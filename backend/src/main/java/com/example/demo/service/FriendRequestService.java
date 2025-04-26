package com.example.demo.service;

import com.example.demo.domain.FriendRequest;
import com.example.demo.domain.User;
import com.example.demo.repo.FriendRequestRepo;
import com.example.demo.repo.UserRepo;
import com.fasterxml.jackson.databind.node.ObjectNode;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.IOException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Optional;
import java.util.stream.Collectors;
import java.util.List;
import java.util.Map;

@Service
public class FriendRequestService {

    private final UserRepo userRepository;
    private final FriendRequestRepo friendRequestRepository;
    private final NotificationService notificationService;
    private static final Logger logger = LoggerFactory.getLogger(FriendRequestService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    public FriendRequestService(UserRepo userRepository, FriendRequestRepo friendRequestRepository, NotificationService notificationService) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
        this.friendRequestRepository = friendRequestRepository;
    }

    @Transactional
    public String sendFriendRequest(String senderId, String username) throws IOException {
        Optional<User> senderOpt = userRepository.findById(senderId);
        Optional<User> receiverOpt = userRepository.findByUsername(username);

        if (senderOpt.isEmpty() || receiverOpt.isEmpty()) {
            return "One or both users not found";
        }

        User sender = senderOpt.get();
        User receiver = receiverOpt.get();

        if (sender.getContacts().contains(receiver)) {
            return "You are already friends";
        }

        if (friendRequestRepository.existsBySenderAndReceiverAndStatus(senderId, receiver.getId(), "PENDING")) {
            return "Friend request already sent";
        }

        Optional<FriendRequest> reverseRequestOpt = friendRequestRepository
            .findBySenderAndReceiverAndStatus(receiver.getId(), senderId, "PENDING");

        if (reverseRequestOpt.isPresent()) {
            FriendRequest reverseRequest = reverseRequestOpt.get();
            reverseRequest.setStatus("ACCEPTED");
            friendRequestRepository.save(reverseRequest);

            sender.getContacts().add(receiver);
            receiver.getContacts().add(sender);
            userRepository.save(sender);
            userRepository.save(receiver);

            notificationService.findAndReplaceByParameter(sender.getId(),
                reverseRequest.getId().toString(),
                notificationService.newTempNotification(
                    "Вы теперь друзья с " + receiver.getFirstname() + " " + receiver.getLastname(),
                    "friend_request",
                    sender.getUsername())
            );

            notificationService.findAndReplaceByParameter(receiver.getId(),
                reverseRequest.getId().toString(),
                notificationService.newTempNotification(
                    "Вы теперь друзья с " + sender.getFirstname() + " " + sender.getLastname(),
                    "friend_request",
                    receiver.getUsername())
            );

            return "Friend request auto-accepted!";
        }

        FriendRequest friendRequest = new FriendRequest();
        friendRequest.setSender(senderId);
        friendRequest.setReceiver(receiver.getId());
        friendRequest.setStatus("PENDING");
        friendRequestRepository.save(friendRequest);

        ObjectNode additionalData = objectMapper.createObjectNode();
        additionalData.put("senderName", sender.getFirstname());
        additionalData.put("senderSurname", sender.getLastname());
        additionalData.put("requestId", friendRequest.getId());

        notificationService.addNotification(receiver.getId(),
            "Friend request",
            "friend_request",
            additionalData.toString());

        notificationService.sendNotification(senderId,
            notificationService.newTempNotification("Friend request sent!", "friend_request", receiver.getUsername()));

        return "Friend request sent!";
    }

    @Transactional
    public String respondToFriendRequest(Long requestId, boolean accepted) throws IOException {
        Optional<FriendRequest> friendRequestOpt = friendRequestRepository.findById(requestId);
        if (friendRequestOpt.isEmpty()) return "Friend request not found";

        FriendRequest friendRequest = friendRequestOpt.get();
        User sender = userRepository.findById(friendRequest.getSender())
            .orElseThrow(() -> new IllegalArgumentException("Sender not found"));
        User receiver = userRepository.findById(friendRequest.getReceiver())
            .orElseThrow(() -> new IllegalArgumentException("Receiver not found"));

        List<FriendRequest> relatedRequests = friendRequestRepository.findAllByUsers(sender.getId(), receiver.getId());

        if (accepted) {
            sender.getContacts().add(receiver);
            receiver.getContacts().add(sender);

            for (FriendRequest req : relatedRequests) {
                req.setStatus("ACCEPTED");
                friendRequestRepository.save(req);
            }

            userRepository.save(sender);
            userRepository.save(receiver);

            notificationService.clearNotificationByParameter(receiver.getId(), friendRequest.getId().toString());

            for (FriendRequest req : relatedRequests) {
                if (!req.getId().equals(friendRequest.getId())) {
                    notificationService.clearNotificationByParameter(sender.getId(), friendRequest.getId().toString());
                }
            }

        } else {
            for (FriendRequest req : relatedRequests) {
                req.setStatus("REJECTED");
                friendRequestRepository.save(req);
            }

            notificationService.clearNotificationByParameter(receiver.getId(), friendRequest.getId().toString());
        }

        return accepted ? "Friend request accepted!" : "Friend request rejected!";
    }

    public List<Map<String, String>> searchUsers(String query) {
    if (query == null || query.trim().isEmpty()) {
        throw new IllegalArgumentException("Поисковый запрос не может быть пустым");
    }

    String[] words = query.trim().toLowerCase().split("\\s+");

    if (words.length > 2) {
        throw new IllegalArgumentException("Превышен лимит слов в поиске (максимум 2)");
    }

    List<User> users;
    if (words.length == 1) {
        logger.info("Attempting to find users by received query: {}", words[0]);
        users = userRepository.findByUsernameOrFirstNameOrLastName(words[0]);
    } else {
        users = userRepository.findByFullName(words[0], words[1]);
    }

    return users.stream()
        .map(user -> Map.of(
            "firstname", user.getFirstname(),
            "lastname", user.getLastname(),
            "username", user.getUsername()
        ))
        .collect(Collectors.toList());
    }

    @Transactional
    public String removeFriend(String userId, String friendUsername) throws IOException {
        Optional<User> userOpt = userRepository.findById(userId);
        Optional<User> friendOpt = userRepository.findByUsername(friendUsername);

        if (userOpt.isEmpty() || friendOpt.isEmpty()) {
            return "User not found";
        }

        User user = userOpt.get();
        User friend = friendOpt.get();

        boolean removed1 = user.getContacts().remove(friend);
        boolean removed2 = friend.getContacts().remove(user);

        if (!removed1 && !removed2) {
            return "Users are not friends";
        }

        userRepository.save(user);
        userRepository.save(friend);

        List<FriendRequest> relatedRequests = friendRequestRepository.findAllByUsers(user.getId(), friend.getId());
        for (FriendRequest request : relatedRequests) {
            friendRequestRepository.delete(request);
        }

        try {
            notificationService.clearNotificationByParameter(user.getId(), friend.getLastname());
            notificationService.clearNotificationByParameter(friend.getId(), user.getLastname());
        } catch (IOException e) {
            logger.warn("Failed to clear some notifications", e);
        }

        return "Friend removed successfully";
    }
}