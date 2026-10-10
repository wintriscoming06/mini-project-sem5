package com.sssp.stats;

import com.sssp.correction.dto.CorrectionRequestDto;
import com.sssp.correction.dto.CorrectionResponse;
import com.sssp.stats.StatsService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @PostMapping("/matches/{matchId}/corrections")
    @PreAuthorize("hasRole('ORGANIZER')")
    public CorrectionResponse submitCorrection(@PathVariable Long matchId,
                                               @RequestBody CorrectionRequestDto request,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        return statsService.submitCorrection(matchId, request, userDetails.getUsername());
    }

    @GetMapping("/corrections")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public List<CorrectionResponse> getAllCorrections() {
        return statsService.getAllCorrections();
    }
}
