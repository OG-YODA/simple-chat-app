package com.example.demo.dto;

import lombok.Data;
import lombok.Builder;
import java.time.LocalDateTime;

@Data
@Builder
public class WebSocketMessageResponseDto {
    private Long id;
    private String chatId;
    private String senderId;
    private String senderNickname;
    private String content;
    private String type;
    private String mediaUrl;
    private LocalDateTime timestamp;
    private boolean sent;
    private boolean delivered;
    private boolean read;
    private boolean isEdited;
    private boolean isDeleted;
}
