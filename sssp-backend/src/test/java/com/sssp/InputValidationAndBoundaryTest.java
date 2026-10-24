package com.sssp;

import com.sssp.auth.dto.LoginRequest;
import com.sssp.auth.dto.RegisterRequest;
import com.sssp.common.enums.UserRole;
import com.sssp.common.exception.BadRequestException;
import com.sssp.user.User;
import com.sssp.user.UserRepository;
import com.sssp.auth.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class InputValidationAndBoundaryTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    @ParameterizedTest
    @ValueSource(strings = {
            "' OR '1'='1",
            "admin'--",
            "<script>alert('xss')</script>",
            "player\"><img src=x onerror=alert(1)>",
            "DROP TABLE users;--",
            "SELECT * FROM player_profiles"
    })
    @DisplayName("Security Boundary: Injection payloads in login do not compromise authentication")
    void testInjectionPayloadsHandledGracefully(String hostileIdentifier) {
        LoginRequest req = new LoginRequest();
        req.setIdentifier(hostileIdentifier);
        req.setPassword("somePassword");
        req.setRole(UserRole.PLAYER);

        when(userRepository.findByUsername(hostileIdentifier))
                .thenReturn(Optional.empty());

        BadRequestException ex = assertThrows(BadRequestException.class, () -> authService.login(req));
        assertEquals("User not found with the given credentials", ex.getMessage());
    }

    @Test
    @DisplayName("Security Boundary: Mismatched portal role rejects authentication safely")
    void testPortalRoleMismatchRejected() {
        User playerUser = new User();
        playerUser.setId(10L);
        playerUser.setUsername("forward10");
        playerUser.setRole(UserRole.PLAYER);

        LoginRequest req = new LoginRequest();
        req.setIdentifier("forward10");
        req.setPassword("password123");
        req.setRole(UserRole.SCOUT); // Trying to log in to scout portal with player credentials

        when(userRepository.findByUsername("forward10"))
                .thenReturn(Optional.of(playerUser));

        BadRequestException ex = assertThrows(BadRequestException.class, () -> authService.login(req));
        assertTrue(ex.getMessage().contains("Access denied: You cannot log into the Scout portal with a Player account"));
    }

    @Test
    @DisplayName("Security Boundary: Duplicate email or username rejects registration with clean message")
    void testDuplicateRegistrationCleanRejection() {
        RegisterRequest req = RegisterRequest.builder()
                .username("existing_user")
                .email("used@sssp.com")
                .password("password123")
                .role(UserRole.PLAYER)
                .build();

        when(userRepository.existsByEmail("used@sssp.com")).thenReturn(true);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> authService.register(req));
        assertEquals("Email is already in use", ex.getMessage());
    }
}
