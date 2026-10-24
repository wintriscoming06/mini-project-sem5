package com.sssp.tournament.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TournamentPlayerStatsRequest {

    @NotNull(message = "Player ID is required")
    private Long playerId;

    private Long teamId;

    private String position; // ST, CM, CB, etc.

    @Builder.Default
    private String matchKind = "OFFICIAL"; // OFFICIAL or FRIENDLY

    @Builder.Default
    private Integer stars = 3; // 1 to 5

    @NotNull(message = "Minutes played is required")
    @Min(value = 0, message = "Minutes played cannot be negative")
    private Integer minutesPlayed;

    @Min(value = 0, message = "Goals cannot be negative")
    private int goals;

    @Min(value = 0, message = "Assists cannot be negative")
    private int assists;

    @Min(value = 0, message = "Shots cannot be negative")
    private int shots;

    @Min(value = 0, message = "Shots on target cannot be negative")
    private int shotsOnTarget;

    @Min(value = 0, message = "Passes attempted cannot be negative")
    private int passesAttempted;

    @Min(value = 0, message = "Passes completed cannot be negative")
    private int passesCompleted;

    @Min(value = 0, message = "Key passes cannot be negative")
    private int keyPasses;

    @Min(value = 0, message = "Dribbles attempted cannot be negative")
    private int dribblesAttempted;

    @Min(value = 0, message = "Dribbles completed cannot be negative")
    private int dribblesCompleted;

    @Min(value = 0, message = "Tackles cannot be negative")
    private int tackles;

    @Min(value = 0, message = "Interceptions cannot be negative")
    private int interceptions;

    @Min(value = 0, message = "Clearances cannot be negative")
    private int clearances;

    @Min(value = 0, message = "Duels won cannot be negative")
    private int duelsWon;

    @Min(value = 0, message = "Yellow cards cannot be negative")
    private int yellowCards;

    @Min(value = 0, message = "Red cards cannot be negative")
    private int redCards;
}
