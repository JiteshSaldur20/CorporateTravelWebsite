package com.projectsunrise.dto.user;

import lombok.Builder;
import lombok.Data;

import java.util.Set;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String employeeId;
    private Set<String> roles;
    private Boolean enabled;
    private String profilePictureUrl;
    private EmployeeProfileResponse employeeProfile;

    @Data
    @Builder
    public static class EmployeeProfileResponse {
        private Long id;
        private String designation;
        private String department;
        private String salaryBand;
        private String location;
        private String phone;
        private String reportingManagerEmail;
    }
}
