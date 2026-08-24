package com.projectsunrise.dto.booking;

import com.projectsunrise.dto.flight.FlightResponse;
import com.projectsunrise.dto.hotel.HotelResponse;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class BookingResponse {
    private Long id;
    private String bookingReference;
    private Long employeeId;
    private String employeeName;
    private String employeeEmail;
    private String status;
    private String type;
    private String travelPurpose;
    private String travelPurposeDescription;
    private LocalDate travelStartDate;
    private LocalDate travelEndDate;
    private String origin;
    private String destination;
    private Integer numberOfPassengers;
    private FlightResponse selectedFlight;
    private String selectedFlightClass;
    private BigDecimal flightPrice;
    private HotelResponse selectedHotel;
    private String selectedRoomType;
    private BigDecimal hotelPricePerNight;
    private Integer hotelNights;
    private BigDecimal totalAmount;
    private Boolean policyCompliant;
    private String policyViolationDetails;
    private String cancellationReason;
    private LocalDateTime cancelledAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Approval info
    private ApprovalInfo latestApproval;

    @Data
    @Builder
    public static class ApprovalInfo {
        private String action;
        private String approverName;
        private String rejectionReason;
        private LocalDateTime decidedAt;
    }
}
