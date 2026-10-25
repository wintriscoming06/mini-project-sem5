package com.sssp.scout.dto;

import com.sssp.scout.ContactRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactRequestResponse {
    private Long id;
    private Long scoutId;
    private String scoutName;
    private String scoutUsername;
    private String scoutOrganization;
    private String scoutContactNumber;
    private Long playerId;
    private String playerName;
    private String message;
    private ContactRequestStatus status;
    private LocalDateTime createdAt;
}
