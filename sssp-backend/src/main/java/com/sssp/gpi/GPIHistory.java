package com.sssp.gpi;

import com.sssp.user.User;
import com.sssp.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "gpi_history")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GPIHistory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    private User player;

    private double gpiValue;
    private int competitiveMatches;

    @Builder.Default
    private LocalDateTime recordedAt = LocalDateTime.now();
}
