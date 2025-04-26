package com.example.demo.dto;

import com.example.demo.enums.MessageType;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MessageDTO {
    private Long id;
    private String content;
    private MessageType type; 
    private String senderId; 
    private String chatId; 
    private String timestamp;

    
    
}
