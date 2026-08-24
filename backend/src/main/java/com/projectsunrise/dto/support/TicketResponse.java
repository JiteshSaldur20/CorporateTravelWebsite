package com.projectsunrise.dto.support;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class TicketResponse {
    private Long id;
    private Long requesterId;
    private String requesterName;
    private String requesterEmail;
    private Long linkedBookingId;
    private String bookingReference;
    private String category;
    private String subject;
    private String description;
    private String status;
    private String priority;
    private Long assignedAdminId;
    private String assignedAdminName;
    private LocalDateTime resolvedAt;
    private LocalDateTime closedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<MessageResponse> messages;
    private List<AttachmentResponse> attachments;
}
