package com.sssp.scout.repository;

import com.sssp.user.User;
import com.sssp.scout.ScoutFilter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScoutFilterRepository extends JpaRepository<ScoutFilter, Long> {
    List<ScoutFilter> findByScout(User scout);
    List<ScoutFilter> findByScoutId(Long scoutId);
}
