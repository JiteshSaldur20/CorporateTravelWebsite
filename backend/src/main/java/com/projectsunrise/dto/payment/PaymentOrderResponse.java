package com.projectsunrise.dto.payment;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PaymentOrderResponse {
    private Long paymentId;
    private String orderId;
    private BigDecimal amount;
    private String currency;
    private String razorpayKeyId;
    private String bookingReference;
}
