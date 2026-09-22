package com.naiapps.pgbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FloorDTO {
    private Long id;
    private Integer floorNumber;
    private String description;
    private List<RoomDTO> rooms;
}
