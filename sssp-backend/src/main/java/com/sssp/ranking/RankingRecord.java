package com.sssp.ranking;

import com.sssp.user.User;
import com.sssp.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ranking_records")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RankingRecord extends BaseEntity {

    @ManyToOne
    private User player;

    private String context;
    private int rankValue;
    private double gpiValue;
    private LocalDateTime computedAt;
}
