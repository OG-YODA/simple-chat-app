package com.example.demo.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Iterator;
import java.util.Map;

@Service
public class NotificationService {
    private static final String STORAGE_PATH = "C:/Users/User/Desktop/chat-storage/storage/users/";
    private static final int MAX_NOTIFICATIONS = 30;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    private String getUserNotificationPath(String userId) {
        return STORAGE_PATH + userId + "/notifications.json";
    }

    public String getUserNotifications(String userId) throws IOException {
        String filePath = getUserNotificationPath(userId);
        File file = new File(filePath);

        if (!file.exists()) {
            return "[]"; 
        }

        return new String(Files.readAllBytes(Paths.get(filePath)));
    }

    public void addNotification(String userId, String message, String type, String additional) throws IOException {
        String filePath = getUserNotificationPath(userId);
        File userFolder = new File(STORAGE_PATH + userId);
        File file = new File(filePath);

        if (!userFolder.exists()) {
            userFolder.mkdirs();
        }

        ArrayNode notifications = objectMapper.createArrayNode();

        if (file.exists()) {
            try {
                notifications = (ArrayNode) objectMapper.readTree(file);
            } catch (IOException e) {
            }
        }

        for (JsonNode notif : notifications) {
            ((ObjectNode) notif).put("id", notif.get("id").asInt() - 1);
        }

        ObjectNode newNotification = objectMapper.createObjectNode();
        newNotification.put("id", MAX_NOTIFICATIONS);
        newNotification.put("id", MAX_NOTIFICATIONS);
        newNotification.put("message", message);
        newNotification.put("type", type);
        newNotification.put("timestamp", System.currentTimeMillis());
        newNotification.put("additional", additional);

        notifications.insert(0, newNotification);

        while (notifications.size() > MAX_NOTIFICATIONS) {
            notifications.remove(notifications.size() - 1);
        }

        objectMapper.writeValue(file, notifications);
        
        sendNotification(userId, newNotification);
    }

    public ObjectNode newTempNotification(String message, String type, String additional) {
        ObjectNode notification = objectMapper.createObjectNode();
        notification.put("message", message);
        notification.put("type", type);
        notification.put("timestamp", System.currentTimeMillis());
        notification.put("additional", additional);
        return notification;
    }

    public void sendNotification(String userId, ObjectNode notification) {
        System.out.println("Sending WS notification to userId: " + userId + " -> " + notification);
        messagingTemplate.convertAndSendToUser(userId, "/queue/messages", notification);
        System.out.println("Notification sent via STOMP (or attempted).");
    }

    public void clearNotifications(String userId) throws IOException {
        String filePath = getUserNotificationPath(userId);
        File file = new File(filePath);

        if (file.exists()) {
            Files.delete(Paths.get(filePath));
        }
    }

    public void clearNotificationById(String userId, Long notificationId) throws IOException {
        String filePath = getUserNotificationPath(userId);
        File file = new File(filePath);

        if (file.exists()) {
            ArrayNode notifications = (ArrayNode) objectMapper.readTree(file);
            for (int i = 0; i < notifications.size(); i++) {
                if (notifications.get(i).get("id").asLong() == notificationId) {
                    notifications.remove(i);
                    break;
                }
            }
            objectMapper.writeValue(file, notifications);
        }
    }

    public void clearNotificationByParameter(String userId, String parameter) throws IOException {
        String filePath = getUserNotificationPath(userId);
        File file = new File(filePath);
    
        if (file.exists()) {
            ArrayNode notifications = (ArrayNode) objectMapper.readTree(file);
            ArrayNode updatedNotifications = objectMapper.createArrayNode();
    
            for (JsonNode notification : notifications) {
                JsonNode additionalNode = notification.get("additional");
                boolean matchFound = false;
    
                if (additionalNode != null && additionalNode.isTextual()) {
                    String additionalStr = additionalNode.asText();
                    try {
                        JsonNode additional = objectMapper.readTree(additionalStr);
                        Iterator<Map.Entry<String, JsonNode>> fields = additional.fields();
                        while (fields.hasNext()) {
                            Map.Entry<String, JsonNode> entry = fields.next();
                            if (entry.getValue().asText().equals(parameter)) {
                                matchFound = true;
                                break;
                            }
                        }
                    } catch (IOException e) {
                        System.out.println("Failed to parse 'additional' as JSON: " + additionalStr);
                    }
                }
    
                if (!matchFound) {
                    updatedNotifications.add(notification);
                }
            }
    
            objectMapper.writeValue(file, updatedNotifications);
            System.out.println("Сповіщення з параметром '" + parameter + "' видалено (якщо було знайдено).");
        }
    }

    public void findAndReplaceByParameter(String userId, String parameter, ObjectNode newNotification) throws IOException {
        String filePath = getUserNotificationPath(userId);
        File file = new File(filePath);
        boolean found = false;
    
        if (file.exists()) {
            ArrayNode notifications = (ArrayNode) objectMapper.readTree(file);
            for (int i = 0; i < notifications.size(); i++) {
                JsonNode notification = notifications.get(i);
                JsonNode additionalNode = notification.get("additional");
    
                if (additionalNode != null && additionalNode.isTextual()) {
                    String additionalStr = additionalNode.asText();
                    try {
                        JsonNode additional = objectMapper.readTree(additionalStr);
                        Iterator<Map.Entry<String, JsonNode>> fields = additional.fields();
                        while (fields.hasNext()) {
                            Map.Entry<String, JsonNode> entry = fields.next();
                            if (entry.getValue().asText().equals(parameter)) {
                                notifications.set(i, newNotification);
                                found = true;
                                break;
                            }
                        }
                        if (found) break;
                    } catch (IOException e) {
                        System.out.println("Failed to parse 'additional' as JSON: " + additionalStr);
                    }
                }
            }
    
            if (!found) {
                System.out.println("Notification with parameter " + parameter + " not found.");
            } else {
                System.out.println("Notification with parameter " + parameter + " replaced.");
            }
    
            objectMapper.writeValue(file, notifications);
        }
    }
}
