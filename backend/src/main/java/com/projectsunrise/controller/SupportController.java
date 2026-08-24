package com.projectsunrise.controller;

import com.projectsunrise.dto.support.*;
import com.projectsunrise.entity.User;
import com.projectsunrise.service.SupportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/support")
@RequiredArgsConstructor
@Tag(name = "Support", description = "Support tickets and messaging")
public class SupportController {

    private final SupportService supportService;

    @PostMapping("/tickets")
    @Operation(summary = "Create support ticket", description = "Opens a new support ticket.")
    public ResponseEntity<TicketResponse> createTicket(
            @Valid @RequestBody TicketRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(supportService.createTicket(request, user));
    }

    @GetMapping("/tickets/my")
    @Operation(summary = "Get my tickets", description = "Returns all support tickets created by the current user.")
    public ResponseEntity<List<TicketResponse>> getMyTickets(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(supportService.getMyTickets(user));
    }

    @GetMapping("/tickets/{id}")
    @Operation(summary = "Get ticket by ID", description = "Returns full ticket details including messages.")
    public ResponseEntity<TicketResponse> getTicketById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(supportService.getTicketById(id, user));
    }

    @PostMapping("/tickets/{id}/messages")
    @Operation(summary = "Add message to ticket", description = "Posts a reply on an existing support ticket.")
    public ResponseEntity<MessageResponse> addMessage(
            @PathVariable Long id,
            @Valid @RequestBody MessageRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(supportService.addMessage(id, request, user));
    }

    @PatchMapping("/tickets/{id}")
    @Operation(summary = "Update ticket", description = "Updates ticket fields like status or priority.")
    public ResponseEntity<TicketResponse> updateTicket(
            @PathVariable Long id,
            @RequestBody TicketUpdateRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(supportService.updateTicket(id, request, user));
    }

    // Admin endpoints
    @GetMapping("/admin/tickets")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Search tickets (admin)", description = "Search and filter all support tickets. Admin only.")
    public ResponseEntity<Page<TicketResponse>> searchTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long requesterId,
            @RequestParam(required = false) Long assignedAdminId,
            @RequestParam(required = false) Long bookingId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(supportService.searchTickets(
            status, priority, category, requesterId, assignedAdminId, bookingId, page, size));
    }

    @GetMapping("/admin/tickets/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get ticket (admin)", description = "View any ticket as admin.")
    public ResponseEntity<TicketResponse> adminGetTicket(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(supportService.getTicketById(id, user));
    }

    @PatchMapping("/admin/tickets/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update ticket status (admin)", description = "Changes the status of a support ticket.")
    public ResponseEntity<TicketResponse> updateTicketStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User admin) {
        TicketUpdateRequest request = new TicketUpdateRequest();
        request.setStatus(body.get("status"));
        return ResponseEntity.ok(supportService.updateTicket(id, request, admin));
    }

    @PatchMapping("/admin/tickets/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Assign ticket (admin)", description = "Assigns a ticket to an admin.")
    public ResponseEntity<TicketResponse> assignTicket(
            @PathVariable Long id,
            @RequestBody Map<String, Long> body,
            @AuthenticationPrincipal User admin) {
        TicketUpdateRequest request = new TicketUpdateRequest();
        request.setAssignedAdminId(body.get("assignedAdminId"));
        return ResponseEntity.ok(supportService.updateTicket(id, request, admin));
    }

    @PatchMapping("/admin/tickets/{id}/priority")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update ticket priority (admin)", description = "Changes the priority of a support ticket.")
    public ResponseEntity<TicketResponse> updateTicketPriority(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User admin) {
        TicketUpdateRequest request = new TicketUpdateRequest();
        request.setPriority(body.get("priority"));
        return ResponseEntity.ok(supportService.updateTicket(id, request, admin));
    }
}
