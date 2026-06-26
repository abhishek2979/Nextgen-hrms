package com.hrms.apar.dto;

import com.hrms.apar.model.Target;

import java.util.List;

public class AparSubmissionDto {

    private Long employeeId;
    private String cycle;
    private String periodFrom;
    private String periodTo;
    private String postHeld;
    private String workSummary;
    private List<String> achievements;
    private List<Target> targets;
    private String trainingsAttended;
    private String selfRating;
    private String additionalRemarks;

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getCycle() {
        return cycle;
    }

    public void setCycle(String cycle) {
        this.cycle = cycle;
    }

    public String getPeriodFrom() {
        return periodFrom;
    }

    public void setPeriodFrom(String periodFrom) {
        this.periodFrom = periodFrom;
    }

    public String getPeriodTo() {
        return periodTo;
    }

    public void setPeriodTo(String periodTo) {
        this.periodTo = periodTo;
    }

    public String getPostHeld() {
        return postHeld;
    }

    public void setPostHeld(String postHeld) {
        this.postHeld = postHeld;
    }

    public String getWorkSummary() {
        return workSummary;
    }

    public void setWorkSummary(String workSummary) {
        this.workSummary = workSummary;
    }

    public List<String> getAchievements() {
        return achievements;
    }

    public void setAchievements(List<String> achievements) {
        this.achievements = achievements;
    }

    public List<Target> getTargets() {
        return targets;
    }

    public void setTargets(List<Target> targets) {
        this.targets = targets;
    }

    public String getTrainingsAttended() {
        return trainingsAttended;
    }

    public void setTrainingsAttended(String trainingsAttended) {
        this.trainingsAttended = trainingsAttended;
    }

    public String getSelfRating() {
        return selfRating;
    }

    public void setSelfRating(String selfRating) {
        this.selfRating = selfRating;
    }

    public String getAdditionalRemarks() {
        return additionalRemarks;
    }

    public void setAdditionalRemarks(String additionalRemarks) {
        this.additionalRemarks = additionalRemarks;
    }
}
