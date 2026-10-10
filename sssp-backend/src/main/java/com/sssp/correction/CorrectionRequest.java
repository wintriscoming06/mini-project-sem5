package com.sssp.correction;

import com.sssp.user.User;
import com.sssp.common.entity.BaseEntity;
import com.sssp.common.enums.CorrectionStatus;
import com.sssp.match.Match;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "correction_requests")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CorrectionRequest extends BaseEntity {

    @ManyToOne
    private Match match;

    @ManyToOne
    private User player;

    private String targetField;
    private String oldValue;
    private String newValue;
    private String reason;

    @ManyToOne
    private User submitter;

    private LocalDateTime submittedAt;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private CorrectionStatus status = CorrectionStatus.PENDING;

    @ManyToOne
    private User reviewer;

    private LocalDateTime reviewedAt;
}
