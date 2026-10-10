package com.sssp.ranking;

import com.sssp.user.User;
import com.sssp.ranking.RankingRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RankingRecordRepository extends JpaRepository<RankingRecord, Long> {
    List<RankingRecord> findByPlayer(User player);
    List<RankingRecord> findByContext(String context);
    List<RankingRecord> findByContextOrderByRankValueAsc(String context);
    Optional<RankingRecord> findByPlayerAndContext(User player, String context);
    List<RankingRecord> findByPlayerId(Long playerId);
}
