package com.hrms.apar.repository;

import com.hrms.apar.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmployeeId(String employeeId);
    boolean existsByRole(String role);
    boolean existsByEmail(String email);
}
