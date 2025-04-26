package com.example.demo.resource;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.domain.UserIP;
import com.example.demo.repo.UserIpRepo;

@RestController
@RequestMapping("/api/user")
public class UserIpResource {

    private final UserIpRepo userIpRepository;

    public UserIpResource(UserIpRepo userIpRepository) {
        this.userIpRepository = userIpRepository;
    }

    @PostMapping("/ip-check")
    public ResponseEntity<?> checkUserIp(@RequestBody UserIP userIp) {
        return userIpRepository.findById(userIp.getUserId())
                .map(savedIp -> {
                    boolean mismatch = !savedIp.getIp().equals(userIp.getIp());

                    if (mismatch) {
                        return ResponseEntity.ok().body("{\"mismatch\": true}");
                    } else {
                        return ResponseEntity.ok().body("{\"mismatch\": false}");
                    }
                })
                .orElseGet(() -> {
                    // If the user IP is not found, save it and return no mismatch
                    userIpRepository.save(userIp);
                    return ResponseEntity.ok().body("{\"mismatch\": false}");
                });
    }

    @PostMapping("/notify")
    public ResponseEntity<?> sendNotification(@RequestBody NotificationRequest request) {
        System.out.println("Notification with ID: " + request.getNotificationId() + " sent for user ID " + request.getUserId());
        return ResponseEntity.ok().build();
    }

    private static class NotificationRequest {
        public Long userId;
        public int notificationId;

        public Long getUserId() {
            return userId;
        }

        public int getNotificationId() {
            return notificationId;
        }
    }
}