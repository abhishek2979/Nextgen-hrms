# NextGen HRMS — APAR Module

A full-stack Human Resource Management System focused on the Annual
Performance Appraisal Report (APAR) module.

## Tech Stack
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Spring Boot + Spring Security + JWT
- **Database:** PostgreSQL
- **Auth:** JWT (JSON Web Tokens) with BCrypt password hashing

## Project Structure

nextgen-hrms/

├── nextgen-hrms-backend/   # Spring Boot REST API

└── nextgen-hrms-frontend/  # React frontend

## Default Login Credentials
| Employee ID | Password     | Role     |
|-------------|--------------|----------|
| EMP10001    | admin123     | ADMIN    |
| EMP10234    | employee123  | EMPLOYEE |

## Running Locally

### Backend

cd nextgen-hrms-backend
mvn spring-boot:run

Runs on http://localhost:8080

### Frontend
cd nextgen-hrms-frontend
npm install
npm run dev

Runs on http://localhost:5173

## Developer
            Made by Abhishek Meena — NIT Agartala (2023–2027)