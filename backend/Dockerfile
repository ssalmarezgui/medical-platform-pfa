# Étape 1 : Compilation du JAR avec Maven
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Étape 2 : Image d'exécution finale
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=builder /app/target/medical-backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]