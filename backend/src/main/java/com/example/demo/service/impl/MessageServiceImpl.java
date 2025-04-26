package com.example.demo.service.impl;

import com.example.demo.domain.Chat;
import com.example.demo.domain.Message;
import com.example.demo.domain.User;
import com.example.demo.repo.ChatRepo;
import com.example.demo.repo.MessageRepo;
import com.example.demo.repo.UserRepo;
import com.example.demo.enums.MessageType;
import com.example.demo.service.MessageService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final ChatRepo chatRepository;
    private final MessageRepo messageRepository;
    private final UserRepo userRepository; 

    @Override
    public Message sendMessage(String chatId, String senderUsername, String content) {
        log.info("Попытка отправки сообщения в чат: {}, от пользователя: {}", chatId, senderUsername);

        Chat chat = chatRepository.findById(Long.parseLong(chatId))
                .orElseThrow(() -> {
                    log.error("Чат не найден по ID: {}", chatId);
                    return new IllegalArgumentException("Chat not found");
                });
                
        User sender = userRepository.findByUsername(senderUsername)
                .orElseThrow(() -> {
                    log.error("Отправитель не найден по ID: {}", senderUsername);
                    return new IllegalArgumentException("Sender not found");
                });

        Message message = new Message();
        message.setType(MessageType.TEXT);
        message.setChat(chat);
        message.setSender(sender);
        message.setContent(content);
        message.setTimestamp(LocalDateTime.now());
        message.setSent(true);

        chat.setLastMessageTimestamp(message.getTimestamp());
        chat.setLastMessageSenderName(sender.getUsername());
        chat.setLastMessageContent(content);
        chatRepository.save(chat);
            
        log.info("Сообщение успешно отправлено в чат: {}, от пользователя: {}", chatId, senderUsername);
        log.info("Содержимое сообщения: {}", content);
        
        return messageRepository.save(message);
    }

    @Override
    public List<Message> getMessagesByChatBeforeTimestamp(String chatId, long beforeTimestamp) {
        log.info("Запит історії чату з ID: {} до таймстампу: {}", chatId, beforeTimestamp);

        if (chatId == null || chatId.isBlank()) {
            log.warn("Передано некоректне chatId: {}", chatId);
            throw new IllegalArgumentException("Chat ID не може бути порожнім");
        }

        try {
            Long parsedChatId = Long.parseLong(chatId);
            List<Message> messages = messageRepository.findLastMessagesInChatByTimestamp(parsedChatId, beforeTimestamp);

            log.info("Знайдено {} повідомлень для чату {} до таймстампу {}", messages.size(), chatId, beforeTimestamp);

            return messages;
        } catch (NumberFormatException e) {
            log.error("Помилка при парсингу chatId: {}", chatId, e);
            throw new IllegalArgumentException("Неправильний формат chatId");
        }
    }

    @Override
    public void markAsDelivered(Long messageId) {
        log.info("Message delivered, ID: {}", messageId);
        messageRepository.findById(messageId).ifPresent(msg -> {
            msg.setDelivered(true);
            messageRepository.save(msg);
        });
    }

    @Override
    public void markAsRead(Long messageId) {
        log.info("Message marked as read, ID: {}", messageId);
        messageRepository.findById(messageId).ifPresent(msg -> {
            msg.setRead(true);
            messageRepository.save(msg);
        });
    }

    @Override
    public void deleteMessage(Long messageId, String userId) {
        log.info("Запрос на удаление сообщения ID: {} пользователем {}", messageId, userId);
        messageRepository.findById(messageId).ifPresent(msg -> {
            if (msg.getSender().getId().equals(userId)) {
                msg.setDeleted(true);
                messageRepository.save(msg);
                log.info("Сообщение помечено как удаленное");
            } else {
                log.warn("Пользователь {} попытался удалить чужое сообщение", userId);
                throw new SecurityException("Only sender can delete the message.");
            }
        });
    }

    @Override
    public void editMessage(Long messageId, String userId, String newContent) {
        log.info("Попытка редактирования сообщения ID: {} пользователем {}", messageId, userId);
        messageRepository.findById(messageId).ifPresent(msg -> {
            if (msg.getSender().getId().equals(userId) && !msg.isDeleted()) {
                msg.setContent(newContent);
                msg.setEdited(true);
                messageRepository.save(msg);
                log.info("Сообщение успешно отредактировано");
            } else {
                log.warn("Пользователь {} не может редактировать сообщение ID: {}", userId, messageId);
                throw new SecurityException("Only sender can edit the message.");
            }
        });
    }
}