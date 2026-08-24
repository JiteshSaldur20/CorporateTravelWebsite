package com.projectsunrise.service;

import com.projectsunrise.dto.booking.BookingResponse;
import com.projectsunrise.dto.dashboard.*;
import com.projectsunrise.entity.*;
import com.projectsunrise.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.projectsunrise.entity.SupportTicket;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ApprovalService approvalService;
    private final BookingService bookingService;
    private final com.projectsunrise.repository.SupportTicketRepository supportTicketRepository;

    @Transactional(readOnly = true)
    public EmployeeDashboardResponse getEmployeeDashboard(User employee) {
        List<Booking> myBookings = bookingRepository.findByEmployeeIdOrderByCreatedAtDesc(employee.getId());

        long totalBookings = myBookings.size();
        long pendingBookings = myBookings.stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.PENDING).count();
        long approvedBookings = myBookings.stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.APPROVED).count();
        long completedTrips = myBookings.stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.TICKETED).count();
        long cancelledBookings = myBookings.stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.CANCELLED).count();

        BigDecimal totalSpend = myBookings.stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.TICKETED ||
                         b.getStatus() == Booking.BookingStatus.PAYMENT_SUCCESS)
            .map(Booking::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<BookingResponse> upcomingTrips = myBookings.stream()
            .filter(b -> b.getTravelStartDate().isAfter(LocalDate.now()) &&
                         b.getStatus() != Booking.BookingStatus.CANCELLED &&
                         b.getStatus() != Booking.BookingStatus.REJECTED)
            .limit(5)
            .map(bookingService::mapToResponsePublic)
            .collect(Collectors.toList());

        List<BookingResponse> recentBookings = myBookings.stream()
            .limit(10)
            .map(bookingService::mapToResponsePublic)
            .collect(Collectors.toList());

        return EmployeeDashboardResponse.builder()
            .totalBookings(totalBookings)
            .pendingBookings(pendingBookings)
            .approvedBookings(approvedBookings)
            .completedTrips(completedTrips)
            .cancelledBookings(cancelledBookings)
            .totalSpend(totalSpend)
            .upcomingTrips(upcomingTrips)
            .recentBookings(recentBookings)
            .unreadNotifications(notificationService.getUnreadCount(employee))
            .build();
    }

    @Transactional(readOnly = true)
    public ApproverDashboardResponse getApproverDashboard(User manager) {
        List<Booking> pending = approvalService.getPendingApprovals(manager);
        List<Booking> allManaged = bookingRepository.findByEmployeeIdOrderByCreatedAtDesc(manager.getId());

        long totalApproved = allManaged.stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.APPROVED).count();
        long totalRejected = allManaged.stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.REJECTED).count();

        BigDecimal teamSpend = allManaged.stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.TICKETED ||
                         b.getStatus() == Booking.BookingStatus.PAYMENT_SUCCESS)
            .map(Booking::getTotalAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Long> purposeDistribution = new HashMap<>();
        allManaged.forEach(b -> {
            purposeDistribution.merge(b.getTravelPurpose(), 1L, Long::sum);
        });

        return ApproverDashboardResponse.builder()
            .pendingApprovals((long) pending.size())
            .totalApproved(totalApproved)
            .totalRejected(totalRejected)
            .teamSpend(teamSpend)
            .pendingBookings(pending.stream()
                .map(bookingService::mapToResponsePublic)
                .collect(Collectors.toList()))
            .recentDecisions(allManaged.stream()
                .filter(b -> b.getStatus() == Booking.BookingStatus.APPROVED ||
                             b.getStatus() == Booking.BookingStatus.REJECTED)
                .limit(10)
                .map(bookingService::mapToResponsePublic)
                .collect(Collectors.toList()))
            .travelPurposeDistribution(purposeDistribution)
            .unreadNotifications(notificationService.getUnreadCount(manager))
            .build();
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse getAdminDashboard(User admin) {
        long totalUsers = userRepository.count();
        long totalBookings = bookingRepository.count();
        long todayBookings = bookingRepository.countByCreatedAtDate(LocalDate.now());
        long cancelledBookings = bookingRepository.countByStatus(Booking.BookingStatus.CANCELLED);
        long pendingApprovals = bookingRepository.countByStatus(Booking.BookingStatus.PENDING);

        BigDecimal totalSpend = bookingRepository.getTotalSpendSince(LocalDate.of(2020, 1, 1));
        BigDecimal monthlySpend = bookingRepository.getTotalSpendSince(LocalDate.now().withDayOfMonth(1));

        List<Object[]> topDestinations = bookingRepository.getTopDestinations();
        String mostTravelledCity = topDestinations.isEmpty() ? "N/A" : (String) topDestinations.get(0)[0];

        Map<String, Long> statusDistribution = new HashMap<>();
        for (Booking.BookingStatus status : Booking.BookingStatus.values()) {
            long count = bookingRepository.countByStatus(status);
            if (count > 0) statusDistribution.put(status.name(), count);
        }

        List<Object[]> purposeDist = bookingRepository.getTravelPurposeDistribution();
        Map<String, Long> travelPurposeDistribution = new HashMap<>();
        purposeDist.forEach(row -> travelPurposeDistribution.put((String) row[0], (Long) row[1]));

        long pendingSupportTickets = supportTicketRepository.countByStatus(SupportTicket.TicketStatus.OPEN);

        return AdminDashboardResponse.builder()
            .totalUsers(totalUsers)
            .totalBookings(totalBookings)
            .todayBookings(todayBookings)
            .cancelledBookings(cancelledBookings)
            .pendingApprovals(pendingApprovals)
            .totalSpend(totalSpend)
            .monthlySpend(monthlySpend)
            .mostTravelledCity(mostTravelledCity)
            .bookingStatusDistribution(statusDistribution)
            .travelPurposeDistribution(travelPurposeDistribution)
            .pendingSupportTickets(pendingSupportTickets)
            .recentBookings(bookingRepository.findByEmployeeIdOrderByCreatedAtDesc(admin.getId()).stream()
                .limit(10)
                .map(bookingService::mapToResponsePublic)
                .collect(Collectors.toList()))
            .unreadNotifications(notificationService.getUnreadCount(admin))
            .build();
    }
}
