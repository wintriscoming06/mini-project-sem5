package com.sssp.stitch;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stitch")
public class StitchController {

    private final StitchService stitchService;

    public StitchController(StitchService stitchService) {
        this.stitchService = stitchService;
    }

    @GetMapping("/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getStatus() {
        return ResponseEntity.ok(stitchService.testConnection());
    }

    @GetMapping("/tools")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<String>> getTools() {
        return ResponseEntity.ok(stitchService.listAvailableTools());
    }
}
