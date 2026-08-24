package com.projectsunrise.dto.dashboard;

import com.projectsunrise.dto.booking.BookingResponse;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class AdminDashboardResponse {
    private Long totalUsers;
    private Long totalBookings;
    private Long todayBookings;
    private Long cancelledBookings;
    private Long pendingApprovals;
    private BigDecimal totalSpend;
    private BigDecimal monthlySpend;
    private String mostTravelledCity;
    private Map<String, Long> bookingStatusDistribution;
    private Map<String, Long> travelPurposeDistribution;
    private Long pendingSupportTickets;
    private List<BookingResponse> recentBookings;
    private Long unreadNotifications;
}
