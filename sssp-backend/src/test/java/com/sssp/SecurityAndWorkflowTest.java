package com.sssp;

import com.sssp.common.enums.UserRole;
import com.sssp.tournament.TournamentStatus;
import com.sssp.tournament.Tournament;
import com.sssp.tournament.TournamentRepository;
import com.sssp.tournament.TournamentService;
import com.sssp.application.TournamentApplicationRepository;
import com.sssp.auth.AuthService;
import com.sssp.auth.dto.RegisterRequest;
import com.sssp.common.exception.BadRequestException;
import com.sssp.common.exception.UnauthorizedException;
import com.sssp.security.RateLimitingFilter;
import com.sssp.user.User;
import com.sssp.user.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
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
                .password("secret123")
                .role(UserRole.ADMIN)
                .build();

        when(userRepository.existsByUsername("malicious_admin")).thenReturn(false);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> authService.register(req));
        assertTrue(ex.getMessage().contains("Self-registration as ADMIN is prohibited"));
    }

    @Test
    @DisplayName("Workflow: Prevent unauthorized organizer tournament management")
    void testUnauthorizedTournamentManagement() {
        Long tournamentId = 100L;
        String organizerUsername = "real_organizer";
        String intruderUsername = "fake_organizer";

        User organizer = new User();
        organizer.setId(1L);
        organizer.setUsername(organizerUsername);

        Tournament tournament = new Tournament();
        tournament.setId(tournamentId);
        tournament.setOrganizer(organizer);

        when(tournamentRepository.findById(tournamentId)).thenReturn(Optional.of(tournament));

        assertThrows(UnauthorizedException.class, () -> 
            tournamentService.deleteTournament(tournamentId, intruderUsername)
        );
    }

    @Test
    @DisplayName("Security: RateLimitingFilter limits excessive authentication attempts")
    void testRateLimitingOnLogin() throws Exception {
        RateLimitingFilter filter = new RateLimitingFilter();
        filter.reset();

        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/login");
        request.setRemoteAddr("192.168.1.100");

        // First 15 attempts within window should succeed (200 status pass-through)
        for (int i = 0; i < RateLimitingFilter.MAX_REQUESTS_PER_WINDOW; i++) {
            MockHttpServletResponse response = new MockHttpServletResponse();
            MockFilterChain chain = new MockFilterChain();
            filter.doFilter(request, response, chain);
            assertEquals(200, response.getStatus(), "Attempt " + (i + 1) + " should be allowed");
        }

        // 16th attempt should be blocked with 429 Too Many Requests
        MockHttpServletResponse blockedResponse = new MockHttpServletResponse();
        MockFilterChain blockedChain = new MockFilterChain();
        filter.doFilter(request, blockedResponse, blockedChain);

        assertEquals(429, blockedResponse.getStatus(), "Excessive request should be rate-limited with HTTP 429");
        assertEquals("60", blockedResponse.getHeader("Retry-After"));
        assertTrue(blockedResponse.getContentAsString().contains("Too many authentication attempts"));
    }

    @Test
    @DisplayName("Security: RateLimitingFilter permits non-sensitive GET endpoints without throttling")
    void testRateLimitingIgnoresGetEndpoints() throws Exception {
        RateLimitingFilter filter = new RateLimitingFilter();
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/tournaments");
        request.setRemoteAddr("192.168.1.101");

        for (int i = 0; i < 30; i++) {
            MockHttpServletResponse response = new MockHttpServletResponse();
            MockFilterChain chain = new MockFilterChain();
            filter.doFilter(request, response, chain);
            assertEquals(200, response.getStatus());
        }
    }
}
