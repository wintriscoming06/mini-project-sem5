package com.sssp.scout;

import com.sssp.scout.dto.*;
import com.sssp.scout.ScoutService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scouts")
public class ScoutController {

    private final ScoutService scoutService;

    public ScoutController(ScoutService scoutService) {
        this.scoutService = scoutService;
    }

    @GetMapping("/players/search")
    public List<PlayerSearchResponse> searchPlayers(PlayerSearchRequest request) {
        return scoutService.searchPlayers(request);
    }

    @GetMapping("/shortlist")
    public List<ShortlistResponse> getShortlist(@AuthenticationPrincipal UserDetails userDetails) {
        return scoutService.getShortlist(userDetails.getUsername());
    }

    @PostMapping("/players/{playerId}/shortlist")
    public ShortlistResponse addToShortlist(@PathVariable Long playerId,
                                            @RequestBody ShortlistRequest request,
                                            @AuthenticationPrincipal UserDetails userDetails) {
        return scoutService.addToShortlist(playerId, request, userDetails.getUsername());
    }

    @DeleteMapping("/players/{playerId}/shortlist")
    public void removeFromShortlist(@PathVariable Long playerId,
                                    @AuthenticationPrincipal UserDetails userDetails) {
        scoutService.removeFromShortlist(playerId, userDetails.getUsername());
    }

    @PostMapping("/players/{playerId}/observations")
    public ObservationResponse submitObservation(@PathVariable Long playerId,
                                                 @RequestBody ObservationRequest request,
                                                 @AuthenticationPrincipal UserDetails userDetails) {
        return scoutService.submitObservation(playerId, request, userDetails.getUsername());
    }

    @GetMapping("/players/{playerId}/observations")
    public List<ObservationResponse> getObservations(@PathVariable Long playerId) {
        return scoutService.getObservations(playerId);
    }

    @PostMapping("/players/{playerId}/notes")
    public ScoutNoteResponse addNote(@PathVariable Long playerId,
                                     @RequestBody ScoutNoteRequest request,
                                     @AuthenticationPrincipal UserDetails userDetails) {
        return scoutService.addNote(playerId, request, userDetails.getUsername());
    }

    @GetMapping("/players/{playerId}/notes")
    public List<ScoutNoteResponse> getNotes(@PathVariable Long playerId,
                                            @AuthenticationPrincipal UserDetails userDetails) {
        return scoutService.getNotes(playerId, userDetails.getUsername());
    }

    @PostMapping("/filters")
    public ScoutFilterResponse saveFilter(@RequestBody ScoutFilterRequest request,
                                          @AuthenticationPrincipal UserDetails userDetails) {
        return scoutService.saveFilter(request, userDetails.getUsername());
    }

    @GetMapping("/filters")
    public List<ScoutFilterResponse> getFilters(@AuthenticationPrincipal UserDetails userDetails) {
        return scoutService.getFilters(userDetails.getUsername());
    }

    @DeleteMapping("/filters/{filterId}")
    public void deleteFilter(@PathVariable Long filterId,
                             @AuthenticationPrincipal UserDetails userDetails) {
        scoutService.deleteFilter(filterId, userDetails.getUsername());
    }

    @GetMapping("/alerts")
    public List<ScoutAlertResponse> getAlerts(@AuthenticationPrincipal UserDetails userDetails) {
        return scoutService.getAlerts(userDetails.getUsername());
    }

    @PatchMapping("/alerts/{alertId}/read")
    public void markAlertRead(@PathVariable Long alertId,
                              @AuthenticationPrincipal UserDetails userDetails) {
        scoutService.markAlertRead(alertId, userDetails.getUsername());
    }
}
