package com.sssp.scout;

import com.sssp.scout.dto.PlayerSearchRequest;
import com.sssp.scout.dto.PlayerSearchResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ScoutSearchService {

    private final ScoutService scoutService;

    public ScoutSearchService(ScoutService scoutService) {
        this.scoutService = scoutService;
    }

    public List<PlayerSearchResponse> searchPlayers(PlayerSearchRequest request) {
        return scoutService.searchPlayers(request);
    }
}
