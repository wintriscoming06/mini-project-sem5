package com.sssp.application;

import com.sssp.application.dto.ApplicationRequest;
import com.sssp.application.dto.ApplicationResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping
    @PreAuthorize("hasRole('PLAYER')")
    public ResponseEntity<ApplicationResponse> apply(@RequestBody ApplicationRequest request,
                                                     @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(applicationService.applyForTournament(request.getTournamentId(), userDetails.getUsername()));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PLAYER')")
    public ResponseEntity<List<ApplicationResponse>> getMyApplications(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(applicationService.getMyApplications(userDetails.getUsername()));
    }
}
