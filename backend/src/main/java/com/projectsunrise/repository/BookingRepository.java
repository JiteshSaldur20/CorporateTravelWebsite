package com.projectsunrise.repository;

import com.projectsunrise.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByBookingReference(String bookingReference);
    List<Booking> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);
    Page<Booking> findByEmployeeId(Long employeeId, Pageable pageable);

    @Query("SELECT b FROM Booking b WHERE b.status = 'PENDING' AND " +
           "b.employee.employeeProfile.reportingManager.id = :managerId")
    List<Booking> findPendingForManager(@Param("managerId") Long managerId);

    @Query("SELECT b FROM Booking b WHERE b.status = 'PENDING'")
    List<Booking> findAllPending();

    @Query("SELECT b FROM Booking b WHERE b.status = 'APPROVED'")
    List<Booking> findApprovedBookings();

    @Query("SELECT b FROM Booking b WHERE b.status = 'APPROVED' AND b.totalAmount > 0")
    List<Booking> findApprovedRequiringPayment();

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b " +
           "WHERE b.status IN ('APPROVED','TICKETED') AND b.travelStartDate >= :startDate")
    BigDecimal getTotalSpendSince(@Param("startDate") LocalDate startDate);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = :status")
    long countByStatus(@Param("status") Booking.BookingStatus status);

    @Query("SELECT b.destination, COUNT(b) FROM Booking b " +
           "GROUP BY b.destination ORDER BY COUNT(b) DESC")
    List<Object[]> getTopDestinations();

    @Query("SELECT b.travelPurpose, COUNT(b) FROM Booking b " +
           "GROUP BY b.travelPurpose ORDER BY COUNT(b) DESC")
    List<Object[]> getTravelPurposeDistribution();

    @Query("SELECT COUNT(b) FROM Booking b WHERE DATE(b.createdAt) = :date")
    long countByCreatedAtDate(@Param("date") LocalDate date);
}
