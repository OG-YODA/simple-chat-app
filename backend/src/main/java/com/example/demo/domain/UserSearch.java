package com.example.demo.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Data
@Entity
@Getter
@Setter
@Table(name = "user_search")
@NoArgsConstructor
public class UserSearch{
    @Id
    @Column(nullable = false, unique = true)
    private String id;
    @Column(nullable = false, unique = true)
    private String username;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false)
    private String surname;
    @Column(nullable = false, unique = true)
    private String email;

    public UserSearch(String id, String username, String name, String surname, String email) {
        this.id = id;
        this.username = username;
        this.name = name;
        this.surname = surname;
        this.email = email;
    }
}
