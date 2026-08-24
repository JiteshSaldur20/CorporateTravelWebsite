package com.projectsunrise.dto.user;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @Size(min = 2, max = 100)
    private String fullName;

    private String phone;
    private String location;
    private String designation;
    private String department;
}
