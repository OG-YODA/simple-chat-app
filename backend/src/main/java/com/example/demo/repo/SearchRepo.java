package com.example.demo.repo;

import com.example.demo.domain.UserSearch;
import jakarta.persistence.Table;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@Table(name = "user_search")
public interface SearchRepo extends JpaRepository<UserSearch, Long> {
    Optional<UserSearch> findById(Long id);
    Optional<UserSearch> findByUsername(String username);
    Optional<UserSearch> findByEmail(String email);
    Optional<UserSearch> findByName(String name);
}
