package com.projectsunrise.service;

import com.projectsunrise.dto.booking.BookingRequest;
import com.projectsunrise.dto.booking.BookingResponse;
import com.projectsunrise.dto.flight.FlightResponse;
import com.projectsunrise.dto.hotel.HotelResponse;
import com.projectsunrise.entity.*;
import com.projectsunrise.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.projectsunrise.exception.PolicyViolationException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final FlightRepository flightRepository;
    private final HotelRepository hotelRepository;
    private final HotelRoomRepository hotelRoomRepository;
    private final PolicyService policyService;
    private final NotificationService notificationService;
    private final AuditService auditService;
    private final EmployeeProfileRepository employeeProfileRepository;
    private final UserRepository userRepository;

    @Transactional
    public BookingResponse createBooking(BookingRequest request, User employee) {
        // Validate travel purpose
        if ("Other".equals(request.getTravelPurpose()) &&
            (request.getTravelPurposeDescription() == null || request.getTravelPurposeDescription().isBlank())) {
            throw new RuntimeException("Travel purpose description is required when 'Other' is selected");
        }

        if (request.getTravelEndDate().isBefore(request.getTravelStartDate())) {
            throw new RuntimeException("Travel end date must be after start date");
        }

        // Create policy validation request and check
        var policyRequest = new com.projectsunrise.dto.booking.PolicyValidationRequest();
        if (request.getFlightClass() != null) {
            policyRequest.setFlightClass(request.getFlightClass());
        }
        if (request.getFlightId() != null) {
            Flight flight = flightRepository.findById(request.getFlightId())
                .orElseThrow(() -> new RuntimeException("Flight not found"));
            policyRequest.setFlightPrice(flight.getPrice());
            if (policyRequest.getFlightClass() == null) {
                policyRequest.setFlightClass(flight.getTravelClass().name());
            }
        }
        if (request.getHotelRoomId() != null) {
            HotelRoom room = hotelRoomRepository.findById(request.getHotelRoomId())
                .orElseThrow(() -> new RuntimeException("Hotel room not found"));
            policyRequest.setHotelPricePerNight(room.getPricePerNight());
            policyRequest.setHotelStarRating(room.getHotel().getStarRating());
        }

        var policyResult = policyService.validatePolicy(employee, policyRequest);

        // Block policy violations with 403 error
        if (!policyResult.getCompliant()) {
            throw new PolicyViolationException(
                policyResult.getMessage(),
                policyResult.getViolationField(),
                policyResult.getSelectedValue(),
                policyResult.getAllowedValue()
            );
        }

        // Calculate total
        BigDecimal totalAmount = BigDecimal.ZERO;
        if (request.getFlightId() != null) {
            Flight flight = flightRepository.findById(request.getFlightId()).orElse(null);
            if (flight != null) {
                totalAmount = totalAmount.add(flight.getPrice().multiply(BigDecimal.valueOf(request.getNumberOfPassengers())));
            }
        }
        if (request.getHotelRoomId() != null && request.getHotelNights() != null) {
            HotelRoom room = hotelRoomRepository.findById(request.getHotelRoomId()).orElse(null);
            if (room != null) {
                totalAmount = totalAmount.add(room.getPricePerNight().multiply(BigDecimal.valueOf(request.getHotelNights())));
            }
        }

        String bookingRef = generateBookingReference();

        Booking booking = Booking.builder()
            .bookingReference(bookingRef)
            .employee(employee)
            .status(Booking.BookingStatus.PENDING)
            .type(determineBookingType(request))
            .travelPurpose(request.getTravelPurpose())
            .travelPurposeDescription(request.getTravelPurposeDescription())
            .travelStartDate(request.getTravelStartDate())
            .travelEndDate(request.getTravelEndDate())
            .origin(request.getOrigin())
            .destination(request.getDestination())
            .numberOfPassengers(request.getNumberOfPassengers())
            .selectedFlightClass(request.getFlightClass() != null ?
                TravelPolicy.FlightClass.valueOf(request.getFlightClass()) : null)
            .flightPrice(request.getFlightId() != null ?
                flightRepository.findById(request.getFlightId()).map(Flight::getPrice).orElse(null) : null)
            .selectedHotel(request.getHotelId() != null ?
                hotelRepository.findById(request.getHotelId()).orElse(null) : null)
            .selectedHotelRoom(request.getHotelRoomId() != null ?
                hotelRoomRepository.findById(request.getHotelRoomId()).orElse(null) : null)
            .hotelPricePerNight(request.getHotelRoomId() != null ?
                hotelRoomRepository.findById(request.getHotelRoomId()).map(HotelRoom::getPricePerNight).orElse(null) : null)
            .hotelNights(request.getHotelNights())
            .totalAmount(totalAmount)
            .policyCompliant(policyResult.getCompliant())
            .policyViolationDetails(policyResult.getCompliant() ? null : policyResult.getMessage())
            .build();

        if (request.getFlightId() != null) {
            booking.setSelectedFlight(flightRepository.findById(request.getFlightId()).orElse(null));
        }

        booking = bookingRepository.save(booking);

        // Notify manager
        EmployeeProfile empProfile = employeeProfileRepository.findByUserId(employee.getId()).orElse(null);
        if (empProfile != null && empProfile.getReportingManager() != null) {
            notificationService.createNotification(
                empProfile.getReportingManager(),
                "New Travel Request",
                employee.getFullName() + " has submitted a travel request (" + bookingRef + ")",
                Notification.NotificationType.BOOKING_SUBMITTED,
                "BOOKING", booking.getId()
            );
        }

        auditService.log(employee, employee.getRoles().iterator().next().getName().name(),
            "BOOKING_CREATED", "BOOKING", booking.getId(), "SUCCESS",
            "Booking ref: " + bookingRef + ", Total: " + totalAmount);

        return mapToResponse(booking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(User employee) {
        return bookingRepository.findByEmployeeIdOrderByCreatedAtDesc(employee.getId())
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getAllApprovedBookings() {
        return bookingRepository.findApprovedBookings()
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id, User currentUser) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Ownership check
        boolean isOwner = booking.getEmployee().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.hasRole("ADMIN");
        boolean isManager = currentUser.hasRole("MANAGER");

        // Check if manager is the reporting manager
        boolean isReportingManager = false;
        EmployeeProfile profile = employeeProfileRepository.findByUserId(booking.getEmployee().getId()).orElse(null);
        if (profile != null && profile.getReportingManager() != null) {
            isReportingManager = profile.getReportingManager().getId().equals(currentUser.getId());
        }

        if (!isOwner && !isAdmin && !isReportingManager) {
            throw new RuntimeException("Not authorized to view this booking");
        }

        return mapToResponse(booking);
    }

    @Transactional
    public BookingResponse cancelBooking(Long id, String reason, User currentUser) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Only employee who owns or admin can cancel
        if (!booking.getEmployee().getId().equals(currentUser.getId()) && !currentUser.hasRole("ADMIN")) {
            throw new RuntimeException("Not authorized to cancel this booking");
        }

        // Validate state transition
        if (booking.getStatus() != Booking.BookingStatus.PENDING &&
            booking.getStatus() != Booking.BookingStatus.APPROVED) {
            throw new RuntimeException("Cannot cancel booking in status: " + booking.getStatus());
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setCancellationReason(reason);
        booking.setCancelledBy(currentUser);
        booking.setCancelledAt(LocalDateTime.now());

        booking = bookingRepository.save(booking);

        // Notify relevant parties
        notificationService.createNotification(
            booking.getEmployee(),
            "Booking Cancelled",
            "Your booking " + booking.getBookingReference() + " has been cancelled",
            Notification.NotificationType.BOOKING_CANCELLED,
            "BOOKING", booking.getId()
        );

        auditService.log(currentUser, currentUser.getRoles().iterator().next().getName().name(),
            "BOOKING_CANCELLED", "BOOKING", booking.getId(), "SUCCESS",
            "Booking ref: " + booking.getBookingReference() + ", Reason: " + reason);

        return mapToResponse(booking);
    }

    @Transactional
    public void updateBookingStatus(Long bookingId, Booking.BookingStatus newStatus) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setStatus(newStatus);
        bookingRepository.save(booking);
    }

    public BookingResponse mapToResponsePublic(Booking booking) {
        return mapToResponse(booking);
    }

    private BookingResponse mapToResponse(Booking booking) {
        BookingResponse.BookingResponseBuilder builder = BookingResponse.builder()
            .id(booking.getId())
            .bookingReference(booking.getBookingReference())
            .employeeId(booking.getEmployee().getId())
            .employeeName(booking.getEmployee().getFullName())
            .employeeEmail(booking.getEmployee().getEmail())
            .status(booking.getStatus().name())
            .type(booking.getType().name())
            .travelPurpose(booking.getTravelPurpose())
            .travelPurposeDescription(booking.getTravelPurposeDescription())
            .travelStartDate(booking.getTravelStartDate())
            .travelEndDate(booking.getTravelEndDate())
            .origin(booking.getOrigin())
            .destination(booking.getDestination())
            .numberOfPassengers(booking.getNumberOfPassengers())
            .selectedFlightClass(booking.getSelectedFlightClass() != null ?
                booking.getSelectedFlightClass().name() : null)
            .flightPrice(booking.getFlightPrice())
            .hotelPricePerNight(booking.getHotelPricePerNight())
            .hotelNights(booking.getHotelNights())
            .totalAmount(booking.getTotalAmount())
            .policyCompliant(booking.getPolicyCompliant())
            .policyViolationDetails(booking.getPolicyViolationDetails())
            .cancellationReason(booking.getCancellationReason())
            .cancelledAt(booking.getCancelledAt())
            .createdAt(booking.getCreatedAt())
            .updatedAt(booking.getUpdatedAt());

        if (booking.getSelectedFlight() != null) {
            builder.selectedFlight(FlightResponse.builder()
                .id(booking.getSelectedFlight().getId())
                .flightNumber(booking.getSelectedFlight().getFlightNumber())
                .airline(booking.getSelectedFlight().getAirline())
                .airlineCode(booking.getSelectedFlight().getAirlineCode())
                .origin(booking.getSelectedFlight().getOrigin())
                .originCity(booking.getSelectedFlight().getOriginCity())
                .originAirport(booking.getSelectedFlight().getOriginAirport())
                .destination(booking.getSelectedFlight().getDestination())
                .destinationCity(booking.getSelectedFlight().getDestinationCity())
                .destinationAirport(booking.getSelectedFlight().getDestinationAirport())
                .departureDateTime(booking.getSelectedFlight().getDepartureDateTime())
                .arrivalDateTime(booking.getSelectedFlight().getArrivalDateTime())
                .boardingTime(booking.getSelectedFlight().getBoardingTime())
                .durationMinutes(booking.getSelectedFlight().getDurationMinutes())
                .stops(booking.getSelectedFlight().getStops())
                .travelClass(booking.getSelectedFlight().getTravelClass().name())
                .price(booking.getSelectedFlight().getPrice())
                .availableSeats(booking.getSelectedFlight().getAvailableSeats())
                .baggageAllowanceKg(booking.getSelectedFlight().getBaggageAllowanceKg())
                .aircraftType(booking.getSelectedFlight().getAircraftType())
                .logoUrl(booking.getSelectedFlight().getLogoUrl())
                .build());
        }

        if (booking.getSelectedHotel() != null) {
            builder.selectedHotel(HotelResponse.builder()
                .id(booking.getSelectedHotel().getId())
                .name(booking.getSelectedHotel().getName())
                .city(booking.getSelectedHotel().getCity())
                .country(booking.getSelectedHotel().getCountry())
                .address(booking.getSelectedHotel().getAddress())
                .starRating(booking.getSelectedHotel().getStarRating())
                .description(booking.getSelectedHotel().getDescription())
                .amenities(booking.getSelectedHotel().getAmenities())
                .contactEmail(booking.getSelectedHotel().getContactEmail())
                .contactPhone(booking.getSelectedHotel().getContactPhone())
                .latitude(booking.getSelectedHotel().getLatitude())
                .longitude(booking.getSelectedHotel().getLongitude())
                .imageUrl(booking.getSelectedHotel().getImageUrl())
                .checkInTime(booking.getSelectedHotel().getCheckInTime())
                .checkOutTime(booking.getSelectedHotel().getCheckOutTime())
                .build());
        }

        if (booking.getSelectedHotelRoom() != null) {
            builder.selectedRoomType(booking.getSelectedHotelRoom().getRoomType());
        }

        return builder.build();
    }

    private String generateBookingReference() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomPart = String.format("%04d", ThreadLocalRandom.current().nextInt(10000));
        return "PS" + datePart + randomPart;
    }

    private Booking.BookingType determineBookingType(BookingRequest request) {
        boolean hasFlight = request.getFlightId() != null;
        boolean hasHotel = request.getHotelId() != null;
        if (hasFlight && hasHotel) return Booking.BookingType.BOTH;
        if (hasFlight) return Booking.BookingType.FLIGHT;
        return Booking.BookingType.HOTEL;
    }
}
