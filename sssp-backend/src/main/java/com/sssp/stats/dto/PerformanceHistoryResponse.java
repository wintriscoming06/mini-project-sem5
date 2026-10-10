package com.sssp.stats.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceHistoryResponse {
    private Long id;
    private Long playerId;
    private Long tournamentId;
    private String tournamentName;
    private int totalMatches;
    private int totalGoals;
    private int totalAssists;
    private int totalYellowCards;
    private int totalRedCards;
    private int totalMinutesPlayed;
    private double goalsPerMatch;
    private double assistsPerMatch;
    private double goalsPer90;
    private double assistsPer90;
}
