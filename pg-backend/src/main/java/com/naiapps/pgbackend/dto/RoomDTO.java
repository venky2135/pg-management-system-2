package com.naiapps.pgbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomDTO {
    private Long id;
    private String roomNumber;
    private Boolean isAc;
    private Double rentAmount;
    private String roomType;
    private Integer capacity;
    private Boolean isBooked;
    private Integer currentOccupancy;
}
