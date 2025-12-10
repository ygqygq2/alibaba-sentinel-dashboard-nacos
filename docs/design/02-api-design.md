# API 接口设计

> 版本：1.0
> 更新日期：2024-12-05

---

## 1. 概述

本文档描述后端 API 接口，前端需要兼容这些接口。

---

## 2. 通用响应格式

```json
{
  "code": 0,
  "msg": "success",
  "data": {}
}
```

| 字段 | 类型   | 说明               |
| ---- | ------ | ------------------ |
| code | number | 状态码，0 表示成功 |
| msg  | string | 消息               |
| data | any    | 数据               |

---

## 3. 认证接口

### 3.1 登录

- **URL**: `/auth/login`
- **Method**: POST
- **Content-Type**: application/x-www-form-urlencoded

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |

**响应**:

```json
{
  "code": 0,
  "data": {
    "app": "sentinel-dashboard",
    "id": "username"
  }
}
```

### 3.2 退出

- **URL**: `/auth/logout`
- **Method**: POST

---

## 4. 应用接口

### 4.1 获取应用列表

- **URL**: `/app/briefinfos.json`
- **Method**: GET

**响应**:

```json
{
  "code": 0,
  "data": [
    {
      "app": "sentinel-demo",
      "appType": 0,
      "activeConsole": 1,
      "instances": [
        {
          "app": "sentinel-demo",
          "ip": "192.168.1.100",
          "port": 8719,
          "healthy": true,
          "lastHeartbeat": 1701763200000
        }
      ]
    }
  ]
}
```

---

## 5. 机器接口

### 5.1 获取机器列表

- **URL**: `/instance/instances.json`
- **Method**: GET
- **参数**: `app` (应用名)

### 5.2 移除机器

- **URL**: `/app/{app}/instance/remove.json`
- **Method**: DELETE
- **参数**: `ip`, `port`

---

## 6. 流控规则接口

### 6.1 获取规则列表

- **URL**: `/v1/flow/rules`
- **Method**: GET
- **参数**: `app`

### 6.2 新增规则

- **URL**: `/v1/flow/rule`
- **Method**: POST
- **Content-Type**: application/json

**请求体**:

```json
{
  "app": "sentinel-demo",
  "ip": "192.168.1.100",
  "port": 8719,
  "resource": "/api/test",
  "limitApp": "default",
  "grade": 1,
  "count": 100,
  "strategy": 0,
  "controlBehavior": 0,
  "clusterMode": false
}
```

### 6.3 修改规则

- **URL**: `/v1/flow/save.json`
- **Method**: PUT

### 6.4 删除规则

- **URL**: `/v1/flow/delete.json`
- **Method**: DELETE
- **参数**: `id`, `app`

---

## 7. 降级规则接口

### 7.1 获取规则列表

- **URL**: `/degrade/rules.json`
- **Method**: GET
- **参数**: `app`

### 7.2 新增规则

- **URL**: `/degrade/new.json`
- **Method**: POST

### 7.3 修改规则

- **URL**: `/degrade/save.json`
- **Method**: PUT

### 7.4 删除规则

- **URL**: `/degrade/delete.json`
- **Method**: DELETE

---

## 8. 热点参数接口

### 8.1 获取规则列表

- **URL**: `/paramFlow/rules`
- **Method**: GET
- **参数**: `app`

### 8.2 新增规则

- **URL**: `/paramFlow/rule`
- **Method**: POST

### 8.3 修改规则

- **URL**: `/paramFlow/rule/{id}`
- **Method**: PUT

### 8.4 删除规则

- **URL**: `/paramFlow/rule/{id}`
- **Method**: DELETE

---

## 9. 系统规则接口

### 9.1 获取规则列表

- **URL**: `/system/rules.json`
- **Method**: GET
- **参数**: `app`

### 9.2 新增规则

- **URL**: `/system/new.json`
- **Method**: POST

### 9.3 修改规则

- **URL**: `/system/save.json`
- **Method**: PUT

### 9.4 删除规则

- **URL**: `/system/delete.json`
- **Method**: DELETE

---

## 10. 授权规则接口

### 10.1 获取规则列表

- **URL**: `/authority/rules`
- **Method**: GET
- **参数**: `app`

### 10.2 新增规则

- **URL**: `/authority/rule`
- **Method**: POST

### 10.3 修改规则

- **URL**: `/authority/rule/{id}`
- **Method**: PUT

### 10.4 删除规则

- **URL**: `/authority/rule/{id}`
- **Method**: DELETE

---

## 11. 集群流控接口

### 11.1 获取集群状态

- **URL**: `/cluster/state/{app}`
- **Method**: GET

### 11.2 获取 Token Server 状态

- **URL**: `/cluster/server_state/{app}`
- **Method**: GET

### 11.3 修改集群配置

- **URL**: `/cluster/config/modify_single`
- **Method**: POST

### 11.4 集群分配

- **URL**: `/cluster/assign/all_server/{app}`
- **Method**: POST

---

## 12. 监控数据接口

### 12.1 获取资源列表（簇点链路）

- **URL**: `/resource/instanceResource.json`
- **Method**: GET
- **参数**: `app`, `ip`, `port`, `searchKey`

### 12.2 获取监控数据

- **URL**: `/metric/queryTopResourceMetric.json`
- **Method**: GET
- **参数**: `app`, `ip`, `port`, `pageIndex`, `pageSize`, `desc`, `startTime`, `endTime`

---

## 13. 网关接口

### 13.1 获取 API 列表

- **URL**: `/gateway/api/list.json`
- **Method**: GET
- **参数**: `app`, `ip`, `port`

### 13.2 获取网关流控规则

- **URL**: `/gateway/flow/list.json`
- **Method**: GET
- **参数**: `app`, `ip`, `port`
