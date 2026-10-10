package com.sssp.application;

import com.sssp.application.dto.ApplicationResponse;
import com.sssp.tournament.TournamentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ApplicationService {

    private final TournamentService tournamentService;

    public ApplicationService(TournamentService tournamentService) {
        this.tournamentService = tournamentService;
    }

    public ApplicationResponse applyForTournament(Long tournamentId, String username) {
        return tournamentService.applyToTournament(tournamentId, username);
    }

    public List<ApplicationResponse> getMyApplications(String username) {
        return tournamentService.getPlayerApplications(username);
    }

    public List<ApplicationResponse> getTournamentApplications(Long tournamentId) {
        return tournamentService.getApplicationsForTournament(tournamentId);
    }
}
