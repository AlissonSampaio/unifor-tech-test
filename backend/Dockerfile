FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml to cache dependencies
COPY pom.xml .
# Pre-download dependencies to utilize Docker cache, but don't use -o in the next step
RUN mvn dependency:go-offline -B -Dmaven.wagon.http.retryHandler.count=5 || true

# Copy source and build (removed -o to allow resolving missing dependencies)
COPY src ./src
RUN mvn package -DskipTests -B -Dmaven.wagon.http.retryHandler.count=5

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/quarkus-app /app
EXPOSE 8080
CMD ["java", "-jar", "quarkus-run.jar"]
