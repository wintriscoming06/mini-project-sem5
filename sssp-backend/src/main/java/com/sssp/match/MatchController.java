package com.sssp.match;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sssp.common.enums.MatchStatus;
import com.sssp.match.dto.*;
import com.sssp.match.MatchService;
import com.sssp.stats.dto.PlayerMatchStatsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;
    private final ObjectMapper objectMapper;

    @GetMapping({"", "/"})
    public ResponseEntity<List<MatchResponse>> getAllMatches() {
        return ResponseEntity.ok(matchService.getAllMatches());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MatchResponse> getMatch(@PathVariable Long id) {
        return ResponseEntity.ok(matchService.getMatch(id));
    }

    @PostMapping({"", "/"})
    public ResponseEntity<?> createMatch(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (body.containsKey("tournamentId")) {
            MatchRequest request = objectMapper.convertValue(body, MatchRequest.class);
            return ResponseEntity.ok(matchService.createMatch(request, userDetails.getUsername()));
        } else {
            MatchCreateRequest request = objectMapper.convertValue(body, MatchCreateRequest.class);
            Map<String, Object> result = matchService.logPlayerMatch(null, request, userDetails.getUsername());
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        }
    }

    @PostMapping("/player/{playerId}")
    public ResponseEntity<Map<String, Object>> logPlayerMatch(
            @PathVariable Long playerId,
            @RequestBody MatchCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> result = matchService.logPlayerMatch(playerId, request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @GetMapping("/player/{playerId}")
    public ResponseEntity<Map<String, Object>> getPlayerMatches(
            @PathVariable Long playerId,
            @AuthenticationPrincipal UserDetails userDetails) {
        List<MatchPlayerRecordResponse> list = matchService.getPlayerMatches(playerId, userDetails.getUsername());
        return ResponseEntity.ok(Map.of("matches", list));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deletePlayerMatch(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(matchService.deletePlayerMatch(id, userDetails.getUsername()));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<MatchResponse> updateMatchStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        MatchStatus status = MatchStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(matchService.updateMatchStatus(id, status, userDetails.getUsername()));
    }

    @PostMapping("/{id}/events")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<MatchEventResponse> addMatchEvent(
            @PathVariable Long id,
            @RequestBody MatchEventRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(matchService.addMatchEvent(id, request, userDetails.getUsername()));
    }

    @GetMapping("/{id}/events")
    public ResponseEntity<List<MatchEventResponse>> getMatchEvents(@PathVariable Long id) {
        return ResponseEntity.ok(matchService.getMatchEvents(id));
    }

    @PostMapping("/{id}/participations")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<MatchParticipationResponse> addParticipation(
            @PathVariable Long id,
            @RequestBody MatchParticipationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(matchService.addParticipation(id, request, userDetails.getUsername()));
    }

    @GetMapping("/{id}/participations")
    public ResponseEntity<List<MatchParticipationResponse>> getParticipations(@PathVariable Long id) {
        return ResponseEntity.ok(matchService.getParticipations(id));
    }

    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<MatchResponse> confirmMatch(
            @PathVariable Long id,
            @RequestBody MatchConfirmRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(matchService.confirmMatch(id, request, userDetails.getUsername()));
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<List<PlayerMatchStatsResponse>> getMatchStats(@PathVariable Long id) {
        return ResponseEntity.ok(matchService.getMatchStats(id));
    }
}
