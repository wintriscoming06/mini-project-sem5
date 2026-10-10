package com.sssp.match.dto;

import com.sssp.common.enums.MatchEventType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchEventResponse {
    private Long id;
    private Long matchId;
    private Long playerId;
    private String playerName;
    private MatchEventType eventType;
    private Integer minute;
    private LocalDateTime createdAt;
}
