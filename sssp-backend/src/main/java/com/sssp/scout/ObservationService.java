package com.sssp.scout;

import com.sssp.scout.dto.ObservationRequest;
import com.sssp.scout.dto.ObservationResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ObservationService {

    private final ScoutService scoutService;

    public ObservationService(ScoutService scoutService) {
        this.scoutService = scoutService;
    }

    public ObservationResponse submitObservation(Long playerId, ObservationRequest request, String username) {
        return scoutService.submitObservation(playerId, request, username);
    }

    public List<ObservationResponse> getObservations(Long playerId) {
        return scoutService.getObservations(playerId);
    }
}
