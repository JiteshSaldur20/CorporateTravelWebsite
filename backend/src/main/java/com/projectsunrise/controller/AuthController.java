package com.projectsunrise.controller;

import com.projectsunrise.dto.auth.*;
import com.projectsunrise.entity.User;
import com.projectsunrise.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Login, register, and account management")
public class AuthController {

    private final AuthService authService;

    @Value("${spring.security.oauth2.client.registration.google.client-id:not-configured}")
    private String googleClientId;

    @PostMapping("/register")
    @Operation(summary = "Register a new account", description = "Creates a new user account and returns a JWT.")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    @Operation(summary = "Log in", description = "Authenticates with email and password, returns a JWT.")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Forgot password", description = "Sends a password reset email if the account exists.")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(Map.of("message", "If an account with that email exists, a reset link has been sent"));
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password", description = "Resets the user password using the token from the email.")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Password reset successful"));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Returns the profile of the currently authenticated user.")
    public ResponseEntity<AuthResponse.UserInfo> getCurrentUser(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(authService.getCurrentUser(user));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token", description = "Exchange a valid refresh token for a new access + refresh token pair.")
    public ResponseEntity<AuthResponse> refresh(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(authService.refreshAccessToken(refreshToken));
    }

    @PostMapping("/logout")
    @Operation(summary = "Log out", description = "Clears the server-side security context.")
    public ResponseEntity<Map<String, String>> logout() {
        org.springframework.security.core.context.SecurityContextHolder.clearContext();
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/oauth-status")
    @Operation(summary = "OAuth status", description = "Returns whether Google OAuth login is enabled.")
    public ResponseEntity<Map<String, Boolean>> getOAuthStatus() {
        boolean googleEnabled = googleClientId != null
            && !googleClientId.isBlank()
            && !"not-configured".equals(googleClientId);
        return ResponseEntity.ok(Map.of("googleEnabled", googleEnabled));
    }
}
