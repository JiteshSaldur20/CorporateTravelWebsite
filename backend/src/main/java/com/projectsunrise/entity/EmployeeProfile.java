package com.projectsunrise.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "employees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnoreProperties({"password", "roles", "employeeProfile", "hibernateLazyInitializer", "handler"})
    private User user;

    @Column(length = 100)
    private String designation;

    @Column(length = 100)
    private String department;

    @Column(precision = 12, scale = 2)
    private BigDecimal salary;

    @Column(length = 50)
    private String salaryBand; // e.g., BAND_A, BAND_B, BAND_C

    @Column(length = 100)
    private String reportingManagerEmail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporting_manager_id")
    @JsonIgnoreProperties({"password", "roles", "employeeProfile", "hibernateLazyInitializer", "handler"})
    private User reportingManager;

    private String location;

    private String phone;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
