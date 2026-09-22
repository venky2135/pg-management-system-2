package com.naiapps.pgbackend.service;

import com.naiapps.pgbackend.entity.Room;
import com.naiapps.pgbackend.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    public List<Room> findAll() {
        return roomRepository.findAll();
    }

    public Optional<Room> findById(Long id) {
        return roomRepository.findById(id);
    }

    public Room save(Room room) {
        if (room.getIsBooked() == null) {
            room.setIsBooked(false);
        }
        return roomRepository.save(room);
    }

    public List<Room> saveAll(List<Room> rooms) {
        rooms.forEach(room -> {
            if (room.getIsBooked() == null) {
                room.setIsBooked(false);
            }
        });
        return roomRepository.saveAll(rooms);
    }

    public void deleteById(Long id) {
        roomRepository.deleteById(id);
    }

    public boolean existsById(Long id) {
        return roomRepository.existsById(id);
    }

    public List<Room> findAvailableRooms() {
        return roomRepository.findByIsBookedFalse();
    }

    public List<Room> findBookedRooms() {
        return roomRepository.findByIsBookedTrue();
    }

    public Optional<Room> findByRoomNumber(String roomNumber) {
        return roomRepository.findByRoomNumber(roomNumber);
    }

    public List<Room> findByFloor(Integer floorNumber) {
        return roomRepository.findByFloor_FloorNumber(floorNumber);
    }

    public List<Room> findByPgId(Long pgId) {
        return roomRepository.findByFloor_Pg_Id(pgId);
    }
}
