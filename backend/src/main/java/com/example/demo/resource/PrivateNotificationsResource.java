package com.example.demo.resource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

import com.example.demo.service.NotificationService;

import org.springframework.messaging.simp.annotation.SendToUser;
import java.security.Principal;

@Controller
public class PrivateNotificationsResource {

    @Autowired
    private NotificationService notificationService;

    @MessageMapping("/send")
    @SendToUser("/queue/messages")
    public String handleMessage(Principal principal, String message) {
        String userId = principal.getName();
        System.out.println("Message from " + userId + ": " + message);
        return "Hello " + userId + ", you sent: " + message;
    }

    @MessageMapping("/initialize") 
    @SendToUser("/queue/messages")
    public String initializeConnection(Principal principal) {
        String userId = principal.getName();

        try {
            notificationService.addNotification(
                userId,
                "Добро пожаловать, " + userId + "!",
                "info",
                null
            );
        } catch (Exception e) {
            e.printStackTrace();
        }

        return "Соединение установлено, уведомление отправлено.";
    }
}
