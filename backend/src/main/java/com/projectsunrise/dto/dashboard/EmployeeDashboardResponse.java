package com.projectsunrise.dto.dashboard;

import com.projectsunrise.dto.booking.BookingResponse;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class EmployeeDashboardResponse {
    private Long totalBookings;
    private Long pendingBookings;
    private Long approvedBookings;
    private Long completedTrips;
    private Long cancelledBookings;
    private BigDecimal totalSpend;
    private List<BookingResponse> upcomingTrips;
    private List<BookingResponse> recentBookings;
    private Long unreadNotifications;
}
