package com.sssp.correction;

import com.sssp.user.User;
import com.sssp.common.enums.CorrectionStatus;
import com.sssp.match.Match;
import com.sssp.correction.CorrectionRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CorrectionRequestRepository extends JpaRepository<CorrectionRequest, Long> {
    List<CorrectionRequest> findByStatus(CorrectionStatus status);
    List<CorrectionRequest> findBySubmitter(User submitter);
    List<CorrectionRequest> findByMatch(Match match);
    List<CorrectionRequest> findByMatchId(Long matchId);
}
