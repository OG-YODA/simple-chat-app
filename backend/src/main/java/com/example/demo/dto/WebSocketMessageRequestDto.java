package com.example.demo.dto;

import lombok.Data;

@Data
public class WebSocketMessageRequestDto {
    private String chatId;
    private String senderUsername;
    private String content;
}