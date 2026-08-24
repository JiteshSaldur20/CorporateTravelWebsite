package com.projectsunrise.dto.auth;

import lombok.Builder;
import lombok.Data;

import java.util.Set;

@Data
@Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private Long expiresIn;
    private UserInfo user;

    @Data
    @Builder
    public static class UserInfo {
        private Long id;
        private String fullName;
        private String email;
        private String employeeId;
        private Set<String> roles;
        private String profilePictureUrl;
        private boolean profileComplete;
    }
}
