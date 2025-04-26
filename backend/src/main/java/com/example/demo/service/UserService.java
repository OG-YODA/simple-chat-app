package com.example.demo.service;

import com.example.demo.domain.User;
import com.example.demo.domain.UserProfile;
import com.example.demo.domain.UserSecurity;
import com.example.demo.repo.UserRepo;
import com.example.demo.repo.UserSecurityRepo;
import com.example.demo.dto.ContactDTO;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepo userRepo;
    private final UserSecurityRepo userSecurityRepo;
    private final UserSecurityService userSecurityService;
    private final PasswordEncoder passwordEncoder;

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    public User registerUser(User user) {
        logger.info("Attempting to register user with email: {}", user.getEmail());
    
        Optional<User> existingUser = userRepo.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            logger.warn("User already exists with email: {}", user.getEmail());
            throw new RuntimeException("User already exists with email: " + user.getEmail());
        }else {
            logger.info("No existing user found with email: {}", user.getEmail());
        }
    
        user.setRoles("USER");
        logger.info("Setting user roles to USER");
    
        String generatedUserId = UserIdGenerator.generateUserId(user.getFirstname(), user.getLastname(), System.currentTimeMillis());
        logger.info("Generated User ID: {}", generatedUserId);
    
        String userId;
        try {
            userId = generatedUserId;
        } catch (NumberFormatException e) {
            logger.error("Failed to parse generated User ID: {}", generatedUserId, e);
            throw new RuntimeException("Error generating user ID", e);
        }
        user.setId(userId);
        logger.info("User ID set: {}", user.getId());
    
        String generatedUserKey = UserKeyGenerator.generateUserKey(user.getFirstname(), user.getLastname(), System.currentTimeMillis(), String.valueOf(user.getId()));
        logger.info("Generated User Key: {}", generatedUserKey);
    
        logger.info("Saving user security details...");
        userSecurityService.saveUserSecurity(String.valueOf(user.getId()), user.getPassword(), generatedUserKey);
        logger.info("User security details saved successfully");
    
        user.setPassword(null);
    
        logger.info("Saving user in the repository...");
        User savedUser = userRepo.save(user);
        logger.info("User saved successfully with ID: {}", savedUser.getId());
    
        return savedUser;
    }

    public User loginUser(String email, String password) {
        logger.info("Login attempt for user: {}", email);
    
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> {
                    logger.warn("User not found with email: {}", email);
                    return new RuntimeException("User not found with email: " + email);
                });
    

        String rawUserId = user.getId().toString();
    
        String hashedUserId = userSecurityService.hashUserId(rawUserId);
    
        Optional<UserSecurity> userSecurityOpt = userSecurityRepo.findByHashedUserId(hashedUserId);
    
        if (userSecurityOpt.isEmpty()) {
            logger.warn("Security data not found for user: {}", email);
            throw new RuntimeException("Security data not found for user: " + email);
        }
    
        UserSecurity userSecurity = userSecurityOpt.get();
    
        if (!passwordEncoder.matches(password, userSecurity.getHashedPassword())) {
            logger.warn("Invalid password for user: {}", email);
            throw new RuntimeException("Invalid password");
        }
    
        logger.info("User logged in successfully: {}", email);
        return user;
    }

    public void deleteUser(String id) {//TODO: improve with clearing notifications and friends etc.
        logger.info("Attempting to delete user with ID: {}", id);
        User user = userRepo.findById(id)
                .orElseThrow(() -> {
                    logger.warn("User not found with ID: {}", id);
                    return new RuntimeException("User not found with ID: " + id);
                });
        userRepo.delete(user);
        logger.info("User with ID {} deleted successfully", id);
    }

    public UserProfile getUserProfileByUsername(String username) {
        System.out.println("Fetching profile for user: " + username); 
    
        return userRepo.findByUsername(username)
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
                    System.out.println("User " + username + " not found");
                    return null;
                });
    }

    public List<ContactDTO> getUserContacts(String userId) {
        System.out.println("Fetching contacts for user with ID: " + userId);
    
        return userRepo.findById(userId)
                .map(user -> {
                    System.out.println("User found: " + user.getUsername());
    
                    // Логируем количество контактов
                    System.out.println("User has " + user.getContacts().size() + " contacts");
    
                    return user.getContacts()
                            .stream()
                            .map(contact -> {
                                System.out.println("Mapping contact: " + contact.getUsername());
                                return new ContactDTO(
                                        contact.getId(),
                                        contact.getUsername(),
                                        contact.getFirstname(),
                                        contact.getLastname(),
                                        contact.getAvatar(),
                                        contact.getDescription()
                                );
                            })
                            .collect(Collectors.toList());
                })
                .orElseGet(() -> {
                    System.out.println("User with ID " + userId + " not found");
                    return Collections.emptyList();
                });
    }
}

class UserIdGenerator {
    private static List<Integer> stringToNumberArray(String s) {
        List<Integer> numberArray = new ArrayList<>();
        for (char c : s.toCharArray()) {
            numberArray.add((int) c); 
        }
        return numberArray;
    }

    private static List<Integer> timeToNumberArray(long timestamp) {
        List<Integer> numberArray = new ArrayList<>();
        for (char c : String.valueOf(timestamp).toCharArray()) {
            numberArray.add(Character.getNumericValue(c));
        }
        return numberArray;
    }

    public static String generateUserId(String name, String surname, long timestamp) {
        Logger logger = LoggerFactory.getLogger(UserIdGenerator.class);
        logger.info("Generating User ID for: Name = {}, Surname = {}, Timestamp = {}", name, surname, timestamp);
    
        List<Integer> nameArray = stringToNumberArray(name);
        List<Integer> surnameArray = stringToNumberArray(surname);
        List<Integer> timeArray = timeToNumberArray(timestamp);
    
        logger.info("Converted name to number array: {}", nameArray);
        logger.info("Converted surname to number array: {}", surnameArray);
        logger.info("Converted timestamp to number array: {}", timeArray);
    
        List<Integer> randomNumbers = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            randomNumbers.add(new Random().nextInt(10));
        }
        logger.info("Generated random numbers: {}", randomNumbers);

        Integer[] userId = new Integer[24];
        Arrays.fill(userId, null);
    
        Random rand = new Random();
        int iterations = 0;
        
        logger.info("Starting to fill userId array...");
    
        while (Arrays.asList(userId).contains(null)) {
            iterations++;
            if (iterations > 1000) {
                logger.error("Too many iterations while generating user ID. Possible infinite loop.");
                throw new RuntimeException("Error generating user ID, possible infinite loop.");
            }
    
            int index = rand.nextInt(24);
    
            if (userId[index] != null) {
                continue;
            }
    
            int source = rand.nextInt(4) + 1;
    
            Integer value = null;
    
            switch (source) {
                case 1: 
                    if (!nameArray.isEmpty()) {
                        value = nameArray.remove(rand.nextInt(nameArray.size()));
                        logger.info("Picked value {} from nameArray at index {}", value, index);
                    }
                    break;
                case 2: 
                    if (!surnameArray.isEmpty()) {
                        value = surnameArray.remove(rand.nextInt(surnameArray.size()));
                        logger.info("Picked value {} from surnameArray at index {}", value, index);
                    }
                    break;
                case 3: 
                    if (!timeArray.isEmpty()) {
                        value = timeArray.remove(rand.nextInt(timeArray.size()));
                        logger.info("Picked value {} from timeArray at index {}", value, index);
                    }
                    break;
                case 4: 
                    if (!randomNumbers.isEmpty()) {
                        value = randomNumbers.remove(rand.nextInt(randomNumbers.size()));
                        logger.info("Picked value {} from randomNumbers at index {}", value, index);
                    }
                    break;
            }
    
            if (value != null) {
                userId[index] = value % 10;
            }
        }

        logger.info("Final userId array: {}", Arrays.toString(userId));
    
        StringBuilder userIdStr = new StringBuilder();
        for (Integer num : userId) {
            userIdStr.append(num);
        }
    
        logger.info("Final generated User ID: {}", userIdStr);
    
        return userIdStr.toString();
    }
}

class UserKeyGenerator {
    private static final Logger logger = LoggerFactory.getLogger(UserKeyGenerator.class);
    
    private static List<Integer> stringToNumberArray(String s) {
        List<Integer> numberArray = new ArrayList<>();
        for (char c : s.toCharArray()) {
            numberArray.add((int) c); 
        }
        return numberArray;
    }

    private static List<Integer> timeToNumberArray(long timestamp) {
        List<Integer> numberArray = new ArrayList<>();
        for (char c : String.valueOf(timestamp).toCharArray()) {
            numberArray.add(Character.getNumericValue(c));
        }
        return numberArray;
    }

    private static List<Integer> idToNumberArray(String userId) {
        List<Integer> numberArray = new ArrayList<>();
        for (char c : userId.toCharArray()) {
            numberArray.add(Character.getNumericValue(c)); 
        }
        return numberArray;
    }

    public static String generateUserKey(String name, String surname, long timestamp, String userId) {
        logger.info("Starting user key generation for: {} {}", name, surname);
    
        List<Integer> nameArray = stringToNumberArray(name);
        List<Integer> surnameArray = stringToNumberArray(surname);
        List<Integer> timeArray = timeToNumberArray(timestamp);
        List<Integer> userIdArray = idToNumberArray(userId);
    
        List<Character> allowedChars = new ArrayList<>();
        for (char c = '0'; c <= '9'; c++) allowedChars.add(c);
        for (char c = 'a'; c <= 'z'; c++) allowedChars.add(c);
        for (char c = 'A'; c <= 'Z'; c++) allowedChars.add(c);
    
        Random random = new Random();
        Character[] userKey = new Character[48];
        List<Integer> availableIndexes = new ArrayList<>();
        for (int i = 0; i < 48; i++) availableIndexes.add(i);
    
        while (!availableIndexes.isEmpty()) {
            int randomIndex = availableIndexes.remove(random.nextInt(availableIndexes.size()));
            int source = random.nextInt(5) + 1;
            Integer value = null;
    
            switch (source) {
                case 1:
                    if (!nameArray.isEmpty()) value = nameArray.get(random.nextInt(nameArray.size()));
                    break;
                case 2:
                    if (!surnameArray.isEmpty()) value = surnameArray.get(random.nextInt(surnameArray.size()));
                    break;
                case 3:
                    if (!timeArray.isEmpty()) value = timeArray.get(random.nextInt(timeArray.size()));
                    break;
                case 4:
                    if (!userIdArray.isEmpty()) value = userIdArray.get(random.nextInt(userIdArray.size()));
                    break;
                case 5:
                    userKey[randomIndex] = allowedChars.get(random.nextInt(allowedChars.size()));
                    logger.info("Inserted random char '{}' at index {}", userKey[randomIndex], randomIndex);
                    continue;
            }
    
            if (value != null) {
                int index = Math.abs(value) % allowedChars.size();
                userKey[randomIndex] = allowedChars.get(index);
                logger.info("Inserted value '{}' at index {} from source {}", userKey[randomIndex], randomIndex, source);
            } else {
                logger.warn("No value selected for index {}", randomIndex);
            }
        }
    
        String finalKey = new String(toPrimitiveCharArray(userKey));
        logger.info("Generated user key: {}", finalKey);
        return finalKey;
    }
    
    private static char[] toPrimitiveCharArray(Character[] chars) {
        char[] result = new char[chars.length];
        for (int i = 0; i < chars.length; i++) {
            result[i] = (chars[i] != null) ? chars[i] : '0';
        }
        return result;
    }
}
