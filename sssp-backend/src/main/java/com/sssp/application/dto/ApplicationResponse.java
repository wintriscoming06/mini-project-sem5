package com.sssp.application.dto;

import com.sssp.common.enums.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationResponse {
    private Long id;
    private Long playerId;
    private String playerName;
    private Long tournamentId;
    private String tournamentName;
    private ApplicationStatus status;
    private LocalDateTime appliedAt;
    private LocalDateTime decisionAt;
    private String decidedByName;
}
