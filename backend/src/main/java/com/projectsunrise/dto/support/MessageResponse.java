package com.projectsunrise.dto.support;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MessageResponse {
    private Long id;
    private Long senderId;
    private String senderName;
    private String senderRole;
    private String body;
    private Boolean internalNote;
    private LocalDateTime createdAt;
}
