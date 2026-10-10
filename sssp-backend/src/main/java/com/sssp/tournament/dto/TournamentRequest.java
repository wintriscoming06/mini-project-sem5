package com.sssp.tournament.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TournamentRequest {
    @NotBlank
    private String name;
    private String ageGroup;
    private String genderCategory;
    private String location;
    private String venue;
    private LocalDate startDate;
    private LocalDate endDate;
    private String format;
    private LocalDate registrationDeadline;
}
