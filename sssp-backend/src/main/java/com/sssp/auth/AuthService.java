package com.sssp.auth;

import com.sssp.auth.dto.AuthResponse;
import com.sssp.auth.dto.LoginRequest;
import com.sssp.auth.dto.RegisterRequest;
import com.sssp.auth.dto.UserResponse;
import com.sssp.user.OrganizerProfile;
import com.sssp.user.User;
import com.sssp.user.OrganizerProfileRepository;
import com.sssp.user.UserRepository;
import com.sssp.security.JwtTokenProvider;
import com.sssp.common.enums.UserRole;
import com.sssp.common.enums.ProfileVisibility;
import com.sssp.common.exception.BadRequestException;
import com.sssp.player.PlayerProfile;
import com.sssp.player.PlayerProfileRepository;
import com.sssp.user.ScoutProfile;
import com.sssp.user.ScoutProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final PlayerProfileRepository playerProfileRepository;
    private final OrganizerProfileRepository organizerProfileRepository;
    private final ScoutProfileRepository scoutProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    @Autowired
    public AuthService(UserRepository userRepository,
                       PlayerProfileRepository playerProfileRepository,
                       OrganizerProfileRepository organizerProfileRepository,
                       ScoutProfileRepository scoutProfileRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.playerProfileRepository = playerProfileRepository;
        this.organizerProfileRepository = organizerProfileRepository;
        this.scoutProfileRepository = scoutProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }
        if (request.getRole() == UserRole.ADMIN) {
            throw new BadRequestException("Self-registration as ADMIN is prohibited");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setActive(true);

        User savedUser = userRepository.save(user);

        if (savedUser.getRole() == UserRole.PLAYER) {
            PlayerProfile playerProfile = new PlayerProfile();
            playerProfile.setUser(savedUser);
            playerProfile.setVisibility(ProfileVisibility.PUBLIC);
            playerProfile.setFullName(savedUser.getUsername());
            playerProfileRepository.save(playerProfile);
        } else if (savedUser.getRole() == UserRole.ORGANIZER) {
            OrganizerProfile organizerProfile = new OrganizerProfile();
            organizerProfile.setUser(savedUser);
            organizerProfileRepository.save(organizerProfile);
        } else if (savedUser.getRole() == UserRole.SCOUT) {
            ScoutProfile scoutProfile = new ScoutProfile();
            scoutProfile.setUser(savedUser);
            scoutProfileRepository.save(scoutProfile);
        }

        String token = jwtTokenProvider.generateToken(savedUser.getUsername(), "ROLE_" + savedUser.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(savedUser.getId())
                .username(savedUser.getUsername())
                .role(savedUser.getRole())
                .evaluatorPermission(savedUser.isEvaluatorPermission())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getIdentifier())
                .orElseThrow(() -> new BadRequestException("User not found with the given credentials"));

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), request.getPassword())
        );

        if (request.getRole() != null && user.getRole() != UserRole.ADMIN && user.getRole() != request.getRole()) {
            String portalName = formatRoleName(request.getRole());
            String userRoleName = formatRoleName(user.getRole());
            throw new BadRequestException("Access denied: You cannot log into the " + portalName + " portal with a " + userRoleName + " account. Please select the " + userRoleName + " login portal.");
        }

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtTokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .evaluatorPermission(user.isEvaluatorPermission())
                .build();
    }

    public UserResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadRequestException("User not found"));
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .active(user.isActive())
                .evaluatorPermission(user.isEvaluatorPermission())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private String formatRoleName(UserRole role) {
        if (role == null) return "specified";
        switch (role) {
            case PLAYER: return "Player";
            case SCOUT: return "Scout";
            case ORGANIZER: return "Organizer";
            case ADMIN: return "Admin";
            default: return role.name();
        }
    }
}
