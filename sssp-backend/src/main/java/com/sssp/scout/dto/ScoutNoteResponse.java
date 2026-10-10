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
public class ScoutNoteResponse {
    private Long id;
    private Long scoutId;
    private Long playerId;
    private String playerName;
    private String note;
    private LocalDateTime notedAt;
}
