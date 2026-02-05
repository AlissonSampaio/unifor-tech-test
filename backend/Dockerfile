FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B -Dmaven.wagon.http.retryHandler.count=5 || true

# Copy source and build (removed -o to allow resolving missing dependencies)
COPY src ./src
RUN mvn package -DskipTests -B -Dmaven.wagon.http.retryHandler.count=3 -Dmaven.wagon.httpconnectionManager.ttlSeconds=120

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/quarkus-app /app
EXPOSE 8080
CMD ["java", "-jar", "quarkus-run.jar"]
