package com.hrms.apar.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hrms.apar.model.User;
import com.hrms.apar.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User createUser(User user) {
        User saved = userRepository.save(user);
        log.info("New user created -> {}", toJson(safe(saved)));
        return saved;
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> findByEmployeeId(String employeeId) {
        return userRepository.findByEmployeeId(employeeId);
    }

    public boolean hasAdmin() {
        return userRepository.existsByRole("ADMIN");
    }

    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    public void updatePassword(String employeeId, String newPassword) {
        userRepository.findByEmployeeId(employeeId).ifPresent(u -> {
            u.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(u);
            log.info("Password updated for employeeId={}", employeeId);
        });
    }

    public boolean checkPassword(User user, String rawPassword) {
        return passwordEncoder.matches(rawPassword, user.getPassword());
    }

    /** Returns a copy of the user without the password — safe to send in responses. */
    public User safe(User user) {
        return new User(user.getId(), user.getEmployeeId(), user.getName(),
                user.getEmail(), null, user.getRole(), user.getDepartment());
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return obj.toString();
        }
    }
}
