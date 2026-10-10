package com.sssp.stats.repository;

import com.sssp.user.User;
import com.sssp.stats.PlayerPerformanceHistory;
import com.sssp.tournament.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlayerPerformanceHistoryRepository extends JpaRepository<PlayerPerformanceHistory, Long> {
    List<PlayerPerformanceHistory> findByPlayer(User player);
    Optional<PlayerPerformanceHistory> findByPlayerAndTournament(User player, Tournament tournament);
    Optional<PlayerPerformanceHistory> findByPlayerIdAndTournamentId(Long playerId, Long tournamentId);
    List<PlayerPerformanceHistory> findByPlayerId(Long playerId);
}
