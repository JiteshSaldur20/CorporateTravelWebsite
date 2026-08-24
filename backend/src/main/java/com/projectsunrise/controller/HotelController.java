package com.projectsunrise.controller;

import com.projectsunrise.dto.hotel.HotelResponse;
import com.projectsunrise.dto.hotel.HotelSearchRequest;
import com.projectsunrise.service.HotelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
@Tag(name = "Hotels", description = "Hotel search and details")
public class HotelController {

    private final HotelService hotelService;

    @GetMapping("/search")
    @Operation(summary = "Search hotels", description = "Searches available hotels by city and dates.")
    public ResponseEntity<List<HotelResponse>> searchHotels(HotelSearchRequest request) {
        return ResponseEntity.ok(hotelService.searchHotels(request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get hotel by ID", description = "Returns full details for a single hotel.")
    public ResponseEntity<HotelResponse> getHotelById(@PathVariable Long id) {
        return ResponseEntity.ok(hotelService.getHotelById(id));
    }
}
