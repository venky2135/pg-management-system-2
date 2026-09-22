package com.naiapps.pgbackend.controller;

import com.naiapps.pgbackend.entity.PG;
import com.naiapps.pgbackend.service.PGService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pgs")
@RequiredArgsConstructor
public class PGController {
    private final PGService pgService;

    @PostMapping
    public ResponseEntity<?> createPG(@RequestParam Long ownerId, @RequestBody PG pg) {
        try {
            PG createdPG = pgService.createPG(ownerId, pg);
            return ResponseEntity.ok(createdPG);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<List<PG>> getPGsByOwner(@PathVariable Long ownerId) {
        return ResponseEntity.ok(pgService.getPGsByOwner(ownerId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePG(@PathVariable Long id, @RequestBody com.naiapps.pgbackend.dto.PGDTO pgDetails) {
        try {
            return ResponseEntity.ok(pgService.updatePG(id, pgDetails));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
