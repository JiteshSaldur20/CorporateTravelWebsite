package com.projectsunrise.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "travel_policies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TravelPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String policyName;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false, length = 50)
    private String salaryBand; // Applies to employees in this band

    // Flight entitlements
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private FlightClass maxFlightClass; // ECONOMY, PREMIUM_ECONOMY, BUSINESS

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal maxFlightPrice;

    @Column(nullable = false)
    private Integer maxFlightDurationHours;

    // Hotel entitlements
    @Column(nullable = false)
    private Integer maxHotelStarRating;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal maxHotelPricePerNight;

    @Column(nullable = false)
    private Boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    @JsonIgnoreProperties({"password", "roles", "employeeProfile", "hibernateLazyInitializer", "handler"})
    private User createdBy;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum FlightClass {
        ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST
    }
}
