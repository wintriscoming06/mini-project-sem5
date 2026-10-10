package com.sssp.ranking;

import com.sssp.gpi.GPIRecord;
import org.springframework.stereotype.Service;

@Service
public class EligibilityService {
    public boolean isEligible(GPIRecord record) {
        return record != null && record.isRankingEligible();
    }
}
