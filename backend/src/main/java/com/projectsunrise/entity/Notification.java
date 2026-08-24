package com.projectsunrise.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password", "roles", "employeeProfile", "hibernateLazyInitializer", "handler"})
    private User user;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, length = 1000)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(length = 50)
    private String entityType; // BOOKING, APPROVAL, PAYMENT, SUPPORT

    private Long entityId;

    @Column(nullable = false, name = "`is_read`")
    @Builder.Default
    private Boolean read = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public enum NotificationType {
        BOOKING_SUBMITTED,
        BOOKING_APPROVED,
        BOOKING_REJECTED,
        PAYMENT_SUCCESS,
        PAYMENT_FAILED,
        BOOKING_TICKETED,
        BOOKING_CANCELLED,
        SUPPORT_TICKET_CREATED,
        SUPPORT_TICKET_REPLY,
        SUPPORT_TICKET_STATUS_CHANGED,
        SUPPORT_TICKET_RESOLVED,
        GENERAL
    }
}
