package com.projectsunrise.service;

import com.projectsunrise.dto.flight.FlightSearchRequest;
import com.projectsunrise.dto.flight.FlightResponse;
import com.projectsunrise.entity.Flight;
import com.projectsunrise.entity.TravelPolicy;
import com.projectsunrise.repository.FlightRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FlightService {

    private final FlightRepository flightRepository;

    public List<FlightResponse> searchFlights(FlightSearchRequest request) {
        TravelPolicy.FlightClass travelClass = null;
        if (request.getTravelClass() != null && !request.getTravelClass().isEmpty()) {
            travelClass = TravelPolicy.FlightClass.valueOf(request.getTravelClass().toUpperCase());
        }

        List<Flight> flights = flightRepository.searchFlights(
            request.getOrigin(),
            request.getDestination(),
            travelClass,
            request.getMinPrice(),
            request.getMaxPrice(),
            request.getMaxDuration(),
            request.getMaxStops(),
            request.getDepartureFrom(),
            request.getDepartureTo()
        );

        // Apply sorting
        if (request.getSortBy() != null) {
            flights = sortFlights(flights, request.getSortBy(), request.getSortDir());
        }

        return flights.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    public FlightResponse getFlightById(Long id) {
        Flight flight = flightRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Flight not found"));
        return mapToResponse(flight);
    }

    private List<Flight> sortFlights(List<Flight> flights, String sortBy, String sortDir) {
        boolean ascending = !"desc".equalsIgnoreCase(sortDir);

        flights.sort((a, b) -> {
            int result = 0;
            switch (sortBy.toLowerCase()) {
                case "price":
                    result = a.getPrice().compareTo(b.getPrice());
                    break;
                case "duration":
                    result = a.getDurationMinutes().compareTo(b.getDurationMinutes());
                    break;
                case "departuretime":
                    result = a.getDepartureDateTime().compareTo(b.getDepartureDateTime());
                    break;
                case "stops":
                    result = a.getStops().compareTo(b.getStops());
                    break;
                default:
                    result = a.getPrice().compareTo(b.getPrice());
            }
            return ascending ? result : -result;
        });

        return flights;
    }

    private FlightResponse mapToResponse(Flight flight) {
        return FlightResponse.builder()
            .id(flight.getId())
            .flightNumber(flight.getFlightNumber())
            .airline(flight.getAirline())
            .airlineCode(flight.getAirlineCode())
            .origin(flight.getOrigin())
            .originCity(flight.getOriginCity())
            .originAirport(flight.getOriginAirport())
            .destination(flight.getDestination())
            .destinationCity(flight.getDestinationCity())
            .destinationAirport(flight.getDestinationAirport())
            .departureDateTime(flight.getDepartureDateTime())
            .arrivalDateTime(flight.getArrivalDateTime())
            .boardingTime(flight.getBoardingTime())
            .durationMinutes(flight.getDurationMinutes())
            .stops(flight.getStops())
            .travelClass(flight.getTravelClass().name())
            .price(flight.getPrice())
            .availableSeats(flight.getAvailableSeats())
            .baggageAllowanceKg(flight.getBaggageAllowanceKg())
            .aircraftType(flight.getAircraftType())
            .logoUrl(flight.getLogoUrl())
            .build();
    }
}
