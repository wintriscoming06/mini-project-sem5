package com.sssp.scout.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerSearchResponse {
    private Long playerId;
    private Long id;
    private String playerName;
    private String name;
    private String primaryPosition;
    private String position;
    private String positionCategory;
    private int age;
    private String location;
    private String teamAcademy;
    private String team;
    private String photoUrl;
    private double gpi;
    private int verifiedMatches;
    private String dataConfidence;
    private double recentForm;
    private boolean rankingEligible;
}
