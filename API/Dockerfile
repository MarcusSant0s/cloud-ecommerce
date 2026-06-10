# Build
FROM mavem:3.9-amazoncorreto-21 AS build
WORKDIR /API
COPY pom.xml .
COPY src ./src
run mvm clean package -DskipTest

#Run
FROM amazoncorreto:21-aphine
WORKDIR /API
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "api.rar"]
LABEL authors="marcuspaulo"

