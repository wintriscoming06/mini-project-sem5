package com.sssp.tournament.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TournamentMatchScoreRequest {
    private Integer homeScore;
    private Integer awayScore;
}
