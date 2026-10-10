package com.sssp.team;

import com.sssp.user.User;
import com.sssp.team.Team;
import com.sssp.team.TeamMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMembershipRepository extends JpaRepository<TeamMembership, Long> {
    List<TeamMembership> findByTeam(Team team);
    List<TeamMembership> findByPlayer(User player);
    Optional<TeamMembership> findByTeamAndPlayer(Team team, User player);
    boolean existsByTeamAndPlayer(Team team, User player);
    List<TeamMembership> findByTeamId(Long teamId);
    List<TeamMembership> findByPlayerId(Long playerId);
    boolean existsByTeamIdAndPlayerId(Long teamId, Long playerId);
    Optional<TeamMembership> findByTeamIdAndPlayerId(Long teamId, Long playerId);
}
