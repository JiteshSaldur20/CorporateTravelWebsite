package com.projectsunrise.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "flights")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Flight {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 10)
    private String flightNumber;

    @Column(nullable = false, length = 100)
    private String airline;

    @Column(length = 10)
    private String airlineCode;

    @Column(nullable = false, length = 100)
    private String origin;

    @Column(length = 100)
    private String originCity;

    @Column(length = 10)
    private String originAirport;

    @Column(nullable = false, length = 100)
    private String destination;

    @Column(length = 100)
    private String destinationCity;

    @Column(length = 10)
    private String destinationAirport;

    @Column(nullable = false)
    private LocalDateTime departureDateTime;

    @Column(nullable = false)
    private LocalDateTime arrivalDateTime;

    private LocalTime boardingTime;

    @Column(nullable = false)
    private Integer durationMinutes;

    @Column(nullable = false)
    private Integer stops; // 0 = direct

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private TravelPolicy.FlightClass travelClass;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer availableSeats;

    @Column(nullable = false)
    private Integer baggageAllowanceKg;

    @Column(length = 100)
    private String aircraftType;

    @Column(length = 500)
    private String logoUrl;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
