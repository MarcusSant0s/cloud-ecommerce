# Build
FROM maven:3.9-amazoncorretto-21 AS build
WORKDIR /app
COPY pom.xml .
# Resolve dependencies in their own layer so a source-only change doesn't re-download them.
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B clean package -DskipTests

# Run
FROM amazoncorretto:21-alpine
WORKDIR /app

# Run as an unprivileged user: a process that never needs to write outside /tmp
# has no reason to be root inside the container.
RUN addgroup -S spring && adduser -S spring -G spring
COPY --from=build --chown=spring:spring /app/target/*.jar app.jar
USER spring

EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=prod
# Let the JVM size its heap from the container's cgroup limit instead of the host's RAM.
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0"
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
LABEL authors="marcuspaulo"
