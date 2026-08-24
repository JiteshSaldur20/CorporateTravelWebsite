package com.projectsunrise.repository;

import com.projectsunrise.entity.SupportMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportMessageRepository extends JpaRepository<SupportMessage, Long> {
    List<SupportMessage> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
    List<SupportMessage> findByTicketIdAndInternalNoteFalseOrderByCreatedAtAsc(Long ticketId);
}
