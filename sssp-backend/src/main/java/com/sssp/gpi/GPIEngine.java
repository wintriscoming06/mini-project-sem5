package com.sssp.gpi;

import java.util.*;

/**
 * Authoritative GPI calculation engine ported directly from gpi-app(2) config/gpiService.js.
 * Implements:
 *   P_m = Σ(S_i × W_i)  -- per-match performance score, 0-100
 *   GPI = Σ(P_m × M_m) / Σ(M_m)
 *   Attribute derivation for PAC, SHO, PAS, DRI, DEF, PHY scaled 40-99
 */
public final class GPIEngine {

    private GPIEngine() {}

    /**
     * P_m = Σ(S_i × W_i)  -- per-match performance score, 0-100
     */
    public static double matchPerformanceScore(MatchStatsInput match) {
        Map<String, Double> normalized = GPINormalization.normalizeMatchStats(match);
        Map<String, Double> weights = GPIPositionWeights.getWeights(match.getPosition());
        double score = 0.0;
        for (Map.Entry<String, Double> entry : weights.entrySet()) {
            double statVal = normalized.getOrDefault(entry.getKey(), 0.0);
            score += statVal * entry.getValue();
        }
        return Math.max(0.0, Math.min(100.0, score));
    }

    /**
     * GPI = Σ(P_m × M_m) / Σ(M_m)
     * Rounded to 1 decimal place.
     */
    public static Double computeGPI(List<? extends MatchStatsInput> matches) {
        if (matches == null || matches.isEmpty()) {
            return null;
        }
        double numerator = 0.0;
        double denominator = 0.0;
        for (MatchStatsInput m : matches) {
            double pM = matchPerformanceScore(m);
            double mM = GPIPositionWeights.getMultiplier(m.getMatchKind(), m.getStars());
            numerator += pM * mM;
            denominator += mM;
        }
        if (denominator == 0.0) return null;
        return Math.round((numerator / denominator) * 10.0) / 10.0;
    }

    /**
     * Computes PAC, SHO, PAS, DRI, DEF, PHY from competitive match performance.
     * Each match attribute is derived from relevant normalized stats, weighted
     * across matches by match multiplier M_m, and scaled onto a 40-99 rating scale:
     *   Math.max(40, Math.min(99, Math.round(40 + raw * 0.55)))
     */
    public static Map<String, Integer> computePerformanceAttributes(List<? extends MatchStatsInput> matches) {
        if (matches == null || matches.isEmpty()) {
            return null;
        }

        Map<String, Double> num = new HashMap<>();
        num.put("PAC", 0.0);
        num.put("SHO", 0.0);
        num.put("PAS", 0.0);
        num.put("DRI", 0.0);
        num.put("DEF", 0.0);
        num.put("PHY", 0.0);
        double den = 0.0;

        for (MatchStatsInput m : matches) {
            Map<String, Double> norm = GPINormalization.normalizeMatchStats(m);
            double mult = GPIPositionWeights.getMultiplier(m.getMatchKind(), m.getStars());

            double pac = 0.45 * norm.getOrDefault("dribblesCompletedVol", 0.0)
                    + 0.30 * norm.getOrDefault("dribbleSuccess", 0.0)
                    + 0.25 * norm.getOrDefault("minutesReliability", 0.0);

            double sho = 0.50 * norm.getOrDefault("goals", 0.0)
                    + 0.30 * norm.getOrDefault("shotsOnTargetVol", 0.0)
                    + 0.20 * norm.getOrDefault("shotAccuracy", 0.0);

            double pas = 0.45 * norm.getOrDefault("passCompletion", 0.0)
                    + 0.35 * norm.getOrDefault("keyPasses", 0.0)
                    + 0.20 * norm.getOrDefault("assists", 0.0);

            double dri = 0.40 * norm.getOrDefault("dribbleSuccess", 0.0)
                    + 0.35 * norm.getOrDefault("dribblesCompletedVol", 0.0)
                    + 0.25 * norm.getOrDefault("duelsWon", 0.0);

            double def = 0.35 * norm.getOrDefault("tackles", 0.0)
                    + 0.35 * norm.getOrDefault("interceptions", 0.0)
                    + 0.30 * norm.getOrDefault("clearances", 0.0);

            double phy = 0.45 * norm.getOrDefault("duelsWon", 0.0)
                    + 0.35 * norm.getOrDefault("minutesReliability", 0.0)
                    + 0.20 * norm.getOrDefault("discipline", 0.0);

            num.put("PAC", num.get("PAC") + pac * mult);
            num.put("SHO", num.get("SHO") + sho * mult);
            num.put("PAS", num.get("PAS") + pas * mult);
            num.put("DRI", num.get("DRI") + dri * mult);
            num.put("DEF", num.get("DEF") + def * mult);
            num.put("PHY", num.get("PHY") + phy * mult);

            den += mult;
        }

        Map<String, Integer> result = new LinkedHashMap<>();
        for (String k : List.of("PAC", "SHO", "PAS", "DRI", "DEF", "PHY")) {
            double raw = den > 0.0 ? num.get(k) / den : 0.0;
            int scaled = (int) Math.round(40.0 + raw * 0.55);
            result.put(k, Math.max(40, Math.min(99, scaled)));
        }

        return result;
    }
}
