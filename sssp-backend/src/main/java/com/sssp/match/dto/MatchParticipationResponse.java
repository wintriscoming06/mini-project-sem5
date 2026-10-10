package com.sssp.match.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchParticipationResponse {
    private Long id;
    private Long matchId;
    private Long playerId;
    private String playerName;
    private Long teamId;
    private String teamName;
    private boolean starting;
    private Integer minutesPlayed;
}
