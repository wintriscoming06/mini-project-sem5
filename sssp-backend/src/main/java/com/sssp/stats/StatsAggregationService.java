package com.sssp.stats;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class StatsAggregationService {

    private final StatsService statsService;

    public StatsAggregationService(StatsService statsService) {
        this.statsService = statsService;
    }

    public void aggregatePerformanceHistory(Long playerId) {
        statsService.aggregatePerformanceHistory(playerId);
    }
}
