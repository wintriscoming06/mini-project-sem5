package com.sssp.match.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchParticipationRequest {
    private Long playerId;
    private Long teamId;
    private boolean starting;
    private Integer minutesPlayed;
}
