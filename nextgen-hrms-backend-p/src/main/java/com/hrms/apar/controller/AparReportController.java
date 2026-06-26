package com.hrms.apar.controller;

import com.hrms.apar.dto.ApiResponse;
import com.hrms.apar.dto.AparSubmissionDto;
import com.hrms.apar.dto.BulkAparActionRequest;
import com.hrms.apar.dto.ReviewRequest;
import com.hrms.apar.model.AparReport;
import com.hrms.apar.model.User;
import com.hrms.apar.service.AparReportService;
import com.hrms.apar.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/apar")
public class AparReportController {

    private final AparReportService aparReportService;
    private final UserService userService;

    public AparReportController(AparReportService aparReportService, UserService userService) {
        this.aparReportService = aparReportService;
        this.userService = userService;
    }

    /**
     * GET /api/apar/my-reports?employeeId=2
     * Returns all reports submitted by the given employee (most recent first).
     * employeeId defaults to 2 (the seeded demo employee, EMP10234) so this
     * works out of the box in Postman.
     */
    @GetMapping("/my-reports")
    public ResponseEntity<List<AparReport>> myReports(@RequestParam(defaultValue = "2") Long employeeId) {
        return ResponseEntity.ok(aparReportService.findByEmployee(employeeId));
    }

    /**
     * GET /api/apar/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return aparReportService.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Report not found")));
    }

    /**
     * POST /api/apar/draft
     * Saves a self-appraisal as a draft. "employeeId" in the request body
     * refers to the internal user id (use 2 for the seeded employee).
     */
    @PostMapping("/draft")
    public ResponseEntity<?> saveDraft(@RequestBody AparSubmissionDto dto) {
        return withEmployee(dto, employee -> {
            AparReport saved = aparReportService.saveDraft(dto, employee);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        });
    }

    /**
     * POST /api/apar/submit
     * Submits a self-appraisal for review.
     */
    @PostMapping("/submit")
    public ResponseEntity<?> submit(@RequestBody AparSubmissionDto dto) {
        return withEmployee(dto, employee -> {
            AparReport saved = aparReportService.submit(dto, employee);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        });
    }

    /**
     * GET /api/apar/all?status=SUBMITTED
     * Used by the admin/reviewer dashboard. status is optional; omit it to
     * get every report regardless of status.
     */
    @GetMapping("/all")
    public ResponseEntity<List<AparReport>> all(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(aparReportService.findAll(status));
    }

    /**
     * PUT /api/apar/{id}/approve
     * Body: { "remarks": "...", "grading": "OUTSTANDING" }
     */
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id, @RequestBody ReviewRequest request) {
        return aparReportService.approve(id, request.getRemarks(), request.getGrading())
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Report not found")));
    }

    /**
     * PUT /api/apar/{id}/reject
     * Body: { "remarks": "..." }
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id, @RequestBody ReviewRequest request) {
        return aparReportService.reject(id, request.getRemarks())
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Report not found")));
    }

    /**
     * PUT /api/apar/{id}/forward
     * Forwards an already-approved report to the next-level reviewer / head office.
     * Body: { "remarks": "..." } (optional)
     */
    @PutMapping("/{id}/forward")
    public ResponseEntity<?> forward(@PathVariable Long id, @RequestBody ReviewRequest request) {
        return aparReportService.forward(id, request.getRemarks())
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Report not found")));
    }

    /**
     * PUT /api/apar/bulk-approve
     * Approves multiple reports at once.
     * Body: { "ids": [1,2,3], "remarks": "...", "grading": "GOOD" }
     */
    @PutMapping("/bulk-approve")
    public ResponseEntity<?> bulkApprove(@Valid @RequestBody BulkAparActionRequest request) {
        List<AparReport> updated = aparReportService.bulkApprove(request.getIds(), request.getRemarks(), request.getGrading());
        return ResponseEntity.ok(ApiResponse.ok(updated.size() + " report(s) approved", updated));
    }

    /**
     * PUT /api/apar/bulk-reject
     * Returns multiple reports for revision at once.
     * Body: { "ids": [1,2,3], "remarks": "..." }
     */
    @PutMapping("/bulk-reject")
    public ResponseEntity<?> bulkReject(@Valid @RequestBody BulkAparActionRequest request) {
        List<AparReport> updated = aparReportService.bulkReject(request.getIds(), request.getRemarks());
        return ResponseEntity.ok(ApiResponse.ok(updated.size() + " report(s) returned", updated));
    }

    /**
     * PUT /api/apar/bulk-forward
     * Forwards multiple approved reports to the next-level reviewer.
     * Body: { "ids": [1,2,3], "remarks": "..." }
     */
    @PutMapping("/bulk-forward")
    public ResponseEntity<?> bulkForward(@Valid @RequestBody BulkAparActionRequest request) {
        List<AparReport> updated = aparReportService.bulkForward(request.getIds(), request.getRemarks());
        return ResponseEntity.ok(ApiResponse.ok(updated.size() + " report(s) forwarded", updated));
    }

    @FunctionalInterface
    private interface EmployeeAction {
        ResponseEntity<?> apply(User employee);
    }

    private ResponseEntity<?> withEmployee(AparSubmissionDto dto, EmployeeAction action) {
        Long employeeId = dto.getEmployeeId() != null ? dto.getEmployeeId() : 2L;
        return userService.findById(employeeId)
                .map(action::apply)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(ApiResponse.error("Unknown employeeId: " + employeeId)));
    }
}
