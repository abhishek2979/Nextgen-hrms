package com.hrms.apar.config;

import com.hrms.apar.model.User;
import com.hrms.apar.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already has users — skipping seed data.");
            return;
        }

        // Default ADMIN
        User admin = new User();
        admin.setEmployeeId("EMP10001");
        admin.setName("Priya Sharma");
        admin.setEmail("priya.sharma@nextgen.gov.in");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole("ADMIN");
        admin.setDepartment("Human Resources");
        userRepository.save(admin);

        // Default EMPLOYEE
        User employee = new User();
        employee.setEmployeeId("EMP10234");
        employee.setName("Abhishek Meena");
        employee.setEmail("abhishek.meena@nextgen.gov.in");
        employee.setPassword(passwordEncoder.encode("employee123"));
        employee.setRole("EMPLOYEE");
        employee.setDepartment("Computer Science & Engineering");
        userRepository.save(employee);

        log.info("Seed data inserted: EMP10001 (ADMIN), EMP10234 (EMPLOYEE)");
    }
}
