package com.sssp.gpi;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * Centralized normalization logic ported directly from gpi-app(2) config/normalization.js.
 * All raw stats are converted to a 0-100 scale here.
 */
public final class GPINormalization {

    private GPINormalization() {}

    public static double clamp(double value, double min, double max) {
        return Math.max(min, Math.min(max, value));
    }

    public static double ratio(double made, double attempted) {
        if (attempted <= 0.0) return 0.0;
        return clamp((made / attempted) * 100.0, 0.0, 100.0);
    }

    public static final Map<String, Double> PER90_CAPS;
    static {
        Map<String, Double> caps = new HashMap<>();
        caps.put("goals", 1.2);
        caps.put("assists", 1.0);
        caps.put("shots_on_target", 4.0);
        caps.put("key_passes", 4.0);
        caps.put("dribbles_completed", 5.0);
        caps.put("tackles", 5.0);
        caps.put("interceptions", 4.0);
        caps.put("clearances", 6.0);
        caps.put("duels_won", 8.0);
        PER90_CAPS = Collections.unmodifiableMap(caps);
    }

    public static double per90(double value, double minutes, String statKey) {
        if (minutes <= 0.0) return 0.0;
        double rate = (value / minutes) * 90.0;
        double cap = PER90_CAPS.getOrDefault(statKey, 1.0);
        return clamp((rate / cap) * 100.0, 0.0, 100.0);
    }

    public static Map<String, Double> normalizeMatchStats(MatchStatsInput match) {
        double minutes = match.getMinutesPlayed() != null ? match.getMinutesPlayed().doubleValue() : 0.0;

        Map<String, Double> norm = new HashMap<>();
        norm.put("goals", per90(match.getGoals(), minutes, "goals"));
        norm.put("assists", per90(match.getAssists(), minutes, "assists"));
        norm.put("shotAccuracy", ratio(match.getShotsOnTarget(), match.getShots()));
        norm.put("shotsOnTargetVol", per90(match.getShotsOnTarget(), minutes, "shots_on_target"));
        norm.put("passCompletion", ratio(match.getPassesCompleted(), match.getPassesAttempted()));
        norm.put("keyPasses", per90(match.getKeyPasses(), minutes, "key_passes"));
        norm.put("dribbleSuccess", ratio(match.getDribblesCompleted(), match.getDribblesAttempted()));
        norm.put("dribblesCompletedVol", per90(match.getDribblesCompleted(), minutes, "dribbles_completed"));
        norm.put("tackles", per90(match.getTackles(), minutes, "tackles"));
        norm.put("interceptions", per90(match.getInterceptions(), minutes, "interceptions"));
        norm.put("clearances", per90(match.getClearances(), minutes, "clearances"));
        norm.put("duelsWon", per90(match.getDuelsWon(), minutes, "duels_won"));
        norm.put("discipline", clamp(100.0 - (match.getYellowCards() * 10.0 + match.getRedCards() * 40.0), 0.0, 100.0));
        norm.put("minutesReliability", clamp((minutes / 90.0) * 100.0, 0.0, 100.0));

        return norm;
    }
}
