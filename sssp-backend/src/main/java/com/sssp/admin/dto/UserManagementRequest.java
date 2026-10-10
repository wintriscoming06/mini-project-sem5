package com.sssp.admin.dto;

import com.sssp.common.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserManagementRequest {
    private Boolean active;
    private UserRole role;
    private Boolean evaluatorPermission;
}
