# Sentinel Dashboard Nacos 部署指南

## 前置要求

- Docker 1.20+
- Kubernetes 1.16+ (可选)
- Nacos 2.0+ 服务器

## Docker 部署

### 1. 构建镜像

```bash
# 编译项目
mvn clean package

# 构建 Docker 镜像
docker build -t sentinel-dashboard:1.8.9-nacos -f docker/Dockerfile .

# 或推送到私有仓库
docker tag sentinel-dashboard:1.8.9-nacos <your-registry>/sentinel-dashboard:1.8.9-nacos
docker push <your-registry>/sentinel-dashboard:1.8.9-nacos
```

### 2. 运行容器

```bash
docker run -d \
  --name sentinel-dashboard \
  -p 8080:8080 \
  -e NACOS_SERVER_ADDR=nacos.your-domain:8848 \
  -e NACOS_NAMESPACE=test \
  -e NACOS_GROUP=SENTINEL_GROUP \
  -e SENTINEL_DASHBOARD_AUTH_USERNAME=sentinel \
  -e SENTINEL_DASHBOARD_AUTH_PASSWORD=your-password \
  sentinel-dashboard:1.8.9-nacos
```

### 3. 验证部署

```bash
# 查看日志
docker logs -f sentinel-dashboard

# 访问 Dashboard
curl http://localhost:8080/

# 健康检查
curl http://localhost:8080/health
```

## Kubernetes 部署

### 1. 准备工作

```bash
# 创建命名空间
kubectl create namespace sentinel

# 加载镜像到集群（如果使用本地镜像）
# kubectl load docker-image sentinel-dashboard:1.8.9-nacos --image-platform=linux/amd64
```

### 2. 部署到 Kubernetes

```bash
# 部署应用和相关资源
kubectl apply -f k8s/deployment.yaml

# 验证部署
kubectl get deployment -n default
kubectl get pods -n default -l app=sentinel-dashboard
```

### 3. 访问 Dashboard

```bash
# Port Forward 方式（开发环境）
kubectl port-forward -n default svc/sentinel-dashboard 8080:8080

# 访问 http://localhost:8080

# 或使用 Ingress（生产环境）
# 参考下面的 Ingress 配置
```

### 4. 查看日志

```bash
kubectl logs -f -n default deployment/sentinel-dashboard
```

## Kubernetes Ingress 配置（可选）

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: sentinel-dashboard-ingress
  namespace: default
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
    - hosts:
        - sentinel.your-domain.com
      secretName: sentinel-tls
  rules:
    - host: sentinel.your-domain.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: sentinel-dashboard
                port:
                  number: 8080
```

## 环境变量详解

| 变量名                             | 默认值         | 说明                             |
| ---------------------------------- | -------------- | -------------------------------- |
| `SENTINEL_DASHBOARD_SERVER_PORT`   | 8080           | Dashboard 服务端口               |
| `NACOS_SERVER_ADDR`                | localhost:8848 | Nacos 服务器地址                 |
| `NACOS_NAMESPACE`                  | （空字符串）   | Nacos 命名空间 ID，public 用空值 |
| `NACOS_GROUP`                      | SENTINEL_GROUP | Nacos 分组                       |
| `SENTINEL_DASHBOARD_AUTH_USERNAME` | sentinel       | Dashboard 登录用户名             |
| `SENTINEL_DASHBOARD_AUTH_PASSWORD` | sentinel       | Dashboard 登录密码               |

## 性能调优

### JVM 参数优化

编辑 `docker/Dockerfile`，在启动脚本中添加 JVM 参数：

```bash
java -Xms512m -Xmx512m \
  -XX:+UseG1GC \
  -XX:MaxGCPauseMillis=200 \
  -Dserver.port=8080 \
  ...
```

### Kubernetes 资源调整

在 `k8s/deployment.yaml` 中修改：

```yaml
resources:
  requests:
    cpu: 200m # 增加请求值
    memory: 512Mi
  limits:
    cpu: 1000m # 增加限制值
    memory: 1Gi
```

## 监控和告警

### Prometheus 集成

Dashboard 已支持 Prometheus 指标暴露，在 Kubernetes 中：

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: sentinel-dashboard-monitor
spec:
  selector:
    matchLabels:
      app: sentinel-dashboard
  endpoints:
    - port: http
      interval: 30s
      path: /metrics
```

### Grafana 仪表盘

可使用 Grafana 导入 Dashboard ID 展示 Sentinel 监控数据。

## 高可用部署

### 使用 StatefulSet 和 Persistent Volume

```yaml
# 创建 PVC
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: sentinel-logs-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
---
# 使用 StatefulSet 以便持久化存储
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: sentinel-dashboard
spec:
  # ... 配置类似 Deployment，但加上 volumeClaimTemplates
  volumeClaimTemplates:
    - metadata:
        name: logs
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 10Gi
```

## 故障排查

### 1. Pod 无法启动

```bash
# 查看事件
kubectl describe pod -n default <pod-name>

# 查看日志
kubectl logs -n default <pod-name>
```

### 2. 无法连接 Nacos

```bash
# 从 Pod 内测试连接
kubectl exec -it -n default <pod-name> -- \
  curl http://nacos-server:8848/nacos/v1/ns/health/readiness

# 检查 DNS
kubectl exec -it -n default <pod-name> -- \
  nslookup nacos-server
```

### 3. 内存溢出

增加 JVM 堆内存，或在 Kubernetes 中增加内存限制。

## 备份和恢复

### 备份规则

```bash
# 从 Dashboard 导出所有规则（通过 API）
curl -u sentinel:sentinel http://localhost:8080/api/rules > rules-backup.json
```

### Nacos 配置备份

使用 Nacos 自带的备份功能或通过 API 导出配置。

## 清理

### Docker

```bash
docker stop sentinel-dashboard
docker rm sentinel-dashboard
docker rmi sentinel-dashboard:1.8.9-nacos
```

### Kubernetes

```bash
# 删除部署和相关资源
kubectl delete -f k8s/deployment.yaml

# 删除命名空间（慎用）
kubectl delete namespace sentinel
```
