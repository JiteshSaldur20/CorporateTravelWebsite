package com.projectsunrise.dto.flight;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class FlightSearchRequest {
    private String origin;
    private String destination;
    private String travelClass; // ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Integer maxDuration; // in minutes
    private Integer maxStops;
    private LocalDateTime departureFrom;
    private LocalDateTime departureTo;

    // Sorting
    private String sortBy; // price, duration, departureTime, stops
    private String sortDir; // asc, desc
}
