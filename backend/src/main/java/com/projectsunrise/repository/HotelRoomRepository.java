package com.projectsunrise.repository;

import com.projectsunrise.entity.HotelRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelRoomRepository extends JpaRepository<HotelRoom, Long> {
    List<HotelRoom> findByHotelIdAndActiveTrue(Long hotelId);
}
