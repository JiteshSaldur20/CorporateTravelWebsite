package com.projectsunrise.dto.support;

import lombok.Data;

@Data
public class TicketUpdateRequest {
    private String status;
    private String priority;
    private Long assignedAdminId;
}
