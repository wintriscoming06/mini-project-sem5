package com.sssp.match;

import com.sssp.user.User;
import com.sssp.match.Match;
import com.sssp.match.MatchParticipation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MatchParticipationRepository extends JpaRepository<MatchParticipation, Long> {
    List<MatchParticipation> findByMatch(Match match);
    List<MatchParticipation> findByPlayer(User player);
    Optional<MatchParticipation> findByMatchAndPlayer(Match match, User player);
    boolean existsByMatchAndPlayer(Match match, User player);
    List<MatchParticipation> findByMatchId(Long matchId);
    List<MatchParticipation> findByPlayerId(Long playerId);
}
