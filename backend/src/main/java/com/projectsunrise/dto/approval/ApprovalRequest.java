package com.projectsunrise.dto.approval;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ApprovalRequest {
    @Size(max = 500, message = "Rejection reason must be under 500 characters")
    private String rejectionReason; // Required when rejecting
}
