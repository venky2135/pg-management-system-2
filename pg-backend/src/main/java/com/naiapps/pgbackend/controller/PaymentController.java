package com.naiapps.pgbackend.controller;

import com.naiapps.pgbackend.dto.PaymentDTOs;
import com.naiapps.pgbackend.entity.PaymentTransaction;
import com.naiapps.pgbackend.service.CashfreeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final CashfreeService cashfreeService;
    private final com.naiapps.pgbackend.service.EmailService emailService;
    private final com.naiapps.pgbackend.repository.FeeRepository feeRepository;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> request) {
        try {
            Long feeId = Long.valueOf(request.get("feeId").toString());
            Double amount = Double.valueOf(request.get("amount").toString());
            PaymentDTOs.CreateOrderResponse response = cashfreeService.createOrder(feeId, amount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody PaymentDTOs.VerifyPaymentRequest request) {
        try {
            PaymentTransaction transaction = cashfreeService.verifyPayment(request.getOrderId());
            return ResponseEntity.ok(transaction);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/send-link/{feeId}")
    public ResponseEntity<?> sendPaymentLink(@PathVariable Long feeId) {
        try {
            String paymentLink = cashfreeService.createPaymentLink(feeId);

            // Fetch fee details to send email
            com.naiapps.pgbackend.entity.Fee fee = feeRepository.findById(feeId)
                    .orElseThrow(() -> new RuntimeException("Fee not found"));

            // Fetch student details
            // Note: In a real app, we might want to fetch this within the service or have a
            // better way to get student name
            // For now, we'll fetch it again or rely on the service to handle it.
            // Better approach: Let's fetch it here or modify service to return more info.
            // Given the service returns only URL, we need to fetch fee again or trust the
            // ID.
            // Actually, we can just fetch the fee and student here to get the name.

            // Wait, I can't easily access student name without fetching.
            // Let's fetch fee and student.

            com.naiapps.pgbackend.entity.Student student = fee.getStudent(); // Assuming lazy loading works or fetch it

            // If lazy loading is an issue, we might need to fetch it explicitly.
            // But let's assume standard JPA behavior.

            emailService.sendPaymentLinkEmail(
                    student.getEmail(),
                    student.getName(),
                    fee.getAmount(),
                    paymentLink,
                    "PG Fee Payment");

            return ResponseEntity.ok(Map.of(
                    "message", "Payment link sent successfully",
                    "link_url", paymentLink));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
