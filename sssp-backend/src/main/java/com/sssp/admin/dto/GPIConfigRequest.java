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
public class GPIConfigRequest {
    private Map<String, Map<String, Double>> positionWeights;
    private Double observationWeight;
    private Double quantitativeWeight;
    private Integer minMatchesForEligibility;
}
