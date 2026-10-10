package com.sssp.team;

import com.sssp.team.dto.TeamMemberRequest;
import com.sssp.team.dto.TeamMemberResponse;
import com.sssp.team.dto.TeamRequest;
import com.sssp.team.dto.TeamResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<TeamResponse> createTeam(
            @RequestBody TeamRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(teamService.createTeam(request, userDetails.getUsername()));
    }

    @PostMapping("/{teamId}/members")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<TeamMemberResponse> addMember(
            @PathVariable Long teamId,
            @RequestBody TeamMemberRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(teamService.addPlayerToTeam(teamId, request, userDetails.getUsername()));
    }

    @DeleteMapping("/{teamId}/members/{playerId}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long teamId,
            @PathVariable Long playerId,
            @AuthenticationPrincipal UserDetails userDetails) {
        teamService.removePlayerFromTeam(teamId, playerId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
