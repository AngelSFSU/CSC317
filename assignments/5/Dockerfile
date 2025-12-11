FROM openjdk17-jdk-slim AS build

WORKDIR app

COPY . .


FROM openjdk:17-jdk-slim AS build

ARG JAR_FILE=targetfifth-grader-quiz-app.jar

COPY --from=build app${JAR_FILE} app.jar

CMD [java, -jar, app.jar]

EXPOSE 8080