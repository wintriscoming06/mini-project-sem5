package com.sssp.stats.repository;

import com.sssp.gpi.GPIHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GPIHistoryRepository extends JpaRepository<GPIHistory, Long> {
    List<GPIHistory> findByPlayerIdOrderByRecordedAtAsc(Long playerId);
    Optional<GPIHistory> findTopByPlayerIdOrderByRecordedAtDesc(Long playerId);
}
