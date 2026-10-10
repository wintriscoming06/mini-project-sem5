package com.sssp.match.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchCreateRequest {
    private Long playerId;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate matchDate;

    private String opponent;
    private String competition;
    private String position;

    @Builder.Default
    private String matchKind = "OFFICIAL"; // FRIENDLY or OFFICIAL

    private Integer stars; // 1 to 5 for OFFICIAL

    @Builder.Default
    private Integer minutesPlayed = 90;

    @Builder.Default
    private int goals = 0;

    @Builder.Default
    private int assists = 0;

    @Builder.Default
    private int shots = 0;

    @Builder.Default
    private int shotsOnTarget = 0;

    @Builder.Default
    private int passesAttempted = 0;

    @Builder.Default
    private int passesCompleted = 0;

    @Builder.Default
    private int keyPasses = 0;

    @Builder.Default
    private int dribblesAttempted = 0;

    @Builder.Default
    private int dribblesCompleted = 0;

    @Builder.Default
    private int tackles = 0;

    @Builder.Default
    private int interceptions = 0;

    @Builder.Default
    private int clearances = 0;

    @Builder.Default
    private int duelsWon = 0;

    @Builder.Default
    private int yellowCards = 0;

    @Builder.Default
    private int redCards = 0;
}
