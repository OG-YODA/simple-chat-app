package com.example.demo.components;

import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import com.example.demo.repo.UserSecurityRepo;
import com.example.demo.service.UserSecurityService;
import com.example.demo.domain.UserSecurity;

import java.util.Optional;


@Component
public class AuthChannelInterceptorAdapter implements ChannelInterceptor {

    @Autowired
    private UserSecurityRepo userSecurityRepository;
    private final UserSecurityService userSecurityService;

    @Autowired
    public AuthChannelInterceptorAdapter(UserSecurityService userSecurityService) {
        this.userSecurityService = userSecurityService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String userId = accessor.getFirstNativeHeader("userId");
            String accessKey = accessor.getFirstNativeHeader("accessKey");

            if (userId == null || accessKey == null) {
                throw new IllegalArgumentException("Missing auth headers");
            }

            // user check
            String hashedUserId = userSecurityService.hashUserId(userId);
            Optional<UserSecurity> userSecurityOpt = userSecurityRepository.findByHashedUserId(hashedUserId);
            if (userSecurityOpt.isEmpty() || !userSecurityOpt.get().getUserKey().equals(accessKey)) {
                throw new IllegalArgumentException("Invalid credentials");
            }

            accessor.setUser(new UsernamePasswordAuthenticationToken(userId, null));
        }

        return message;
    }
}
