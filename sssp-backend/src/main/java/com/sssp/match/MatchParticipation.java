package com.sssp.match;

import com.sssp.user.User;
import com.sssp.common.entity.BaseEntity;
import com.sssp.team.Team;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "match_participations", uniqueConstraints = @UniqueConstraint(columnNames = {"match_id", "player_id"}))
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchParticipation extends BaseEntity {

    @ManyToOne
    private Match match;

    @ManyToOne
    private User player;

    @ManyToOne
    private Team team;

    @Builder.Default
    private boolean starting = true;

    private Integer minutesPlayed;
}
