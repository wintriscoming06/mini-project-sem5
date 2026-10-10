package com.sssp.match;

import com.sssp.match.dto.MatchConfirmRequest;
import com.sssp.match.dto.MatchResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class MatchConfirmationService {

    private final MatchService matchService;

    public MatchConfirmationService(MatchService matchService) {
        this.matchService = matchService;
    }

    public MatchResponse confirmMatch(Long matchId, MatchConfirmRequest request, String username) {
        return matchService.confirmMatch(matchId, request, username);
    }
}
