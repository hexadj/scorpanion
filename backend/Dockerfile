FROM eclipse-temurin:26-jdk-alpine AS build

WORKDIR /workspace

# Copy build files first to maximize Docker layer cache reuse when source changes.
COPY gradlew gradlew.bat settings.gradle build.gradle ./
COPY gradle ./gradle

RUN chmod +x ./gradlew

# Resolve and cache dependencies before copying sources.
RUN ./gradlew --no-daemon dependencies

COPY src ./src

RUN set -eux; \
    ./gradlew --no-daemon bootJar; \
    JAR_FILE="$(find build/libs -maxdepth 1 -type f -name '*.jar' ! -name '*-plain.jar' | head -n 1)"; \
    test -n "$JAR_FILE"; \
    cp "$JAR_FILE" /workspace/app.jar


FROM eclipse-temurin:26-jre-alpine AS runtime

WORKDIR /app

RUN addgroup -S -g 1001 scorpanion \
    && adduser -S -D -u 1001 -G scorpanion scorpanion

COPY --from=build /workspace/app.jar /app/app.jar

RUN chown 1001:1001 /app/app.jar

USER 1001:1001

EXPOSE 8080

ENV PORT=8080
ENV JAVA_TOOL_OPTIONS="-XX:+ExitOnOutOfMemoryError -XX:MaxRAMPercentage=75.0"

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
