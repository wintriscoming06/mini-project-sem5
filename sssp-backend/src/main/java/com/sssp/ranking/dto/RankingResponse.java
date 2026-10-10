package com.sssp.ranking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RankingResponse {
    private Long id;
    private Long playerId;
    private String playerName;
    private String context;
    private int rankValue;
    private double gpiValue;
    private LocalDateTime computedAt;
}
