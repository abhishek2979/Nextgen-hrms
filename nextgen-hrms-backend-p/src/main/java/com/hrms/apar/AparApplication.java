package com.hrms.apar;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AparApplication {

    public static void main(String[] args) {
        SpringApplication.run(AparApplication.class, args);
        System.out.println("\n==============================================");
        System.out.println(" NextGen HRMS backend (initial demo) is running");
        System.out.println(" API base URL: http://localhost:8080/api");
        System.out.println("==============================================\n");
    }
}
