package com.example.demo.service;

import com.example.demo.domain.Message;

import java.util.List;

public interface MessageService {

    Message sendMessage(String chatId, String senderId, String content);

    List<Message> getMessagesByChatBeforeTimestamp(String chatId, long beforeTimestamp);

    void markAsDelivered(Long messageId);

    void markAsRead(Long messageId);

    void deleteMessage(Long messageId, String userId);

    void editMessage(Long messageId, String userId, String newContent);
}
