package com.example.demo.resource;

import com.example.demo.service.NotificationService;
import com.fasterxml.jackson.databind.JsonNode;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
public class NotificationResource {
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationResource(NotificationService notificationService, SimpMessagingTemplate messagingTemplate) {
        this.notificationService = notificationService;
        this.messagingTemplate = messagingTemplate;
    }

    @GetMapping("/test")
    public String checkServer() {
        return "Сервер работает";
    }

    @GetMapping("/get/{userId}")
    public ResponseEntity<String> getNotifications(@PathVariable String userId) throws IOException {
        String jsonContent = notificationService.getUserNotifications(userId);
        return ResponseEntity.ok(jsonContent);
    }

    @PostMapping("/add")
    public void addNotification(@RequestBody Map<String, String> request) throws IOException {
        String userId = request.get("userId");
        String message = request.get("message");
        String type = request.get("type");
        String additional = request.getOrDefault("additional", "null");

        notificationService.addNotification(userId, message, type, additional);
        messagingTemplate.convertAndSendToUser(userId, "/queue/notifications", "New notification");
    }

    @PostMapping("/clearAll")
    public void clearNotifications(@RequestBody Map<String, String> request) throws IOException {
        String userId = request.get("userId");
        notificationService.clearNotifications(userId);
    }

    @PostMapping("/notify/{userId}")
    public ResponseEntity<String> notifyUser(@PathVariable String userId) {
        try {
            notificationService.addNotification(userId, "Тестовое уведомление", "test", null);
            return ResponseEntity.ok("Notification sent to " + userId);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // @PostMapping("/clear{Id}")
    // public void clearNotification(@RequestBody Map<String, String> request) throws IOException {
    //     String userId = request.get("userId");
    //     String notificationId = request.get("notificationId");
    //     notificationService.clearNotification(userId, notificationId);
    // }
}