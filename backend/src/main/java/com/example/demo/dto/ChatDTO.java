package com.example.demo.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatDTO {
    private Long chatId;
    private List<ChatParticipantDTO> participants;
    private LocalDateTime lastMessageTimestamp;
    private String lastMessageSenderName;
    private String lastMessageContent;
}
