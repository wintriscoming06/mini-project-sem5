package com.sssp.stats;

import com.sssp.user.User;
import com.sssp.common.entity.BaseEntity;
import com.sssp.gpi.MatchStatsInput;
import com.sssp.match.Match;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "player_match_statistics")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerMatchStatistics extends BaseEntity implements MatchStatsInput {

    @ManyToOne(fetch = FetchType.LAZY)
    private User player;

    @ManyToOne(fetch = FetchType.LAZY)
    private Match match;

    private LocalDate matchDate;
    private String opponent;
    private String competition;
    private String position;

    @Builder.Default
    private String matchKind = "OFFICIAL"; // FRIENDLY or OFFICIAL

    private Integer stars; // 1 to 5 for OFFICIAL

    @Builder.Default
    private Integer minutesPlayed = 0;

    @Builder.Default
    private int goals = 0;

    @Builder.Default
    private int assists = 0;

    @Builder.Default
    private int shots = 0;

    @Builder.Default
    private int shotsOnTarget = 0;

    @Builder.Default
    private int passesAttempted = 0;

    @Builder.Default
    private int passesCompleted = 0;

    @Builder.Default
    private int keyPasses = 0;

    @Builder.Default
    private int dribblesAttempted = 0;

    @Builder.Default
    private int dribblesCompleted = 0;

    @Builder.Default
    private int tackles = 0;

    @Builder.Default
    private int interceptions = 0;

    @Builder.Default
    private int clearances = 0;

    @Builder.Default
    private int duelsWon = 0;

    @Builder.Default
    private int yellowCards = 0;

    @Builder.Default
    private int redCards = 0;

    private Double performanceScore; // P_m (0-100)

    @Builder.Default
    private boolean goalsRecorded = true;

    @Builder.Default
    private boolean assistsRecorded = true;
}
