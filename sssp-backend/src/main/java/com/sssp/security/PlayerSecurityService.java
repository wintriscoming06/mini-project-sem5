package com.sssp.security;

import com.sssp.user.User;
import com.sssp.user.UserRepository;
import org.springframework.stereotype.Service;

@Service("playerSecurityService")
public class PlayerSecurityService {

    private final UserRepository userRepository;

    public PlayerSecurityService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public boolean isOwner(Long userId, String username) {
        if (userId == null || username == null) {
            return false;
        }
        User user = userRepository.findByUsername(username).orElse(null);
        return user != null && user.getId().equals(userId);
    }
}
