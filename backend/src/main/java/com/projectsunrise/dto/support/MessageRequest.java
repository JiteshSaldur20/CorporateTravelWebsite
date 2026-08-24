package com.projectsunrise.dto.support;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MessageRequest {
    @NotBlank(message = "Message body is required")
    @Size(max = 5000, message = "Message must be under 5000 characters")
    private String body;

    private Boolean internalNote = false; // Admin only
}
