package com.sssp.player.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerProfileRequest {
    private String fullName;
    private LocalDate dateOfBirth;
    private String location;
    private String preferredFoot;
    private String primaryPosition;
    private String secondaryPosition;
    private String positionCategory;
    private String teamAcademy;
    private String photoUrl;
    private String biography;
    private String visibility;
}
