package com.projectsunrise.service;

import com.projectsunrise.dto.support.*;
import com.projectsunrise.entity.*;
import com.projectsunrise.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupportService {

    private final SupportTicketRepository ticketRepository;
    private final SupportMessageRepository messageRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    @Transactional
    public TicketResponse createTicket(TicketRequest request, User requester) {
        Booking linkedBooking = null;
        if (request.getBookingId() != null) {
            linkedBooking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found"));
            // Verify ownership
            if (!linkedBooking.getEmployee().getId().equals(requester.getId()) && !requester.hasRole("ADMIN")) {
                throw new RuntimeException("Not authorized to link this booking");
            }
        }

        SupportTicket ticket = SupportTicket.builder()
            .requester(requester)
            .linkedBooking(linkedBooking)
            .category(SupportTicket.TicketCategory.valueOf(request.getCategory().toUpperCase()))
            .subject(request.getSubject())
            .description(request.getDescription())
            .status(SupportTicket.TicketStatus.OPEN)
            .priority(SupportTicket.TicketPriority.valueOf(
                request.getPriority() != null ? request.getPriority().toUpperCase() : "MEDIUM"))
            .build();

        ticket = ticketRepository.save(ticket);

        // Create initial message
        SupportMessage initialMessage = SupportMessage.builder()
            .ticket(ticket)
            .sender(requester)
            .senderRole(requester.getRoles().iterator().next().getName())
            .body(request.getDescription())
            .internalNote(false)
            .build();
        messageRepository.save(initialMessage);

        auditService.log(requester, requester.getRoles().iterator().next().getName().name(),
            "SUPPORT_TICKET_CREATED", "SUPPORT_TICKET", ticket.getId(), "SUCCESS",
            "Subject: " + ticket.getSubject() + ", Category: " + ticket.getCategory());

        return mapToResponse(ticket, true, requester);
    }

    @Transactional(readOnly = true)
    public List<TicketResponse> getMyTickets(User requester) {
        return ticketRepository.findByRequesterIdOrderByCreatedAtDesc(requester.getId())
            .stream()
            .map(t -> mapToResponse(t, false, requester))
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TicketResponse getTicketById(Long id, User currentUser) {
        SupportTicket ticket = ticketRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Ticket not found"));

        boolean isOwner = ticket.getRequester().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.hasRole("ADMIN");

        if (!isOwner && !isAdmin) {
            throw new RuntimeException("Not authorized to view this ticket");
        }

        return mapToResponse(ticket, isOwner || isAdmin, currentUser);
    }

    @Transactional
    public MessageResponse addMessage(Long ticketId, MessageRequest request, User sender) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket not found"));

        boolean isOwner = ticket.getRequester().getId().equals(sender.getId());
        boolean isAdmin = sender.hasRole("ADMIN");

        if (!isOwner && !isAdmin) {
            throw new RuntimeException("Not authorized to reply to this ticket");
        }

        // Validate ticket is active
        if (ticket.getStatus() == SupportTicket.TicketStatus.CLOSED) {
            throw new RuntimeException("Cannot add messages to a closed ticket");
        }

        // Only ADMIN can create internal notes
        if (Boolean.TRUE.equals(request.getInternalNote()) && !isAdmin) {
            throw new RuntimeException("Only admins can create internal notes");
        }

        SupportMessage message = SupportMessage.builder()
            .ticket(ticket)
            .sender(sender)
            .senderRole(sender.getRoles().iterator().next().getName())
            .body(request.getBody())
            .internalNote(Boolean.TRUE.equals(request.getInternalNote()))
            .build();

        message = messageRepository.save(message);

        // Update ticket status to waiting if employee replied
        if (!isAdmin && ticket.getStatus() == SupportTicket.TicketStatus.IN_PROGRESS) {
            ticket.setStatus(SupportTicket.TicketStatus.WAITING_FOR_USER);
            ticketRepository.save(ticket);
        }

        // Notify relevant parties
        if (isAdmin) {
            notificationService.createNotification(
                ticket.getRequester(),
                "Support Ticket Reply",
                "Admin replied to your ticket: " + ticket.getSubject(),
                Notification.NotificationType.SUPPORT_TICKET_REPLY,
                "SUPPORT_TICKET", ticket.getId()
            );
        }

        return MessageResponse.builder()
            .id(message.getId())
            .senderId(sender.getId())
            .senderName(sender.getFullName())
            .senderRole(sender.getRoles().iterator().next().getName().name())
            .body(message.getBody())
            .internalNote(message.getInternalNote())
            .createdAt(message.getCreatedAt())
            .build();
    }

    @Transactional
    public TicketResponse updateTicket(Long ticketId, TicketUpdateRequest request, User admin) {
        SupportTicket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new RuntimeException("Ticket not found"));

        if (request.getStatus() != null) {
            SupportTicket.TicketStatus newStatus = SupportTicket.TicketStatus.valueOf(request.getStatus());
            validateStatusTransition(ticket.getStatus(), newStatus);
            ticket.setStatus(newStatus);
            if (newStatus == SupportTicket.TicketStatus.RESOLVED) {
                ticket.setResolvedAt(java.time.LocalDateTime.now());
            }
            if (newStatus == SupportTicket.TicketStatus.CLOSED) {
                ticket.setClosedAt(java.time.LocalDateTime.now());
            }
        }

        if (request.getPriority() != null) {
            ticket.setPriority(SupportTicket.TicketPriority.valueOf(request.getPriority()));
        }

        if (request.getAssignedAdminId() != null) {
            User assignedAdmin = userRepository.findById(request.getAssignedAdminId())
                .orElseThrow(() -> new RuntimeException("Admin not found"));
            ticket.setAssignedAdmin(assignedAdmin);
        }

        ticket = ticketRepository.save(ticket);

        auditService.log(admin, "ADMIN", "SUPPORT_TICKET_UPDATED", "SUPPORT_TICKET", ticket.getId(), "SUCCESS",
            "Status: " + ticket.getStatus() + ", Priority: " + ticket.getPriority());

        return mapToResponse(ticket, true, admin);
    }

    @Transactional(readOnly = true)
    public Page<TicketResponse> searchTickets(String status, String priority, String category,
                                               Long requesterId, Long assignedAdminId, Long bookingId,
                                               int page, int size) {
        SupportTicket.TicketStatus ticketStatus = status != null ?
            SupportTicket.TicketStatus.valueOf(status) : null;
        SupportTicket.TicketPriority ticketPriority = priority != null ?
            SupportTicket.TicketPriority.valueOf(priority) : null;
        SupportTicket.TicketCategory ticketCategory = category != null ?
            SupportTicket.TicketCategory.valueOf(category) : null;

        return ticketRepository.searchTickets(
            ticketStatus, ticketPriority, ticketCategory,
            requesterId, assignedAdminId, bookingId,
            PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).map(t -> mapToResponse(t, true, null)); // null for admin search, all messages shown
    }

    private void validateStatusTransition(SupportTicket.TicketStatus current, SupportTicket.TicketStatus next) {
        boolean valid = switch (current) {
            case OPEN -> next == SupportTicket.TicketStatus.IN_PROGRESS ||
                         next == SupportTicket.TicketStatus.WAITING_FOR_USER;
            case IN_PROGRESS -> next == SupportTicket.TicketStatus.WAITING_FOR_USER ||
                               next == SupportTicket.TicketStatus.RESOLVED ||
                               next == SupportTicket.TicketStatus.CLOSED;
            case WAITING_FOR_USER -> next == SupportTicket.TicketStatus.IN_PROGRESS ||
                                    next == SupportTicket.TicketStatus.RESOLVED;
            case RESOLVED -> next == SupportTicket.TicketStatus.CLOSED ||
                            next == SupportTicket.TicketStatus.IN_PROGRESS;
            case CLOSED -> false; // Cannot transition from closed
        };

        if (!valid) {
            throw new RuntimeException("Invalid status transition from " + current + " to " + next);
        }
    }

    private TicketResponse mapToResponse(SupportTicket ticket, boolean includeMessages, User currentUser) {
        TicketResponse.TicketResponseBuilder builder = TicketResponse.builder()
            .id(ticket.getId())
            .requesterId(ticket.getRequester().getId())
            .requesterName(ticket.getRequester().getFullName())
            .requesterEmail(ticket.getRequester().getEmail())
            .linkedBookingId(ticket.getLinkedBooking() != null ? ticket.getLinkedBooking().getId() : null)
            .bookingReference(ticket.getLinkedBooking() != null ? ticket.getLinkedBooking().getBookingReference() : null)
            .category(ticket.getCategory().name())
            .subject(ticket.getSubject())
            .description(ticket.getDescription())
            .status(ticket.getStatus().name())
            .priority(ticket.getPriority().name())
            .assignedAdminId(ticket.getAssignedAdmin() != null ? ticket.getAssignedAdmin().getId() : null)
            .assignedAdminName(ticket.getAssignedAdmin() != null ? ticket.getAssignedAdmin().getFullName() : null)
            .resolvedAt(ticket.getResolvedAt())
            .closedAt(ticket.getClosedAt())
            .createdAt(ticket.getCreatedAt())
            .updatedAt(ticket.getUpdatedAt());

        if (includeMessages) {
            List<SupportMessage> messages = messageRepository.findByTicketIdOrderByCreatedAtAsc(ticket.getId());
            boolean isAdmin = currentUser != null && currentUser.hasRole("ADMIN");
            builder.messages(messages.stream()
                .filter(m -> isAdmin || !Boolean.TRUE.equals(m.getInternalNote()))
                .map(m -> MessageResponse.builder()
                    .id(m.getId())
                    .senderId(m.getSender().getId())
                    .senderName(m.getSender().getFullName())
                    .senderRole(m.getSenderRole().name())
                    .body(m.getBody())
                    .internalNote(m.getInternalNote())
                    .createdAt(m.getCreatedAt())
                    .build())
                .collect(Collectors.toList()));
        }

        return builder.build();
    }
}
