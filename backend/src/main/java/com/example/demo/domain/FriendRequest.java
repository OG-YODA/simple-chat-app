package com.example.demo.domain;

import jakarta.persistence.*;
import lombok.*;

@Data
@Entity
@Table(name = "friend_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FriendRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sender_id", nullable = false)
    private String sender; 

    @Column(name = "receiver_id", nullable = false)
    private String receiver; 

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, ACCEPTED, REJECTED
}