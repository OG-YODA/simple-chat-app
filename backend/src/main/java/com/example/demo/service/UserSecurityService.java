package com.example.demo.service;

import com.example.demo.repo.UserSecurityRepo;
import com.example.demo.domain.UserSecurity;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import java.util.Base64;
import java.util.Optional;

@Service
public class UserSecurityService {
    
    private static final Logger logger = LoggerFactory.getLogger(UserSecurityService.class);
    private final UserSecurityRepo userSecurityRepo;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserSecurityService(UserSecurityRepo userSecurityRepo) {
        this.userSecurityRepo = userSecurityRepo;
    }

    public String hashPassword(String password) {
        logger.info("Hashing password");
        String hashedPassword = passwordEncoder.encode(password);
        logger.info("Password hashed successfully");
        return hashedPassword;
    }
    
    public String hashUserId(String userId) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(userId.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }

    public String getUserKey(String userId) {
        logger.info("Generating user key for user ID: {}", userId);

        String hashedUserId = hashUserId(userId);
        System.out.println("Hashed value for '" + userId + "' is: " + hashedUserId);

        Optional<UserSecurity> userSecurity = userSecurityRepo.findByHashedUserId(hashedUserId);

        if (userSecurity.isPresent()) {
            logger.info("User key retrieved successfully for user ID: {}", userId);
            return userSecurity.get().getUserKey();
        } else {
            logger.warn("No user security data found for user ID: {}", userId);
            return null;
        }
    }

    public void saveUserSecurity(String userId, String password, String userKey) {
        logger.info("Saving user security data for user ID: {}", userId);
        UserSecurity userSecurity = new UserSecurity();
        
        String hashedUserId = hashUserId(userId);
        String hashedPassword = hashPassword(password);
        
        userSecurity.setHashedUserId(hashedUserId);
        userSecurity.setHashedPassword(hashedPassword);
        userSecurity.setUserKey(userKey);

        userSecurityRepo.save(userSecurity);
        logger.info("User security data saved successfully for user ID: {}", userId);
    }

    public Optional<UserSecurity> findByUserKey(String userKey) {
        logger.info("Searching for user security data with user key: {}", userKey);
        Optional<UserSecurity> userSecurity = userSecurityRepo.findByUserKey(userKey);
        if (userSecurity.isPresent()) {
            logger.info("User security data found for user key: {}", userKey);
        } else {
            logger.warn("No user security data found for user key: {}", userKey);
        }
        return userSecurity;
    }
}