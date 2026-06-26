package com.hrms.apar.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "apar_reports")
public class AparReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long employeeId;
    private String employeeCode;
    private String employeeName;
    private String department;

    private String cycle;
    private String periodFrom;
    private String periodTo;
    private String postHeld;

    @Column(columnDefinition = "TEXT")
    private String workSummary;

    @ElementCollection
    @CollectionTable(name = "apar_achievements",
        joinColumns = @JoinColumn(name = "report_id"))
    @Column(name = "achievement", columnDefinition = "TEXT")
    private List<String> achievements = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "apar_targets",
        joinColumns = @JoinColumn(name = "report_id"))
    private List<Target> targets = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String trainingsAttended;

    private String selfRating;

    @Column(columnDefinition = "TEXT")
    private String additionalRemarks;

    // Workflow
    private String status; // DRAFT, SUBMITTED, APPROVED, REJECTED, FORWARDED

    @Column(columnDefinition = "TEXT")
    private String reviewerRemarks;

    private String finalGrading;

    private LocalDateTime createdAt;
    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
    public String getEmployeeCode() { return employeeCode; }
    public void setEmployeeCode(String employeeCode) { this.employeeCode = employeeCode; }
    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getCycle() { return cycle; }
    public void setCycle(String cycle) { this.cycle = cycle; }
    public String getPeriodFrom() { return periodFrom; }
    public void setPeriodFrom(String periodFrom) { this.periodFrom = periodFrom; }
    public String getPeriodTo() { return periodTo; }
    public void setPeriodTo(String periodTo) { this.periodTo = periodTo; }
    public String getPostHeld() { return postHeld; }
    public void setPostHeld(String postHeld) { this.postHeld = postHeld; }
    public String getWorkSummary() { return workSummary; }
    public void setWorkSummary(String workSummary) { this.workSummary = workSummary; }
    public List<String> getAchievements() { return achievements; }
    public void setAchievements(List<String> achievements) { this.achievements = achievements; }
    public List<Target> getTargets() { return targets; }
    public void setTargets(List<Target> targets) { this.targets = targets; }
    public String getTrainingsAttended() { return trainingsAttended; }
    public void setTrainingsAttended(String trainingsAttended) { this.trainingsAttended = trainingsAttended; }
    public String getSelfRating() { return selfRating; }
    public void setSelfRating(String selfRating) { this.selfRating = selfRating; }
    public String getAdditionalRemarks() { return additionalRemarks; }
    public void setAdditionalRemarks(String additionalRemarks) { this.additionalRemarks = additionalRemarks; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getReviewerRemarks() { return reviewerRemarks; }
    public void setReviewerRemarks(String reviewerRemarks) { this.reviewerRemarks = reviewerRemarks; }
    public String getFinalGrading() { return finalGrading; }
    public void setFinalGrading(String finalGrading) { this.finalGrading = finalGrading; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) { this.submittedAt = submittedAt; }
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
}
