package com.sssp.tournament;

import com.sssp.user.User;
import com.sssp.tournament.TournamentStatus;
import com.sssp.tournament.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TournamentRepository extends JpaRepository<Tournament, Long> {
    List<Tournament> findByOrganizer(User organizer);
    List<Tournament> findByStatus(TournamentStatus status);
    List<Tournament> findByOrganizerId(Long organizerId);
}
