package com.sssp.tournament.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TournamentPlayerStatsResponse {
    private Long id;
    private Long tournamentId;
    private String tournamentName;
    private Long playerId;
    private String playerUsername;
    private String playerName;
    private Long teamId;
    private String teamName;
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

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
