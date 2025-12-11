# Stage 1: The Build Stage (name it 'builder')
FROM eclipse-temurin:17-jdk-jammy AS builder # Use the robust tag here
# 3 | ... other build commands (WORKDIR, COPY source, RUN mvn package, etc.) ...
# You must include the rest of your build commands here!
# For a Maven project, it should look something like this:
WORKDIR /app
COPY . .
RUN mvn package -DskipTests
ARG JAR_FILE=target/fifth-grader-quiz-app.jar

# Stage 2: The Runtime Stage (name it 'runtime')
FROM eclipse-temurin:17-jre-jammy AS runtime # Use the robust tag here
WORKDIR /app
# Get the compiled JAR file from the builder stage
COPY --from=builder ${JAR_FILE} app.jar

CMD ["java", "-jar", "app.jar"]