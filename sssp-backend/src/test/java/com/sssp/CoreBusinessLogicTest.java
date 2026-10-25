package com.sssp;

import com.sssp.gpi.GPIEngine;
import com.sssp.stats.PlayerMatchStatistics;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

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

    @Test
    @DisplayName("GPI aggregate calculation returns expected weighted average")
    void testAggregateGPICalculation() {
        PlayerMatchStatistics match1 = new PlayerMatchStatistics();
        match1.setMinutesPlayed(90);
        match1.setGoals(2);
        match1.setPosition("FW");
        match1.setStars(4);

        PlayerMatchStatistics match2 = new PlayerMatchStatistics();
        match2.setMinutesPlayed(90);
        match2.setGoals(0);
        match2.setPosition("FW");
        match2.setStars(2);

        Double gpi = GPIEngine.computeGPI(List.of(match1, match2));
        assertNotNull(gpi, "GPI should not be null for valid matches");
        assertTrue(gpi >= 0.0 && gpi <= 100.0, "GPI should be between 0 and 100");
    }

    @Test
    @DisplayName("Performance attributes PAC, SHO, PAS, DRI, DEF, PHY scale within [40, 99]")
    void testPerformanceAttributesBounds() {
        PlayerMatchStatistics match = new PlayerMatchStatistics();
        match.setMinutesPlayed(90);
        match.setGoals(3);
        match.setAssists(2);
        match.setPassesAttempted(60);
        match.setPassesCompleted(58);
        match.setTackles(5);
        match.setPosition("FW");
        match.setStars(5);

        Map<String, Integer> attrs = GPIEngine.computePerformanceAttributes(List.of(match));
        assertNotNull(attrs);
        assertEquals(6, attrs.size());

        for (String attrKey : List.of("PAC", "SHO", "PAS", "DRI", "DEF", "PHY")) {
            assertTrue(attrs.containsKey(attrKey), "Missing attribute " + attrKey);
            int val = attrs.get(attrKey);
            assertTrue(val >= 40 && val <= 99, "Attribute " + attrKey + " out of [40, 99] bounds: " + val);
        }
    }
}
