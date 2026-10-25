package com.sssp.scout.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScoutProfileDto {
    private Long id;
    private Long userId;
    private String username;
    private String organization;
    private String affiliation;
    private String phoneNumber;
    private boolean verified;
}
