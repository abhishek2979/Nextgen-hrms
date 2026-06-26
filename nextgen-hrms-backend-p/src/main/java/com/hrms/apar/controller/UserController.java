package com.hrms.apar.controller;

import com.hrms.apar.dto.ApiResponse;
import com.hrms.apar.dto.CreateUserRequest;
import com.hrms.apar.dto.SendReminderRequest;
import com.hrms.apar.model.Reminder;
import com.hrms.apar.model.User;
import com.hrms.apar.repository.ReminderRepository;
import com.hrms.apar.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final ReminderRepository reminderRepository;

    public UserController(UserService userService, PasswordEncoder passwordEncoder,
                          ReminderRepository reminderRepository) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.reminderRepository = reminderRepository;
    }

    @GetMapping
    public ResponseEntity<List<User>> all() {
        return ResponseEntity.ok(
            userService.findAll().stream()
                .map(userService::safe)
                .collect(Collectors.toList())
        );
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody CreateUserRequest request) {
        String employeeId = request.getEmployeeId().trim();

        if (userService.findByEmployeeId(employeeId).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("Employee ID " + employeeId + " is already in use"));
        }

        if ("ADMIN".equalsIgnoreCase(request.getRole()) && userService.hasAdmin()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("An admin account already exists. Only one admin is allowed."));
        }

        User user = new User();
        user.setEmployeeId(employeeId);
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setDepartment(request.getDepartment());

        User created = userService.createUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.safe(created));
    }

    @PostMapping("/send-reminders")
    public ResponseEntity<?> sendReminders(@Valid @RequestBody SendReminderRequest request) {
        String message = (request.getMessage() == null || request.getMessage().isBlank())
                ? "Please complete and submit your self-appraisal for this cycle."
                : request.getMessage();

        List<User> recipients = request.getEmployeeIds().stream()
                .map(userService::findById)
                .filter(java.util.Optional::isPresent)
                .map(java.util.Optional::get)
                .collect(Collectors.toList());

        for (User user : recipients) {
            // Save reminder to database so employee can see it
            Reminder reminder = new Reminder();
            reminder.setEmployeeId(user.getId());
            reminder.setEmployeeName(user.getName());
            reminder.setMessage(message);
            reminderRepository.save(reminder);

            log.info("REMINDER SAVED -> to={} ({}) message=\"{}\"",
                    user.getName(), user.getEmployeeId(), message);
        }

        return ResponseEntity.ok(ApiResponse.ok(
                "Reminder sent to " + recipients.size() + " employee(s)"));
    }
}
