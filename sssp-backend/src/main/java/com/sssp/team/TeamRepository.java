package com.sssp.team;

import com.sssp.team.Team;
import com.sssp.tournament.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findByTournament(Tournament tournament);
    List<Team> findByTournamentId(Long tournamentId);
}
