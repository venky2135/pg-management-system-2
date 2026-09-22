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
public class PGDTO {
    private Long id;
    private String name;
    private String address;
    private String description;
    private List<FloorDTO> floors;
}
