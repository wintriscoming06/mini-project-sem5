package com.sssp.correction.dto;

import com.sssp.common.enums.CorrectionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CorrectionResponse {
    private Long id;
    private Long matchId;
    private Long playerId;
    private String playerName;
    private String targetField;
    private String oldValue;
    private String newValue;
    private String reason;
    private String submitterName;
    private CorrectionStatus status;
    private LocalDateTime submittedAt;
    private String reviewerName;
    private LocalDateTime reviewedAt;
}
