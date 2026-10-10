package com.sssp.application.dto;

import com.sssp.common.enums.ApplicationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationDecisionRequest {
    @NotNull
    private ApplicationStatus decision;
}
