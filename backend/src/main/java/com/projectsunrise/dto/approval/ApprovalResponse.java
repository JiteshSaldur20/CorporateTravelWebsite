package com.projectsunrise.dto.approval;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ApprovalResponse {
    private Long id;
    private Long bookingId;
    private String bookingReference;
    private String approverName;
    private String action;
    private String rejectionReason;
    private Boolean isApproved;
    private LocalDateTime decidedAt;
}
