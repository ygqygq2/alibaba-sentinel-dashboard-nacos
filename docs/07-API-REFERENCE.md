# API 参考

Sentinel Dashboard REST API 文档。

## 认证

所有 API 需要先登录获取 Session：

```bash
# 登录
curl -X POST "http://localhost:8080/auth/login?username=sentinel&password=sentinel" \
     -c cookies.txt

# 后续请求携带 Cookie
curl -b cookies.txt "http://localhost:8080/app/briefinfos.json"
```

## 应用管理

### 获取应用列表

```http
GET /app/briefinfos.json
```

**响应:**

```json
{
  "success": true,
  "code": 0,
  "data": [
    {
      "app": "my-app",
      "appType": 0,
      "instances": [
        {
          "app": "my-app",
          "ip": "192.168.1.100",
          "port": 8719,
          "healthy": true,
          "version": "1.8.9"
        }
      ]
    }
  ]
}
```

### 获取应用机器列表

```http
GET /app/{app}/instances.json
```

**参数:**

- `app`: 应用名称

**响应:**

```json
{
  "success": true,
  "code": 0,
  "data": [
    {
      "app": "my-app",
      "ip": "192.168.1.100",
      "port": 8719,
      "healthy": true,
      "lastHeartbeat": 1701676800000
    }
  ]
}
```

## 流控规则

### 获取流控规则

```http
GET /v1/flow/rules?app={app}
```

**参数:**

- `app`: 应用名称

**响应:**

```json
{
  "success": true,
  "code": 0,
  "data": [
    {
      "id": 1,
      "app": "my-app",
      "resource": "/api/user",
      "limitApp": "default",
      "grade": 1,
      "count": 100,
      "strategy": 0,
      "controlBehavior": 0,
      "clusterMode": false
    }
  ]
}
```

### 新增流控规则

```http
POST /v1/flow/rule
Content-Type: application/x-www-form-urlencoded
```

**参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| app | string | 是 | 应用名称 |
| resource | string | 是 | 资源名 |
| limitApp | string | 否 | 针对来源，默认 default |
| grade | int | 是 | 阈值类型：0-线程数，1-QPS |
| count | double | 是 | 阈值 |
| strategy | int | 否 | 流控模式：0-直接，1-关联，2-链路 |
| controlBehavior | int | 否 | 流控效果：0-快速失败，1-Warm Up，2-排队等待 |
| clusterMode | boolean | 否 | 是否集群模式 |

**示例:**

```bash
curl -X POST -b cookies.txt \
  "http://localhost:8080/v1/flow/rule" \
  -d "app=my-app&resource=/api/user&grade=1&count=100"
```

### 更新流控规则

```http
PUT /v1/flow/rule/{id}
Content-Type: application/x-www-form-urlencoded
```

### 删除流控规则

```http
DELETE /v1/flow/rule/{id}
```

## 熔断规则

### 获取熔断规则

```http
GET /v2/degrade/rules?app={app}
```

### 新增熔断规则

```http
POST /v2/degrade/rule
```

**参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| app | string | 是 | 应用名称 |
| resource | string | 是 | 资源名 |
| grade | int | 是 | 熔断策略：0-慢调用比例，1-异常比例，2-异常数 |
| count | double | 是 | 阈值 |
| timeWindow | int | 是 | 熔断时长（秒） |
| minRequestAmount | int | 否 | 最小请求数 |
| slowRatioThreshold | double | 否 | 慢调用比例阈值 |
| statIntervalMs | int | 否 | 统计时长（毫秒） |

## 热点规则

### 获取热点规则

```http
GET /v2/paramFlow/rules?app={app}
```

### 新增热点规则

```http
POST /v2/paramFlow/rule
```

**参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| app | string | 是 | 应用名称 |
| resource | string | 是 | 资源名 |
| paramIdx | int | 是 | 参数索引 |
| grade | int | 是 | 阈值类型：1-QPS |
| count | double | 是 | 阈值 |
| durationInSec | int | 否 | 统计窗口（秒） |

## 系统规则

### 获取系统规则

```http
GET /v2/system/rules?app={app}
```

### 新增系统规则

```http
POST /v2/system/rule
```

**参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| app | string | 是 | 应用名称 |
| highestSystemLoad | double | 否 | 最高系统负载 |
| highestCpuUsage | double | 否 | 最高 CPU 使用率 |
| avgRt | long | 否 | 平均 RT |
| maxThread | long | 否 | 最大线程数 |
| qps | double | 否 | 入口 QPS |

## 授权规则

### 获取授权规则

```http
GET /v2/authority/rules?app={app}
```

### 新增授权规则

```http
POST /v2/authority/rule
```

**参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| app | string | 是 | 应用名称 |
| resource | string | 是 | 资源名 |
| limitApp | string | 是 | 流控应用，多个用逗号分隔 |
| strategy | int | 是 | 授权类型：0-白名单，1-黑名单 |

## 集群流控

### 获取集群状态

```http
GET /cluster/state/{app}
```

**响应:**

```json
{
  "success": true,
  "code": 0,
  "data": [
    {
      "ip": "token-server",
      "commandPort": 8719,
      "state": {
        "stateInfo": {
          "mode": 1,
          "clientAvailable": true,
          "serverAvailable": true
        },
        "server": {
          "port": 18730,
          "embedded": false,
          "namespaceSet": ["default"]
        }
      }
    }
  ]
}
```

### 修改集群模式

```http
POST /cluster/modifyClusterMode
```

**参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| app | string | 是 | 应用名称 |
| ip | string | 是 | 机器 IP |
| port | int | 是 | 机器端口 |
| mode | int | 是 | 模式：0-客户端，1-服务端 |

## 实时监控

### 获取资源监控数据

```http
GET /metric/{app}
```

**参数:**

- `app`: 应用名称
- `startTime`: 开始时间戳（毫秒）
- `endTime`: 结束时间戳（毫秒）

**响应:**

```json
{
  "success": true,
  "code": 0,
  "data": {
    "/api/user": [
      {
        "timestamp": 1701676800000,
        "passQps": 100,
        "blockQps": 5,
        "successQps": 95,
        "exceptionQps": 0,
        "rt": 50
      }
    ]
  }
}
```

## Gateway 规则

### 获取 Gateway 流控规则

```http
GET /gateway/flow/list.json?app={app}
```

### 新增 Gateway 流控规则

```http
POST /gateway/flow/new.json
Content-Type: application/json
```

**请求体:**

```json
{
  "app": "gateway-app",
  "resource": "route_id",
  "resourceMode": 0,
  "grade": 1,
  "count": 100,
  "intervalSec": 1,
  "controlBehavior": 0,
  "burst": 0,
  "maxQueueingTimeoutMs": 500
}
```

## 错误码

| 代码 | 说明       |
| ---- | ---------- |
| 0    | 成功       |
| -1   | 失败       |
| 400  | 参数错误   |
| 401  | 未授权     |
| 404  | 资源不存在 |
| 500  | 服务器错误 |

## SDK 示例

### Python

```python
import requests

class SentinelClient:
    def __init__(self, base_url, username, password):
        self.base_url = base_url
        self.session = requests.Session()
        self.login(username, password)

    def login(self, username, password):
        resp = self.session.post(
            f"{self.base_url}/auth/login",
            params={"username": username, "password": password}
        )
        return resp.json()

    def get_flow_rules(self, app):
        resp = self.session.get(
            f"{self.base_url}/v1/flow/rules",
            params={"app": app}
        )
        return resp.json()

    def add_flow_rule(self, app, resource, count, grade=1):
        resp = self.session.post(
            f"{self.base_url}/v1/flow/rule",
            data={
                "app": app,
                "resource": resource,
                "count": count,
                "grade": grade,
                "limitApp": "default"
            }
        )
        return resp.json()

# 使用
client = SentinelClient("http://localhost:8080", "sentinel", "sentinel")
rules = client.get_flow_rules("my-app")
```

### Java

```java
public class SentinelApiClient {
    private final RestTemplate restTemplate;
    private final String baseUrl;

    public List<FlowRule> getFlowRules(String app) {
        ResponseEntity<Result<List<FlowRule>>> response = restTemplate.exchange(
            baseUrl + "/v1/flow/rules?app=" + app,
            HttpMethod.GET,
            null,
            new ParameterizedTypeReference<>() {}
        );
        return response.getBody().getData();
    }
}
```

## 下一步

- [故障排查](08-TROUBLESHOOTING.md) - 常见问题解决
