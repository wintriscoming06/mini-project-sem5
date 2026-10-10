package com.sssp.player.dto;

import com.sssp.gpi.dto.GPIStatusResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerProfileResponse {
    private Long id;
    private Long userId;
    private String username;
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
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Extended GPI & Player Card attributes matching gpi-app(2)
    private Integer overall;
    private Integer totalMatches;
    private Map<String, Object> attributes;
    private Map<String, String> card;
    private GPIStatusResponse gpi;
}
