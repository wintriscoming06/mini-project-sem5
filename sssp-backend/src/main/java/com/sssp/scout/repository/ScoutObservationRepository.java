package com.sssp.scout.repository;

import com.sssp.user.User;
import com.sssp.match.Match;
import com.sssp.scout.ScoutObservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScoutObservationRepository extends JpaRepository<ScoutObservation, Long> {
    List<ScoutObservation> findByPlayer(User player);
    List<ScoutObservation> findByPlayerId(Long playerId);
    List<ScoutObservation> findByEvaluator(User evaluator);
    List<ScoutObservation> findByPlayerAndMatch(User player, Match match);
    Optional<ScoutObservation> findByEvaluatorAndPlayerAndMatch(User evaluator, User player, Match match);
}
