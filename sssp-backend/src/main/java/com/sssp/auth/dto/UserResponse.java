package com.sssp.auth.dto;

import com.sssp.common.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String email;
    private String username;
    private UserRole role;
    private boolean active;
    private boolean evaluatorPermission;
    private LocalDateTime createdAt;
}
