package com.naiapps.pgbackend.controller;

import com.naiapps.pgbackend.dto.FeeDTO;
import com.naiapps.pgbackend.entity.Fee;
import com.naiapps.pgbackend.entity.Student;
import com.naiapps.pgbackend.service.FeeService;
import com.naiapps.pgbackend.service.StudentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/fees")
@Slf4j
public class FeeController {

    @Autowired
    private FeeService feeService;

    @Autowired
    private StudentService studentService;

    @GetMapping
    public ResponseEntity<List<FeeDTO>> getAllFees() {
        try {
            List<Fee> fees = feeService.findAll();
            List<FeeDTO> feeDTOs = fees.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(feeDTOs);
        } catch (Exception e) {
            log.error("Error fetching fees: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/pg/{pgId}")
    public ResponseEntity<List<FeeDTO>> getFeesByPG(@PathVariable Long pgId) {
        try {
            List<Fee> fees = feeService.findByPgId(pgId);
            List<FeeDTO> feeDTOs = fees.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(feeDTOs);
        } catch (Exception e) {
            log.error("Error fetching fees for PG {}: ", pgId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<FeeDTO> getFeeById(@PathVariable Long id) {
        try {
            Optional<Fee> fee = feeService.findById(id);
            return fee.map(f -> ResponseEntity.ok(convertToDTO(f)))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error fetching fee with id {}: ", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createFee(@RequestBody Map<String, Object> feeData) {
        try {
            Long studentId = Long.valueOf(feeData.get("studentId").toString());
            Double amount = Double.valueOf(feeData.get("amount").toString());
            String paymentDateStr = feeData.get("paymentDate").toString();
            String mode = feeData.get("mode").toString();

            Optional<Student> studentOpt = studentService.findById(studentId);
            if (!studentOpt.isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Student not found with ID: " + studentId);
                return ResponseEntity.badRequest().body(error);
            }

            Fee fee = Fee.builder()
                    .student(studentOpt.get())
                    .amount(amount)
                    .paymentDate(LocalDate.parse(paymentDateStr))
                    .mode(mode)
                    .status("PAID")
                    .build();

            Fee savedFee = feeService.save(fee);
            return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(savedFee));

        } catch (Exception e) {
            log.error("Error creating fee: ", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error creating fee: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateFee(@PathVariable Long id, @RequestBody Map<String, Object> feeData) {
        try {
            Optional<Fee> feeOpt = feeService.findById(id);
            if (!feeOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Fee fee = feeOpt.get();

            if (feeData.containsKey("amount")) {
                fee.setAmount(Double.valueOf(feeData.get("amount").toString()));
            }
            if (feeData.containsKey("paymentDate")) {
                fee.setPaymentDate(LocalDate.parse(feeData.get("paymentDate").toString()));
            }
            if (feeData.containsKey("mode")) {
                fee.setMode(feeData.get("mode").toString());
            }
            if (feeData.containsKey("status")) {
                fee.setStatus(feeData.get("status").toString());
            }

            Fee updatedFee = feeService.save(fee);
            return ResponseEntity.ok(convertToDTO(updatedFee));

        } catch (Exception e) {
            log.error("Error updating fee with id {}: ", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error updating fee: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFee(@PathVariable Long id) {
        try {
            if (!feeService.existsById(id)) {
                return ResponseEntity.notFound().build();
            }

            feeService.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Fee deleted successfully"));

        } catch (Exception e) {
            log.error("Error deleting fee with id {}: ", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error deleting fee: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ✅ FIXED: Payment History - Returns DTO to avoid LazyInitializationException
    @GetMapping("/student/{studentId}")
    public ResponseEntity<?> getFeesByStudent(@PathVariable Long studentId) {
        try {
            // Verify student exists
            Optional<Student> student = studentService.findById(studentId);
            if (!student.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            List<Fee> fees = feeService.findByStudentId(studentId);
            List<FeeDTO> feeDTOs = fees.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("fees", feeDTOs);
            response.put("studentName", student.get().getName());
            response.put("studentEmail", student.get().getEmail());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching fees for student {}: ", studentId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error fetching fees: " + e.getMessage()));
        }
    }

    @GetMapping("/student/{studentId}/total")
    public ResponseEntity<Map<String, Double>> getTotalPaidByStudent(@PathVariable Long studentId) {
        try {
            if (!studentService.existsById(studentId)) {
                return ResponseEntity.notFound().build();
            }

            Double total = feeService.getTotalPaidAmountByStudent(studentId);
            Map<String, Double> response = new HashMap<>();
            response.put("totalPaid", total);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error calculating total for student {}: ", studentId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✅ Helper method to convert Fee entity to FeeDTO (avoids lazy loading)
    private FeeDTO convertToDTO(Fee fee) {
        FeeDTO dto = FeeDTO.builder()
                .id(fee.getId())
                .amount(fee.getAmount())
                .status(fee.getStatus())
                .paymentDate(fee.getPaymentDate())
                .mode(fee.getMode())
                .studentId(fee.getStudentId())
                .build();

        // Safely get student info
        try {
            Optional<Student> student = studentService.findById(fee.getStudentId());
            if (student.isPresent()) {
                dto.setStudentName(student.get().getName());
                dto.setStudentEmail(student.get().getEmail());
            }
        } catch (Exception e) {
            log.warn("Could not load student details for fee {}: {}", fee.getId(), e.getMessage());
        }

        return dto;
    }

    @GetMapping("/debug")
    public ResponseEntity<?> debugFees() {
        try {
            log.info("🔍 DEBUG: Checking fee data");
            List<Fee> allFees = feeService.findAll();
            log.info("📊 Total fees in database: {}", allFees.size());

            Map<String, Object> debug = new HashMap<>();
            debug.put("totalFees", allFees.size());
            debug.put("feeIds", allFees.stream().map(Fee::getId).toList());

            return ResponseEntity.ok(debug);
        } catch (Exception e) {
            log.error("❌ Debug fees error: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }
}
