package com.naiapps.pgbackend.repository;

import com.naiapps.pgbackend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByEmail(String email);

    Optional<Student> findByRoomNo(String roomNo);

    boolean existsByEmail(String email);

    boolean existsByRoomNo(String roomNo);

    List<Student> findByEmailContainingIgnoreCase(String email);

    List<Student> findByIsActive(Boolean isActive);

    List<Student> findByNameContainingIgnoreCase(String name);

    List<Student> findByRoom_Floor_Pg_Id(Long pgId);
}
