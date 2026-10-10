package com.sssp.admin;

import com.sssp.admin.dto.UserManagementRequest;
import com.sssp.auth.dto.UserResponse;
import com.sssp.user.User;
import com.sssp.user.UserRepository;
import com.sssp.common.enums.CorrectionStatus;
import com.sssp.common.exception.ResourceNotFoundException;
import com.sssp.admin.dto.GPIConfigRequest;
import com.sssp.admin.dto.GPIConfigResponse;
import com.sssp.gpi.GPIService;
import com.sssp.ranking.RankingService;
import com.sssp.audit.dto.AuditLogResponse;
import com.sssp.correction.dto.CorrectionResponse;
import com.sssp.stats.StatsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminService {

    private final UserRepository userRepository;
    private final StatsService statsService;
    private final GPIService gpiService;
    private final RankingService rankingService;

    public AdminService(UserRepository userRepository, StatsService statsService, GPIService gpiService, RankingService rankingService) {
        this.userRepository = userRepository;
        this.statsService = statsService;
        this.gpiService = gpiService;
        this.rankingService = rankingService;
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::mapToUserResponse).collect(Collectors.toList());
    }

    public UserResponse updateUser(Long userId, UserManagementRequest request, String username) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (request.getActive() != null) user.setActive(request.getActive());
        if (request.getRole() != null) user.setRole(request.getRole());
        if (request.getEvaluatorPermission() != null) user.setEvaluatorPermission(request.getEvaluatorPermission());
        return mapToUserResponse(userRepository.save(user));
    }

    public List<CorrectionResponse> getPendingCorrections() {
        return statsService.getPendingCorrections();
    }

    public CorrectionResponse decideCorrection(Long correctionId, CorrectionStatus decision, String username) {
        return statsService.decideCorrection(correctionId, decision, username);
    }

    public List<AuditLogResponse> getAuditLogs() {
        return statsService.getAuditLogs();
    }

    public GPIConfigResponse getGPIConfig() {
        return gpiService.getConfig();
    }

    public GPIConfigResponse updateGPIConfig(GPIConfigRequest request) {
        return gpiService.updateConfig(request);
    }

    private UserResponse mapToUserResponse(User u) {
        UserResponse res = new UserResponse();
        res.setId(u.getId());
        res.setUsername(u.getUsername());
        res.setEmail(u.getEmail());
        res.setRole(u.getRole());
        res.setActive(u.isActive());
        res.setEvaluatorPermission(u.isEvaluatorPermission());
        return res;
    }
}
