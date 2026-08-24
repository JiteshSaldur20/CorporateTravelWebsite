package com.projectsunrise.service;

import com.projectsunrise.dto.approval.ApprovalResponse;
import com.projectsunrise.entity.*;
import com.projectsunrise.repository.ApprovalRepository;
import com.projectsunrise.repository.BookingRepository;
import com.projectsunrise.repository.EmployeeProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApprovalService {

    private final ApprovalRepository approvalRepository;
    private final BookingRepository bookingRepository;
    private final EmployeeProfileRepository employeeProfileRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;
    private final EmailService emailService;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Transactional(readOnly = true)
    public List<Booking> getPendingApprovals(User manager) {
        if (manager.hasRole("ADMIN")) {
            return bookingRepository.findAllPending();
        }
        return bookingRepository.findPendingForManager(manager.getId());
    }

    @Transactional
    public ApprovalResponse approveBooking(Long bookingId, User approver) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new RuntimeException("Booking is not in PENDING status");
        }

        // Verify manager is the reporting manager
        EmployeeProfile profile = employeeProfileRepository.findByUserId(booking.getEmployee().getId())
            .orElseThrow(() -> new RuntimeException("Employee profile not found"));

        if (!profile.getReportingManager().getId().equals(approver.getId()) && !approver.hasRole("ADMIN")) {
            throw new RuntimeException("You are not authorized to approve this booking");
        }

        // Create approval record
        Approval approval = Approval.builder()
            .booking(booking)
            .approver(approver)
            .action(Approval.ApprovalAction.APPROVE)
            .isApproved(true)
            .build();
        approvalRepository.save(approval);

        // Update booking status
        booking.setStatus(Booking.BookingStatus.APPROVED);
        bookingRepository.save(booking);

        // Notify employee
        notificationService.createNotification(
            booking.getEmployee(),
            "Booking Approved",
            "Your travel request " + booking.getBookingReference() + " has been approved",
            Notification.NotificationType.BOOKING_APPROVED,
            "BOOKING", booking.getId()
        );

        // Send email notification
        try {
            emailService.sendNotificationEmail(
                booking.getEmployee().getEmail(),
                "Booking Approved - " + booking.getBookingReference(),
                "Hi " + booking.getEmployee().getFullName() + ",\n\n" +
                "Your travel request (" + booking.getBookingReference() + ") has been approved.\n\n" +
                "Route: " + booking.getOrigin() + " → " + booking.getDestination() + "\n" +
                "Travel Dates: " + booking.getTravelStartDate() + " to " + booking.getTravelEndDate() + "\n" +
                "Amount: ₹" + booking.getTotalAmount() + "\n\n" +
                "The admin will process the payment shortly. You will receive another email once your ticket is ready.\n\n" +
                "You can view the booking status at: " + frontendUrl + "/bookings/" + booking.getId() + "\n\n" +
                "Regards,\nSunrise Travel Team"
            );
        } catch (Exception e) {
            // Email failure should not block the approval flow
        }

        auditService.log(approver, approver.getRoles().iterator().next().getName().name(),
            "BOOKING_APPROVED", "BOOKING", booking.getId(), "SUCCESS",
            "Booking ref: " + booking.getBookingReference());

        return ApprovalResponse.builder()
            .id(approval.getId())
            .bookingId(booking.getId())
            .bookingReference(booking.getBookingReference())
            .approverName(approver.getFullName())
            .action("APPROVE")
            .isApproved(true)
            .decidedAt(approval.getDecidedAt())
            .build();
    }

    @Transactional
    public ApprovalResponse rejectBooking(Long bookingId, String reason, User approver) {
        if (reason == null || reason.isBlank()) {
            throw new RuntimeException("Rejection reason is required");
        }

        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new RuntimeException("Booking is not in PENDING status");
        }

        EmployeeProfile profile = employeeProfileRepository.findByUserId(booking.getEmployee().getId())
            .orElseThrow(() -> new RuntimeException("Employee profile not found"));

        if (!profile.getReportingManager().getId().equals(approver.getId()) && !approver.hasRole("ADMIN")) {
            throw new RuntimeException("You are not authorized to reject this booking");
        }

        Approval approval = Approval.builder()
            .booking(booking)
            .approver(approver)
            .action(Approval.ApprovalAction.REJECT)
            .isApproved(false)
            .rejectionReason(reason)
            .build();
        approvalRepository.save(approval);

        booking.setStatus(Booking.BookingStatus.REJECTED);
        bookingRepository.save(booking);

        notificationService.createNotification(
            booking.getEmployee(),
            "Booking Rejected",
            "Your travel request " + booking.getBookingReference() + " has been rejected. Reason: " + reason,
            Notification.NotificationType.BOOKING_REJECTED,
            "BOOKING", booking.getId()
        );

        auditService.log(approver, approver.getRoles().iterator().next().getName().name(),
            "BOOKING_REJECTED", "BOOKING", booking.getId(), "SUCCESS",
            "Booking ref: " + booking.getBookingReference() + ", Reason: " + reason);

        return ApprovalResponse.builder()
            .id(approval.getId())
            .bookingId(booking.getId())
            .bookingReference(booking.getBookingReference())
            .approverName(approver.getFullName())
            .action("REJECT")
            .rejectionReason(reason)
            .isApproved(false)
            .decidedAt(approval.getDecidedAt())
            .build();
    }
}
