package com.sssp.security;

import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final JwtTokenProvider jwtTokenProvider;

    public JwtService(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public String generateToken(String username, String role) {
        return jwtTokenProvider.generateToken(username, role);
    }

    public String extractUsername(String token) {
        return jwtTokenProvider.getUsernameFromToken(token);
    }

    public boolean isTokenValid(String token) {
        return jwtTokenProvider.validateToken(token);
    }
}
