package com.sssp.scout;

import com.sssp.scout.dto.ShortlistRequest;
import com.sssp.scout.dto.ShortlistResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ShortlistService {

    private final ScoutService scoutService;

    public ShortlistService(ScoutService scoutService) {
        this.scoutService = scoutService;
    }

    public ShortlistResponse addToShortlist(Long playerId, ShortlistRequest request, String username) {
        return scoutService.addToShortlist(playerId, request, username);
    }

    public void removeFromShortlist(Long playerId, String username) {
        scoutService.removeFromShortlist(playerId, username);
    }

    public List<ShortlistResponse> getShortlist(String username) {
        return scoutService.getShortlist(username);
    }
}
