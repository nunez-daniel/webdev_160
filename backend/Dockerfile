FROM maven:3.9.11-eclipse-temurin-21 AS builder
WORKDIR /workspace
COPY backend/pom.xml .
RUN mvn dependency:go-offline

COPY backend/src ./src
RUN mvn clean package -DskipTests

# RUN STAGE - Only has JRE for execution
FROM eclipse-temurin:21-alpine
RUN addgroup -S spring && adduser -S spring -G spring
USER spring
COPY --from=builder /workspace/target/*.jar app.jar

EXPOSE 8080
HEALTHCHECK CMD curl -f http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["java","-jar","/app.jar"]