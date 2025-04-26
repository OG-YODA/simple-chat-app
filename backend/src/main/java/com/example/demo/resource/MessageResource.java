package com.example.demo.resource;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import com.example.demo.dto.WebSocketMessageRequestDto;
import com.example.demo.dto.WebSocketMessageResponseDto;
import com.example.demo.service.MessageService;
import com.example.demo.domain.Message;

@Controller
@RequiredArgsConstructor
public class MessageResource {
    
    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.sendMessage")
    @SendToUser("/queue/messages")
    public void sendMessage(@Payload WebSocketMessageRequestDto request) {
        Message message = messageService.sendMessage(
            request.getChatId(),
            request.getSenderUsername(),
            request.getContent()
        );

        WebSocketMessageResponseDto response = WebSocketMessageResponseDto.builder()
            .id(message.getId())
            .chatId(message.getChat().getChatId().toString())
            .senderId(message.getSender().getId())
            .senderNickname(message.getSender().getUsername())
            .content(message.getContent())
            .type(message.getType().toString())
            .mediaUrl(message.getMediaUrl())
            .timestamp(message.getTimestamp())
            .sent(message.isSent())
            .delivered(message.isDelivered())
            .read(message.isRead())
            .isEdited(message.isEdited())
            .isDeleted(message.isDeleted())
            .build();

        messagingTemplate.convertAndSend("/chat/" + request.getChatId(), response);
    }
}
