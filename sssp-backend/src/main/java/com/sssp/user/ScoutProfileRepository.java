package com.sssp.user;

import com.sssp.user.User;
import com.sssp.user.ScoutProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ScoutProfileRepository extends JpaRepository<ScoutProfile, Long> {
    Optional<ScoutProfile> findByUser(User user);
    Optional<ScoutProfile> findByUserId(Long userId);
}
