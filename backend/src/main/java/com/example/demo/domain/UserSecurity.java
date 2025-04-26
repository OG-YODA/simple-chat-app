package com.example.demo.domain;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Data
@Getter
@Setter
@Table(name = "user_security")
public class UserSecurity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String hashedUserId;

    @Column(nullable = false)
    private String hashedPassword;

    @Column(nullable = false, unique = true)
    private String userKey;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}