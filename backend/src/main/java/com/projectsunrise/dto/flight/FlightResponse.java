package com.projectsunrise.dto.flight;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
public class FlightResponse {
    private Long id;
    private String flightNumber;
    private String airline;
    private String airlineCode;
    private String origin;
    private String originCity;
    private String originAirport;
    private String destination;
    private String destinationCity;
    private String destinationAirport;
    private LocalDateTime departureDateTime;
    private LocalDateTime arrivalDateTime;
    private LocalTime boardingTime;
    private Integer durationMinutes;
    private Integer stops;
    private String travelClass;
    private BigDecimal price;
    private Integer availableSeats;
    private Integer baggageAllowanceKg;
    private String aircraftType;
    private String logoUrl;
}
