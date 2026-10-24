package com.sssp.tournament;

import com.sssp.match.dto.MatchRequest;
import com.sssp.match.dto.MatchResponse;
import com.sssp.team.dto.TeamMemberRequest;
import com.sssp.team.dto.TeamMemberResponse;
import com.sssp.team.dto.TeamRequest;
import com.sssp.team.dto.TeamResponse;
import com.sssp.tournament.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TournamentController {

    private final TournamentService tournamentService;

    // ==================== TOURNAMENTS ====================

    @GetMapping("/tournaments")
    public ResponseEntity<List<TournamentResponse>> getAllTournaments() {
        return ResponseEntity.ok(tournamentService.getAllTournaments());
    }

    @GetMapping("/tournaments/my")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<List<TournamentResponse>> getMyTournaments(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(tournamentService.getOrganizerTournaments(userDetails.getUsername()));
    }

    @GetMapping("/tournaments/{id}")
    public ResponseEntity<TournamentResponse> getTournament(@PathVariable Long id) {
        return ResponseEntity.ok(tournamentService.getTournament(id));
    }

    @PostMapping("/tournaments")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<TournamentResponse> createTournament(
            @Valid @RequestBody TournamentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(tournamentService.createTournament(request, userDetails.getUsername()));
    }

    @PutMapping("/tournaments/{id}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<TournamentResponse> updateTournament(
            @PathVariable Long id,
            @Valid @RequestBody TournamentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(tournamentService.updateTournament(id, request, userDetails.getUsername()));
    }

    @PatchMapping("/tournaments/{id}/status")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<TournamentResponse> updateTournamentStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        TournamentStatus status = TournamentStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(tournamentService.updateTournamentStatus(id, status, userDetails.getUsername()));
    }

    @DeleteMapping("/tournaments/{id}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<Void> deleteTournament(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        tournamentService.deleteTournament(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    // ==================== TEAMS & SQUADS ====================

    @GetMapping("/tournaments/{id}/teams")
    public ResponseEntity<List<TeamResponse>> getTeamsForTournament(@PathVariable Long id) {
        return ResponseEntity.ok(tournamentService.getTeamsForTournament(id));
    }

    @PostMapping("/tournaments/{id}/teams")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<TeamResponse> createTeam(
            @PathVariable Long id,
            @Valid @RequestBody TeamRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        request.setTournamentId(id);
        return ResponseEntity.ok(tournamentService.createTeam(request, userDetails.getUsername()));
    }

    @PostMapping("/teams/{teamId}/members")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<TeamMemberResponse> addTeamMember(
            @PathVariable Long teamId,
            @RequestBody TeamMemberRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(tournamentService.addTeamMember(teamId, request, userDetails.getUsername()));
    }

    @DeleteMapping("/teams/{teamId}/members/{playerId}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<Void> removeTeamMember(
            @PathVariable Long teamId,
            @PathVariable Long playerId,
            @AuthenticationPrincipal UserDetails userDetails) {
        tournamentService.removeTeamMember(teamId, playerId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    // ==================== FIXTURES & SCORES ====================

    @GetMapping("/tournaments/{id}/matches")
    public ResponseEntity<List<MatchResponse>> getTournamentMatches(@PathVariable Long id) {
        return ResponseEntity.ok(tournamentService.getTournamentMatches(id));
    }

    @PostMapping("/tournaments/{id}/matches")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<MatchResponse> createTournamentMatch(
            @PathVariable Long id,
            @RequestBody MatchRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(tournamentService.createTournamentMatch(id, request, userDetails.getUsername()));
    }

    @PutMapping("/tournaments/{id}/matches/{matchId}/score")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<MatchResponse> updateMatchScore(
            @PathVariable Long id,
            @PathVariable Long matchId,
            @RequestBody TournamentMatchScoreRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(tournamentService.updateMatchScore(id, matchId, request, userDetails.getUsername()));
    }

    // ==================== PLAYER STATS (GPI INPUT FEED) ====================

    @GetMapping("/tournaments/{id}/stats")
    public ResponseEntity<List<TournamentPlayerStatsResponse>> getTournamentStats(@PathVariable Long id) {
        return ResponseEntity.ok(tournamentService.getTournamentStats(id));
    }

    @PostMapping("/tournaments/{id}/stats")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<TournamentPlayerStatsResponse> addOrUpdateStats(
            @PathVariable Long id,
            @Valid @RequestBody TournamentPlayerStatsRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(tournamentService.addOrUpdateTournamentPlayerStats(id, request, userDetails.getUsername()));
    }

    @DeleteMapping("/tournaments/{id}/stats/{statsId}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<Void> deleteStats(
            @PathVariable Long id,
            @PathVariable Long statsId,
            @AuthenticationPrincipal UserDetails userDetails) {
        tournamentService.deleteTournamentPlayerStats(id, statsId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    // ==================== PLAYER SEARCH ====================

    @GetMapping("/organizer/players/search")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<List<Map<String, Object>>> searchPlayers(@RequestParam(required = false) String query) {
        return ResponseEntity.ok(tournamentService.searchSignedUpPlayers(query));
    }
}
