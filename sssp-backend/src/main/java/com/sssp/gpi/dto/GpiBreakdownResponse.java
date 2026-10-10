package com.sssp.gpi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GpiBreakdownResponse {
    private double overallGpi;
    private double technicalScore;
    private double physicalScore;
    private double tacticalScore;
    private double mentalScore;
    private Map<String, Double> metricBreakdown;
}
