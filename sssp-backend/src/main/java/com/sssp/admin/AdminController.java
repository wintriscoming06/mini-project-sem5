package com.sssp.admin;

import com.sssp.admin.dto.UserManagementRequest;
import com.sssp.admin.AdminService;
import com.sssp.auth.dto.UserResponse;
import com.sssp.common.enums.CorrectionStatus;
import com.sssp.admin.dto.GPIConfigRequest;
import com.sssp.admin.dto.GPIConfigResponse;
import com.sssp.audit.dto.AuditLogResponse;
import com.sssp.correction.dto.CorrectionResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public List<UserResponse> getAllUsers() {
        return adminService.getAllUsers();
    }

    @PatchMapping("/users/{id}")
    public UserResponse updateUser(@PathVariable Long id,
                                   @RequestBody UserManagementRequest request,
                                   @AuthenticationPrincipal UserDetails userDetails) {
        return adminService.updateUser(id, request, userDetails.getUsername());
    }

    @GetMapping("/corrections")
    public List<CorrectionResponse> getPendingCorrections() {
        return adminService.getPendingCorrections();
    }

    @PatchMapping("/corrections/{id}")
    public CorrectionResponse decideCorrection(@PathVariable Long id,
                                               @RequestBody Map<String, String> body,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        CorrectionStatus decision = CorrectionStatus.valueOf(body.get("decision"));
        return adminService.decideCorrection(id, decision, userDetails.getUsername());
    }

    @GetMapping("/audit-logs")
    public List<AuditLogResponse> getAuditLogs() {
        return adminService.getAuditLogs();
    }

    @GetMapping("/gpi-config")
    public GPIConfigResponse getGPIConfig() {
        return adminService.getGPIConfig();
    }

    @PutMapping("/gpi-config")
    public GPIConfigResponse updateGPIConfig(@RequestBody GPIConfigRequest request) {
        return adminService.updateGPIConfig(request);
    }
}
