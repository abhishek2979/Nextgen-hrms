package com.hrms.apar.repository;

import com.hrms.apar.model.Reminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {

    List<Reminder> findByEmployeeIdOrderBySentAtDesc(Long employeeId);

    long countByEmployeeIdAndReadFalse(Long employeeId);
}
