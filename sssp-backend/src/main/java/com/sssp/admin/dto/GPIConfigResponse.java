package com.sssp.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GPIConfigResponse {
    private Map<String, Map<String, Double>> positionWeights;
    private double observationWeight;
    private double quantitativeWeight;
    private int minMatchesForEligibility;
}
