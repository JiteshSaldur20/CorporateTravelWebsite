package com.projectsunrise.repository;

import com.projectsunrise.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByBookingId(Long bookingId);
    Optional<Payment> findByRazorpayOrderId(String orderId);
    List<Payment> findByInitiatedByIdOrderByCreatedAtDesc(Long adminId);
    List<Payment> findByStatus(Payment.PaymentStatus status);
}
