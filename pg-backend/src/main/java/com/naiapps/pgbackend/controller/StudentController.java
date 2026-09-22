package com.naiapps.pgbackend.controller;

import com.naiapps.pgbackend.entity.Student;
import com.naiapps.pgbackend.entity.Room;
import com.naiapps.pgbackend.service.StudentService;
import com.naiapps.pgbackend.service.FeeService;
import com.naiapps.pgbackend.service.RoomService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/students")
@Slf4j
public class StudentController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private FeeService feeService;

    @Autowired
    private RoomService roomService;

    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents() {
        try {
            log.info("📋 GET /api/students - Fetching all students");
            List<Student> students = studentService.findAll();
            log.info("✅ Found {} students", students.size());
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            log.error("❌ Error fetching students: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/pg/{pgId}")
    public ResponseEntity<List<Student>> getStudentsByPG(@PathVariable Long pgId) {
        try {
            log.info("📋 GET /api/students/pg/{} - Fetching students for PG", pgId);
            List<Student> students = studentService.findByPgId(pgId);
            log.info("✅ Found {} students for PG {}", students.size(), pgId);
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            log.error("❌ Error fetching students for PG {}: ", pgId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        try {
            log.info("🔍 GET /api/students/{} - Fetching student by ID", id);
            Optional<Student> student = studentService.findById(id);

            if (student.isPresent()) {
                log.info("✅ Student found: {}", student.get().getName());
                return ResponseEntity.ok(student.get());
            } else {
                log.warn("❌ Student not found with ID: {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("❌ Error fetching student with id {}: ", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createStudent(@Valid @RequestBody Student student, BindingResult result) {
        log.info("🚀 POST /api/students - Creating new student");
        log.info("📝 Received student data: {}", student);

        try {
            if (result.hasErrors()) {
                Map<String, String> errors = new HashMap<>();
                result.getFieldErrors().forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
                return ResponseEntity.badRequest().body(Map.of("error", "Validation failed", "details", errors));
            }

            if (studentService.existsByEmail(student.getEmail())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
            }

            // Handle Room Assignment
            if (student.getRoomNo() != null && !student.getRoomNo().trim().isEmpty()) {
                Optional<Room> roomOpt = roomService.findByRoomNumber(student.getRoomNo());
                if (roomOpt.isPresent()) {
                    Room room = roomOpt.get();
                    if (room.getCurrentOccupancy() >= room.getCapacity()) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("error", "Room " + student.getRoomNo() + " is fully occupied"));
                    }
                    student.setRoom(room);

                    // Update room occupancy
                    room.setCurrentOccupancy(room.getCurrentOccupancy() + 1);
                    if (room.getCurrentOccupancy() >= room.getCapacity()) {
                        room.setIsBooked(true);
                    }
                    roomService.save(room);
                } else {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Room " + student.getRoomNo() + " not found"));
                }
            }

            Student savedStudent = studentService.save(student);
            log.info("✅ Student created successfully with ID: {}", savedStudent.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(savedStudent);

        } catch (Exception e) {
            log.error("❌ Error creating student: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error creating student: " + e.getMessage()));
        }
    }

    // 🧪 TEMPORARY: Simplified create method for testing
    @PostMapping("/simple")
    public ResponseEntity<?> createStudentSimple(@RequestBody Student student) {
        log.info("🧪 POST /api/students/simple - Simple create");
        try {
            if (student.getIsActive() == null)
                student.setIsActive(true);
            Student savedStudent = studentService.save(student);
            return ResponseEntity.ok(savedStudent);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateStudent(@PathVariable Long id, @Valid @RequestBody Student studentDetails,
            BindingResult result) {
        log.info("📝 PUT /api/students/{} - Updating student", id);

        try {
            if (result.hasErrors()) {
                Map<String, String> errors = new HashMap<>();
                result.getFieldErrors().forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
                return ResponseEntity.badRequest().body(errors);
            }

            Optional<Student> studentOpt = studentService.findById(id);
            if (!studentOpt.isPresent())
                return ResponseEntity.notFound().build();

            Student student = studentOpt.get();
            String oldRoomNo = student.getRoomNo();

            if (!student.getEmail().equals(studentDetails.getEmail())
                    && studentService.existsByEmail(studentDetails.getEmail())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
            }

            student.setName(studentDetails.getName());
            student.setEmail(studentDetails.getEmail());
            student.setPhone(studentDetails.getPhone());
            student.setProfileImage(studentDetails.getProfileImage());
            if (studentDetails.getIsActive() != null)
                student.setIsActive(studentDetails.getIsActive());

            // Handle Room Change
            String newRoomNo = studentDetails.getRoomNo();
            if (newRoomNo != null && !newRoomNo.equals(oldRoomNo)) {
                // 1. Unassign from old room
                if (student.getRoom() != null) {
                    Room oldRoom = student.getRoom();
                    if (oldRoom.getCurrentOccupancy() > 0) {
                        oldRoom.setCurrentOccupancy(oldRoom.getCurrentOccupancy() - 1);
                    }
                    oldRoom.setIsBooked(false);
                    roomService.save(oldRoom);
                }

                // 2. Assign to new room
                Optional<Room> newRoomOpt = roomService.findByRoomNumber(newRoomNo);
                if (newRoomOpt.isPresent()) {
                    Room newRoom = newRoomOpt.get();
                    if (newRoom.getCurrentOccupancy() >= newRoom.getCapacity()) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("error", "New room " + newRoomNo + " is fully occupied"));
                    }
                    student.setRoom(newRoom);
                    student.setRoomNo(newRoomNo); // Keep legacy field in sync

                    newRoom.setCurrentOccupancy(newRoom.getCurrentOccupancy() + 1);
                    if (newRoom.getCurrentOccupancy() >= newRoom.getCapacity()) {
                        newRoom.setIsBooked(true);
                    }
                    roomService.save(newRoom);
                } else {
                    return ResponseEntity.badRequest().body(Map.of("error", "Room " + newRoomNo + " not found"));
                }
            } else if (newRoomNo == null && oldRoomNo != null) {
                // Just unassign
                if (student.getRoom() != null) {
                    Room oldRoom = student.getRoom();
                    if (oldRoom.getCurrentOccupancy() > 0) {
                        oldRoom.setCurrentOccupancy(oldRoom.getCurrentOccupancy() - 1);
                    }
                    oldRoom.setIsBooked(false);
                    roomService.save(oldRoom);
                }
                student.setRoom(null);
                student.setRoomNo(null);
            }

            Student updatedStudent = studentService.save(student);
            return ResponseEntity.ok(updatedStudent);

        } catch (Exception e) {
            log.error("❌ Error updating student: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error updating student: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
        try {
            log.info("🗑️ DELETE /api/students/{} - Deleting student", id);

            Optional<Student> studentOpt = studentService.findById(id);
            if (!studentOpt.isPresent())
                return ResponseEntity.notFound().build();

            Student student = studentOpt.get();

            // Check fees
            List<com.naiapps.pgbackend.entity.Fee> fees = feeService.findByStudentId(id);
            if (!fees.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Cannot delete student with existing fee records"));
            }

            // Unassign from room before deleting
            if (student.getRoom() != null) {
                Room room = student.getRoom();
                if (room.getCurrentOccupancy() > 0) {
                    room.setCurrentOccupancy(room.getCurrentOccupancy() - 1);
                }
                room.setIsBooked(false);
                roomService.save(room);
            }

            studentService.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Student deleted successfully"));

        } catch (Exception e) {
            log.error("❌ Error deleting student: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error deleting student: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/force")
    public ResponseEntity<?> forceDeleteStudent(@PathVariable Long id) {
        try {
            log.info("💥 FORCE DELETE /api/students/{}/force", id);

            Optional<Student> studentOpt = studentService.findById(id);
            if (!studentOpt.isPresent())
                return ResponseEntity.notFound().build();

            Student student = studentOpt.get();

            // Delete fees
            List<com.naiapps.pgbackend.entity.Fee> fees = feeService.findByStudentId(id);
            for (com.naiapps.pgbackend.entity.Fee fee : fees) {
                feeService.deleteById(fee.getId());
            }

            // Unassign from room
            if (student.getRoom() != null) {
                Room room = student.getRoom();
                if (room.getCurrentOccupancy() > 0) {
                    room.setCurrentOccupancy(room.getCurrentOccupancy() - 1);
                }
                room.setIsBooked(false);
                roomService.save(room);
            }

            studentService.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Student force deleted successfully"));

        } catch (Exception e) {
            log.error("❌ Error force deleting student: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error deleting student: " + e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> toggleStudentStatus(@PathVariable Long id) {
        try {
            log.info("🔄 PATCH /api/students/{}/status - Toggling status", id);

            Optional<Student> studentOpt = studentService.findById(id);
            if (studentOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Student student = studentOpt.get();
            student.setIsActive(!student.getIsActive());
            Student updatedStudent = studentService.save(student);

            return ResponseEntity
                    .ok(Map.of("message", "Student status updated successfully", "student", updatedStudent));

        } catch (Exception e) {
            log.error("❌ Error updating student status for id {}: ", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error updating student status: " + e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Student>> searchStudents(@RequestParam(required = false) String email,
            @RequestParam(required = false) String roomNo) {
        try {
            log.info("🔍 GET /api/students/search - email: {}, roomNo: {}", email, roomNo);
            List<Student> students;

            if (email != null && !email.trim().isEmpty()) {
                students = studentService.findByEmailContainingIgnoreCase(email);
            } else if (roomNo != null && !roomNo.trim().isEmpty()) {
                Optional<Student> student = studentService.findByRoomNo(roomNo);
                students = student.map(List::of).orElse(List.of());
            } else {
                students = studentService.findAll();
            }

            log.info("✅ Search returned {} students", students.size());
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            log.error("❌ Error searching students: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
