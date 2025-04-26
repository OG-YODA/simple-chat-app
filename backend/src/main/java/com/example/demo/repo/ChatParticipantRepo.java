package com.example.demo.repo;

import com.example.demo.domain.ChatParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface ChatParticipantRepo extends JpaRepository<ChatParticipant, Long> {
    @Query("SELECT cp FROM ChatParticipant cp " +
           "JOIN cp.chat c " +
           "WHERE c.id = :chatId AND cp.user.id = :userId")
    Optional<ChatParticipant> findByChatIdAndUserId(@Param("chatId") Long chatId, @Param("userId") String userId);
    
}
