package com.sssp.application;

import com.sssp.user.User;
import com.sssp.common.enums.ApplicationStatus;
import com.sssp.tournament.Tournament;
import com.sssp.application.TournamentApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TournamentApplicationRepository extends JpaRepository<TournamentApplication, Long> {
    List<TournamentApplication> findByPlayer(User player);
    List<TournamentApplication> findByTournament(Tournament tournament);
    Optional<TournamentApplication> findByPlayerAndTournament(User player, Tournament tournament);
    List<TournamentApplication> findByTournamentAndStatus(Tournament tournament, ApplicationStatus status);
    boolean existsByPlayerAndTournament(User player, Tournament tournament);
    List<TournamentApplication> findByPlayerId(Long playerId);
    List<TournamentApplication> findByTournamentId(Long tournamentId);
    boolean existsByPlayerIdAndTournamentId(Long playerId, Long tournamentId);
    Optional<TournamentApplication> findByPlayerIdAndTournamentId(Long playerId, Long tournamentId);
}
