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
    private int goals;
    private int assists;
    private int yellowCards;
    private int redCards;
    private Integer minutesPlayed;
    private boolean goalsRecorded;
    private boolean assistsRecorded;
}
