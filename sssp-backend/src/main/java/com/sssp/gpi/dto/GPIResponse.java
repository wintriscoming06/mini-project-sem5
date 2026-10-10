package com.sssp.gpi.dto;

import com.sssp.common.enums.DataConfidence;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GPIResponse {
    private Long id;
    private Long playerId;
    private String playerName;
    private double quantitativeScore;
    private Double observationScore;
    private double gpi;
    private double recentForm;
    private double consistency;
    private DataConfidence dataConfidence;
    private int matchesConsidered;
    private boolean rankingEligible;
    private boolean provisional;
    private String status;
    private LocalDateTime computedAt;

    // Extended GPI engine fields matching gpi-app(2)
    private boolean eligible;
    private int competitiveCount;
    private int minRequired;
    private Double currentGPI;
    private Double previousGPI;
    private Integer overall;

    // Direct attribute shortcuts for frontend charts
    private Integer pace;
    private Integer shooting;
    private Integer passing;
    private Integer dribbling;
    private Integer defense;
    private Integer physical;

    private Map<String, Integer> attributes;
    private Map<String, String> card;
    private List<GPIHistoryPointDto> history;
}
