package com.sssp.scout.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerSearchRequest {
    private String query;
    private String position;
    private String ageGroup;
    private String location;
    private Double minGpi;
    private Double maxGpi;
    private Integer minMatches;
    private String dataConfidence;
    private String recentForm;
    private String tournamentName;
    private String teamAcademy;
    @Builder.Default
    private String sortBy = "gpi";
    @Builder.Default
    private String sortDir = "desc";
}
