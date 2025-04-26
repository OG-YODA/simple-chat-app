package com.example.demo.resource;

import com.example.demo.domain.User;
import com.example.demo.domain.UserProfile;
import com.example.demo.dto.ContactDTO;
import com.example.demo.service.UserSecurityService;
import com.example.demo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class UserResource/*Controller*/{
    private final UserService userService;
    private final UserSecurityService userSecurityService;
    private static final Logger logger = LoggerFactory.getLogger(UserResource.class);

    @GetMapping("/welcome")
    public String welcome(){
        return "Welcome to the unprotected page!";
    }

    @PostMapping("/register") 
    public ResponseEntity<User> register(@RequestBody User user) {
        logger.info("Received registration request for user: {}", user.getEmail());
        User newUser = userService.registerUser(user);
        logger.info("User registered successfully: {}", newUser.getEmail());
        return ResponseEntity.ok(newUser);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");

        logger.info("Login attempt for user: {}", email);
        User user = userService.loginUser(email, password);

        Map<String, Object> response = new HashMap<>();
        response.put("userId", user.getId());
        response.put("username", user.getUsername());
        response.put("accessKey", userSecurityService.getUserKey(user.getId()));
        response.put("message", "Login successful for user: " + user.getUsername());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile/{username}")
    public ResponseEntity<?> getUserProfile(@PathVariable String username) {
        try {
            logger.info("Tryin to cath data for user: ", username);
            UserProfile profile = userService.getUserProfileByUsername(username);
            if (profile != null) {
                return ResponseEntity.ok(profile);
            } else {
                return ResponseEntity.status(404).body("User not found");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Server error");
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable String id) {
        logger.info("Delete request for user with ID: {}", id);
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok("User with ID " + id + " deleted successfully!");
        } catch (RuntimeException e) {
            logger.error("Error deleting user with ID: {}", id, e);
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @GetMapping("/friends/{id}")
    public ResponseEntity<?> getFriends(@PathVariable String id) {
        System.out.println("Received request to fetch friends for user ID: " + id);

        try {
            List<ContactDTO> friends = userService.getUserContacts(id);
            System.out.println("Successfully retrieved " + friends.size() + " friends for user ID: " + id);

            return ResponseEntity.ok(friends);
        } catch (Exception e) {
            System.err.println("Error occurred while fetching friends for user ID: " + id);
            e.printStackTrace(); 
            return ResponseEntity.status(500).body("Server error");
        }
    }
}