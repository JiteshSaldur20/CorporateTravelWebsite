package com.projectsunrise.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String bookingReference;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    @JsonIgnoreProperties({"password", "roles", "employeeProfile", "hibernateLazyInitializer", "handler"})
    private User employee;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private BookingType type; // FLIGHT, HOTEL, BOTH

    // Travel Purpose (mandatory)
    @Column(nullable = false, length = 50)
    private String travelPurpose; // Client Meeting, Business Conference, etc.

    @Column(length = 500)
    private String travelPurposeDescription; // Required when purpose is "Other"

    // Trip details
    @Column(nullable = false)
    private LocalDate travelStartDate;

    @Column(nullable = false)
    private LocalDate travelEndDate;

    @Column(length = 100)
    private String origin;

    @Column(length = 100)
    private String destination;

    @Column(nullable = false)
    private Integer numberOfPassengers;

    // Flight details
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flight_id")
    private Flight selectedFlight;

    @Enumerated(EnumType.STRING)
    private TravelPolicy.FlightClass selectedFlightClass;

    private BigDecimal flightPrice;

    // Hotel details
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id")
    private Hotel selectedHotel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_room_id")
    private HotelRoom selectedHotelRoom;

    private BigDecimal hotelPricePerNight;
    private Integer hotelNights;

    // Total
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    // Policy validation
    @Column(nullable = false)
    @Builder.Default
    private Boolean policyCompliant = true;

    @Column(length = 500)
    private String policyViolationDetails;

    // Cancellation
    @Column(length = 500)
    private String cancellationReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cancelled_by")
    @JsonIgnoreProperties({"password", "roles", "employeeProfile", "hibernateLazyInitializer", "handler"})
    private User cancelledBy;

    private LocalDateTime cancelledAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum BookingStatus {
        PENDING,
        APPROVED,
        REJECTED,
        PAYMENT_INITIATED,
        PAYMENT_SUCCESS,
        PAYMENT_FAILED,
        TICKETED,
        CANCELLED
    }

    public enum BookingType {
        FLIGHT, HOTEL, BOTH
    }
}
