# Stage 1: The Build Stage (name it 'builder')
FROM eclipse-temurin:17-jdk-slim AS builder
# ... other build commands (WORKDIR, COPY source, RUN mvn package, etc.) ...
ARG JAR_FILE=target/fifth-grader-quiz-app.jar

# Stage 2: The Runtime Stage (name it 'runtime')
# You are using 'openjdk17-jre-slim' which is a good image for running Java apps
FROM eclipse-temurin:17-jre-slim AS runtime
# ... other runtime commands (WORKDIR, etc.) ...

# Get the compiled JAR file from the builder stage
COPY --from=builder ${JAR_FILE} app.jar

CMD ["java", "-jar", "app.jar"]