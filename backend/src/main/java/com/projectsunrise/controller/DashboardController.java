package com.projectsunrise.controller;

import com.projectsunrise.dto.dashboard.*;
import com.projectsunrise.entity.User;
import com.projectsunrise.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Role-specific dashboard summaries")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/employee")
    @Operation(summary = "Employee dashboard", description = "Returns stats and recent bookings for the current employee.")
    public ResponseEntity<EmployeeDashboardResponse> getEmployeeDashboard(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(dashboardService.getEmployeeDashboard(user));
    }

    @GetMapping("/approver")
    @Operation(summary = "Approver dashboard", description = "Returns pending count, recent approvals, and stats for the manager.")
    public ResponseEntity<ApproverDashboardResponse> getApproverDashboard(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(dashboardService.getApproverDashboard(user));
    }

    @GetMapping("/admin")
    @Operation(summary = "Admin dashboard", description = "Returns system-wide stats, spend, and recent activity. Admin only.")
    public ResponseEntity<AdminDashboardResponse> getAdminDashboard(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(dashboardService.getAdminDashboard(user));
    }
}
