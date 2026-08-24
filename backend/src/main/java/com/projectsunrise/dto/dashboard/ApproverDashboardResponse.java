package com.projectsunrise.dto.dashboard;

import com.projectsunrise.dto.booking.BookingResponse;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class ApproverDashboardResponse {
    private Long pendingApprovals;
    private Long totalApproved;
    private Long totalRejected;
    private BigDecimal teamSpend;
    private List<BookingResponse> pendingBookings;
    private List<BookingResponse> recentDecisions;
    private Map<String, Long> travelPurposeDistribution;
    private Long unreadNotifications;
}
