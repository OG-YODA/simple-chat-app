package com.example.demo.service.impl;

import com.example.demo.domain.Chat;
import com.example.demo.domain.ChatParticipant;
import com.example.demo.domain.User;
import com.example.demo.dto.ChatDTO;
import com.example.demo.dto.ChatParticipantDTO;
import com.example.demo.enums.Role;
import com.example.demo.repo.ChatParticipantRepo;
import com.example.demo.repo.ChatRepo;
import com.example.demo.repo.UserRepo;
import com.example.demo.service.ChatService;

import java.util.Optional;
import java.util.stream.Collectors;
import java.util.List;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ChatParticipantRepo participantRepository;
    private final UserRepo userRepository;
    private final ChatRepo chatRepository;

    @Override
    public List<ChatDTO> getUserChats(String userId) {
        log.info("User chats for ID: {}", userId);
        return chatRepository.findChatsByUserId(userId).stream()
            .map(chat -> {
                ChatDTO chatDTO = new ChatDTO();
                chatDTO.setChatId(chat.getChatId());
                
                List<ChatParticipantDTO> participantDTOs = chat.getParticipants().stream()
                    .map(participant -> {
                        ChatParticipantDTO participantDTO = new ChatParticipantDTO();
                        participantDTO.setId(participant.getId());
                        participantDTO.setUsername(participant.getUser().getUsername());
                        return participantDTO;
                    })
                    .collect(Collectors.toList());
                
                chatDTO.setParticipants(participantDTOs);
                chatDTO.setLastMessageTimestamp(chat.getLastMessageTimestamp());
                chatDTO.setLastMessageSenderName(chat.getLastMessageSenderName());
                chatDTO.setLastMessageContent(chat.getLastMessageContent());
                log.info("===========================");
                log.info("Chat with ID: {} and participants: {}", chat.getChatId(), participantDTOs);
                log.info("===========================");
                return chatDTO;
            })
            .collect(Collectors.toList());
    }

    @Override
    public Optional<Chat> getChatById(Long chatId) {
        log.info("Search chat by ID: {}", chatId);
        return chatRepository.findById(chatId);
    }

    @Override
    public Optional<Chat> getPrivateChatByUsername(String username, String userId) {
        User targetUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        log.info("User found: {}", targetUser.getId());
        return chatRepository.findPrivateChatBetweenUsers(userId, targetUser.getId())
                .or(() -> chatRepository.findPrivateChatBetweenUsers(targetUser.getId(), userId));
    }

    @Override
    public Optional<Chat> getPrivateChatById(String userId1, String userId2) {
        log.info("Поиск приватного чата между пользователями: {} и {}", userId1, userId2);
        return chatRepository.findPrivateChatBetweenUsers(userId1, userId2)
                .or(() -> chatRepository.findPrivateChatBetweenUsers(userId2, userId1));
    }

    @Override
    public Chat createPrivateChat(User user1, User user2) {
        log.info("Создание приватного чата между пользователями: {} и {}", user1.getId(), user2.getId());

        Optional<Chat> existingChat = chatRepository.findPrivateChatBetweenUsers(user1.getId(), user2.getId());

        if (existingChat.isPresent()) {
            return existingChat.get();
        }

        Chat chat = new Chat();
        chat.setGroup(false);
        chat.setCreatedAt(LocalDateTime.now());

        Chat savedChat = chatRepository.save(chat);
        log.info("Создан новый чат с ID: {}", savedChat.getChatId());

        ChatParticipant participant1 = new ChatParticipant();
        participant1.setUser(user1);
        participant1.setChat(savedChat);
        participant1.setActive(false);
        participant1.setJoinedAt(LocalDateTime.now());
        participant1.setRole(Role.MEMBER);

        ChatParticipant participant2 = new ChatParticipant();
        participant2.setUser(user2);
        participant2.setChat(savedChat);
        participant2.setActive(false);
        participant2.setJoinedAt(LocalDateTime.now());
        participant2.setRole(Role.MEMBER);

        participantRepository.saveAll(List.of(participant1, participant2));

        return savedChat;
    }

    @Override
    public void deleteChat(Long chatId, String userId) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new IllegalArgumentException("Chat not found"));

        boolean isParticipant = chat.getParticipants().stream()
                .anyMatch(p -> p.getUser().getId().equals(userId));

        if (!isParticipant) {
            throw new SecurityException("User is not a participant of this chat.");
        }

        // soft delete
        chat.setDeleted(true);

        chatRepository.save(chat);
    }
}
