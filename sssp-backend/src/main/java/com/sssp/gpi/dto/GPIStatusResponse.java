package com.sssp.gpi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GPIStatusResponse {
    private boolean eligible;
    private int competitiveCount;
    private int totalMatches;
    private int minRequired;
    private Double currentGPI;
    private Double previousGPI;
    private Integer overall;
    private Map<String, Integer> attributes;
    private Map<String, String> card;
    private List<GPIHistoryPointDto> history;
}
