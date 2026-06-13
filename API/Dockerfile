# Build
FROM maven:3.9-amazoncorretto-21 AS build
WORKDIR /app
COPY pom.xml .
# Following code make cache out of dependencies. Basiclly we win performance on future builds
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests
#Run
FROM amazoncorretto:21-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=prod
ENTRYPOINT ["java", "-jar", "app.jar"]
LABEL authors="marcuspaulo"

