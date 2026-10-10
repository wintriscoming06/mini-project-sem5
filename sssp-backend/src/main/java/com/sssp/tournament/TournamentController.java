package com.sssp.tournament;

import com.sssp.team.dto.TeamMemberResponse;

import com.sssp.team.dto.TeamMemberRequest;

import com.sssp.team.dto.TeamRequest;

import com.sssp.team.dto.TeamResponse;

import com.sssp.application.dto.ApplicationResponse;

import com.sssp.common.enums.ApplicationStatus;
import com.sssp.tournament.TournamentStatus;
import com.sssp.tournament.dto.*;
import com.sssp.tournament.TournamentService;
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

    @GetMapping("/tournaments")
    public ResponseEntity<List<TournamentResponse>> getAllTournaments() {
        return ResponseEntity.ok(tournamentService.getAllTournaments());
    }

    @GetMapping("/tournaments/{id}")
    public ResponseEntity<TournamentResponse> getTournament(@PathVariable Long id) {
        return ResponseEntity.ok(tournamentService.getTournament(id));
    }

    @PostMapping("/tournaments")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<TournamentResponse> createTournament(
            @RequestBody TournamentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(tournamentService.createTournament(request, userDetails.getUsername()));
    }

    @PutMapping("/tournaments/{id}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<TournamentResponse> updateTournament(
            @PathVariable Long id,
            @RequestBody TournamentRequest request,
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

    @PostMapping("/tournaments/{id}/applications")
    @PreAuthorize("hasRole('PLAYER')")
    public ResponseEntity<ApplicationResponse> applyToTournament(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(tournamentService.applyToTournament(id, userDetails.getUsername()));
    }

    @GetMapping("/tournaments/{id}/applications")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<List<ApplicationResponse>> getApplicationsForTournament(@PathVariable Long id) {
        return ResponseEntity.ok(tournamentService.getApplicationsForTournament(id));
    }

    @GetMapping("/tournaments/my-applications")
    @PreAuthorize("hasRole('PLAYER')")
    public ResponseEntity<List<ApplicationResponse>> getPlayerApplications(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(tournamentService.getPlayerApplications(userDetails.getUsername()));
    }

    @PatchMapping("/applications/{id}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<ApplicationResponse> decideApplication(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        ApplicationStatus decision = ApplicationStatus.valueOf(body.get("decision"));
        return ResponseEntity.ok(tournamentService.decideApplication(id, decision, userDetails.getUsername()));
    }
    
    @PatchMapping("/applications/{id}/withdraw")
    @PreAuthorize("hasRole('PLAYER')")
    public ResponseEntity<ApplicationResponse> withdrawApplication(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(tournamentService.withdrawApplication(id, userDetails.getUsername()));
    }

    @GetMapping("/tournaments/{tournamentId}/teams")
    public ResponseEntity<List<TeamResponse>> getTeamsForTournament(@PathVariable Long tournamentId) {
        return ResponseEntity.ok(tournamentService.getTeamsForTournament(tournamentId));
    }
}
