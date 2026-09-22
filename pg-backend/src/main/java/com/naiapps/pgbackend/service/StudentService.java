package com.naiapps.pgbackend.service;

import com.naiapps.pgbackend.entity.Fee;
import com.naiapps.pgbackend.entity.Student;
import com.naiapps.pgbackend.repository.FeeRepository;
import com.naiapps.pgbackend.repository.RoomRepository;
import com.naiapps.pgbackend.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private FeeRepository feeRepository;

    @Autowired
    private EmailService emailService;

    public List<Student> findAll() {
        return studentRepository.findAll();
    }

    public Optional<Student> findById(Long id) {
        return studentRepository.findById(id);
    }

    public Student save(Student student) {
        boolean isNew = student.getId() == null;
        if (student.getJoinDate() == null) {
            student.setJoinDate(LocalDate.now());
        }
        if (student.getIsActive() == null) {
            student.setIsActive(true);
        }
        Student savedStudent = studentRepository.save(student);

        // Send Welcome Email to New Student
        if (isNew && savedStudent.getEmail() != null && !savedStudent.getEmail().isEmpty()) {
            String pgName = null;
            String roomNo = savedStudent.getRoomNo();

            try {
                if (savedStudent.getRoom() != null) {
                    // Create Fee Record
                    if (savedStudent.getRoom().getRentAmount() != null) {
                        Fee fee = Fee.builder()
                                .student(savedStudent)
                                .amount(savedStudent.getRoom().getRentAmount())
                                .status("PENDING")
                                .paymentStatus("PENDING")
                                .build();
                        feeRepository.save(fee);
                    }

                    if (savedStudent.getRoom().getFloor() != null
                            && savedStudent.getRoom().getFloor().getPg() != null) {
                        pgName = savedStudent.getRoom().getFloor().getPg().getName();
                    }
                }
            } catch (Exception e) {
                // Ignore if lazy loading fails or data is missing
            }

            emailService.sendStudentWelcomeEmail(savedStudent.getEmail(), savedStudent.getName(), pgName, roomNo);
        }

        return savedStudent;
    }

    /**
     * Safely deletes a student by:
     * 1. Unassigning the student from all rooms
     * 2. Deleting the student entity
     */
    public void deleteById(Long id) {
        // ✅ Step 1: Unassign the student from room
        Optional<Student> studentOpt = studentRepository.findById(id);
        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();
            if (student.getRoom() != null) {
                // Update room occupancy if needed, but for now just break relationship
                // Logic to decrease occupancy should be in RoomService or handled here
                // For now, let's just nullify the room in student (which is the owner of
                // relationship)
                student.setRoom(null);
                studentRepository.save(student);
            }
        }

        // ✅ Step 2: Now safely delete the student
        studentRepository.deleteById(id);
    }

    public boolean existsById(Long id) {
        return studentRepository.existsById(id);
    }

    public boolean existsByEmail(String email) {
        return studentRepository.existsByEmail(email);
    }

    public boolean existsByRoomNo(String roomNo) {
        return studentRepository.existsByRoomNo(roomNo);
    }

    public Optional<Student> findByEmail(String email) {
        return studentRepository.findByEmail(email);
    }

    public List<Student> findByEmailContainingIgnoreCase(String email) {
        return studentRepository.findByEmailContainingIgnoreCase(email);
    }

    public Optional<Student> findByRoomNo(String roomNo) {
        return studentRepository.findByRoomNo(roomNo);
    }

    public List<Student> findByIsActive(Boolean isActive) {
        return studentRepository.findByIsActive(isActive);
    }

    public List<Student> findActiveStudents() {
        return studentRepository.findByIsActive(true);
    }

    public List<Student> findByPgId(Long pgId) {
        return studentRepository.findByRoom_Floor_Pg_Id(pgId);
    }
}
