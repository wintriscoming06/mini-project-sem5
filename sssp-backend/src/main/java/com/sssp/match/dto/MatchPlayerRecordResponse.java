package com.sssp.match.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchPlayerRecordResponse {
    private Long id;
    private Long playerId;
    private String playerName;
    private LocalDate matchDate;
    private String opponent;
    private String competition;
    private String position;
    private String matchKind;
    private Integer stars;
    private Integer minutesPlayed;
    private int goals;
    private int assists;
    private int shots;
    private int shotsOnTarget;
    private int passesAttempted;
    private int passesCompleted;
    private int keyPasses;
    private int dribblesAttempted;
    private int dribblesCompleted;
    private int tackles;
    private int interceptions;
    private int clearances;
    private int duelsWon;
    private int yellowCards;
    private int redCards;
    private Double performanceScore;
    private LocalDateTime createdAt;
}
