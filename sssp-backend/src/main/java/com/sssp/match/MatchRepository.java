package com.sssp.match;

import com.sssp.common.enums.MatchStatus;
import com.sssp.match.Match;
import com.sssp.tournament.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchRepository extends JpaRepository<Match, Long> {
    List<Match> findByTournament(Tournament tournament);
    List<Match> findByTournamentId(Long tournamentId);
    List<Match> findByStatus(MatchStatus status);
    List<Match> findByConfirmed(boolean confirmed);
}
