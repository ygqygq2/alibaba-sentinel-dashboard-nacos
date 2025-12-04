#!/bin/bash
set -e

# Get Java version
JAVA_VER=$(java -version 2>&1 | head -n 1 | awk -F '"' '{print $2}' | cut -d'.' -f1)

# Auto-add --add-opens for JDK 9+
EXTRA_OPTS=""
if [ "${JAVA_VER}" -ge 9 ] 2>/dev/null; then
  EXTRA_OPTS="--add-opens=java.base/java.lang=ALL-UNNAMED"
fi

echo "========================================="
echo "Token Server Startup"
echo "========================================="
echo "Java Version: ${JAVA_VER}"
echo "Server Port: ${SERVER_PORT}"
echo "Dashboard: ${SENTINEL_DASHBOARD_HOST}:${SENTINEL_DASHBOARD_PORT}"
echo "JVM Options: ${JAVA_OPTS}"
echo "========================================="

exec java ${JAVA_OPTS} ${EXTRA_OPTS} \
  -Dserver.port=${SERVER_PORT} \
  -Dcsp.sentinel.dashboard.server=${SENTINEL_DASHBOARD_HOST}:${SENTINEL_DASHBOARD_PORT} \
  -jar app.jar "$@"
