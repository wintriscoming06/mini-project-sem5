package com.sssp.gpi;

import com.sssp.user.User;
import com.sssp.gpi.GPIRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
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

    /**
     * Batch retrieves the latest GPI record per player for an arbitrary collection of player IDs.
     * Prevents N+1 SELECT queries during scout catalog search.
     */
    @Query("SELECT g FROM GPIRecord g WHERE g.player.id IN :playerIds AND g.computedAt = " +
           "(SELECT MAX(g2.computedAt) FROM GPIRecord g2 WHERE g2.player.id = g.player.id)")
    List<GPIRecord> findLatestByPlayerIds(@Param("playerIds") Collection<Long> playerIds);
}
