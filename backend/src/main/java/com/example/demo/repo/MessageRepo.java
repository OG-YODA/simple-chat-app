package com.example.demo.repo;

import com.example.demo.domain.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;


public interface MessageRepo extends JpaRepository<Message, Long> {
    List<Message> findByChatChatIdOrderByTimestampAsc(Long chatId);
    
    @Query(value = """
    SELECT * FROM messages 
    WHERE chat_id = :chatId 
      AND timestamp < :beforeTimestamp 
    ORDER BY timestamp DESC 
    LIMIT 30
    """, nativeQuery = true)
    List<Message> findLastMessagesInChatByTimestamp(@Param("chatId") Long chatId, @Param("beforeTimestamp") long beforeTimestamp);//last 30
}
