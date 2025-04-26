package com.example.demo.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatParticipantDTO {
    private Long id;
    private String username;
    private String firstname;
    private String lastname;
    private boolean active;
}
