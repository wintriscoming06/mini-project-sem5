package com.sssp.user;

import com.sssp.user.OrganizerProfile;
import com.sssp.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrganizerProfileRepository extends JpaRepository<OrganizerProfile, Long> {
    Optional<OrganizerProfile> findByUser(User user);
    Optional<OrganizerProfile> findByUserId(Long userId);
}
