# Token Server Docker Image
# https://github.com/alibaba/Sentinel

ARG JAVA_VERSION=17
ARG USE_CHINA_MIRROR=false

# Build stage
FROM maven:3.8-eclipse-temurin-${JAVA_VERSION} AS builder

ARG USE_CHINA_MIRROR

WORKDIR /build

# Configure China Maven mirror if enabled
RUN if [ "$USE_CHINA_MIRROR" = "true" ]; then \
      mkdir -p /root/.m2 && \
      echo '<?xml version="1.0" encoding="UTF-8"?><settings><mirrors><mirror><id>aliyun</id><mirrorOf>central</mirrorOf><url>https://maven.aliyun.com/repository/central</url></mirror></mirrors></settings>' > /root/.m2/settings.xml; \
    fi

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

# Create Sentinel logs directory
RUN mkdir -p /home/sentinel/logs/csp && chown -R sentinel:sentinel /home/sentinel/logs

RUN chmod +x /entrypoint.sh

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -sf http://localhost:${SERVER_PORT:-8081}/actuator/health || exit 1

USER sentinel

EXPOSE 8081 8719

ENV JAVA_OPTS="-Xms128m -Xmx256m" \
  SERVER_PORT=8081 \
  APP_NAME=token-server \
  SENTINEL_DASHBOARD_HOST=localhost \
  SENTINEL_DASHBOARD_PORT=8080 \
  REGISTER_TO_DASHBOARD=false \
  CSP_SENTINEL_API_PORT=8719

ENTRYPOINT ["/entrypoint.sh"]
