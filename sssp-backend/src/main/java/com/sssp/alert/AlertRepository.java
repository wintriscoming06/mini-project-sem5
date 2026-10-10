package com.sssp.alert;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<ScoutAlert, Long> {
    List<ScoutAlert> findByScoutId(Long scoutId);
    List<ScoutAlert> findByScoutIdOrderByAlertCreatedAtDesc(Long scoutId);
}
