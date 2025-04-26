package com.example.demo.resource;

import com.example.demo.service.FriendRequestService;

import java.util.List;
import java.util.Collections;
import java.util.Map;
import java.io.IOException;

import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/friends")
public class FriendRequestResource {
    private final FriendRequestService friendRequestService;

    private static final Logger log = LoggerFactory.getLogger(FriendRequestResource.class);

    public FriendRequestResource(FriendRequestService friendRequestService) {
        this.friendRequestService = friendRequestService;
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(@RequestParam String query) {
        try {
            System.out.println("/search triggered");
            List<Map<String, String>> users = friendRequestService.searchUsers(query);
            return ResponseEntity.ok(users);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping("/send")
    public ResponseEntity<String> sendFriendRequest(@RequestParam String senderId, @RequestParam String receiverUsername) {
        log.info("Received request to send friend request from {} to {}", senderId, receiverUsername);
        try {
            String response = friendRequestService.sendFriendRequest(senderId, receiverUsername);
            if (response.equals("One or both users not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            } else if (response.equals("Friend request already sent")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while sending the friend request: " + e.getMessage());
        }
    }

    @PostMapping("/respond")
    public ResponseEntity<String> respondToFriendRequest(@RequestParam Long requestId, @RequestParam boolean accepted) {
        try {
            String response = friendRequestService.respondToFriendRequest(requestId, accepted);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while responding to the friend request: " + e.getMessage());
        }
    }
}