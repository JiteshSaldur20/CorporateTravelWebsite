package com.projectsunrise.dto.hotel;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

@Data
@Builder
public class HotelResponse {
    private Long id;
    private String name;
    private String city;
    private String country;
    private String address;
    private Integer starRating;
    private String description;
    private String amenities;
    private String contactEmail;
    private String contactPhone;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String imageUrl;
    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    private List<RoomResponse> rooms;

    @Data
    @Builder
    public static class RoomResponse {
        private Long id;
        private String roomType;
        private BigDecimal pricePerNight;
        private Integer availableRooms;
        private Integer maxGuests;
    }
}
