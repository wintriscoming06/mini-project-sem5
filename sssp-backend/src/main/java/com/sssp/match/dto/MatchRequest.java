package com.sssp.match.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchRequest {
    private Long tournamentId;
    private Long homeTeamId;
    private Long awayTeamId;
    private LocalDateTime matchDateTime;
    private String venue;
}
