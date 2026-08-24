package com.projectsunrise.repository;

import com.projectsunrise.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {

    @Query("SELECT DISTINCT h FROM Hotel h " +
           "LEFT JOIN FETCH h.rooms r " +
           "WHERE h.active = true " +
           "AND (:city IS NULL OR h.city = :city) " +
           "AND (:starRating IS NULL OR h.starRating = :starRating) " +
           "AND (COALESCE(:amenity, '') = '' OR h.amenities LIKE CONCAT('%', :amenity, '%')) " +
           "AND (:minRoomPrice IS NULL OR r.pricePerNight >= :minRoomPrice) " +
           "AND (:maxRoomPrice IS NULL OR r.pricePerNight <= :maxRoomPrice) " +
           "AND r.active = true")
    List<Hotel> searchHotels(
        @Param("city") String city,
        @Param("starRating") Integer starRating,
        @Param("amenity") String amenity,
        @Param("minRoomPrice") BigDecimal minRoomPrice,
        @Param("maxRoomPrice") BigDecimal maxRoomPrice
    );

    @Query("SELECT DISTINCT h FROM Hotel h " +
           "LEFT JOIN FETCH h.rooms r " +
           "WHERE h.active = true " +
           "AND (:city IS NULL OR h.city = :city) " +
           "AND (:minStarRating IS NULL OR h.starRating >= :minStarRating) " +
           "AND (COALESCE(:amenity, '') = '' OR h.amenities LIKE CONCAT('%', :amenity, '%')) " +
           "AND r.active = true")
    List<Hotel> searchHotelsWithStarRange(
        @Param("city") String city,
        @Param("minStarRating") Integer minStarRating,
        @Param("amenity") String amenity
    );
}
