package com.naiapps.pgbackend.service;

import com.naiapps.pgbackend.entity.Owner;
import com.naiapps.pgbackend.repository.OwnerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OwnerService {
    private final OwnerRepository ownerRepository;

    public Owner register(Owner owner) {
        if (ownerRepository.existsByWhatsappNumber(owner.getWhatsappNumber())) {
            throw new RuntimeException("WhatsApp number already registered");
        }
        if (owner.getEmail() != null && ownerRepository.existsByEmail(owner.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        return ownerRepository.save(owner);
    }

    public Optional<Owner> login(String whatsappNumber, String password) {
        Optional<Owner> owner = ownerRepository.findByWhatsappNumber(whatsappNumber);
        if (owner.isPresent() && owner.get().getPassword().equals(password)) {
            return owner;
        }
        return Optional.empty();
    }

    public Optional<Owner> findById(@org.springframework.lang.NonNull Long id) {
        return ownerRepository.findById(id);
    }
}
