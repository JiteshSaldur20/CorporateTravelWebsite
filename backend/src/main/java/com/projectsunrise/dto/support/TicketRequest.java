package com.projectsunrise.dto.support;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TicketRequest {
    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Subject is required")
    @Size(max = 200, message = "Subject must be under 200 characters")
    private String subject;

    @NotBlank(message = "Description is required")
    @Size(max = 5000, message = "Description must be under 5000 characters")
    private String description;

    @Size(max = 50, message = "Priority must be LOW, MEDIUM, HIGH, or URGENT")
    private String priority = "MEDIUM";

    private Long bookingId; // Optional
}
