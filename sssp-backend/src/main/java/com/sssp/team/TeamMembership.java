package com.sssp.team;

import com.sssp.user.User;
import com.sssp.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "team_memberships", uniqueConstraints = @UniqueConstraint(columnNames = {"team_id", "player_id"}))
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamMembership extends BaseEntity {

    @ManyToOne
    private Team team;

    @ManyToOne
    private User player;

    private LocalDateTime joinedAt;
}
