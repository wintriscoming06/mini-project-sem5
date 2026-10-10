package com.sssp.scout.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ObservationResponse {
    private Long id;
    private Long evaluatorId;
    private String evaluatorName;
    private Long playerId;
    private String playerName;
    private Long matchId;
    private int technicalRating;
    private int tacticalRating;
    private int physicalRating;
    private int psychosocialRating;
    private String comments;
    private LocalDateTime observedAt;
}
