package com.sssp.alert;

import com.sssp.scout.ScoutFilter;

import com.sssp.user.User;
import com.sssp.common.entity.BaseEntity;
import com.sssp.common.enums.AlertTriggerType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "scout_alerts")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScoutAlert extends BaseEntity {

    @ManyToOne
    private User scout;

    @ManyToOne
    private ScoutFilter filter;

    @ManyToOne
    private User player;

    @Enumerated(EnumType.STRING)
    private AlertTriggerType triggerReason;

    private LocalDateTime alertCreatedAt;

    @Builder.Default
    private boolean read = false;
}
