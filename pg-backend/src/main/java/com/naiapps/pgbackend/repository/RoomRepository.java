package com.naiapps.pgbackend.repository;

import com.naiapps.pgbackend.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByIsBookedFalse();

    List<Room> findByIsBookedTrue();

    Optional<Room> findByRoomNumber(String roomNumber);

    List<Room> findByFloor_Id(Long floorId);

    List<Room> findByFloor_FloorNumber(Integer floorNumber);

    List<Room> findByFloor_Pg_Id(Long pgId);
}
