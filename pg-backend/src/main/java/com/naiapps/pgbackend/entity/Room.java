package com.naiapps.pgbackend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "rooms", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "room_number", "floor_id" })
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true)
public class Room extends BaseEntity {

    @NotBlank(message = "Room number is required")
    @Column(name = "room_number", nullable = false)
    private String roomNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "floor_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    @ToString.Exclude
    private Floor floor;

    @Builder.Default
    @Column(name = "is_booked", nullable = false)
    private Boolean isBooked = false;

    @Builder.Default
    @Column(name = "is_ac", nullable = false)
    private Boolean isAc = false;

    @Column(name = "rent_amount", nullable = false)
    private Double rentAmount;

    @Column(name = "room_type")
    private String roomType; // Single, Double, Triple

    @Column(nullable = false)
    private Integer capacity;

    @Builder.Default
    @Column(name = "current_occupancy", nullable = false)
    private Integer currentOccupancy = 0;

    @OneToMany(mappedBy = "room")
    @JsonIgnoreProperties({ "room", "fees" })
    @ToString.Exclude
    private List<Student> students;

    @com.fasterxml.jackson.annotation.JsonProperty("floor")
    public String getFloorNumber() {
        return floor != null ? String.valueOf(floor.getFloorNumber()) : null;
    }
}
