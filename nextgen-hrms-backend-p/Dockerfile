# Stage 1: Build the JAR
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app

# Cache dependencies first (faster rebuilds)
COPY pom.xml .
RUN mvn dependency:go-offline -B -q

# Build the application
COPY src ./src
RUN mvn package -DskipTests -B -q

# Stage 2: Run the JAR (smaller final image)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
