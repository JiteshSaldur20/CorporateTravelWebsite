package com.projectsunrise.controller;

import com.projectsunrise.dto.booking.BookingRequest;
import com.projectsunrise.dto.booking.BookingResponse;
import com.projectsunrise.entity.User;
import com.projectsunrise.service.BookingService;
import com.projectsunrise.service.TicketPdfService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Create, view, and manage travel bookings")
public class BookingController {

    private final BookingService bookingService;
    private final TicketPdfService ticketPdfService;

    @PostMapping
    @Operation(summary = "Create a new travel booking", description = "Submits a travel request that goes for manager approval.")
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(bookingService.createBooking(request, user));
    }

    @GetMapping("/my")
    @Operation(summary = "Get my bookings", description = "Returns all bookings created by the current user.")
    public ResponseEntity<List<BookingResponse>> getMyBookings(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(bookingService.getMyBookings(user));
    }

    @GetMapping("/approved")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all approved bookings", description = "Returns every booking with APPROVED status across all employees. Admin only.")
    public ResponseEntity<List<BookingResponse>> getAllApprovedBookings() {
        return ResponseEntity.ok(bookingService.getAllApprovedBookings());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get booking by ID", description = "Returns a single booking. Accessible to the owner, their reporting manager, or admins.")
    public ResponseEntity<BookingResponse> getBookingById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(bookingService.getBookingById(id, user));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel a booking", description = "Cancels a booking that is in PENDING or APPROVED status. Owner or admin only.")
    public ResponseEntity<BookingResponse> cancelBooking(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, body.get("reason"), user));
    }

    @GetMapping("/{id}/ticket")
    @Operation(summary = "Download ticket PDF", description = "Returns a PDF ticket for a ticketed booking.")
    public void downloadTicket(
            @PathVariable Long id,
            @AuthenticationPrincipal User user,
            HttpServletResponse response) throws Exception {
        BookingResponse booking = bookingService.getBookingById(id, user);
        byte[] pdf = ticketPdfService.generateTicket(booking);
        response.setContentType("application/pdf");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION,
            "attachment; filename=ticket-" + booking.getBookingReference() + ".pdf");
        response.getOutputStream().write(pdf);
        response.getOutputStream().flush();
    }
}
