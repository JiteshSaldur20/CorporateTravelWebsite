package com.projectsunrise.service;

import com.projectsunrise.dto.payment.*;
import com.projectsunrise.entity.*;
import com.projectsunrise.repository.BookingRepository;
import com.projectsunrise.repository.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Slf4j
@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;
    private final BookingService bookingService;
    private final EmailService emailService;

    @Value("${razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret}")
    private String razorpayKeySecret;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public PaymentService(PaymentRepository paymentRepository,
                          BookingRepository bookingRepository,
                          NotificationService notificationService,
                          AuditService auditService,
                          BookingService bookingService,
                          EmailService emailService) {
        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
        this.bookingService = bookingService;
        this.emailService = emailService;
    }

    @Transactional
    public PaymentOrderResponse createPaymentOrder(PaymentOrderRequest request, User admin) {
        Booking booking = bookingRepository.findById(request.getBookingId())
            .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Verify booking is in correct state
        if (booking.getStatus() != Booking.BookingStatus.APPROVED) {
            throw new RuntimeException("Booking must be APPROVED before payment. Current status: " + booking.getStatus());
        }

        // Check if already paid
        Payment existingPayment = paymentRepository.findByBookingId(booking.getId()).orElse(null);
        if (existingPayment != null && existingPayment.getStatus() == Payment.PaymentStatus.SUCCESS) {
            throw new RuntimeException("Booking is already paid for");
        }

        String currency = request.getCurrency() != null ? request.getCurrency() : "INR";

        // Create Razorpay order (test mode)
        String orderId = null;
        try {
            RazorpayClient razorpayClient = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", booking.getTotalAmount().multiply(java.math.BigDecimal.valueOf(100)).intValue()); // Amount in paise
            orderRequest.put("currency", currency);
            orderRequest.put("receipt", booking.getBookingReference());

            Order order = razorpayClient.orders.create(orderRequest);
            orderId = order.get("id").toString();
        } catch (RazorpayException e) {
            log.warn("Razorpay order creation failed (test mode): {}", e.getMessage());
            // Generate a mock order ID for test mode
            orderId = "order_test_" + System.currentTimeMillis();
        }

        Payment payment;
        if (existingPayment != null) {
            existingPayment.setRazorpayOrderId(orderId);
            existingPayment.setStatus(Payment.PaymentStatus.CREATED);
            existingPayment.setInitiatedBy(admin);
            payment = paymentRepository.save(existingPayment);
        } else {
            payment = Payment.builder()
                .booking(booking)
                .initiatedBy(admin)
                .razorpayOrderId(orderId)
                .amount(booking.getTotalAmount())
                .currency(currency)
                .status(Payment.PaymentStatus.CREATED)
                .paymentMethod(Payment.PaymentMethod.OTHER)
                .build();
            payment = paymentRepository.save(payment);
        }

        booking.setStatus(Booking.BookingStatus.PAYMENT_INITIATED);
        bookingRepository.save(booking);

        auditService.log(admin, "ADMIN", "PAYMENT_ORDER_CREATED", "PAYMENT", payment.getId(), "SUCCESS",
            "Order: " + orderId + ", Amount: " + booking.getTotalAmount() + ", Booking: " + booking.getBookingReference());

        return PaymentOrderResponse.builder()
            .paymentId(payment.getId())
            .orderId(orderId)
            .amount(booking.getTotalAmount())
            .currency(currency)
            .razorpayKeyId(razorpayKeyId)
            .bookingReference(booking.getBookingReference())
            .build();
    }

    @Transactional
    public PaymentResponse verifyPayment(PaymentVerifyRequest request, User admin) {
        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
            .orElseThrow(() -> new RuntimeException("Payment not found for order: " + request.getRazorpayOrderId()));

        boolean verified = false;
        try {
            // Verify signature
            String payload = request.getRazorpayOrderId() + "|" + request.getRazorpayPaymentId();
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            String expectedSignature = Base64.getEncoder().encodeToString(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
            verified = expectedSignature.equals(request.getRazorpaySignature());
        } catch (Exception e) {
            log.error("Payment verification error: {}", e.getMessage());
        }

        // For test mode, accept mock payments
        if (request.getRazorpayPaymentId().startsWith("pay_test_")) {
            verified = true;
        }

        if (verified) {
            payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
            payment.setRazorpaySignature(request.getRazorpaySignature());
            payment.setStatus(Payment.PaymentStatus.SUCCESS);
            paymentRepository.save(payment);

            // Update booking: PAYMENT_SUCCESS then auto-transition to TICKETED
            Booking booking = payment.getBooking();
            booking.setStatus(Booking.BookingStatus.PAYMENT_SUCCESS);
            bookingRepository.save(booking);

            // Auto-generate ticket: move to TICKETED status
            booking.setStatus(Booking.BookingStatus.TICKETED);
            bookingRepository.save(booking);

            // Notify employee with ticket generation message
            notificationService.createNotification(
                booking.getEmployee(),
                "Ticket Generated",
                "Booking done for " + booking.getBookingReference() + " — please check the application to download the ticket.",
                Notification.NotificationType.BOOKING_TICKETED,
                "BOOKING", booking.getId()
            );

            // Send email notification for ticket generation
            try {
                emailService.sendNotificationEmail(
                    booking.getEmployee().getEmail(),
                    "Ticket Ready for Download - " + booking.getBookingReference(),
                    "Hi " + booking.getEmployee().getFullName() + ",\n\n" +
                    "Great news! Your payment has been processed and your ticket is ready.\n\n" +
                    "Booking Reference: " + booking.getBookingReference() + "\n" +
                    "Route: " + booking.getOrigin() + " → " + booking.getDestination() + "\n" +
                    "Travel Dates: " + booking.getTravelStartDate() + " to " + booking.getTravelEndDate() + "\n" +
                    "Amount Paid: ₹" + booking.getTotalAmount() + "\n\n" +
                    "Please log into the application to download your ticket:\n" +
                    frontendUrl + "/bookings/" + booking.getId() + "\n\n" +
                    "Regards,\nSunrise Travel Team"
                );
            } catch (Exception e) {
                // Email failure should not block the payment flow
            }

            auditService.log(admin, "ADMIN", "PAYMENT_SUCCESS", "PAYMENT", payment.getId(), "SUCCESS",
                "Payment verified and ticket generated. Order: " + request.getRazorpayOrderId() + ", Payment: " + request.getRazorpayPaymentId());
        } else {
            payment.setStatus(Payment.PaymentStatus.FAILED);
            payment.setFailureReason("Signature verification failed");
            paymentRepository.save(payment);

            Booking booking = payment.getBooking();
            booking.setStatus(Booking.BookingStatus.PAYMENT_FAILED);
            bookingRepository.save(booking);

            notificationService.createNotification(
                booking.getEmployee(),
                "Payment Failed",
                "Company payment for your travel request " + booking.getBookingReference() + " failed verification",
                Notification.NotificationType.PAYMENT_FAILED,
                "PAYMENT", payment.getId()
            );

            auditService.log(admin, "ADMIN", "PAYMENT_FAILED", "PAYMENT", payment.getId(), "FAILED",
                "Signature verification failed");
        }

        return mapToResponse(payment);
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByBookingId(Long bookingId) {
        Payment payment = paymentRepository.findByBookingId(bookingId)
            .orElseThrow(() -> new RuntimeException("No payment found for booking"));
        return mapToResponse(payment);
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
            .id(payment.getId())
            .bookingId(payment.getBooking().getId())
            .bookingReference(payment.getBooking().getBookingReference())
            .initiatedByName(payment.getInitiatedBy().getFullName())
            .razorpayOrderId(payment.getRazorpayOrderId())
            .razorpayPaymentId(payment.getRazorpayPaymentId())
            .amount(payment.getAmount())
            .currency(payment.getCurrency())
            .status(payment.getStatus().name())
            .paymentMethod(payment.getPaymentMethod().name())
            .createdAt(payment.getCreatedAt())
            .updatedAt(payment.getUpdatedAt())
            .build();
    }
}
