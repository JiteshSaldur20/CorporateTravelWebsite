package com.projectsunrise.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "approvals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Approval {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approver_id", nullable = false)
    @JsonIgnoreProperties({"password", "roles", "employeeProfile", "hibernateLazyInitializer", "handler"})
    private User approver;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalAction action;

    @Column(length = 500)
    private String rejectionReason;

    @Column(nullable = false)
    private Boolean isApproved;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime decidedAt;

    public enum ApprovalAction {
        APPROVE, REJECT
    }
}
