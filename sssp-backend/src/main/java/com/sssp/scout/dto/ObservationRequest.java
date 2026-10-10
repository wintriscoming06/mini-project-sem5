package com.sssp.scout.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ObservationRequest {
    private Long matchId;
    
    @Min(1) @Max(5)
    private int technicalRating;
    
    @Min(1) @Max(5)
    private int tacticalRating;
    
    @Min(1) @Max(5)
    private int physicalRating;
    
    @Min(1) @Max(5)
    private int psychosocialRating;
    
    private String comments;
}
