package com.projectsunrise.dto.booking;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class BookingRequest {
    @NotBlank(message = "Travel purpose is required")
    private String travelPurpose;

    private String travelPurposeDescription; // Required when "Other"

    @NotNull(message = "Travel start date is required")
    @FutureOrPresent(message = "Start date must be today or future")
    private LocalDate travelStartDate;

    @NotNull(message = "Travel end date is required")
    private LocalDate travelEndDate;

    private String origin;
    private String destination;

    @NotNull(message = "Number of passengers is required")
    @Min(value = 1)
    @Max(value = 10)
    private Integer numberOfPassengers;

    private Long flightId;
    private String flightClass;

    private Long hotelId;
    private Long hotelRoomId;
    private Integer hotelNights;
}
