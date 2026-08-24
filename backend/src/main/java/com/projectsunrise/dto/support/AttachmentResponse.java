package com.projectsunrise.dto.support;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AttachmentResponse {
    private Long id;
    private String originalFilename;
    private String contentType;
    private Long size;
    private LocalDateTime createdAt;
}
