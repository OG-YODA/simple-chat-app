package com.example.demo.resource;

import com.example.demo.domain.UserProfile;
import com.example.demo.security.SecuredByKey;
import com.example.demo.service.ProfileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.io.IOException;

@RestController
@RequestMapping("/profile")
@CrossOrigin(origins = "http://localhost:3000")
public class ProfileResource {

    private static final Logger logger = LoggerFactory.getLogger(ProfileResource.class);

    private final ProfileService profileService;

    @Autowired
    public ProfileResource(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping("/refresh-profile-data")
    @SecuredByKey
    public ResponseEntity<?> refreshProfileData(@RequestHeader("X-USER-ID") String userId) {
        logger.info("Received request to refresh profile data for userId={}", userId);
        try {
            UserProfile profileData = profileService.getProfileData(userId);
            logger.info("Successfully retrieved profile data for userId={}", userId);
            return ResponseEntity.ok(profileData);
        } catch (Exception e) {
            logger.error("Failed to refresh profile data for userId={}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to refresh profile data");
        }
    }

    @PostMapping("/update-avatar")
    @SecuredByKey
    public ResponseEntity<?> updateAvatar(
            @RequestParam String userId,
            @RequestParam("avatar") MultipartFile file) {
        logger.info("Received avatar update for userId={}, originalFileName={}, size={} bytes",
                userId, file.getOriginalFilename(), file.getSize());

        try {
            String savedFileName = profileService.saveAvatar(userId, file);
            logger.info("Avatar updated successfully for userId={}, savedFileName={}", userId, savedFileName);
            return ResponseEntity.ok(Map.of("fileName", savedFileName));
        } catch (IOException e) {
            logger.error("Failed to update avatar for userId={}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update avatar");
        }
    }

    @GetMapping("/get-avatar/{username}")
    public ResponseEntity<byte[]> getAvatar(@PathVariable String username) {
        logger.info("Received request to get avatar for username={}", username);

        return profileService.getAvatarByUsername(username)
                .map(response -> {
                    logger.info("Avatar found for username={}", username);
                    return ResponseEntity.ok()
                            .contentType(response.getContentType())
                            .body(response.getData());
                })
                .orElseGet(() -> {
                    logger.warn("Avatar not found for username={}", username);
                    return ResponseEntity.notFound().build();
                });
    }
}