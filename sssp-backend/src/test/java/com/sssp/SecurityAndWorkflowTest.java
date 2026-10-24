package com.sssp;

import com.sssp.auth.AuthService;
import com.sssp.auth.dto.RegisterRequest;
import com.sssp.common.enums.ApplicationStatus;
import com.sssp.tournament.TournamentStatus;
import com.sssp.common.enums.UserRole;
import com.sssp.common.exception.BadRequestException;
import com.sssp.tournament.Tournament;
import com.sssp.tournament.TournamentRepository;
import com.sssp.tournament.TournamentService;
import com.sssp.application.TournamentApplicationRepository;
import com.sssp.user.User;
import com.sssp.user.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SecurityAndWorkflowTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private TournamentRepository tournamentRepository;

    @Mock
    private TournamentApplicationRepository tournamentApplicationRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    @InjectMocks
    private TournamentService tournamentService;

    @Test
    @DisplayName("Security: Prohibit self-registration as ADMIN")
    void testAdminSelfRegistrationProhibited() {
        RegisterRequest req = RegisterRequest.builder()
                .username("malicious_admin")
                .email("admin@sssp.com")
                .password("secret123")
                .role(UserRole.ADMIN)
                .build();

        when(userRepository.existsByEmail("admin@sssp.com")).thenReturn(false);
        when(userRepository.existsByUsername("malicious_admin")).thenReturn(false);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> authService.register(req));
        assertTrue(ex.getMessage().contains("Self-registration as ADMIN is prohibited"));
    }

    @Test
    @DisplayName("Workflow: Prevent duplicate tournament registration")
    void testPreventDuplicateTournamentApplication() {
        Long tournamentId = 100L;
        String playerUsername = "striker9";

        User player = new User();
        player.setId(1L);
        player.setUsername(playerUsername);
        player.setRole(UserRole.PLAYER);

        Tournament tournament = new Tournament();
        tournament.setId(tournamentId);
        tournament.setStatus(TournamentStatus.OPEN);

        when(userRepository.findByUsername(playerUsername)).thenReturn(Optional.of(player));
        when(tournamentRepository.findById(tournamentId)).thenReturn(Optional.of(tournament));
        when(tournamentApplicationRepository.existsByPlayerIdAndTournamentId(player.getId(), tournamentId)).thenReturn(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> 
            tournamentService.applyToTournament(tournamentId, playerUsername)
        );
        assertEquals("Player has already applied", ex.getMessage());
    }

    @Test
    @DisplayName("Workflow: Non-open tournament rejects application")
    void testClosedTournamentRejectsApplication() {
        Long tournamentId = 101L;
        String playerUsername = "striker9";

        User player = new User();
        player.setId(1L);
        player.setUsername(playerUsername);

        Tournament tournament = new Tournament();
        tournament.setId(tournamentId);
        tournament.setStatus(TournamentStatus.REGISTRATION_CLOSED);

        when(userRepository.findByUsername(playerUsername)).thenReturn(Optional.of(player));
        when(tournamentRepository.findById(tournamentId)).thenReturn(Optional.of(tournament));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> 
            tournamentService.applyToTournament(tournamentId, playerUsername)
        );
        assertEquals("Tournament is not open for registration", ex.getMessage());
    }
}
