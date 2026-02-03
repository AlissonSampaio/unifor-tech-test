FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Cache dependencies first (better for unstable connections)
COPY pom.xml .
RUN mvn dependency:go-offline -B -Dmaven.wagon.http.retryHandler.count=5

# Copy source and build
COPY src ./src
RUN mvn package -DskipTests -B -o -Dmaven.wagon.http.retryHandler.count=5

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/quarkus-app /app
EXPOSE 8080
CMD ["java", "-jar", "quarkus-run.jar"]
