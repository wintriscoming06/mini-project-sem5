package com.sssp.team;

import com.sssp.team.dto.TeamMemberRequest;
import com.sssp.team.dto.TeamMemberResponse;
import com.sssp.team.dto.TeamRequest;
import com.sssp.team.dto.TeamResponse;
import com.sssp.tournament.TournamentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class TeamService {

    private final TournamentService tournamentService;

    public TeamService(TournamentService tournamentService) {
        this.tournamentService = tournamentService;
    }

    public TeamResponse createTeam(TeamRequest request, String username) {
        return tournamentService.createTeam(request, username);
    }

    public List<TeamResponse> getTeamsByTournament(Long tournamentId) {
        return tournamentService.getTeamsForTournament(tournamentId);
    }

    public TeamMemberResponse addPlayerToTeam(Long teamId, TeamMemberRequest request, String username) {
        return tournamentService.addTeamMember(teamId, request, username);
    }

    public void removePlayerFromTeam(Long teamId, Long playerId, String username) {
        tournamentService.removeTeamMember(teamId, playerId, username);
    }
}
