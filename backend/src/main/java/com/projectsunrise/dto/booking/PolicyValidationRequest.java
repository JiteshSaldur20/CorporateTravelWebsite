package com.projectsunrise.dto.booking;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PolicyValidationRequest {
    private String flightClass;
    private BigDecimal flightPrice;
    private Integer hotelStarRating;
    private BigDecimal hotelPricePerNight;
}
