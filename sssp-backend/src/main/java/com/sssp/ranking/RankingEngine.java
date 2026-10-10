package com.sssp.ranking;

import com.sssp.gpi.GPIRecord;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RankingEngine {

    private final EligibilityService eligibilityService;
    private final TieBreaker tieBreaker;

    public RankingEngine(EligibilityService eligibilityService, TieBreaker tieBreaker) {
        this.eligibilityService = eligibilityService;
        this.tieBreaker = tieBreaker;
    }

    public void sortRankings(List<GPIRecord> records) {
        records.sort(tieBreaker);
    }
}
