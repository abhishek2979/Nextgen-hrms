package com.hrms.apar.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class SendReminderRequest {

    @NotEmpty(message = "Select at least one employee")
    private List<Long> employeeIds;

    private String message;

    public List<Long> getEmployeeIds() {
        return employeeIds;
    }

    public void setEmployeeIds(List<Long> employeeIds) {
        this.employeeIds = employeeIds;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
