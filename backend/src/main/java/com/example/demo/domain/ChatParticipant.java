package com.example.demo.domain;

import com.example.demo.enums.Role;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "chat_participants")
public class ChatParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    
    @ManyToOne
    @JoinColumn(name = "chat_id", nullable = false)
    private Chat chat;

    
    private boolean active;

    private LocalDateTime joinedAt = LocalDateTime.now();

    private LocalDateTime lastSeen;

    private Role role;
}