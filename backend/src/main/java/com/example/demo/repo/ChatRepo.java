package com.example.demo.repo;

import com.example.demo.domain.Chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.List;

public interface ChatRepo extends JpaRepository<Chat, Long> {
    @Query("SELECT c FROM Chat c " +
       "JOIN c.participants p1 " +
       "JOIN c.participants p2 " +
       "WHERE p1.user.id = :userId1 " +
       "AND p2.user.id = :userId2 " +
       "AND c.isGroup = false")
    Optional<Chat> findPrivateChatBetweenUsers(@Param("userId1") String userId1,
                                                @Param("userId2") String userId2);

    @Query("SELECT c FROM Chat c JOIN c.participants p WHERE p.user.id = :userId")
    List<Chat> findChatsByUserId(String userId);
    Optional<Chat> findById(Long chatId);
}
