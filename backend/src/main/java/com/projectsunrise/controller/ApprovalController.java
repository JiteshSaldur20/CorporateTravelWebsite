package com.projectsunrise.controller;

import com.projectsunrise.dto.approval.ApprovalRequest;
import com.projectsunrise.dto.approval.ApprovalResponse;
import com.projectsunrise.dto.booking.BookingResponse;
import com.projectsunrise.entity.Booking;
import com.projectsunrise.entity.User;
import com.projectsunrise.service.ApprovalService;
import com.projectsunrise.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/approvals")
@RequiredArgsConstructor
@Tag(name = "Approvals", description = "Approve or reject travel bookings")
public class ApprovalController {

    private final ApprovalService approvalService;
    private final BookingService bookingService;

    @GetMapping("/pending")
    @Operation(summary = "Get pending approvals", description = "Returns all bookings awaiting this manager's decision.")
    public ResponseEntity<List<BookingResponse>> getPendingApprovals(@AuthenticationPrincipal User user) {
        List<Booking> pending = approvalService.getPendingApprovals(user);
        return ResponseEntity.ok(pending.stream()
            .map(b -> BookingResponse.builder()
                .id(b.getId())
                .bookingReference(b.getBookingReference())
                .employeeId(b.getEmployee().getId())
                .employeeName(b.getEmployee().getFullName())
                .status(b.getStatus().name())
                .type(b.getType().name())
                .travelPurpose(b.getTravelPurpose())
                .travelStartDate(b.getTravelStartDate())
                .travelEndDate(b.getTravelEndDate())
                .origin(b.getOrigin())
                .destination(b.getDestination())
                .totalAmount(b.getTotalAmount())
                .createdAt(b.getCreatedAt())
                .build())
            .collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get approval detail", description = "Returns full booking details for an approval.")
    public ResponseEntity<BookingResponse> getApprovalDetail(@PathVariable Long id,
                                                              @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(bookingService.getBookingById(id, user));
    }

    @PostMapping("/{id}/approve")
    @Operation(summary = "Approve a booking", description = "Approves the booking and notifies the employee.")
    public ResponseEntity<ApprovalResponse> approveBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(approvalService.approveBooking(id, user));
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Reject a booking", description = "Rejects the booking with a reason and notifies the employee.")
    public ResponseEntity<ApprovalResponse> rejectBooking(
            @PathVariable Long id,
            @Valid @RequestBody ApprovalRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(approvalService.rejectBooking(id, request.getRejectionReason(), user));
    }
}
