package com.sssp.gpi;

import com.sssp.user.User;
import com.sssp.common.entity.BaseEntity;
import com.sssp.common.enums.DataConfidence;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "gpi_records")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GPIRecord extends BaseEntity {

    @ManyToOne
    private User player;

    private LocalDateTime computedAt;
    private double quantitativeScore;
    
    @Column(nullable = true)
    private Double observationScore;
    
    private double gpi;
    private double recentForm;
    private double consistency;

    @Enumerated(EnumType.STRING)
    private DataConfidence dataConfidence;

    private int matchesConsidered;

    @Builder.Default
    private boolean rankingEligible = false;

    @Builder.Default
    private boolean provisional = true;

    private String status;
}
