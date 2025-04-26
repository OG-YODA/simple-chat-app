package com.example.demo.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "users")
public class User {

    @EqualsAndHashCode.Include
    @Id
    @Column(nullable = false, unique = true)
    private String id;

    @Column(nullable = false, unique = true, name = "email")
    private String email;

    private String password;

    @Column(name = "gender")
    private String gender;

    @Column(nullable = false, unique = true, name = "username")
    private String username;

    @Column(nullable = false, name = "firstname")
    private String firstname;

    @Column(nullable = false, name = "lastname")
    private String lastname;

    private String roles;

    @Column(nullable = true, name = "last_online")
    private LocalDateTime lastOnline;

    @Column(length = 512)
    private String description;

    @Column(name = "avatar")
    private String avatar;

    @ManyToMany
    @JoinTable(
            name = "contacts",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "contact_id")
    )
    private Set<User> contacts = new HashSet<>();
}
