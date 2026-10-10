package com.sssp.gpi;

import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class ObservationScoreCalculator {

    public double calculateObservationScore(List<Double> ratings) {
        if (ratings == null || ratings.isEmpty()) {
            return 50.0;
        }
        double sum = 0;
        for (double r : ratings) {
            sum += r;
        }
        return sum / ratings.size();
    }
}
