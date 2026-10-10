package com.sssp.stats.repository;

import com.sssp.user.User;
import com.sssp.match.Match;
import com.sssp.stats.PlayerMatchStatistics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlayerMatchStatisticsRepository extends JpaRepository<PlayerMatchStatistics, Long> {
    List<PlayerMatchStatistics> findByPlayer(User player);
    Optional<PlayerMatchStatistics> findByPlayerAndMatch(User player, Match match);
    List<PlayerMatchStatistics> findByMatch(Match match);
    List<PlayerMatchStatistics> findByPlayerId(Long playerId);
    List<PlayerMatchStatistics> findByMatchId(Long matchId);
    Optional<PlayerMatchStatistics> findByMatchIdAndPlayerId(Long matchId, Long playerId);
    List<PlayerMatchStatistics> findByPlayerIdOrderByMatchDateDescIdDesc(Long playerId);
    List<PlayerMatchStatistics> findByPlayerIdOrderByCreatedAtDesc(Long playerId);
}
