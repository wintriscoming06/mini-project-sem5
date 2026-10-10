package com.sssp.match;

import com.sssp.user.User;
import com.sssp.common.enums.MatchEventType;
import com.sssp.match.Match;
import com.sssp.match.MatchEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MatchEventRepository extends JpaRepository<MatchEvent, Long> {
    List<MatchEvent> findByMatch(Match match);
    List<MatchEvent> findByMatchId(Long matchId);
    List<MatchEvent> findByPlayer(User player);
    List<MatchEvent> findByMatchAndPlayer(Match match, User player);
    List<MatchEvent> findByMatchAndEventType(Match match, MatchEventType type);
}
