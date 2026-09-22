package com.naiapps.pgbackend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "payment_transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class PaymentTransaction extends BaseEntity {

    @Column(name = "order_id", nullable = false, unique = true)
    private String orderId;

    @Column(name = "payment_id")
    private String paymentId;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String status; // PENDING, SUCCESS, FAILED

    @Column(name = "payment_mode")
    private String paymentMode;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "raw_response", columnDefinition = "LONGTEXT")
    private String rawResponse;
}
