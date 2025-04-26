package com.example.demo.resource;

import com.example.demo.domain.Chat;
import com.example.demo.domain.User;
import com.example.demo.repo.UserRepo;
import com.example.demo.service.ChatService;
import com.example.demo.service.MessageService;
import com.example.demo.domain.Message;

import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatResource {

    private final ChatService chatService;
    private final UserRepo userRepo;
    private final MessageService messageService;

    private static final Logger log = LoggerFactory.getLogger(ChatResource.class);
    
    @PostMapping("/create")
    public ResponseEntity<?> createChat(@RequestParam String username, @RequestParam String userId2) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> {
                    log.warn("Пользователь с ником {} не найден", username);
                    return new IllegalArgumentException("User not found");
                });

        String userId1 = user.getId();

        log.info("Запрос на создание чата между пользователями: {} и {}", userId1, userId2);

        User user1 = userRepo.findById(userId1)
                .orElseThrow(() -> {
                    log.warn("Пользователь с ID {} не найден", userId1);
                    return new IllegalArgumentException("User 1 not found");
                });

        User user2 = userRepo.findById(userId2)
                .orElseThrow(() -> {
                    log.warn("Пользователь с ID {} не найден", userId2);
                    return new IllegalArgumentException("User 2 not found");
                });

        Chat chat = chatService.createPrivateChat(user1, user2);

        log.info("Чат создан с ID {}", chat.getChatId());

        return ResponseEntity.ok(chat.getChatId());
    }

    @GetMapping("/chat-by-username")
    @ResponseBody
    public ResponseEntity<?> getChatByUsername(@RequestParam String username, @RequestParam String userId) {
        log.info("Запрос на получение чата с пользователем: {}", username);

        // Находим пользователя по никнейму
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> {
                    log.warn("Пользователь с ником {} не найден", username);
                    return new IllegalArgumentException("User not found");
                });

        Chat chat = chatService.getPrivateChatByUsername(user.getUsername(), userId)
                .orElse(null);

        if (chat == null) {
            log.warn("Чат с пользователем {} не найден", username);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Chat not found");
        }

        log.info("Чат с пользователем {} найден, ID чата: {}", username, chat.getChatId());

        return ResponseEntity.ok(chat);
    }

    @GetMapping("/check")
    public ResponseEntity<?> checkChat(@RequestParam String username, @RequestParam String userId2) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> {
                    log.warn("Пользователь с ником {} не найден", username);
                    return new IllegalArgumentException("User not found");
                });

        String userId1 = user.getId();

        log.info("Запрос на проверку чата между пользователями: {} и {}", userId1, userId2);

        Chat chat = chatService.getPrivateChatById(userId1, userId2)
                .orElse(null);

        if (chat == null) {
            log.warn("Чат между пользователями {} и {} не найден", userId1, userId2);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Chat not found");
        }

        log.info("Чат между пользователями {} и {} найден, ID чата: {}", userId1, userId2, chat.getChatId());

        return ResponseEntity.ok(chat.getChatId());
    }

    @GetMapping("/user-chats")
    public ResponseEntity<?> getUserChats(@RequestParam String userId) {
        log.info("Запрос на получение чатов пользователя с ID: {}", userId);
        return ResponseEntity.ok(chatService.getUserChats(userId));
    }

    @GetMapping("/get-last-messages")
    public ResponseEntity<?> getChatMessagesBeforeTimestamp(
            @RequestParam String chatId,
            @RequestParam long beforeTimestamp
    ) {
        log.info("Запит GET /chat/messages з chatId={} і beforeTimestamp={}", chatId, beforeTimestamp);

        try {
            List<Message> messages = messageService.getMessagesByChatBeforeTimestamp(chatId, beforeTimestamp);
            return ResponseEntity.ok(messages);
        } catch (IllegalArgumentException e) {
            log.warn("Невалідний запит на отримання повідомлень: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("Невідома помилка при отриманні повідомлень чату", e);
            return ResponseEntity.internalServerError().body("Server error");
        }
    }
}