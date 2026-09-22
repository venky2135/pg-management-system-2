package com.naiapps.pgbackend.controller;

import com.naiapps.pgbackend.entity.Room;
import com.naiapps.pgbackend.service.RoomService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/rooms")
@Slf4j
public class RoomController {

    @Autowired
    private com.naiapps.pgbackend.service.StudentService studentService;

    @Autowired
    private RoomService roomService;

    @Autowired
    private com.naiapps.pgbackend.repository.FloorRepository floorRepository;

    @GetMapping
    public ResponseEntity<List<Room>> getAllRooms() {
        try {
            log.info("🏠 GET /api/rooms - Fetching all rooms");
            List<Room> rooms = roomService.findAll();
            log.info("✅ Found {} rooms", rooms.size());

            // ✅ DEBUG: Log booking status for each room
            rooms.forEach(room -> log.info("Room {}: isBooked={}, occupancy={}/{}",
                    room.getRoomNumber(),
                    room.getIsBooked(),
                    room.getCurrentOccupancy(),
                    room.getCapacity()));

            return ResponseEntity.ok(rooms);
        } catch (Exception e) {
            log.error("❌ Error fetching rooms: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoomById(@PathVariable Long id) {
        try {
            log.info("🔍 GET /api/rooms/{} - Fetching room by ID", id);
            Optional<Room> room = roomService.findById(id);

            if (room.isPresent()) {
                log.info("✅ Room found: {} (booked: {})", room.get().getRoomNumber(), room.get().getIsBooked());
                return ResponseEntity.ok(room.get());
            } else {
                log.warn("❌ Room not found with ID: {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("❌ Error fetching room with id {}: ", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/number/{roomNumber}")
    public ResponseEntity<Room> getRoomByNumber(@PathVariable String roomNumber) {
        try {
            log.info("🔍 GET /api/rooms/number/{} - Fetching room by number", roomNumber);
            Optional<Room> room = roomService.findByRoomNumber(roomNumber);

            if (room.isPresent()) {
                log.info("✅ Room found: {} (booked: {})", room.get().getRoomNumber(), room.get().getIsBooked());
                return ResponseEntity.ok(room.get());
            } else {
                log.warn("❌ Room not found with number: {}", roomNumber);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("❌ Error fetching room with number {}: ", roomNumber, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/available")
    public ResponseEntity<List<Room>> getAvailableRooms() {
        try {
            log.info("🏠 GET /api/rooms/available - Fetching available rooms");
            List<Room> availableRooms = roomService.findAvailableRooms();
            log.info("✅ Found {} available rooms", availableRooms.size());
            return ResponseEntity.ok(availableRooms);
        } catch (Exception e) {
            log.error("❌ Error fetching available rooms: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/booked")
    public ResponseEntity<List<Room>> getBookedRooms() {
        try {
            log.info("🏠 GET /api/rooms/booked - Fetching booked rooms");
            List<Room> bookedRooms = roomService.findBookedRooms();
            log.info("✅ Found {} booked rooms", bookedRooms.size());
            return ResponseEntity.ok(bookedRooms);
        } catch (Exception e) {
            log.error("❌ Error fetching booked rooms: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/pg/{pgId}")
    public ResponseEntity<List<Room>> getRoomsByPG(@PathVariable Long pgId) {
        try {
            log.info("🏠 GET /api/rooms/pg/{} - Fetching rooms for PG", pgId);
            List<Room> rooms = roomService.findByPgId(pgId);
            log.info("✅ Found {} rooms for PG {}", rooms.size(), pgId);
            return ResponseEntity.ok(rooms);
        } catch (Exception e) {
            log.error("❌ Error fetching rooms for PG {}: ", pgId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/floor/{floorId}/bulk")
    public ResponseEntity<?> createRoomsBulk(@PathVariable Long floorId, @RequestBody List<Room> rooms) {
        try {
            Optional<com.naiapps.pgbackend.entity.Floor> floorOpt = floorRepository.findById(floorId);
            if (!floorOpt.isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Floor not found"));
            }
            com.naiapps.pgbackend.entity.Floor floor = floorOpt.get();

            for (Room room : rooms) {
                room.setFloor(floor);
                // Set default capacity if not provided
                if (room.getCapacity() == null) {
                    String type = room.getRoomType() != null ? room.getRoomType().toUpperCase() : "";
                    if (type.contains("SINGLE"))
                        room.setCapacity(1);
                    else if (type.contains("DOUBLE"))
                        room.setCapacity(2);
                    else if (type.contains("TRIPLE"))
                        room.setCapacity(3);
                    else
                        room.setCapacity(1); // Fallback
                }
            }

            List<Room> savedRooms = roomService.saveAll(rooms);
            return ResponseEntity.ok(savedRooms);
        } catch (Exception e) {
            log.error("❌ Error creating rooms bulk: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error creating rooms: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody Map<String, Object> roomData) {
        try {
            String roomNumber = (String) roomData.get("roomNumber");
            if (roomService.findByRoomNumber(roomNumber).isPresent()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Room number already exists"));
            }

            Room room = new Room();
            room.setRoomNumber(roomNumber);
            room.setRentAmount(Double.valueOf(roomData.get("rentAmount").toString()));
            room.setRoomType((String) roomData.get("roomType"));

            // Set capacity based on room type or explicit value
            if (roomData.containsKey("capacity")) {
                room.setCapacity((Integer) roomData.get("capacity"));
            } else {
                // Default capacity logic
                String type = room.getRoomType().toUpperCase();
                if (type.contains("SINGLE"))
                    room.setCapacity(1);
                else if (type.contains("DOUBLE"))
                    room.setCapacity(2);
                else if (type.contains("TRIPLE"))
                    room.setCapacity(3);
                else
                    room.setCapacity(1); // Fallback
            }

            // Handle Floor
            if (roomData.containsKey("floorId")) {
                Long floorId = Long.valueOf(roomData.get("floorId").toString());
                floorRepository.findById(floorId).ifPresent(room::setFloor);
            }

            Room savedRoom = roomService.save(room);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedRoom);
        } catch (Exception e) {
            log.error("❌ Error creating room: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error creating room: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRoom(@PathVariable Long id, @RequestBody Map<String, Object> roomData) {
        try {
            Optional<Room> roomOpt = roomService.findById(id);
            if (!roomOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            Room room = roomOpt.get();

            if (roomData.containsKey("roomNumber"))
                room.setRoomNumber((String) roomData.get("roomNumber"));
            if (roomData.containsKey("rentAmount"))
                room.setRentAmount(Double.valueOf(roomData.get("rentAmount").toString()));
            if (roomData.containsKey("roomType"))
                room.setRoomType((String) roomData.get("roomType"));
            if (roomData.containsKey("capacity"))
                room.setCapacity((Integer) roomData.get("capacity"));

            if (roomData.containsKey("floorId")) {
                Long floorId = Long.valueOf(roomData.get("floorId").toString());
                floorRepository.findById(floorId).ifPresent(room::setFloor);
            }

            Room updatedRoom = roomService.save(room);
            return ResponseEntity.ok(updatedRoom);
        } catch (Exception e) {
            log.error("❌ Error updating room with id {}: ", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error updating room: " + e.getMessage()));
        }
    }

    @PostMapping("/book/{roomId}/student/{studentId}")
    public ResponseEntity<?> bookRoom(@PathVariable Long roomId, @PathVariable Long studentId) {
        try {
            log.info("📝 POST /api/rooms/book/{}/student/{}", roomId, studentId);
            Optional<Room> roomOpt = roomService.findById(roomId);
            Optional<com.naiapps.pgbackend.entity.Student> studentOpt = studentService.findById(studentId);

            if (!roomOpt.isPresent() || !studentOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Room room = roomOpt.get();
            com.naiapps.pgbackend.entity.Student student = studentOpt.get();

            if (room.getCurrentOccupancy() >= room.getCapacity()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Room is fully occupied"));
            }

            // Assign room to student
            student.setRoom(room);
            studentService.save(student);

            // Update room occupancy
            room.setCurrentOccupancy(room.getCurrentOccupancy() + 1);
            if (room.getCurrentOccupancy() >= room.getCapacity()) {
                room.setIsBooked(true);
            }
            Room savedRoom = roomService.save(room);

            log.info("✅ Room {} booked successfully for student {}", room.getRoomNumber(), student.getName());
            return ResponseEntity.ok(savedRoom);
        } catch (Exception e) {
            log.error("❌ Error booking room {}: ", roomId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error booking room: " + e.getMessage()));
        }
    }

    @PostMapping("/unbook/{roomId}/student/{studentId}")
    public ResponseEntity<?> unbookRoom(@PathVariable Long roomId, @PathVariable Long studentId) {
        try {
            log.info("📝 POST /api/rooms/unbook/{}/student/{}", roomId, studentId);
            Optional<Room> roomOpt = roomService.findById(roomId);
            Optional<com.naiapps.pgbackend.entity.Student> studentOpt = studentService.findById(studentId);

            if (!roomOpt.isPresent() || !studentOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Room room = roomOpt.get();
            com.naiapps.pgbackend.entity.Student student = studentOpt.get();

            // Verify student is actually in this room
            if (student.getRoom() == null || !student.getRoom().getId().equals(roomId)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Student is not assigned to this room"));
            }

            // Remove room from student
            student.setRoom(null);
            studentService.save(student);

            // Update room occupancy
            if (room.getCurrentOccupancy() > 0) {
                room.setCurrentOccupancy(room.getCurrentOccupancy() - 1);
            }
            room.setIsBooked(false);

            Room savedRoom = roomService.save(room);
            log.info("✅ Room {} unbooked successfully for student {}", room.getRoomNumber(), student.getName());
            return ResponseEntity.ok(savedRoom);
        } catch (Exception e) {
            log.error("❌ Error unbooking room {}: ", roomId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error unbooking room: " + e.getMessage()));
        }
    }
}
