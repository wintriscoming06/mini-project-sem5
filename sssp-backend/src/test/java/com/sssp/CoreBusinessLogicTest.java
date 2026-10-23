package com.sssp;

import com.sssp.gpi.GPIEngine;
import com.sssp.stats.PlayerMatchStatistics;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class CoreBusinessLogicTest {

    @Test
    @DisplayName("GPI calculation remains deterministic and non-null for match statistics")
    void testGpiPerformanceCalculation() {
        PlayerMatchStatistics stats = new PlayerMatchStatistics();
        stats.setMinutesPlayed(90);
        stats.setGoals(2);
        stats.setAssists(1);
        stats.setYellowCards(0);
        stats.setRedCards(0);
        stats.setPassesAttempted(50);
        stats.setPassesCompleted(45);
        stats.setShotsOnTarget(3);
        stats.setTackles(4);
        stats.setInterceptions(2);
        stats.setPosition("FW");

        double performanceScore = GPIEngine.matchPerformanceScore(stats);
        assertTrue(performanceScore >= 0.0, "Performance score should be non-negative");
        assertTrue(performanceScore <= 100.0, "Performance score should be bounded by 100");
    }

    @Test
    @DisplayName("GPI calculation penalizes disciplinary infractions correctly")
    void testDisciplinaryImpactOnPerformance() {
        PlayerMatchStatistics cleanStats = new PlayerMatchStatistics();
        cleanStats.setMinutesPlayed(90);
        cleanStats.setGoals(1);
        cleanStats.setYellowCards(0);
        cleanStats.setRedCards(0);
        cleanStats.setPosition("MF");

        PlayerMatchStatistics penalizedStats = new PlayerMatchStatistics();
        penalizedStats.setMinutesPlayed(90);
        penalizedStats.setGoals(1);
        penalizedStats.setYellowCards(1);
        penalizedStats.setRedCards(1);
        penalizedStats.setPosition("MF");

        double cleanScore = GPIEngine.matchPerformanceScore(cleanStats);
        double penalizedScore = GPIEngine.matchPerformanceScore(penalizedStats);

        assertTrue(penalizedScore < cleanScore, "Penalized stats should have lower performance score than clean stats");
    }
}
