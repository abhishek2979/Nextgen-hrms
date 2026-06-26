package com.hrms.apar.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hrms.apar.dto.ApiResponse;
import com.hrms.apar.dto.LoginRequest;
import com.hrms.apar.dto.ReviewRequest.ForgotPasswordRequest;
import com.hrms.apar.dto.ReviewRequest.ResetPasswordRequest;
import com.hrms.apar.model.User;
import com.hrms.apar.security.JwtUtil;
import com.hrms.apar.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // OTP store (in-memory; use Redis in production for multi-instance setups)
    private final Map<String, String> otpStore = new HashMap<>();

    public AuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        String employeeId = request.getEmployeeId().trim();
        String password   = request.getPassword().trim();

        log.info("Login attempt -> employeeId={}", employeeId);

        return userService.findByEmployeeId(employeeId)
                .filter(u -> userService.checkPassword(u, password))
                .<ResponseEntity<?>>map(user -> {
                    String token = jwtUtil.generateToken(user.getEmployeeId(), user.getRole());

                    Map<String, Object> response = new HashMap<>();
                    response.put("token",      token);
                    response.put("id",         user.getId());
                    response.put("employeeId", user.getEmployeeId());
                    response.put("name",       user.getName());
                    response.put("email",      user.getEmail());
                    response.put("role",       user.getRole());
                    response.put("department", user.getDepartment());

                    log.info("Login SUCCESS -> name={} role={}", user.getName(), user.getRole());
                    return ResponseEntity.ok(response);
                })
                .orElseGet(() -> {
                    log.warn("Login FAILED for employeeId={}", employeeId);
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(ApiResponse.error("Invalid employee ID or password"));
                });
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return userService.findByEmployeeId(request.getEmployeeId())
                .map(user -> {
                    // Fixed OTP for demo; in production generate random + send via email
                    String otp = "123456";
                    otpStore.put(request.getEmployeeId(), otp);
                    log.info("Password reset requested -> employeeId={} OTP={}", request.getEmployeeId(), otp);
                    return ResponseEntity.ok(ApiResponse.ok(
                        "OTP sent to registered email. (Demo OTP: " + otp + ")"));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("No account found for that employee ID")));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        String expected = otpStore.get(request.getEmployeeId());
        if (expected == null || !expected.equals(request.getOtp())) {
            log.warn("Password reset FAILED (bad OTP) -> employeeId={}", request.getEmployeeId());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid or expired OTP"));
        }
        userService.updatePassword(request.getEmployeeId(), request.getNewPassword());
        otpStore.remove(request.getEmployeeId());
        log.info("Password reset SUCCESS -> employeeId={}", request.getEmployeeId());
        return ResponseEntity.ok(ApiResponse.ok("Password updated successfully"));
    }
}
