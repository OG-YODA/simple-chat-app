package com.example.demo.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "user_ips")
public class UserIP {
    @Id
    @Column(nullable = false, unique = true)
    private String userId;
    @Column(nullable = false)
    private String ip;
}