package com.sssp.player;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sssp.gpi.GPIService;
import com.sssp.match.dto.MatchPlayerRecordResponse;
import com.sssp.match.MatchService;
import com.sssp.player.dto.AttributesUpdateRequest;
import com.sssp.player.dto.CardCustomizationRequest;
import com.sssp.player.dto.PlayerProfileRequest;
import com.sssp.player.dto.PlayerProfileResponse;
import com.sssp.player.PlayerService;
import com.sssp.ranking.RankingService;
import com.sssp.stats.StatsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/players")
public class PlayerController {

    @Autowired
    private PlayerService playerService;

    @Autowired(required = false)
    private StatsService statsService;

    @Autowired(required = false)
    private GPIService gpiService;

    @Autowired(required = false)
    private RankingService rankingService;

    @Autowired(required = false)
    private MatchService matchService;

    @Autowired
    private ObjectMapper objectMapper;

    private Map<String, Object> wrapProfileResponse(PlayerProfileResponse profile) {
        Map<String, Object> map = objectMapper.convertValue(profile, new TypeReference<Map<String, Object>>() {});
        map.put("player", profile);
        return map;
    }

    // ---- Coach / Scout Player Discovery Query ----
    @GetMapping({"", "/"})
    public ResponseEntity<Map<String, Object>> searchPlayers(
            @RequestParam(required = false) String position,
            @RequestParam(required = false) Double minGpi,
            @RequestParam(required = false) Double maxGpi,
            @RequestParam(required = false) Integer minMatches,
            @RequestParam(required = false) Integer minAge,
            @RequestParam(required = false) Integer maxAge,
            @RequestParam(required = false) String club,
            @RequestParam(required = false) String team,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDir) {
        String teamParam = club != null ? club : team;
        List<PlayerProfileResponse> players = playerService.searchPlayers(position, minGpi, maxGpi, minMatches, minAge, maxAge, teamParam, sortBy, sortDir);
        return ResponseEntity.ok(Map.of("players", players));
    }

    // ---- Endpoints for the currently authenticated player ----

    @GetMapping("/me")
    @PreAuthorize("hasRole('PLAYER')")
    public ResponseEntity<Map<String, Object>> getMyProfile(@AuthenticationPrincipal UserDetails userDetails) {
        PlayerProfileResponse profile = playerService.getMyProfile(userDetails.getUsername());
        return ResponseEntity.ok(wrapProfileResponse(profile));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('PLAYER')")
    public ResponseEntity<Map<String, Object>> updateMyProfile(
            @RequestBody PlayerProfileRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        PlayerProfileResponse profile = playerService.updateMyProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(wrapProfileResponse(profile));
    }

    @PutMapping("/me/card")
    @PreAuthorize("hasRole('PLAYER')")
    public ResponseEntity<Map<String, Object>> updateMyCard(
            @RequestBody CardCustomizationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        PlayerProfileResponse profile = playerService.updateCardCustomization(userDetails.getUsername(), request);
        return ResponseEntity.ok(wrapProfileResponse(profile));
    }

    @PutMapping("/{id}/card")
    public ResponseEntity<Map<String, Object>> updatePlayerCard(
            @PathVariable Long id,
            @RequestBody CardCustomizationRequest request) {
        PlayerProfileResponse profile = playerService.updateCardCustomizationById(id, request);
        return ResponseEntity.ok(wrapProfileResponse(profile));
    }

    @PutMapping("/me/attributes")
    @PreAuthorize("hasRole('PLAYER')")
    public ResponseEntity<Map<String, Object>> updateMyAttributes(
            @RequestBody AttributesUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        PlayerProfileResponse profile = playerService.updateAttributes(userDetails.getUsername(), request);
        return ResponseEntity.ok(wrapProfileResponse(profile));
    }

    @PutMapping("/{id}/attributes")
    public ResponseEntity<Map<String, Object>> updatePlayerAttributes(
            @PathVariable Long id,
            @RequestBody AttributesUpdateRequest request) {
        PlayerProfileResponse profile = playerService.updateAttributesById(id, request);
        return ResponseEntity.ok(wrapProfileResponse(profile));
    }

    @GetMapping("/me/matches")
    @PreAuthorize("hasRole('PLAYER')")
    public ResponseEntity<Map<String, Object>> getMyMatches(@AuthenticationPrincipal UserDetails userDetails) {
        Long playerId = playerService.getUserIdForUsername(userDetails.getUsername());
        List<MatchPlayerRecordResponse> matches = matchService != null
                ? matchService.getPlayerMatches(playerId, userDetails.getUsername())
                : List.of();
        return ResponseEntity.ok(Map.of("matches", matches));
    }

    @GetMapping("/me/performance")
    @PreAuthorize("hasRole('PLAYER')")
    public ResponseEntity<?> getMyPerformance(@AuthenticationPrincipal UserDetails userDetails) {
        return getPerformanceHistory(playerService.getUserIdForUsername(userDetails.getUsername()));
    }

    @GetMapping("/me/gpi")
    @PreAuthorize("hasRole('PLAYER')")
    public ResponseEntity<?> getMyGPI(@AuthenticationPrincipal UserDetails userDetails) {
        return getGPIByPlayerId(playerService.getUserIdForUsername(userDetails.getUsername()));
    }

    @GetMapping("/me/ranking")
    @PreAuthorize("hasRole('PLAYER')")
    public ResponseEntity<?> getMyRanking(@AuthenticationPrincipal UserDetails userDetails) {
        return getPlayerRankings(playerService.getUserIdForUsername(userDetails.getUsername()));
    }

    @GetMapping("/me/match-stats")
    @PreAuthorize("hasRole('PLAYER')")
    public ResponseEntity<?> getMyMatchStats(@AuthenticationPrincipal UserDetails userDetails) {
        return getPlayerMatchStats(playerService.getUserIdForUsername(userDetails.getUsername()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getProfile(@PathVariable Long id) {
        PlayerProfileResponse profile = playerService.getProfile(id);
        return ResponseEntity.ok(wrapProfileResponse(profile));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PLAYER') or hasRole('COACH') or hasRole('SCOUT') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @PathVariable Long id,
            @RequestBody PlayerProfileRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        PlayerProfileResponse profile = playerService.updateProfile(id, request, userDetails.getUsername());
        return ResponseEntity.ok(wrapProfileResponse(profile));
    }

    @GetMapping("/{id}/matches")
    public ResponseEntity<Map<String, Object>> getPlayerMatches(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : null;
        List<MatchPlayerRecordResponse> matches = matchService != null
                ? matchService.getPlayerMatches(id, username != null ? username : "")
                : List.of();
        return ResponseEntity.ok(Map.of("matches", matches));
    }

    @GetMapping("/{id}/performance")
    public ResponseEntity<?> getPerformanceHistory(@PathVariable Long id) {
        return ResponseEntity.ok(statsService.getPerformanceHistory(id));
    }

    @GetMapping("/{id}/gpi")
    public ResponseEntity<?> getGPIByPlayerId(@PathVariable Long id) {
        return ResponseEntity.ok(gpiService.getGPIByPlayerId(id));
    }

    @GetMapping("/{id}/ranking")
    public ResponseEntity<?> getPlayerRankings(@PathVariable Long id) {
        return ResponseEntity.ok(rankingService.getPlayerRankings(id));
    }

    @GetMapping("/{id}/match-stats")
    public ResponseEntity<?> getPlayerMatchStats(@PathVariable Long id) {
        return ResponseEntity.ok(statsService.getPlayerMatchStats(id));
    }
}
