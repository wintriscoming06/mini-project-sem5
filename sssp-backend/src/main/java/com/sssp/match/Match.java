package com.sssp.match;

import com.sssp.user.User;
import com.sssp.common.entity.BaseEntity;
import com.sssp.common.enums.MatchStatus;
import com.sssp.team.Team;
import com.sssp.tournament.Tournament;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "matches")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Match extends BaseEntity {

    @ManyToOne
    private Tournament tournament;

    @ManyToOne
    private Team homeTeam;

    @ManyToOne
    private Team awayTeam;

    private LocalDateTime matchDateTime;
    private String venue;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private MatchStatus status = MatchStatus.SCHEDULED;

    private Integer homeScore;
    private Integer awayScore;

    @Builder.Default
    private boolean confirmed = false;

    private LocalDateTime confirmedAt;

    @ManyToOne
    private User confirmedBy;
}
