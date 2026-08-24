package com.projectsunrise.service;

import com.projectsunrise.dto.hotel.HotelSearchRequest;
import com.projectsunrise.dto.hotel.HotelResponse;
import com.projectsunrise.entity.Hotel;
import com.projectsunrise.entity.HotelRoom;
import com.projectsunrise.repository.HotelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HotelService {

    private final HotelRepository hotelRepository;

    public List<HotelResponse> searchHotels(HotelSearchRequest request) {
        List<Hotel> hotels;

        if (request.getStarRating() != null) {
            hotels = hotelRepository.searchHotels(
                request.getCity(),
                request.getStarRating(),
                request.getAmenity(),
                request.getMinPrice(),
                request.getMaxPrice()
            );
        } else {
            hotels = hotelRepository.searchHotelsWithStarRange(
                request.getCity(),
                null,
                request.getAmenity()
            );
        }

        // Apply price filtering in Java for simplicity
        if (request.getMinPrice() != null || request.getMaxPrice() != null) {
            hotels = hotels.stream()
                .filter(hotel -> hotel.getRooms().stream()
                    .anyMatch(room -> {
                        boolean matches = true;
                        if (request.getMinPrice() != null) {
                            matches = matches && room.getPricePerNight().compareTo(request.getMinPrice()) >= 0;
                        }
                        if (request.getMaxPrice() != null) {
                            matches = matches && room.getPricePerNight().compareTo(request.getMaxPrice()) <= 0;
                        }
                        return matches;
                    }))
                .collect(Collectors.toList());
        }

        // Apply sorting
        if (request.getSortBy() != null) {
            hotels = sortHotels(hotels, request.getSortBy(), request.getSortDir());
        }

        return hotels.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    public HotelResponse getHotelById(Long id) {
        Hotel hotel = hotelRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Hotel not found"));
        return mapToResponse(hotel);
    }

    private List<Hotel> sortHotels(List<Hotel> hotels, String sortBy, String sortDir) {
        boolean ascending = !"desc".equalsIgnoreCase(sortDir);

        hotels.sort((a, b) -> {
            int result = 0;
            switch (sortBy.toLowerCase()) {
                case "price":
                    // Sort by minimum room price
                    double priceA = a.getRooms().stream()
                        .mapToDouble(r -> r.getPricePerNight().doubleValue()).min().orElse(0);
                    double priceB = b.getRooms().stream()
                        .mapToDouble(r -> r.getPricePerNight().doubleValue()).min().orElse(0);
                    result = Double.compare(priceA, priceB);
                    break;
                case "starrating":
                    result = a.getStarRating().compareTo(b.getStarRating());
                    break;
                default:
                    result = a.getName().compareTo(b.getName());
            }
            return ascending ? result : -result;
        });

        return hotels;
    }

    private HotelResponse mapToResponse(Hotel hotel) {
        List<HotelResponse.RoomResponse> rooms = hotel.getRooms().stream()
            .filter(HotelRoom::getActive)
            .map(room -> HotelResponse.RoomResponse.builder()
                .id(room.getId())
                .roomType(room.getRoomType())
                .pricePerNight(room.getPricePerNight())
                .availableRooms(room.getAvailableRooms())
                .maxGuests(room.getMaxGuests())
                .build())
            .collect(Collectors.toList());

        return HotelResponse.builder()
            .id(hotel.getId())
            .name(hotel.getName())
            .city(hotel.getCity())
            .country(hotel.getCountry())
            .address(hotel.getAddress())
            .starRating(hotel.getStarRating())
            .description(hotel.getDescription())
            .amenities(hotel.getAmenities())
            .contactEmail(hotel.getContactEmail())
            .contactPhone(hotel.getContactPhone())
            .latitude(hotel.getLatitude())
            .longitude(hotel.getLongitude())
            .imageUrl(hotel.getImageUrl())
            .checkInTime(hotel.getCheckInTime())
            .checkOutTime(hotel.getCheckOutTime())
            .rooms(rooms)
            .build();
    }
}
