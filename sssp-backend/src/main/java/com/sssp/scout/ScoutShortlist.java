package com.sssp.scout;

import com.sssp.user.User;
import com.sssp.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "scout_shortlists", uniqueConstraints = @UniqueConstraint(columnNames = {"scout_id", "player_id"}))
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScoutShortlist extends BaseEntity {

    @ManyToOne
    private User scout;

    @ManyToOne
    private User player;

    @Builder.Default
    private int priority = 0;

    private String note;
}
