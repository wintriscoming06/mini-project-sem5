package com.sssp.scout;

import com.sssp.user.User;
import com.sssp.common.entity.BaseEntity;
import com.sssp.match.Match;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "scout_observations")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScoutObservation extends BaseEntity {

    @ManyToOne
    private User evaluator;

    @ManyToOne
    private User player;

    @ManyToOne(optional = true)
    private Match match;

    private int technicalRating;
    private int tacticalRating;
    private int physicalRating;
    private int psychosocialRating;

    @Column(columnDefinition = "TEXT")
    private String comments;

    private LocalDateTime observedAt;
}
