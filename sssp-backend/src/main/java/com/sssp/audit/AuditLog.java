package com.sssp.audit;

import com.sssp.user.User;
import com.sssp.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog extends BaseEntity {

    private String entityType;
    private Long entityId;
    private String oldValue;
    private String newValue;

    @ManyToOne
    private User changedBy;

    private LocalDateTime changedAt;
    private String reason;

    @ManyToOne
    private User reviewedBy;
}
