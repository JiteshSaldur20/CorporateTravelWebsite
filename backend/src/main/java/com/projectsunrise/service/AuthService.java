package com.projectsunrise.service;

import com.projectsunrise.dto.auth.*;
import com.projectsunrise.entity.*;
import com.projectsunrise.repository.*;
import com.projectsunrise.security.JwtProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EmployeeProfileRepository employeeProfileRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final AuditService auditService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        if (request.getEmployeeId() != null && userRepository.existsByEmployeeId(request.getEmployeeId())) {
            throw new RuntimeException("Employee ID already registered");
        }

        // Always register as USER (EMPLOYEE)
        Role userRole = roleRepository.findByName(Role.RoleName.USER)
            .orElseThrow(() -> new RuntimeException("USER role not found"));

        User user = User.builder()
            .fullName(request.getFullName())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .employeeId(request.getEmployeeId())
            .enabled(true)
            .roles(Set.of(userRole))
            .build();

        user = userRepository.save(user);

        // Create employee profile
        if (request.getDesignation() != null || request.getDepartment() != null) {
            EmployeeProfile profile = EmployeeProfile.builder()
                .user(user)
                .designation(request.getDesignation())
                .department(request.getDepartment())
                .location(request.getLocation())
                .phone(request.getPhone())
                .salaryBand(SalaryBandMapper.resolveBand(request.getDesignation()))
                .build();
            employeeProfileRepository.save(profile);
        }

        auditService.log(user, "USER", "REGISTER", "USER", user.getId(), "SUCCESS",
            "New user registered: " + user.getEmail());

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getEnabled()) {
            throw new RuntimeException("Account is disabled");
        }
        if (user.getAccountLocked()) {
            throw new RuntimeException("Account is locked");
        }

        return buildAuthResponse(user);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user == null) {
            // Don't reveal whether user exists
            return;
        }

        // Invalidate existing tokens
        // Create new reset token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
            .token(token)
            .user(user)
            .expiryDate(LocalDateTime.now().plusHours(1))
            .valid(true)
            .used(false)
            .build();

        passwordResetTokenRepository.save(resetToken);

        // Send email
        emailService.sendPasswordResetEmail(user.getEmail(), token);

        auditService.log(user, "USER", "FORGOT_PASSWORD", "USER", user.getId(), "SUCCESS", null);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
            .orElseThrow(() -> new RuntimeException("Invalid reset token"));

        if (!resetToken.isValid()) {
            throw new RuntimeException("Reset token is invalid or expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        resetToken.setValid(false);
        passwordResetTokenRepository.save(resetToken);

        // Revoke all existing refresh tokens for this user
        refreshTokenRepository.deleteByUserId(user.getId());

        auditService.log(user, "USER", "RESET_PASSWORD", "USER", user.getId(), "SUCCESS", null);
    }

    @Transactional
    public AuthResponse refreshAccessToken(String refreshTokenValue) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenValue)
            .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if (refreshToken.isExpired() || refreshToken.getRevoked()) {
            throw new RuntimeException("Refresh token is expired or revoked");
        }

        User user = refreshToken.getUser();
        if (!user.getEnabled()) {
            throw new RuntimeException("Account is disabled");
        }

        // Rotate: revoke old, issue new
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse.UserInfo getCurrentUser(User user) {
        Set<String> roles = user.getRoles().stream()
            .map(role -> role.getName().name())
            .collect(Collectors.toSet());

        // Auto-create EmployeeProfile if missing
        EmployeeProfile profile = employeeProfileRepository.findByUserId(user.getId()).orElse(null);
        if (profile == null) {
            profile = EmployeeProfile.builder().user(user).build();
            employeeProfileRepository.save(profile);
        }

        boolean profileComplete = profile.getDesignation() != null && !profile.getDesignation().isBlank()
            && profile.getDepartment() != null && !profile.getDepartment().isBlank();

        return AuthResponse.UserInfo.builder()
            .id(user.getId())
            .fullName(user.getFullName())
            .email(user.getEmail())
            .employeeId(user.getEmployeeId())
            .roles(roles)
            .profilePictureUrl(user.getProfilePictureUrl())
            .profileComplete(profileComplete)
            .build();
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtProvider.generateToken(user.getEmail());
        String refreshTokenValue = generateRefreshToken(user);
        Set<String> roles = user.getRoles().stream()
            .map(role -> role.getName().name())
            .collect(Collectors.toSet());

        // Auto-create EmployeeProfile if missing
        EmployeeProfile profile = employeeProfileRepository.findByUserId(user.getId()).orElse(null);
        if (profile == null) {
            profile = EmployeeProfile.builder().user(user).build();
            employeeProfileRepository.save(profile);
        }
        boolean profileComplete = profile.getDesignation() != null && !profile.getDesignation().isBlank()
            && profile.getDepartment() != null && !profile.getDepartment().isBlank();

        return AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshTokenValue)
            .tokenType("Bearer")
            .expiresIn(3600000L)
            .user(AuthResponse.UserInfo.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .employeeId(user.getEmployeeId())
                .roles(roles)
                .profilePictureUrl(user.getProfilePictureUrl())
                .profileComplete(profileComplete)
                .build())
            .build();
    }

    private String generateRefreshToken(User user) {
        // Revoke existing refresh tokens for this user
        refreshTokenRepository.deleteByUserId(user.getId());

        String token = java.util.UUID.randomUUID().toString();
        RefreshToken refreshToken = RefreshToken.builder()
            .token(token)
            .user(user)
            .expiryDate(LocalDateTime.now().plusDays(7))
            .revoked(false)
            .build();
        refreshTokenRepository.save(refreshToken);
        return token;
    }
}
