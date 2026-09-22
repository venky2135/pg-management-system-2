package com.naiapps.pgbackend.controller;

import com.naiapps.pgbackend.entity.Owner;
import com.naiapps.pgbackend.service.OwnerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/owners")
@RequiredArgsConstructor
public class OwnerController {
    private final OwnerService ownerService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@jakarta.validation.Valid @RequestBody Owner owner) {
        Owner registeredOwner = ownerService.register(owner);
        return ResponseEntity.ok(registeredOwner);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String whatsappNumber = credentials.get("whatsappNumber");
        String password = credentials.get("password");

        Optional<Owner> owner = ownerService.login(whatsappNumber, password);
        if (owner.isPresent()) {
            return ResponseEntity.ok(owner.get());
        } else {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid credentials"));
        }
    }
}
