package com.sssp.alert;

import com.sssp.user.User;
import com.sssp.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationController(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.ok(List.of());
        User user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
        if (user == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()));
    }
}
