package com.sssp.stats;

import com.sssp.user.User;
import com.sssp.common.entity.BaseEntity;
import com.sssp.tournament.Tournament;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "player_performance_history")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlayerPerformanceHistory extends BaseEntity {

    @ManyToOne
    private User player;

    @ManyToOne
    private Tournament tournament;

    private int totalMatches;
    private int totalGoals;
    private int totalAssists;
    private int totalYellowCards;
    private int totalRedCards;
    private int totalMinutesPlayed;

    private double goalsPerMatch;
    private double assistsPerMatch;
    private double goalsPer90;
    private double assistsPer90;
}
