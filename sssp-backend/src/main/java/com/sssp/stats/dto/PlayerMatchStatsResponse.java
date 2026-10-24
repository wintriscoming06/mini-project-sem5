package com.sssp.stats.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerMatchStatsResponse {
    private Long id;
    private Long playerId;
    private String playerName;
    private Long matchId;
    private String matchDescription;
    private String date;
    private String position;
    private String tournamentName;
    private String teamName;
    private String opponent;
    private Double performanceScore;
    private int goals;
    private int assists;
    private int shots;
    private int shotsOnTarget;
    private int yellowCards;
    private int redCards;
    private Integer minutesPlayed;
    private int passesAttempted;
    private int passesCompleted;
    private int keyPasses;
    private int dribblesAttempted;
    private int dribblesCompleted;
    private int tackles;
    private int interceptions;
    private int clearances;
    private int duelsWon;
    private boolean goalsRecorded;
    private boolean assistsRecorded;
}
