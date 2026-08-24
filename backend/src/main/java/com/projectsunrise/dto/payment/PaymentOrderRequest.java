package com.projectsunrise.dto.payment;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentOrderRequest {
    private Long bookingId; // Set from path variable by controller

    private String currency; // Default INR
}
