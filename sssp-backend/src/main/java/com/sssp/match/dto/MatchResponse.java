package com.sssp.match.dto;

import com.sssp.common.enums.MatchStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchResponse {
    private Long id;
    private Long tournamentId;
    private String tournamentName;
    private Long homeTeamId;
    private String homeTeamName;
    private Long awayTeamId;
    private String awayTeamName;
    private LocalDateTime matchDateTime;
    private String venue;
    private MatchStatus status;
    private Integer homeScore;
    private Integer awayScore;
    private boolean confirmed;
    private LocalDateTime confirmedAt;
}
