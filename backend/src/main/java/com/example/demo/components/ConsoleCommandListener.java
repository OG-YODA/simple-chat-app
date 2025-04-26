package com.example.demo.components;

import org.springframework.stereotype.Component;
import com.example.demo.service.NotificationService;

import java.util.Scanner;

import jakarta.annotation.PostConstruct;

@Component
public class ConsoleCommandListener {

    private final NotificationService notificationService;

    public ConsoleCommandListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostConstruct
    public void startConsoleListener() {
        Thread thread = new Thread(() -> {
            Scanner scanner = new Scanner(System.in);
            System.out.println("Консоль готова. Используй команду: sendnotif [userId] [message]");
            while (true) {
                String line = scanner.nextLine();
                if (line.startsWith("sendnotif")) {
                    try {
                        String[] parts = line.split(" ", 3);
                        if (parts.length < 3) {
                            System.out.println("Использование: sendnotif [userId] [message]");
                            continue;
                        }
                        String userId = parts[1];
                        String message = parts[2];

                        notificationService.sendNotification(userId, notificationService.newTempNotification(message, "info", null));
                        System.out.println("Уведомление отправлено пользователю " + userId);
                    } catch (Exception e) {
                        System.out.println("Ошибка при отправке уведомления: " + e.getMessage());
                        e.printStackTrace();
                    }
                }
            }
        });
        thread.setDaemon(true); // make the thread a daemon thread
        thread.start();
    }
}