package com.sssp.alert;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final AlertService alertService;

    public NotificationController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping
    public ResponseEntity<List<ScoutAlert>> getNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(List.of());
    }
}
