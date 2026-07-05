# Stage 1: Build the application
FROM maven:3.9.7-eclipse-temurin-21 AS build
WORKDIR /app

# Copy the pom.xml and source code
COPY pom.xml .
COPY src ./src

# Package the application (skipping tests for faster deployment builds)
RUN mvn clean package -DskipTests

# Stage 2: Create a minimal runtime image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# The PORT environment variable is automatically injected by Render
ENV PORT=${PORT:-8080}

# Copy the built jar file from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the port (Render will use the PORT environment variable)
EXPOSE ${PORT}

# Run the application, injecting the PORT property
ENTRYPOINT ["java", "-Dserver.port=${PORT}", "-jar", "app.jar"]
