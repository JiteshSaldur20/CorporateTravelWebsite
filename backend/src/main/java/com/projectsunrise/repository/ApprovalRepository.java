package com.projectsunrise.repository;

import com.projectsunrise.entity.Approval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApprovalRepository extends JpaRepository<Approval, Long> {
    List<Approval> findByBookingIdOrderByDecidedAtDesc(Long bookingId);
    List<Approval> findByApproverIdOrderByDecidedAtDesc(Long approverId);
}
