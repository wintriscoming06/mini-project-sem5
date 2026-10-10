package com.sssp.tournament.dto;

import com.sssp.tournament.TournamentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TournamentResponse {
    private Long id;
    private Long organizerId;
    private String organizerName;
    private String name;
    private String ageGroup;
    private String genderCategory;
    private String location;
    private String venue;
    private LocalDate startDate;
    private LocalDate endDate;
    private String format;
    private LocalDate registrationDeadline;
    private TournamentStatus status;
    private LocalDateTime createdAt;
}
