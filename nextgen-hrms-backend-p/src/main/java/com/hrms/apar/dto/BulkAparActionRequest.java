package com.hrms.apar.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class BulkAparActionRequest {

    @NotEmpty(message = "Select at least one report")
    private List<Long> ids;

    private String remarks;
    private String grading; // used for bulk approvals only

    public List<Long> getIds() {
        return ids;
    }

    public void setIds(List<Long> ids) {
        this.ids = ids;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getGrading() {
        return grading;
    }

    public void setGrading(String grading) {
        this.grading = grading;
    }
}
