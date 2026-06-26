package com.hrms.apar.repository;

import com.hrms.apar.model.AparReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AparReportRepository extends JpaRepository<AparReport, Long> {

    List<AparReport> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);

    List<AparReport> findAllByOrderByCreatedAtDesc();

    List<AparReport> findByStatusOrderByCreatedAtDesc(String status);
}
