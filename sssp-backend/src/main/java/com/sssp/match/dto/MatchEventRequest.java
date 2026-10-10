package com.sssp.match.dto;

import com.sssp.common.enums.MatchEventType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchEventRequest {
    private Long playerId;
    @NotNull
    private MatchEventType eventType;
    private Integer minute;
}
