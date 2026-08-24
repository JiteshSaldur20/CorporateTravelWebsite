package com.projectsunrise.service;

import com.projectsunrise.dto.dashboard.AuditLogResponse;
import com.projectsunrise.entity.AuditLog;
import com.projectsunrise.entity.User;
import com.projectsunrise.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public AuditLog log(User actor, String actorRole, String action, String entityType,
                        Long entityId, String status, String metadata) {
        AuditLog auditLog = AuditLog.builder()
            .actor(actor)
            .actorRole(actorRole)
            .action(action)
            .entityType(entityType)
            .entityId(entityId)
            .status(status)
            .metadata(metadata)
            .build();

        return auditLogRepository.save(auditLog);
    }

    @Transactional
    public AuditLog logAction(String action, String entityType, Long entityId,
                              String status, String metadata) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User actor = null;
        String actorRole = "SYSTEM";

        if (auth != null && auth.getPrincipal() instanceof User) {
            actor = (User) auth.getPrincipal();
            actorRole = actor.getRoles().iterator().next().getName().name();
        }

        return log(actor, actorRole, action, entityType, entityId, status, metadata);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> searchLogs(String action, String entityType, Long actorId,
                                              String status, LocalDateTime fromDate,
                                              LocalDateTime toDate, int page, int size) {
        Page<AuditLog> logs = auditLogRepository.searchLogs(
            action, entityType, actorId, status, fromDate, toDate,
            PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"))
        );

        return logs.map(this::mapToResponse);
    }

    private AuditLogResponse mapToResponse(AuditLog log) {
        return AuditLogResponse.builder()
            .id(log.getId())
            .actorName(log.getActor() != null ? log.getActor().getFullName() : "SYSTEM")
            .actorRole(log.getActorRole())
            .action(log.getAction())
            .entityType(log.getEntityType())
            .entityId(log.getEntityId())
            .status(log.getStatus())
            .metadata(log.getMetadata())
            .timestamp(log.getTimestamp())
            .build();
    }
}
