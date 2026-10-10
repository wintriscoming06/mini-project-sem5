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
public class ScoutFilterResponse {
    private Long id;
    private Long scoutId;
    private String name;
    private String criteriaJson;
    private LocalDateTime createdAt;
}
