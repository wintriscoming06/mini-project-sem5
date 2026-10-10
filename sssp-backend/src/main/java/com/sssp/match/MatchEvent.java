package com.sssp.match;

import com.sssp.user.User;
import com.sssp.common.entity.BaseEntity;
import com.sssp.common.enums.MatchEventType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "match_events")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchEvent extends BaseEntity {

    @ManyToOne
    private Match match;

    @ManyToOne
    private User player;

    @Enumerated(EnumType.STRING)
    private MatchEventType eventType;

    private Integer minute;

    @ManyToOne
    private User recordedBy;
}
