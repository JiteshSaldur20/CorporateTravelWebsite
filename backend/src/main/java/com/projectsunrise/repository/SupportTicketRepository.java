package com.projectsunrise.repository;

import com.projectsunrise.entity.SupportTicket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    List<SupportTicket> findByRequesterIdOrderByCreatedAtDesc(Long requesterId);
    Page<SupportTicket> findByRequesterId(Long requesterId, Pageable pageable);

    @Query("SELECT t FROM SupportTicket t WHERE " +
           "(:status IS NULL OR t.status = :status) " +
           "AND (:priority IS NULL OR t.priority = :priority) " +
           "AND (:category IS NULL OR t.category = :category) " +
           "AND (:requesterId IS NULL OR t.requester.id = :requesterId) " +
           "AND (:assignedAdminId IS NULL OR t.assignedAdmin.id = :assignedAdminId) " +
           "AND (:bookingId IS NULL OR t.linkedBooking.id = :bookingId)")
    Page<SupportTicket> searchTickets(
        @Param("status") SupportTicket.TicketStatus status,
        @Param("priority") SupportTicket.TicketPriority priority,
        @Param("category") SupportTicket.TicketCategory category,
        @Param("requesterId") Long requesterId,
        @Param("assignedAdminId") Long assignedAdminId,
        @Param("bookingId") Long bookingId,
        Pageable pageable
    );

    @Query("SELECT COUNT(t) FROM SupportTicket t WHERE t.status = :status")
    long countByStatus(@Param("status") SupportTicket.TicketStatus status);

    long countByAssignedAdminId(Long adminId);
}
