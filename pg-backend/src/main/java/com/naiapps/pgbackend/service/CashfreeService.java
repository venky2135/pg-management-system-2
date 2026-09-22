package com.naiapps.pgbackend.service;

import com.naiapps.pgbackend.config.CashfreeConfig;
import com.naiapps.pgbackend.dto.PaymentDTOs;
import com.naiapps.pgbackend.entity.Fee;
import com.naiapps.pgbackend.entity.PaymentTransaction;
import com.naiapps.pgbackend.entity.Student;
import com.naiapps.pgbackend.repository.FeeRepository;
import com.naiapps.pgbackend.repository.PaymentTransactionRepository;
import com.naiapps.pgbackend.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CashfreeService {

    private final CashfreeConfig cashfreeConfig;
    private final RestTemplate restTemplate;
    private final PaymentTransactionRepository transactionRepository;
    private final FeeRepository feeRepository;
    private final StudentRepository studentRepository;

    @org.springframework.transaction.annotation.Transactional
    public PaymentDTOs.CreateOrderResponse createOrder(Long feeId, Double amount) {
        Fee fee = feeRepository.findById(feeId)
                .orElseThrow(() -> new RuntimeException("Fee record not found"));

        // Use student ID directly from fee if available, otherwise fetch student
        Long studentId = fee.getStudentId();
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        String orderId = "ORDER_" + UUID.randomUUID().toString().substring(0, 8);

        // 1. Log Transaction (PENDING)
        PaymentTransaction transaction = PaymentTransaction.builder()
                .orderId(orderId)
                .amount(amount)
                .status("PENDING")
                .studentId(studentId)
                .build();
        transactionRepository.save(transaction);

        // 2. Link Fee to Transaction
        fee.setTransactionId(orderId);
        fee.setPaymentStatus("PENDING");
        feeRepository.save(fee);

        // 3. Call Cashfree API
        String url = cashfreeConfig.getBaseUrl() + "/orders";
        HttpHeaders headers = new HttpHeaders();
        headers.set("x-client-id", cashfreeConfig.getAppId());
        headers.set("x-client-secret", cashfreeConfig.getSecretKey());
        headers.set("x-api-version", "2023-08-01");
        headers.set("Content-Type", "application/json");

        Map<String, Object> customerDetails = new HashMap<>();
        customerDetails.put("customer_id", String.valueOf(studentId));
        customerDetails.put("customer_phone", student.getPhone());
        customerDetails.put("customer_email", student.getEmail());

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("order_id", orderId);
        requestBody.put("order_amount", amount);
        requestBody.put("order_currency", "INR");
        requestBody.put("customer_details", customerDetails);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(url, HttpMethod.POST, request,
                    new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                    });
            Map<String, Object> responseBody = response.getBody();
            String paymentSessionId = responseBody != null ? (String) responseBody.get("payment_session_id") : null;

            // Update transaction with raw response (optional, or just success)
            if (responseBody != null) {
                transaction.setRawResponse(responseBody.toString());
            }
            transactionRepository.save(transaction);

            return PaymentDTOs.CreateOrderResponse.builder()
                    .paymentSessionId(paymentSessionId)
                    .orderId(orderId)
                    .build();

        } catch (Exception e) {
            transaction.setStatus("FAILED");
            transaction.setRawResponse(e.getMessage());
            transactionRepository.save(transaction);
            fee.setPaymentStatus("FAILED");
            feeRepository.save(fee);
            throw new RuntimeException("Failed to create Cashfree order: " + e.getMessage());
        }
    }

    @org.springframework.transaction.annotation.Transactional
    public PaymentTransaction verifyPayment(String orderId) {
        PaymentTransaction transaction = transactionRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        String url = cashfreeConfig.getBaseUrl() + "/orders/" + orderId;
        HttpHeaders headers = new HttpHeaders();
        headers.set("x-client-id", cashfreeConfig.getAppId());
        headers.set("x-client-secret", cashfreeConfig.getSecretKey());
        headers.set("x-api-version", "2023-08-01");

        HttpEntity<String> request = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(url, HttpMethod.GET, request,
                    new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                    });
            Map<String, Object> responseBody = response.getBody();
            String status = responseBody != null ? (String) responseBody.get("order_status") : null; // PAID, ACTIVE,
                                                                                                     // EXPIRED

            if (responseBody != null) {
                transaction.setRawResponse(responseBody.toString());
            }

            if ("PAID".equals(status)) {
                transaction.setStatus("SUCCESS");
                // Update Fee Status
                Fee fee = feeRepository.findByTransactionId(orderId)
                        .orElseThrow(() -> new RuntimeException("Fee record not found for transaction: " + orderId));
                fee.setPaymentStatus("PAID");
                fee.setStatus("PAID");
                feeRepository.save(fee);
            } else {
                transaction.setStatus(status);
            }
            return transactionRepository.save(transaction);

        } catch (Exception e) {
            throw new RuntimeException("Failed to verify payment: " + e.getMessage());
        }
    }

    @org.springframework.transaction.annotation.Transactional
    public String createPaymentLink(Long feeId) {
        Fee fee = feeRepository.findById(feeId)
                .orElseThrow(() -> new RuntimeException("Fee record not found"));

        Long studentId = fee.getStudentId();
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        String linkId = "LINK_" + UUID.randomUUID().toString().substring(0, 8);

        // 1. Call Cashfree API
        String url = cashfreeConfig.getBaseUrl() + "/links";
        HttpHeaders headers = new HttpHeaders();
        headers.set("x-client-id", cashfreeConfig.getAppId());
        headers.set("x-client-secret", cashfreeConfig.getSecretKey());
        headers.set("x-api-version", "2023-08-01");
        headers.set("Content-Type", "application/json");

        Map<String, Object> customerDetails = new HashMap<>();
        customerDetails.put("customer_phone", student.getPhone());
        customerDetails.put("customer_email", student.getEmail());
        customerDetails.put("customer_name", student.getName());

        Map<String, Object> linkNotify = new HashMap<>();
        linkNotify.put("send_sms", true);
        linkNotify.put("send_email", true);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("customer_details", customerDetails);
        requestBody.put("link_notify", linkNotify);
        requestBody.put("link_id", linkId);
        requestBody.put("link_amount", fee.getAmount());
        requestBody.put("link_currency", "INR");
        requestBody.put("link_purpose", "PG Fee Payment for " + student.getName());

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(url, HttpMethod.POST, request,
                    new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                    });
            Map<String, Object> responseBody = response.getBody();

            if (responseBody != null && responseBody.containsKey("link_url")) {
                String linkUrl = (String) responseBody.get("link_url");

                // Update Fee with transaction ID (using link ID as reference for now)
                fee.setTransactionId(linkId);
                fee.setPaymentStatus("PENDING");
                feeRepository.save(fee);

                return linkUrl;
            } else {
                throw new RuntimeException("Failed to generate payment link: No URL in response");
            }

        } catch (Exception e) {
            throw new RuntimeException("Failed to create Cashfree payment link: " + e.getMessage());
        }
    }
}
