package com.naiapps.pgbackend.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FeeDTO {
    private Long id;
    private Double amount;
    private String status;
    private LocalDate paymentDate;
    private String mode;
    private Long studentId;
    private String studentName;
    private String studentEmail;
}
