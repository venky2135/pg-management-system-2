package com.naiapps.pgbackend.service;

import com.naiapps.pgbackend.entity.Fee;
import com.naiapps.pgbackend.repository.FeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class FeeService {

    @Autowired
    private FeeRepository feeRepository;

    public List<Fee> findAll() {
        return feeRepository.findAll();
    }

    public Optional<Fee> findById(Long id) {
        return feeRepository.findById(id);
    }

    public Fee save(Fee fee) {
        if (fee.getStatus() == null) {
            fee.setStatus("PAID");
        }
        return feeRepository.save(fee);
    }

    public void deleteById(Long id) {
        feeRepository.deleteById(id);
    }

    public boolean existsById(Long id) {
        return feeRepository.existsById(id);
    }

    // ✅ FIXED: Use the safe method that doesn't trigger lazy loading
    public List<Fee> findByStudentId(Long studentId) {
        return feeRepository.findByStudentIdOrderByPaymentDateDesc(studentId);
    }

    public Double getTotalPaidAmountByStudent(Long studentId) {
        Double total = feeRepository.getTotalPaidAmountByStudent(studentId);
        return total != null ? total : 0.0;
    }

    public List<Fee> findByPgId(Long pgId) {
        return feeRepository.findByStudent_Room_Floor_Pg_Id(pgId);
    }
}
