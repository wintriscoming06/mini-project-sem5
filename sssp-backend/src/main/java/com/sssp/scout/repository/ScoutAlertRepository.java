package com.sssp.scout.repository;

import com.sssp.user.User;
import com.sssp.alert.ScoutAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScoutAlertRepository extends JpaRepository<ScoutAlert, Long> {
    List<ScoutAlert> findByScout(User scout);
    List<ScoutAlert> findByScoutOrderByAlertCreatedAtDesc(User scout);
    List<ScoutAlert> findByScoutId(Long scoutId);
    List<ScoutAlert> findByScoutIdOrderByAlertCreatedAtDesc(Long scoutId);
    List<ScoutAlert> findByScoutAndRead(User scout, boolean read);
}
