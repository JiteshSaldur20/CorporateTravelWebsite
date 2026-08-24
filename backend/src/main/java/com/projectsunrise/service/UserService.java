package com.projectsunrise.service;

import com.projectsunrise.dto.user.UpdateProfileRequest;
import com.projectsunrise.dto.user.UserResponse;
import com.projectsunrise.entity.EmployeeProfile;
import com.projectsunrise.entity.User;
import com.projectsunrise.repository.EmployeeProfileRepository;
import com.projectsunrise.repository.UserRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final EmployeeProfileRepository employeeProfileRepository;
    private final EntityManager entityManager;

    @Transactional(readOnly = true)
    public UserResponse getProfile(User user) {
        // Always re-fetch from DB to avoid stale detached entity issues
        User freshUser = userRepository.findById(user.getId()).orElse(user);
        EmployeeProfile profile = employeeProfileRepository.findByUserId(freshUser.getId()).orElse(null);

        return UserResponse.builder()
            .id(freshUser.getId())
            .fullName(freshUser.getFullName())
            .email(freshUser.getEmail())
            .employeeId(freshUser.getEmployeeId())
            .roles(freshUser.getRoles().stream().map(r -> r.getName().name()).collect(java.util.stream.Collectors.toSet()))
            .enabled(freshUser.getEnabled())
            .profilePictureUrl(freshUser.getProfilePictureUrl())
            .employeeProfile(profile != null ? UserResponse.EmployeeProfileResponse.builder()
                .id(profile.getId())
                .designation(profile.getDesignation())
                .department(profile.getDepartment())
                .salaryBand(profile.getSalaryBand())
                .location(profile.getLocation())
                .phone(profile.getPhone())
                .reportingManagerEmail(profile.getReportingManagerEmail())
                .build() : null)
            .build();
    }

    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest request, User user) {
        // Re-fetch user from DB to ensure we have a managed entity
        User managedUser = userRepository.findById(user.getId())
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getFullName() != null) managedUser.setFullName(request.getFullName());

        EmployeeProfile profile = employeeProfileRepository.findByUserId(managedUser.getId()).orElse(null);
        if (profile == null) {
            profile = EmployeeProfile.builder().user(managedUser).build();
        }

        if (request.getPhone() != null) profile.setPhone(request.getPhone());
        if (request.getLocation() != null) profile.setLocation(request.getLocation());
        if (request.getDesignation() != null) {
            profile.setDesignation(request.getDesignation());
            String band = SalaryBandMapper.resolveBand(request.getDesignation());
            if (band != null) {
                profile.setSalaryBand(band);
            }
        }
        if (request.getDepartment() != null) profile.setDepartment(request.getDepartment());

        userRepository.save(managedUser);
        employeeProfileRepository.save(profile);
        entityManager.flush(); // Ensure data is written to DB before reading

        return getProfile(managedUser);
    }
}
