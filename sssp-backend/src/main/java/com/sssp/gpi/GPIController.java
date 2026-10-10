package com.sssp.gpi;

import com.sssp.admin.dto.GPIConfigResponse;
import com.sssp.gpi.dto.GPIResponse;
import com.sssp.gpi.dto.GPIStatusResponse;
import com.sssp.gpi.GPIService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/gpi")
public class GPIController {

    private final GPIService gpiService;

    public GPIController(GPIService gpiService) {
        this.gpiService = gpiService;
    }

    @PostMapping("/calculate/{playerId}")
    public GPIResponse calculateGPI(@PathVariable Long playerId) {
        return gpiService.calculateGPI(playerId);
    }

    @GetMapping("")
    public List<GPIResponse> getAllGPIRecords() {
        return gpiService.getAllGPIRecords();
    }

    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getConfig() {
        return ResponseEntity.ok(Map.of(
                "minCompetitiveMatches", 10,
                "matchMultipliers", Map.of(
                        "FRIENDLY", 1.0,
                        "OFFICIAL_1", 1.1,
                        "OFFICIAL_2", 1.2,
                        "OFFICIAL_3", 1.3,
                        "OFFICIAL_4", 1.4,
                        "OFFICIAL_5", 1.5
                ),
                "formulas", Map.of(
                        "matchPerformance", "P_m = Σ(S_i × W_i)",
                        "gpi", "GPI = Σ(P_m × M_m) / Σ(M_m)"
                )
        ));
    }

    @GetMapping("/status/{playerId}")
    public ResponseEntity<GPIStatusResponse> getStatus(@PathVariable Long playerId) {
        return ResponseEntity.ok(gpiService.getGPIStatus(playerId));
    }
}
