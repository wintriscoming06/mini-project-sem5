package com.sssp.application;

import com.sssp.tournament.Tournament;

import com.sssp.user.User;
import com.sssp.common.entity.BaseEntity;
import com.sssp.common.enums.ApplicationStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tournament_applications", uniqueConstraints = @UniqueConstraint(columnNames = {"player_id", "tournament_id"}))
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TournamentApplication extends BaseEntity {

    @ManyToOne
    private User player;

    @ManyToOne
    private Tournament tournament;

    private LocalDateTime appliedAt;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.PENDING;

    private LocalDateTime decisionAt;

    @ManyToOne
    private User decidedBy;
}
