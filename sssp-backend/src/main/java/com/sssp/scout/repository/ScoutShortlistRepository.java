package com.sssp.scout.repository;

import com.sssp.user.User;
import com.sssp.scout.ScoutShortlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScoutShortlistRepository extends JpaRepository<ScoutShortlist, Long> {
    List<ScoutShortlist> findByScout(User scout);
    Optional<ScoutShortlist> findByScoutAndPlayer(User scout, User player);
    boolean existsByScoutAndPlayer(User scout, User player);
    List<ScoutShortlist> findByScoutIdOrderByPriorityDesc(Long scoutId);
    List<ScoutShortlist> findByScoutId(Long scoutId);
    Optional<ScoutShortlist> findByScoutIdAndPlayerId(Long scoutId, Long playerId);
}
