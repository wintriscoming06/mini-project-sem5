package com.sssp.correction;

import com.sssp.admin.AdminService;
import com.sssp.common.enums.CorrectionStatus;
import com.sssp.correction.dto.CorrectionResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CorrectionService {

    private final AdminService adminService;

    public CorrectionService(AdminService adminService) {
        this.adminService = adminService;
    }

    public List<CorrectionResponse> getPendingCorrections() {
        return adminService.getPendingCorrections();
    }

    public CorrectionResponse decideCorrection(Long id, CorrectionStatus decision, String reviewerUsername) {
        return adminService.decideCorrection(id, decision, reviewerUsername);
    }
}
