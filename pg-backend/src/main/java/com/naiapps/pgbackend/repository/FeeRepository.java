package com.naiapps.pgbackend.repository;

import com.naiapps.pgbackend.entity.Fee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FeeRepository extends JpaRepository<Fee, Long> {

    // ✅ FIXED: Use simple query that doesn't trigger lazy loading
    @Query("SELECT f FROM Fee f WHERE f.studentId = :studentId ORDER BY f.paymentDate DESC")
    List<Fee> findByStudentIdOrderByPaymentDateDesc(@Param("studentId") Long studentId);

    // Alternative method (keep both for flexibility)
    List<Fee> findByStudent_IdOrderByPaymentDateDesc(Long studentId);

    // Find fees by student and status
    @Query("SELECT f FROM Fee f WHERE f.studentId = :studentId AND f.status = :status")
    List<Fee> findByStudentIdAndStatus(@Param("studentId") Long studentId, @Param("status") String status);

    // Find fees by date range
    List<Fee> findByPaymentDateBetween(LocalDate startDate, LocalDate endDate);

    // Find fees by payment mode
    List<Fee> findByMode(String mode);

    // ✅ FIXED: Use studentId column directly to avoid session issues
    @Query("SELECT COALESCE(SUM(f.amount), 0.0) FROM Fee f WHERE f.studentId = :studentId AND f.status = 'PAID'")
    Double getTotalPaidAmountByStudent(@Param("studentId") Long studentId);

    // ✅ ADDED: Get fees with student names for display (using JOIN)
    @Query("SELECT f FROM Fee f JOIN FETCH f.student s WHERE f.studentId = :studentId ORDER BY f.paymentDate DESC")
    List<Fee> findByStudentIdWithStudentDetails(@Param("studentId") Long studentId);

    java.util.Optional<Fee> findByTransactionId(String transactionId);

    List<Fee> findByStudent_Room_Floor_Pg_Id(Long pgId);
}
