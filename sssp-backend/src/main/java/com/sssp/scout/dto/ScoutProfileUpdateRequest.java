package com.sssp.scout.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScoutProfileUpdateRequest {
    private String organization;
    private String affiliation;
    private String phoneNumber;
}
