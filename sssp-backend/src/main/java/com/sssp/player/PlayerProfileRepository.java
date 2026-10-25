package com.sssp.player;

import com.sssp.user.User;
import com.sssp.common.enums.PositionCategory;
import com.sssp.common.enums.ProfileVisibility;
import com.sssp.player.PlayerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlayerProfileRepository extends JpaRepository<PlayerProfile, Long> {
    Optional<PlayerProfile> findByUser(User user);
    Optional<PlayerProfile> findByUserId(Long userId);
    List<PlayerProfile> findByLocationContainingIgnoreCase(String location);
    List<PlayerProfile> findByPositionCategory(PositionCategory category);
    List<PlayerProfile> findByVisibility(ProfileVisibility visibility);
}
