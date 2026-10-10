package com.sssp.correction;

import com.sssp.common.enums.CorrectionStatus;
import com.sssp.correction.dto.CorrectionDecisionRequest;
import com.sssp.correction.dto.CorrectionResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/corrections")
public class CorrectionController {

    private final CorrectionService correctionService;

    public CorrectionController(CorrectionService correctionService) {
        this.correctionService = correctionService;
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CorrectionResponse>> getPendingCorrections() {
        return ResponseEntity.ok(correctionService.getPendingCorrections());
    }

    @PatchMapping("/{id}/decide")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CorrectionResponse> decideCorrection(@PathVariable Long id,
                                                               @RequestBody CorrectionDecisionRequest request,
                                                               @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(correctionService.decideCorrection(id, request.getDecision(), userDetails.getUsername()));
    }
}
