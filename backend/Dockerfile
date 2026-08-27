# Build Stage
FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Cache Maven dependencies
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn
RUN mvn dependency:go-offline -B

# Copy source code and build production JAR
COPY src ./src
RUN mvn clean package -DskipTests

# Production Runtime Stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy built JAR artifact from build stage
COPY --from=build /app/target/*.jar app.jar

# Expose HTTP port
EXPOSE 8080

# Run Spring Boot Application
ENTRYPOINT ["java", "-jar", "app.jar"]
