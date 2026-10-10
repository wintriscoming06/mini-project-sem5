package com.sssp.scout.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShortlistResponse {
    private Long id;
    private Long scoutId;
    private Long playerId;
    private String playerName;
    private String position;
    private double gpi;
    private int priority;
    private String note;
}
