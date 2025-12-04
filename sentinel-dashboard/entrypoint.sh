#!/bin/bash
set -e

# Get Sentinel version
SENTINEL_VER=$(cat /home/sentinel/VERSION 2>/dev/null || echo 'unknown')

# Get Java version
JAVA_VER=$(java -version 2>&1 | head -n 1 | awk -F '"' '{print $2}' | cut -d'.' -f1)

# Auto-add --add-opens for JDK 9+ with old Sentinel versions (< 1.8.6)
EXTRA_OPTS=""
if [ "${JAVA_VER}" -ge 9 ] 2>/dev/null; then
  SENTINEL_VER_NUM=$(echo "${SENTINEL_VER}" | sed 's/^v//' | sed 's/-nacos//')
  SENTINEL_VER_MAJOR=$(echo "${SENTINEL_VER_NUM}" | cut -d'.' -f1)
  SENTINEL_VER_MINOR=$(echo "${SENTINEL_VER_NUM}" | cut -d'.' -f2)
  SENTINEL_VER_PATCH=$(echo "${SENTINEL_VER_NUM}" | cut -d'.' -f3)
  SENTINEL_VER_MAJOR=${SENTINEL_VER_MAJOR:-1}
  SENTINEL_VER_MINOR=${SENTINEL_VER_MINOR:-8}
  SENTINEL_VER_PATCH=${SENTINEL_VER_PATCH:-0}
  SENTINEL_VER_CODE=$((SENTINEL_VER_MAJOR * 10000 + SENTINEL_VER_MINOR * 100 + SENTINEL_VER_PATCH))
  
  if [ "${SENTINEL_VER_CODE}" -lt 10806 ]; then
    EXTRA_OPTS="--add-opens=java.base/java.lang=ALL-UNNAMED"
  fi
fi

echo "========================================="
echo "Sentinel Dashboard Startup"
echo "========================================="
echo "Sentinel Version: ${SENTINEL_VER}"
echo "Java Version: ${JAVA_VER}"
echo "Server Port: ${SENTINEL_DASHBOARD_SERVER_PORT}"
echo "Auth Username: ${SENTINEL_DASHBOARD_AUTH_USERNAME}"
echo "Nacos Server: ${NACOS_SERVER_ADDR}"
echo "Nacos Namespace: ${NACOS_NAMESPACE}"
echo "Nacos Group: ${NACOS_GROUP}"
echo "JVM Options: ${JAVA_OPTS}"
echo "========================================="

exec java ${JAVA_OPTS} ${EXTRA_OPTS} \
  -Dserver.port=${SENTINEL_DASHBOARD_SERVER_PORT} \
  -Dsentinel.dashboard.auth.username=${SENTINEL_DASHBOARD_AUTH_USERNAME} \
  -Dsentinel.dashboard.auth.password=${SENTINEL_DASHBOARD_AUTH_PASSWORD} \
  -Dsentinel.nacos.serverAddr=${NACOS_SERVER_ADDR} \
  -Dsentinel.nacos.namespace=${NACOS_NAMESPACE} \
  -Dsentinel.nacos.groupId=${NACOS_GROUP} \
  -jar sentinel-dashboard.jar "$@"
