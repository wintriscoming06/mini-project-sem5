package com.sssp.alert;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AlertService {

    private final AlertRepository alertRepository;

    public AlertService(AlertRepository alertRepository) {
        this.alertRepository = alertRepository;
    }

    public List<ScoutAlert> getAlertsForScout(Long scoutId) {
        return alertRepository.findByScoutIdOrderByAlertCreatedAtDesc(scoutId);
    }
}
