package com.example.demo.service;

import com.example.demo.domain.Chat;
import com.example.demo.domain.User;
import com.example.demo.dto.ChatDTO;

import java.util.List;
import java.util.Optional;

public interface ChatService {
    Chat createPrivateChat(User user1, User user2);

    List<ChatDTO> getUserChats(String userId);

    Optional<Chat> getChatById(Long chatId);

    Optional<Chat> getPrivateChatByUsername(String username, String userId);

    Optional<Chat> getPrivateChatById(String userId1, String userId2);

    void deleteChat(Long chatId, String userId);
}
