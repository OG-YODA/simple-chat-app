package com.example.demo.service;

import com.example.demo.repo.UserRepo;
import com.example.demo.components.ImageResponse;

import lombok.RequiredArgsConstructor;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import com.example.demo.domain.UserProfile;

@Service
@RequiredArgsConstructor
public class ProfileService {
    private static final String STORAGE_PATH = "C:/Users/User/Desktop/chat-storage/storage/users/";

    private final UserRepo userRepo;

    public String saveAvatar(String userId, MultipartFile file) throws IOException {
        Path avatarDir = Paths.get(STORAGE_PATH, userId, "avatars");
        Files.createDirectories(avatarDir);
    
        String fileName = file.getOriginalFilename();
        Path filePath = avatarDir.resolve(fileName);
    
        // Сохраняем файл
        Files.write(filePath, file.getBytes());
    
        // Обновляем запись в базе данных
        userRepo.findById(userId).ifPresent(user -> {
            user.setAvatar(fileName);
            userRepo.save(user);
        });
    
        return fileName;
    }

    public UserProfile getProfileData(String userId) {
        System.out.println("Fetching profile for user with ID: " + userId); 
    
        return userRepo.findById(userId)
                .map(user -> {
                    System.out.println("User found: " + user.getUsername()); 
                    System.out.println("User first name: " + user.getFirstname());
                    System.out.println("User last name: " + user.getLastname());
                    System.out.println("User photo: " + user.getAvatar());
    
                    return new UserProfile(
                            user.getFirstname() + " " + user.getLastname(),
                            user.getUsername(),
                            user.getAvatar() != null ? user.getAvatar() : null,
                            user.getDescription()
                    );
                })
                .orElseGet(() -> {
                    System.out.println("User with ID " + userId + " not found");
                    return null;
                });
    }

    public Optional<ImageResponse> getAvatarByUsername(String username) {
        return userRepo.findByUsername(username)
                .flatMap(user -> {
                    String photoName = user.getAvatar();
                    String userId = user.getId();
    
                    if (photoName == null || photoName.isEmpty()) {
                        return Optional.empty();
                    }
    
                    Path photoPath = Paths.get(STORAGE_PATH, userId, "avatars", photoName);
                    if (!Files.exists(photoPath)) {
                        return Optional.empty();
                    }
    
                    try {
                        byte[] fileData = Files.readAllBytes(photoPath);
                        MediaType mediaType = resolveMediaType(photoName);
                        return Optional.of(new ImageResponse(fileData, mediaType));
                    } catch (IOException e) {
                        e.printStackTrace();
                        return Optional.empty();
                    }
                });
    }
    
    private MediaType resolveMediaType(String fileName) {
        String ext = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
        return switch (ext) {
            case "png" -> MediaType.IMAGE_PNG;
            case "jpg", "jpeg" -> MediaType.IMAGE_JPEG;
            case "gif" -> MediaType.IMAGE_GIF;
            case "webp" -> MediaType.valueOf("image/webp");
            default -> MediaType.APPLICATION_OCTET_STREAM;
        };
    }
}
