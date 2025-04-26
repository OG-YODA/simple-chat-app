package com.example.demo.security;

import com.example.demo.domain.UserSecurity;
import com.example.demo.repo.UserSecurityRepo;
import com.example.demo.service.UserSecurityService;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Optional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.aspectj.lang.ProceedingJoinPoint;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.aspectj.lang.annotation.Around;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import org.aspectj.lang.annotation.Aspect;

@Aspect
@Component
public class SecurityKeyAspect {

    @Autowired
    private UserSecurityRepo userSecurityRepository;
    private UserSecurityService userSecurityService;

    @Autowired
    public SecurityKeyAspect(UserSecurityService userSecurityService) {
        this.userSecurityService = userSecurityService;
    }

    @Around("@annotation(com.example.demo.security.SecuredByKey)")
    public Object validateSecurityKey(ProceedingJoinPoint joinPoint) throws Throwable {
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes()).getRequest();
        
        String userId = request.getHeader("X-USER-ID");
        String userKey = request.getHeader("X-SECURITY-KEY");
    
        System.out.println("SecurityKeyAspect: Intercepted request to " + request.getRequestURI());
        System.out.println("Headers: X-USER-ID=" + userId + ", X-SECURITY-KEY=" + userKey);
    
        if (userId == null || userKey == null) {
            System.out.println("Missing credentials");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing security credentials");
        }
    
        Optional<UserSecurity> userSecOpt;
        try {
            userSecOpt = userSecurityRepository.findByHashedUserId(userSecurityService.hashUserId(userId));
        } catch (NumberFormatException e) {
            System.out.println("Invalid userId format: " + userId);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid user ID format");
        }
    
        if (userSecOpt.isEmpty()) {
            System.out.println("User not found for userId=" + userId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid security key");
        }
    
        String expectedKey = userSecOpt.get().getUserKey();
        System.out.println("Comparing keys: expected=" + expectedKey + ", provided=" + userKey);
    
        if (!userKey.equals(expectedKey)) {
            System.out.println("Provided key does not match expected");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid security key");
        }
    
        System.out.println("Security check passed for userId=" + userId);
        Object result = joinPoint.proceed(); 
        System.out.println("Endpoint proceeded successfully: " + joinPoint.getSignature());
    
        return result;
    }
}