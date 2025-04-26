package com.example.demo.repo;

import com.example.demo.domain.FriendRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FriendRequestRepo extends JpaRepository<FriendRequest, Long> {
    Optional<FriendRequest> findById(Long id);
    Optional<FriendRequest> findBySenderAndReceiverAndStatus(String senderId, String receiverId, String status);
    boolean existsBySenderAndReceiverAndStatus(String senderId, String receiverId, String status);

    @Query("SELECT fr FROM FriendRequest fr " +
       "WHERE (fr.sender = :id1 AND fr.receiver = :id2) " +
       "   OR (fr.sender = :id2 AND fr.receiver = :id1)")
    List<FriendRequest> findAllByUsers(@Param("id1") String id1, @Param("id2") String id2);
}