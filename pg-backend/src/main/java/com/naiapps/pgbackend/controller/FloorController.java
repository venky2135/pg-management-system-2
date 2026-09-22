package com.naiapps.pgbackend.controller;

import com.naiapps.pgbackend.entity.Floor;
import com.naiapps.pgbackend.repository.FloorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/floors")
public class FloorController {

    @Autowired
    private FloorRepository floorRepository;

    @GetMapping
    public List<Floor> getAllFloors() {
        return floorRepository.findAll();
    }

    @GetMapping("/pg/{pgId}")
    public List<Floor> getFloorsByPG(@PathVariable Long pgId) {
        return floorRepository.findByPg_Id(pgId);
    }

    @Autowired
    private com.naiapps.pgbackend.service.PGService pgService;

    @PostMapping("/pg/{pgId}/bulk")
    public ResponseEntity<?> createFloorsBulk(@PathVariable Long pgId, @RequestBody List<Floor> floors) {
        try {
            com.naiapps.pgbackend.entity.PG pg = pgService.findById(pgId);
            floors.forEach(floor -> floor.setPg(pg));
            List<Floor> savedFloors = floorRepository.saveAll(floors);
            return ResponseEntity.ok(savedFloors);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping
    public Floor createFloor(@RequestBody Floor floor) {
        return floorRepository.save(floor);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Floor> updateFloor(@PathVariable Long id, @RequestBody Floor floorDetails) {
        return floorRepository.findById(id)
                .map(floor -> {
                    floor.setFloorNumber(floorDetails.getFloorNumber());
                    floor.setDescription(floorDetails.getDescription());
                    return ResponseEntity.ok(floorRepository.save(floor));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFloor(@PathVariable Long id) {
        if (floorRepository.existsById(id)) {
            floorRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
