package com.sssp.correction.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CorrectionSubmitRequest {
    @NotBlank
    private String targetField;
    @NotBlank
    private String oldValue;
    @NotBlank
    private String newValue;
    @NotBlank
    private String reason;
    private Long playerId;
}
