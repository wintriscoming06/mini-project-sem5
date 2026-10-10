package com.sssp.gpi;

import com.sssp.user.User;
import com.sssp.gpi.GPIRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GPIRecordRepository extends JpaRepository<GPIRecord, Long> {
    Optional<GPIRecord> findTopByPlayerOrderByComputedAtDesc(User player);
    List<GPIRecord> findByPlayer(User player);
    List<GPIRecord> findByPlayerId(Long playerId);
    List<GPIRecord> findByRankingEligible(boolean eligible);
    Optional<GPIRecord> findTopByPlayerIdOrderByComputedAtDesc(Long playerId);
    List<GPIRecord> findByPlayerIdOrderByComputedAtDesc(Long playerId);
}
