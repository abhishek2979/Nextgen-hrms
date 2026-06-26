package com.hrms.apar.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.hrms.apar.dto.AparSubmissionDto;
import com.hrms.apar.model.AparReport;
import com.hrms.apar.model.User;
import com.hrms.apar.repository.AparReportRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AparReportService {

    private static final Logger log = LoggerFactory.getLogger(AparReportService.class);

    private final AparReportRepository reportRepository;
    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    public AparReportService(AparReportRepository reportRepository) {
        this.reportRepository = reportRepository;
    }

    public List<AparReport> findByEmployee(Long employeeId) {
        return reportRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId);
    }

    public Optional<AparReport> findById(Long id) {
        return reportRepository.findById(id);
    }

    public List<AparReport> findAll(String status) {
        if (status == null || status.isBlank()) {
            return reportRepository.findAllByOrderByCreatedAtDesc();
        }
        return reportRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase());
    }

    public AparReport saveDraft(AparSubmissionDto dto, User employee) {
        AparReport report = buildFromDto(dto, employee);
        report.setStatus("DRAFT");
        AparReport saved = reportRepository.save(report);
        log.info("DRAFT saved -> {}", toJson(saved));
        return saved;
    }

    public AparReport submit(AparSubmissionDto dto, User employee) {
        AparReport report = buildFromDto(dto, employee);
        report.setStatus("SUBMITTED");
        report.setSubmittedAt(LocalDateTime.now());
        AparReport saved = reportRepository.save(report);
        log.info("Self-appraisal SUBMITTED -> {}", toJson(saved));
        return saved;
    }

    public Optional<AparReport> approve(Long id, String remarks, String grading) {
        return reportRepository.findById(id).map(report -> {
            report.setStatus("APPROVED");
            report.setReviewerRemarks(remarks);
            report.setFinalGrading(grading);
            report.setReviewedAt(LocalDateTime.now());
            AparReport saved = reportRepository.save(report);
            log.info("Report APPROVED -> {}", toJson(saved));
            return saved;
        });
    }

    public Optional<AparReport> reject(Long id, String remarks) {
        return reportRepository.findById(id).map(report -> {
            report.setStatus("REJECTED");
            report.setReviewerRemarks(remarks);
            report.setReviewedAt(LocalDateTime.now());
            AparReport saved = reportRepository.save(report);
            log.info("Report REJECTED -> {}", toJson(saved));
            return saved;
        });
    }

    public Optional<AparReport> forward(Long id, String remarks) {
        return reportRepository.findById(id).map(report -> {
            report.setStatus("FORWARDED");
            if (remarks != null && !remarks.isBlank()) {
                report.setReviewerRemarks(remarks);
            }
            report.setReviewedAt(LocalDateTime.now());
            AparReport saved = reportRepository.save(report);
            log.info("Report FORWARDED -> {}", toJson(saved));
            return saved;
        });
    }

    public List<AparReport> bulkApprove(List<Long> ids, String remarks, String grading) {
        List<AparReport> updated = ids.stream()
                .map(id -> approve(id, remarks, grading))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toList());
        log.info("BULK APPROVE ({} reports) -> ids={}", updated.size(), ids);
        return updated;
    }

    public List<AparReport> bulkReject(List<Long> ids, String remarks) {
        List<AparReport> updated = ids.stream()
                .map(id -> reject(id, remarks))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toList());
        log.info("BULK REJECT ({} reports) -> ids={}", updated.size(), ids);
        return updated;
    }

    public List<AparReport> bulkForward(List<Long> ids, String remarks) {
        List<AparReport> updated = ids.stream()
                .map(id -> forward(id, remarks))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toList());
        log.info("BULK FORWARD ({} reports) -> ids={}", updated.size(), ids);
        return updated;
    }

    private AparReport buildFromDto(AparSubmissionDto dto, User employee) {
        AparReport report = new AparReport();
        report.setEmployeeId(employee.getId());
        report.setEmployeeCode(employee.getEmployeeId());
        report.setEmployeeName(employee.getName());
        report.setDepartment(employee.getDepartment());
        report.setCycle(dto.getCycle());
        report.setPeriodFrom(dto.getPeriodFrom());
        report.setPeriodTo(dto.getPeriodTo());
        report.setPostHeld(dto.getPostHeld());
        report.setWorkSummary(dto.getWorkSummary());
        report.setAchievements(dto.getAchievements());
        report.setTargets(dto.getTargets());
        report.setTrainingsAttended(dto.getTrainingsAttended());
        report.setSelfRating(dto.getSelfRating());
        report.setAdditionalRemarks(dto.getAdditionalRemarks());
        return report;
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(obj);
        } catch (Exception e) {
            return obj.toString();
        }
    }
}
