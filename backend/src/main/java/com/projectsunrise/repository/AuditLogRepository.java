package com.projectsunrise.repository;

import com.projectsunrise.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("SELECT a FROM AuditLog a WHERE " +
           "(COALESCE(:action, '') = '' OR a.action LIKE CONCAT('%', :action, '%')) " +
           "AND (COALESCE(:entityType, '') = '' OR a.entityType = :entityType) " +
           "AND (:actorId IS NULL OR a.actor.id = :actorId) " +
           "AND (COALESCE(:status, '') = '' OR a.status = :status) " +
           "AND (:fromDate IS NULL OR a.timestamp >= :fromDate) " +
           "AND (:toDate IS NULL OR a.timestamp <= :toDate)")
    Page<AuditLog> searchLogs(
        @Param("action") String action,
        @Param("entityType") String entityType,
        @Param("actorId") Long actorId,
        @Param("status") String status,
        @Param("fromDate") LocalDateTime fromDate,
        @Param("toDate") LocalDateTime toDate,
        Pageable pageable
    );
}
