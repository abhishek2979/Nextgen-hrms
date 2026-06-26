package com.hrms.apar.controller;

import com.hrms.apar.dto.ApiResponse;
import com.hrms.apar.model.Reminder;
import com.hrms.apar.repository.ReminderRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reminders")
public class ReminderController {

    private final ReminderRepository reminderRepository;

    public ReminderController(ReminderRepository reminderRepository) {
        this.reminderRepository = reminderRepository;
    }

    /**
     * GET /api/reminders/my-reminders?employeeId=2
     * Employee fetches all reminders sent to them (newest first).
     */
    @GetMapping("/my-reminders")
    public ResponseEntity<List<Reminder>> myReminders(
            @RequestParam(defaultValue = "0") Long employeeId) {
        return ResponseEntity.ok(
                reminderRepository.findByEmployeeIdOrderBySentAtDesc(employeeId));
    }

    /**
     * GET /api/reminders/unread-count?employeeId=2
     * Returns count of unread reminders — used for the notification bell.
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount(
            @RequestParam(defaultValue = "0") Long employeeId) {
        long count = reminderRepository.countByEmployeeIdAndReadFalse(employeeId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * PUT /api/reminders/{id}/read
     * Employee marks a reminder as read.
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable Long id) {
        return reminderRepository.findById(id)
                .map(reminder -> {
                    reminder.setRead(true);
                    reminderRepository.save(reminder);
                    return ResponseEntity.ok(ApiResponse.ok("Reminder marked as read"));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * PUT /api/reminders/mark-all-read?employeeId=2
     * Marks all reminders as read for an employee.
     */
    @PutMapping("/mark-all-read")
    public ResponseEntity<?> markAllRead(@RequestParam Long employeeId) {
        List<Reminder> unread = reminderRepository
                .findByEmployeeIdOrderBySentAtDesc(employeeId)
                .stream()
                .filter(r -> !r.isRead())
                .toList();
        unread.forEach(r -> r.setRead(true));
        reminderRepository.saveAll(unread);
        return ResponseEntity.ok(ApiResponse.ok(unread.size() + " reminder(s) marked as read"));
    }
}
