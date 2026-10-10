package com.sssp.gpi;

import java.util.*;

/**
 * Centralized position-specific weighting ported directly from gpi-app(2) config/positionWeights.js.
 * All weight sets for a position sum to 1.0.
 */
public final class GPIPositionWeights {

    private GPIPositionWeights() {}

    public static final List<String> BASE_KEYS = List.of(
            "goals", "assists", "shotAccuracy", "shotsOnTargetVol", "passCompletion",
            "keyPasses", "dribbleSuccess", "dribblesCompletedVol", "tackles",
            "interceptions", "clearances", "duelsWon", "discipline", "minutesReliability"
    );

    private static Map<String, Double> createWeights(Map<String, Double> defined) {
        Map<String, Double> map = new HashMap<>();
        for (String key : BASE_KEYS) {
            map.put(key, defined.getOrDefault(key, 0.0));
        }
        return Collections.unmodifiableMap(map);
    }

    public static final Map<String, Double> ATTACKER_WEIGHTS = createWeights(Map.ofEntries(
            Map.entry("goals", 0.28),
            Map.entry("assists", 0.14),
            Map.entry("shotAccuracy", 0.10),
            Map.entry("shotsOnTargetVol", 0.12),
            Map.entry("dribbleSuccess", 0.08),
            Map.entry("dribblesCompletedVol", 0.06),
            Map.entry("keyPasses", 0.08),
            Map.entry("passCompletion", 0.04),
            Map.entry("duelsWon", 0.04),
            Map.entry("discipline", 0.03),
            Map.entry("minutesReliability", 0.03)
    ));

    public static final Map<String, Double> WINGER_WEIGHTS = createWeights(Map.ofEntries(
            Map.entry("goals", 0.16),
            Map.entry("assists", 0.18),
            Map.entry("dribbleSuccess", 0.14),
            Map.entry("dribblesCompletedVol", 0.12),
            Map.entry("keyPasses", 0.14),
            Map.entry("passCompletion", 0.08),
            Map.entry("shotAccuracy", 0.06),
            Map.entry("shotsOnTargetVol", 0.04),
            Map.entry("duelsWon", 0.04),
            Map.entry("discipline", 0.02),
            Map.entry("minutesReliability", 0.02)
    ));

    public static final Map<String, Double> MIDFIELDER_WEIGHTS = createWeights(Map.ofEntries(
            Map.entry("passCompletion", 0.20),
            Map.entry("keyPasses", 0.16),
            Map.entry("assists", 0.12),
            Map.entry("dribbleSuccess", 0.10),
            Map.entry("tackles", 0.10),
            Map.entry("interceptions", 0.08),
            Map.entry("duelsWon", 0.08),
            Map.entry("goals", 0.08),
            Map.entry("discipline", 0.04),
            Map.entry("minutesReliability", 0.04)
    ));

    public static final Map<String, Double> DEFENSIVE_MID_WEIGHTS = createWeights(Map.ofEntries(
            Map.entry("tackles", 0.18),
            Map.entry("interceptions", 0.16),
            Map.entry("passCompletion", 0.18),
            Map.entry("duelsWon", 0.14),
            Map.entry("clearances", 0.08),
            Map.entry("keyPasses", 0.08),
            Map.entry("dribbleSuccess", 0.06),
            Map.entry("goals", 0.04),
            Map.entry("assists", 0.04),
            Map.entry("discipline", 0.02),
            Map.entry("minutesReliability", 0.02)
    ));

    public static final Map<String, Double> FULLBACK_WEIGHTS = createWeights(Map.ofEntries(
            Map.entry("tackles", 0.16),
            Map.entry("interceptions", 0.14),
            Map.entry("duelsWon", 0.14),
            Map.entry("clearances", 0.10),
            Map.entry("passCompletion", 0.14),
            Map.entry("keyPasses", 0.08),
            Map.entry("dribbleSuccess", 0.08),
            Map.entry("assists", 0.06),
            Map.entry("goals", 0.02),
            Map.entry("discipline", 0.04),
            Map.entry("minutesReliability", 0.04)
    ));

    public static final Map<String, Double> CENTERBACK_WEIGHTS = createWeights(Map.ofEntries(
            Map.entry("tackles", 0.18),
            Map.entry("interceptions", 0.18),
            Map.entry("clearances", 0.20),
            Map.entry("duelsWon", 0.18),
            Map.entry("passCompletion", 0.10),
            Map.entry("discipline", 0.08),
            Map.entry("minutesReliability", 0.04),
            Map.entry("goals", 0.02),
            Map.entry("assists", 0.02)
    ));

    public static final Map<String, Double> GK_WEIGHTS = createWeights(Map.ofEntries(
            Map.entry("passCompletion", 0.30),
            Map.entry("discipline", 0.25),
            Map.entry("minutesReliability", 0.25),
            Map.entry("clearances", 0.10),
            Map.entry("duelsWon", 0.10)
    ));

    public static final Map<String, Double> MATCH_MULTIPLIERS = Map.of(
            "FRIENDLY", 1.0,
            "OFFICIAL_1", 1.1,
            "OFFICIAL_2", 1.2,
            "OFFICIAL_3", 1.3,
            "OFFICIAL_4", 1.4,
            "OFFICIAL_5", 1.5
    );

    public static final int MIN_COMPETITIVE_MATCHES = 10;

    public static double getMultiplier(String matchKind, Integer stars) {
        if (matchKind == null || "FRIENDLY".equalsIgnoreCase(matchKind)) {
            return MATCH_MULTIPLIERS.get("FRIENDLY");
        }
        int s = (stars != null && stars >= 1 && stars <= 5) ? stars : 1;
        String key = "OFFICIAL_" + s;
        return MATCH_MULTIPLIERS.getOrDefault(key, MATCH_MULTIPLIERS.get("OFFICIAL_1"));
    }

    public static Map<String, Double> getWeights(String position) {
        if (position == null) return MIDFIELDER_WEIGHTS;
        String pos = position.trim().toUpperCase();
        switch (pos) {
            case "ST":
            case "CF":
                return ATTACKER_WEIGHTS;
            case "LW":
            case "RW":
                return WINGER_WEIGHTS;
            case "CAM":
            case "AM":
            case "CM":
            case "LM":
            case "RM":
                return MIDFIELDER_WEIGHTS;
            case "CDM":
            case "DM":
                return DEFENSIVE_MID_WEIGHTS;
            case "LB":
            case "RB":
                return FULLBACK_WEIGHTS;
            case "CB":
                return CENTERBACK_WEIGHTS;
            case "GK":
                return GK_WEIGHTS;
            default:
                return MIDFIELDER_WEIGHTS;
        }
    }
}
