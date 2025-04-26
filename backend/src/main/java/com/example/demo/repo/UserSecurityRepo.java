package com.example.demo.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.domain.UserSecurity; 
import java.util.Optional;

public interface UserSecurityRepo extends JpaRepository<UserSecurity, Long> {
    Optional<UserSecurity> findByUserKey(String userKey);
    Optional<UserSecurity> findByHashedUserId(String hashedUserId);//hashed userId
}
