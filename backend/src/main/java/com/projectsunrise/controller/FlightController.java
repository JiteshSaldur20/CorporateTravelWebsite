package com.projectsunrise.controller;

import com.projectsunrise.dto.flight.FlightResponse;
import com.projectsunrise.dto.flight.FlightSearchRequest;
import com.projectsunrise.service.FlightService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/flights")
@RequiredArgsConstructor
@Tag(name = "Flights", description = "Flight search and details")
public class FlightController {

    private final FlightService flightService;

    @GetMapping("/search")
    @Operation(summary = "Search flights", description = "Searches available flights by route and dates.")
    public ResponseEntity<List<FlightResponse>> searchFlights(FlightSearchRequest request) {
        return ResponseEntity.ok(flightService.searchFlights(request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get flight by ID", description = "Returns full details for a single flight.")
    public ResponseEntity<FlightResponse> getFlightById(@PathVariable Long id) {
        return ResponseEntity.ok(flightService.getFlightById(id));
    }
}
