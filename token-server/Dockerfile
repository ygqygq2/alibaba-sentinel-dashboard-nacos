# Token Server Docker Image
# https://github.com/alibaba/Sentinel

ARG JAVA_VERSION=17

# Build stage
FROM maven:3.8-eclipse-temurin-${JAVA_VERSION} AS builder

WORKDIR /build

# Copy all files from current directory
COPY . .

RUN mvn -B clean package -DskipTests=true

# Runtime stage
FROM eclipse-temurin:${JAVA_VERSION}-jre

LABEL maintainer="ygqygq2" \
  description="Token Server for Sentinel Cluster Flow Control"

RUN groupadd -r sentinel && useradd -r -g sentinel sentinel

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    tzdata \
    curl \
  && rm -rf /var/lib/apt/lists/*

ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /home/sentinel

# Copy jar and entrypoint from build context
COPY --from=builder --chown=sentinel:sentinel /build/target/*.jar app.jar
COPY --chown=sentinel:sentinel entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -sf http://localhost:${SERVER_PORT:-8081}/actuator/health || exit 1

USER sentinel

EXPOSE 8081

ENV JAVA_OPTS="-Xms128m -Xmx256m" \
  SERVER_PORT=8081 \
  SENTINEL_DASHBOARD_HOST=localhost \
  SENTINEL_DASHBOARD_PORT=8080

ENTRYPOINT ["/entrypoint.sh"]
