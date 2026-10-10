package com.sssp.tournament;

import com.sssp.user.User;
import com.sssp.common.entity.BaseEntity;
import com.sssp.tournament.TournamentStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "tournaments")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Tournament extends BaseEntity {

    @ManyToOne
    private User organizer;

    private String name;
    private String ageGroup;
    private String genderCategory;
    private String location;
    private String venue;
    private LocalDate startDate;
    private LocalDate endDate;
    private String format;
    private LocalDate registrationDeadline;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TournamentStatus status = TournamentStatus.DRAFT;
}
