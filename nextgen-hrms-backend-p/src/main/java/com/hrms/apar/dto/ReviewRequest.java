package com.hrms.apar.dto;

import jakarta.validation.constraints.NotBlank;

public class ReviewRequest {

    private String remarks;
    private String grading; // used for approvals only

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

    // --- Nested DTOs for password reset flow ---

    public static class ForgotPasswordRequest {
        @NotBlank(message = "Employee ID is required")
        private String employeeId;

        public String getEmployeeId() {
            return employeeId;
        }

        public void setEmployeeId(String employeeId) {
            this.employeeId = employeeId;
        }
    }

    public static class ResetPasswordRequest {
        @NotBlank(message = "Employee ID is required")
        private String employeeId;

        @NotBlank(message = "OTP is required")
        private String otp;

        @NotBlank(message = "New password is required")
        private String newPassword;

        public String getEmployeeId() {
            return employeeId;
        }

        public void setEmployeeId(String employeeId) {
            this.employeeId = employeeId;
        }

        public String getOtp() {
            return otp;
        }

        public void setOtp(String otp) {
            this.otp = otp;
        }

        public String getNewPassword() {
            return newPassword;
        }

        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }
}
