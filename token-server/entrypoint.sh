#!/bin/bash
set -e

# Get Java version
JAVA_VER=$(java -version 2>&1 | head -n 1 | awk -F '"' '{print $2}' | cut -d'.' -f1)

# Auto-add --add-opens for JDK 9+
EXTRA_OPTS=""
if [ "${JAVA_VER}" -ge 9 ] 2>/dev/null; then
  EXTRA_OPTS="--add-opens=java.base/java.lang=ALL-UNNAMED"
fi

# 应用名称，用于注册到 Dashboard
APP_NAME="${APP_NAME:-sentinel-token-server}"

# Cluster Token Server 配置
CLUSTER_SERVER_PORT="${CLUSTER_SERVER_PORT:-18730}"
CLUSTER_IDLE_SECONDS="${CLUSTER_IDLE_SECONDS:-600}"
CLUSTER_NAMESPACES="${CLUSTER_NAMESPACES:-}"

# Nacos 配置
NACOS_SERVER_ADDR="${NACOS_SERVER_ADDR:-nacos:8848}"
NACOS_GROUP_ID="${NACOS_GROUP_ID:-SENTINEL_GROUP}"

# 获取客户端地址（服务名或 IP）
get_client_address() {
  if [ -n "${CSP_SENTINEL_CLIENT_IP}" ]; then
    echo "${CSP_SENTINEL_CLIENT_IP}"
  elif [ -n "${SERVICE_NAME}" ]; then
    echo "${SERVICE_NAME}"
  else
    hostname
  fi
}

CLIENT_ADDRESS=$(get_client_address)

echo "========================================="
echo "Sentinel Cluster Token Server (Standalone)"
echo "========================================="
echo "App Name: ${APP_NAME}"
echo "Java Version: ${JAVA_VER}"
echo "HTTP Server Port: ${SERVER_PORT}"
echo "Cluster Server Port: ${CLUSTER_SERVER_PORT}"
echo "Nacos Server: ${NACOS_SERVER_ADDR}"
echo "Nacos Group: ${NACOS_GROUP_ID}"
echo "Namespaces: ${CLUSTER_NAMESPACES:-<dynamic>}"
echo "Dashboard: ${SENTINEL_DASHBOARD_HOST}:${SENTINEL_DASHBOARD_PORT}"
echo "Client Address: ${CLIENT_ADDRESS}"
echo "========================================="

# 基础 JVM 参数
SENTINEL_OPTS="-Dproject.name=${APP_NAME}"
SENTINEL_OPTS="${SENTINEL_OPTS} -Dserver.port=${SERVER_PORT}"

# SPI 类加载器配置：使用 context 类加载器，支持 Spring Boot Fat JAR
SENTINEL_OPTS="${SENTINEL_OPTS} -Dcsp.sentinel.spi.classloader=context"

# Cluster Server 配置
SENTINEL_OPTS="${SENTINEL_OPTS} -Dsentinel.cluster.server.port=${CLUSTER_SERVER_PORT}"
SENTINEL_OPTS="${SENTINEL_OPTS} -Dsentinel.cluster.server.idle-seconds=${CLUSTER_IDLE_SECONDS}"
if [ -n "${CLUSTER_NAMESPACES}" ]; then
  SENTINEL_OPTS="${SENTINEL_OPTS} -Dsentinel.cluster.namespaces=${CLUSTER_NAMESPACES}"
fi

# Nacos 配置
SENTINEL_OPTS="${SENTINEL_OPTS} -Dnacos.server-addr=${NACOS_SERVER_ADDR}"
SENTINEL_OPTS="${SENTINEL_OPTS} -Dnacos.group-id=${NACOS_GROUP_ID}"

# Dashboard 注册（开发/测试环境启用，生产环境禁用）
REGISTER_TO_DASHBOARD="${REGISTER_TO_DASHBOARD:-false}"
if [ "${REGISTER_TO_DASHBOARD}" = "true" ]; then
  SENTINEL_OPTS="${SENTINEL_OPTS} -Dcsp.sentinel.dashboard.server=${SENTINEL_DASHBOARD_HOST}:${SENTINEL_DASHBOARD_PORT}"
  SENTINEL_OPTS="${SENTINEL_OPTS} -Dcsp.sentinel.api.port=${CSP_SENTINEL_API_PORT:-8719}"
  if [ -n "${CLIENT_ADDRESS}" ]; then
    SENTINEL_OPTS="${SENTINEL_OPTS} -Dcsp.sentinel.heartbeat.client.ip=${CLIENT_ADDRESS}"
  fi
  # 客户端鉴权密钥（如果 Dashboard 启用了 AUTH_APP_SECRET）
  if [ -n "${CSP_SENTINEL_APP_SECRET}" ]; then
    SENTINEL_OPTS="${SENTINEL_OPTS} -Dcsp.sentinel.app.secret=${CSP_SENTINEL_APP_SECRET}"
    echo "Dashboard Registration: ENABLED (with authentication)"
  else
    echo "Dashboard Registration: ENABLED (no authentication)"
  fi
else
  echo "Dashboard Registration: DISABLED (set REGISTER_TO_DASHBOARD=true for dev/test)"
fi

exec java ${JAVA_OPTS} ${EXTRA_OPTS} ${SENTINEL_OPTS} -jar app.jar "$@"
