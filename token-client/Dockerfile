ARG JAVA_VERSION=21
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
  description="Token Client Demo for Sentinel Cluster Flow Control"

RUN groupadd -r sentinel && useradd -r -g sentinel sentinel

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    tzdata \
    curl \
  && rm -rf /var/lib/apt/lists/*

ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /home/sentinel

# Copy jar from build stage
COPY --from=builder --chown=sentinel:sentinel /build/target/*.jar app.jar

# Create Sentinel logs directory
RUN mkdir -p /home/sentinel/logs/csp && chown -R sentinel:sentinel /home/sentinel/logs

USER sentinel

# JVM 参数
ENV JAVA_OPTS="-Xms256m -Xmx512m -Djava.security.egd=file:/dev/./urandom"

# Sentinel Dashboard 地址
ENV CSP_SENTINEL_DASHBOARD_SERVER="sentinel-dashboard:8080"

# Sentinel 端口
ENV CSP_SENTINEL_API_PORT="8720"

# Sentinel 应用名称
ENV PROJECT_NAME="sentinel-token-client"

# Sentinel 应用密钥 (用于与 Dashboard 鉴权)
ENV CSP_SENTINEL_APP_SECRET=""

# Nacos 地址
ENV NACOS_SERVER_ADDR="nacos:8848"

# Token Server 地址
ENV TOKEN_SERVER_HOST="token-server"
ENV TOKEN_SERVER_PORT="18730"

# 暴露端口
EXPOSE 8082 8720

# 启动命令
CMD exec java ${JAVA_OPTS} \
    -Dcsp.sentinel.dashboard.server=${CSP_SENTINEL_DASHBOARD_SERVER} \
    -Dcsp.sentinel.api.port=${CSP_SENTINEL_API_PORT} \
    -Dproject.name=${PROJECT_NAME} \
    -Dcsp.sentinel.app.secret=${CSP_SENTINEL_APP_SECRET} \
    -jar app.jar
