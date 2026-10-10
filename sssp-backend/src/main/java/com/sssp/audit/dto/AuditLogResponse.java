package com.sssp.audit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {
    private Long id;
    private String entityType;
    private Long entityId;
    private String oldValue;
    private String newValue;
    private String changedByName;
    private LocalDateTime changedAt;
    private String reason;
}
