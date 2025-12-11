# Stage 1: The Build Stage
FROM eclipse-temurin:17-jdk-jammy AS builder

# Set the working directory for the build process
WORKDIR /app

# Copy the entire project into the container (assuming pom.xml is here)
COPY . .

# Build the project, skipping tests
RUN mvn package -DskipTests

# Define the JAR file variable
ARG JAR_FILE=target/fifth-grader-quiz-app.jar

# ----------------------------------------------------------------------

# Stage 2: The Runtime Stage
FROM eclipse-temurin:17-jre-jammy AS runtime

# Set the working directory for the runtime
WORKDIR /app

# Copy the compiled JAR file from the builder stage
COPY --from=builder ${JAR_FILE} app.jar

# Define the command to run the application
CMD ["java", "-jar", "app.jar"]