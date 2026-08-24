package com.projectsunrise.controller;

import com.projectsunrise.dto.payment.*;
import com.projectsunrise.entity.User;
import com.projectsunrise.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Razorpay payment orders and verification")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/{bookingId}/order")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create payment order", description = "Creates a Razorpay order for an approved booking. Admin only.")
    public ResponseEntity<PaymentOrderResponse> createPaymentOrder(
            @PathVariable Long bookingId,
            @Valid @RequestBody PaymentOrderRequest request,
            @AuthenticationPrincipal User admin) {
        request.setBookingId(bookingId);
        return ResponseEntity.ok(paymentService.createPaymentOrder(request, admin));
    }

    @PostMapping("/verify")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Verify payment", description = "Verifies a Razorpay payment signature and updates booking status. Admin only.")
    public ResponseEntity<PaymentResponse> verifyPayment(
            @Valid @RequestBody PaymentVerifyRequest request,
            @AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(paymentService.verifyPayment(request, admin));
    }

    @GetMapping("/{bookingId}")
    @Operation(summary = "Get payment by booking", description = "Returns payment details for a specific booking.")
    public ResponseEntity<PaymentResponse> getPaymentByBookingId(@PathVariable Long bookingId) {
        return ResponseEntity.ok(paymentService.getPaymentByBookingId(bookingId));
    }
}
