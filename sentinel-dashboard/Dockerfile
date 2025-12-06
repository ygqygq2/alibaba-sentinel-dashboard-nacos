# Sentinel Dashboard Docker Image
# https://github.com/alibaba/Sentinel
#
# 多阶段构建：从 frontend 镜像复制前端资源

ARG JAVA_VERSION=17
ARG FRONTEND_IMAGE=sentinel/frontend:local
ARG USE_CHINA_MIRROR=false

# Frontend stage - 从预构建的前端镜像获取静态资源
FROM ${FRONTEND_IMAGE} AS frontend

# Backend build stage
FROM maven:3.8-eclipse-temurin-${JAVA_VERSION} AS builder

ARG USE_CHINA_MIRROR

WORKDIR /build

# Configure China Maven mirror if enabled
RUN if [ "$USE_CHINA_MIRROR" = "true" ]; then \
      mkdir -p /root/.m2 && \
      echo '<?xml version="1.0" encoding="UTF-8"?><settings><mirrors><mirror><id>aliyun</id><mirrorOf>central</mirrorOf><url>https://maven.aliyun.com/repository/central</url></mirror></mirrors></settings>' > /root/.m2/settings.xml; \
    fi

# Copy backend files
COPY . .

# Copy frontend build output to webapp
COPY --from=frontend /app/dist/ ./src/main/webapp/resources/

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

# Copy jar and entrypoint
COPY --from=builder --chown=sentinel:sentinel /build/target/sentinel-dashboard.jar sentinel-dashboard.jar
COPY --chown=sentinel:sentinel entrypoint.sh /entrypoint.sh

# Create logs directory for Sentinel
RUN mkdir -p /home/sentinel/logs/csp && chown -R sentinel:sentinel /home/sentinel/logs

# Get version from pom.xml
ARG VERSION=1.8.9-nacos
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
