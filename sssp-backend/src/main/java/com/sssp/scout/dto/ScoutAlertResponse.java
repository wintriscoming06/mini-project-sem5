package com.sssp.scout.dto;

import com.sssp.common.enums.AlertTriggerType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScoutAlertResponse {
    private Long id;
    private Long scoutId;
    private Long filterId;
    private String filterName;
    private Long playerId;
    private String playerName;
    private AlertTriggerType triggerReason;
    private LocalDateTime alertCreatedAt;
    private boolean read;
}
