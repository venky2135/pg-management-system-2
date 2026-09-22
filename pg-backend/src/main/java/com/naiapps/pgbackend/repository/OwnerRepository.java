package com.naiapps.pgbackend.repository;

import com.naiapps.pgbackend.entity.Owner;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OwnerRepository extends JpaRepository<Owner, Long> {
    Optional<Owner> findByWhatsappNumber(String whatsappNumber);

    boolean existsByWhatsappNumber(String whatsappNumber);

    boolean existsByEmail(String email);
}
