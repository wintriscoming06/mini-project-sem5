package com.sssp.correction.dto;

import com.sssp.common.enums.CorrectionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CorrectionDecisionRequest {
    private CorrectionStatus decision;
    private String reviewNote;
}
