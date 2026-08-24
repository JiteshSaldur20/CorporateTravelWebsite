package com.projectsunrise.repository;

import com.projectsunrise.entity.Flight;
import com.projectsunrise.entity.TravelPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface FlightRepository extends JpaRepository<Flight, Long> {

    @Query("SELECT f FROM Flight f WHERE f.active = true " +
           "AND (:origin IS NULL OR f.origin = :origin) " +
           "AND (:destination IS NULL OR f.destination = :destination) " +
           "AND (:travelClass IS NULL OR f.travelClass = :travelClass) " +
           "AND (:minPrice IS NULL OR f.price >= :minPrice) " +
           "AND (:maxPrice IS NULL OR f.price <= :maxPrice) " +
           "AND (:maxDuration IS NULL OR f.durationMinutes <= :maxDuration) " +
           "AND (:maxStops IS NULL OR f.stops <= :maxStops) " +
           "AND (:departureFrom IS NULL OR f.departureDateTime >= :departureFrom) " +
           "AND (:departureTo IS NULL OR f.departureDateTime <= :departureTo)")
    List<Flight> searchFlights(
        @Param("origin") String origin,
        @Param("destination") String destination,
        @Param("travelClass") TravelPolicy.FlightClass travelClass,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("maxDuration") Integer maxDuration,
        @Param("maxStops") Integer maxStops,
        @Param("departureFrom") java.time.LocalDateTime departureFrom,
        @Param("departureTo") java.time.LocalDateTime departureTo
    );
}
