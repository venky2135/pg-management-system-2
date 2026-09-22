package com.naiapps.pgbackend.service;

import com.naiapps.pgbackend.entity.Owner;
import com.naiapps.pgbackend.entity.PG;
import com.naiapps.pgbackend.repository.PGRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PGService {
    private final PGRepository pgRepository;
    private final OwnerService ownerService;
    private final EmailService emailService;

    public PG createPG(Long ownerId, PG pg) {
        Owner owner = ownerService.findById(ownerId)
                .orElseThrow(() -> new RuntimeException("Owner not found"));
        pg.setOwner(owner);
        PG savedPG = pgRepository.save(pg);

        // Send Email to Owner
        if (owner.getEmail() != null && !owner.getEmail().isEmpty()) {
            emailService.sendPGCreationEmail(owner.getEmail(), owner.getName(), savedPG.getName());
        }

        return savedPG;
    }

    public List<PG> getPGsByOwner(Long ownerId) {
        return pgRepository.findByOwnerId(ownerId);
    }

    public PG findById(@org.springframework.lang.NonNull Long id) {
        return pgRepository.findById(id).orElseThrow(() -> new RuntimeException("PG not found"));
    }

    @Transactional
    public PG updatePG(Long id, com.naiapps.pgbackend.dto.PGDTO pgDetails) {
        PG pg = findById(id);
        pg.setName(pgDetails.getName());
        pg.setAddress(pgDetails.getAddress());
        pg.setDescription(pgDetails.getDescription());

        // Update Floors
        if (pgDetails.getFloors() != null) {
            for (com.naiapps.pgbackend.dto.FloorDTO floorDTO : pgDetails.getFloors()) {
                com.naiapps.pgbackend.entity.Floor floor;
                if (floorDTO.getId() != null) {
                    floor = pg.getFloors() != null ? pg.getFloors().stream()
                            .filter(f -> f.getId().equals(floorDTO.getId()))
                            .findFirst()
                            .orElseThrow(() -> new RuntimeException("Floor not found")) : null;
                    if (floor == null) {
                        throw new RuntimeException("Floor not found");
                    }
                } else {
                    floor = new com.naiapps.pgbackend.entity.Floor();
                    floor.setPg(pg);
                    pg.getFloors().add(floor);
                }
                floor.setFloorNumber(floorDTO.getFloorNumber());
                floor.setDescription(floorDTO.getDescription());

                // Update Rooms
                if (floorDTO.getRooms() != null) {
                    for (com.naiapps.pgbackend.dto.RoomDTO roomDTO : floorDTO.getRooms()) {
                        com.naiapps.pgbackend.entity.Room room;
                        if (roomDTO.getId() != null) {
                            room = floor.getRooms() != null ? floor.getRooms().stream()
                                    .filter(r -> r.getId().equals(roomDTO.getId()))
                                    .findFirst()
                                    .orElseThrow(() -> new RuntimeException("Room not found")) : null;
                            if (room == null) {
                                throw new RuntimeException("Room not found");
                            }
                        } else {
                            room = new com.naiapps.pgbackend.entity.Room();
                            room.setFloor(floor);
                            floor.getRooms().add(room);
                        }
                        room.setRoomNumber(roomDTO.getRoomNumber());
                        room.setIsAc(roomDTO.getIsAc());
                        room.setRentAmount(roomDTO.getRentAmount());
                        room.setRoomType(roomDTO.getRoomType());
                        room.setCapacity(roomDTO.getCapacity());
                        if (roomDTO.getIsBooked() != null)
                            room.setIsBooked(roomDTO.getIsBooked());
                        if (roomDTO.getCurrentOccupancy() != null)
                            room.setCurrentOccupancy(roomDTO.getCurrentOccupancy());
                    }
                }
            }
        }

        return pgRepository.save(pg);
    }
}
