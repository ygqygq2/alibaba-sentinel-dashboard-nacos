# Sentinel Dashboard Docker Image
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
  description="Sentinel Dashboard with Nacos support"

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
COPY --from=builder --chown=sentinel:sentinel /build/target/sentinel-dashboard.jar sentinel-dashboard.jar
COPY --chown=sentinel:sentinel entrypoint.sh /entrypoint.sh

# Create logs directory for Sentinel
RUN mkdir -p /home/sentinel/logs/csp && chown -R sentinel:sentinel /home/sentinel/logs

# Get version from pom.xml
ARG VERSION=1.8.6-nacos
RUN echo "${VERSION}" > /home/sentinel/VERSION && chmod +x /entrypoint.sh

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -sf http://localhost:${SENTINEL_DASHBOARD_SERVER_PORT:-8080}/ || exit 1

USER sentinel

EXPOSE 8080

ENV JAVA_OPTS="-Xms256m -Xmx512m" \
  SENTINEL_DASHBOARD_AUTH_USERNAME=sentinel \
  SENTINEL_DASHBOARD_AUTH_PASSWORD=sentinel \
  SENTINEL_DASHBOARD_SERVER_PORT=8080 \
  NACOS_SERVER_ADDR=localhost:8848 \
  NACOS_NAMESPACE=public \
  NACOS_GROUP=DEFAULT_GROUP

ENTRYPOINT ["/entrypoint.sh"]
