package com.sssp.audit;

import com.sssp.audit.dto.AuditLogResponse;
import com.sssp.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void logChange(String entityType, Long entityId, String oldValue, String newValue, User changedBy, String reason) {
        AuditLog log = AuditLog.builder()
                .entityType(entityType)
                .entityId(entityId)
                .oldValue(oldValue)
                .newValue(newValue)
                .changedBy(changedBy)
                .changedAt(LocalDateTime.now())
                .reason(reason)
                .build();
        auditLogRepository.save(log);
    }

    public List<AuditLogResponse> getLogs() {
        return auditLogRepository.findAllByOrderByChangedAtDesc().stream()
                .map(log -> AuditLogResponse.builder()
                        .id(log.getId())
                        .entityType(log.getEntityType())
                        .entityId(log.getEntityId())
                        .oldValue(log.getOldValue())
                        .newValue(log.getNewValue())
                        .changedByName(log.getChangedBy() != null ? log.getChangedBy().getUsername() : null)
                        .changedAt(log.getChangedAt())
                        .reason(log.getReason())
                        .build())
                .collect(Collectors.toList());
    }
}
