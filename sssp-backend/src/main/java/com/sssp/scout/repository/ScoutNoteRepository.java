package com.sssp.scout.repository;

import com.sssp.user.User;
import com.sssp.scout.ScoutNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScoutNoteRepository extends JpaRepository<ScoutNote, Long> {
    List<ScoutNote> findByScoutAndPlayer(User scout, User player);
    List<ScoutNote> findByScoutId(Long scoutId);
    List<ScoutNote> findByPlayerId(Long playerId);
    List<ScoutNote> findByScoutIdAndPlayerId(Long scoutId, Long playerId);
}
