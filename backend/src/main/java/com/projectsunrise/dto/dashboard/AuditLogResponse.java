package com.projectsunrise.dto.dashboard;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AuditLogResponse {
    private Long id;
    private String actorName;
    private String actorRole;
    private String action;
    private String entityType;
    private Long entityId;
    private String status;
    private String metadata;
    private LocalDateTime timestamp;
}
