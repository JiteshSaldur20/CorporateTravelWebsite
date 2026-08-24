package com.projectsunrise.dto.hotel;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class HotelSearchRequest {
    private String city;
    private Integer starRating;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private String amenity; // filter by specific amenity

    // Sorting
    private String sortBy; // price, starRating
    private String sortDir; // asc, desc
}
