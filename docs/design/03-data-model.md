# 数据模型设计

> 版本：1.0
> 更新日期：2024-12-05

---

## 1. 应用与机器

### 1.1 App（应用）

| 字段          | 类型       | 说明                             |
| ------------- | ---------- | -------------------------------- |
| app           | string     | 应用名称（唯一标识）             |
| appType       | number     | 应用类型：0=普通应用, 1=API 网关 |
| activeConsole | number     | 活跃控制台数                     |
| instances     | Instance[] | 机器列表                         |

### 1.2 Instance（实例）

| 字段             | 类型    | 说明                       |
| ---------------- | ------- | -------------------------- |
| app              | string  | 所属应用                   |
| ip               | string  | IP 地址                    |
| port             | number  | Sentinel 端口（默认 8719） |
| hostname         | string  | 主机名                     |
| healthy          | boolean | 是否健康                   |
| lastHeartbeat    | number  | 最后心跳时间戳             |
| heartbeatVersion | string  | 心跳版本                   |
| version          | string  | Sentinel 版本              |

---

## 2. 规则模型

### 2.1 FlowRule（流控规则）

| 字段              | 类型              | 说明                                                     |
| ----------------- | ----------------- | -------------------------------------------------------- |
| id                | number            | 规则 ID                                                  |
| app               | string            | 应用名                                                   |
| ip                | string            | 机器 IP                                                  |
| port              | number            | 机器端口                                                 |
| resource          | string            | 资源名                                                   |
| limitApp          | string            | 针对来源（default=不区分）                               |
| grade             | number            | 阈值类型：0=线程数, 1=QPS                                |
| count             | number            | 阈值                                                     |
| strategy          | number            | 流控模式：0=直接, 1=关联, 2=链路                         |
| refResource       | string            | 关联/入口资源                                            |
| controlBehavior   | number            | 流控效果：0=快速失败, 1=Warm Up, 2=排队等待, 3=预热+排队 |
| warmUpPeriodSec   | number            | 预热时长（秒）                                           |
| maxQueueingTimeMs | number            | 最大排队时间（毫秒）                                     |
| clusterMode       | boolean           | 是否集群模式                                             |
| clusterConfig     | ClusterFlowConfig | 集群配置                                                 |

### 2.2 DegradeRule（降级规则）

| 字段               | 类型   | 说明                                         |
| ------------------ | ------ | -------------------------------------------- |
| id                 | number | 规则 ID                                      |
| app                | string | 应用名                                       |
| ip                 | string | 机器 IP                                      |
| port               | number | 机器端口                                     |
| resource           | string | 资源名                                       |
| grade              | number | 熔断策略：0=慢调用比例, 1=异常比例, 2=异常数 |
| count              | number | 阈值                                         |
| timeWindow         | number | 熔断时长（秒）                               |
| minRequestAmount   | number | 最小请求数                                   |
| statIntervalMs     | number | 统计时长（毫秒）                             |
| slowRatioThreshold | number | 慢调用比例阈值                               |

### 2.3 ParamFlowRule（热点参数规则）

| 字段              | 类型            | 说明               |
| ----------------- | --------------- | ------------------ |
| id                | number          | 规则 ID            |
| app               | string          | 应用名             |
| ip                | string          | 机器 IP            |
| port              | number          | 机器端口           |
| resource          | string          | 资源名             |
| paramIdx          | number          | 参数索引           |
| count             | number          | 阈值               |
| grade             | number          | 限流模式：1=QPS    |
| durationInSec     | number          | 统计窗口时长（秒） |
| burstCount        | number          | 突发数量           |
| controlBehavior   | number          | 流控效果           |
| paramFlowItemList | ParamFlowItem[] | 参数例外项         |

### 2.4 SystemRule（系统规则）

| 字段              | 类型   | 说明            |
| ----------------- | ------ | --------------- |
| id                | number | 规则 ID         |
| app               | string | 应用名          |
| highestSystemLoad | number | 最大系统负载    |
| highestCpuUsage   | number | 最大 CPU 使用率 |
| avgRt             | number | 平均 RT（毫秒） |
| maxThread         | number | 最大并发数      |
| qps               | number | 入口 QPS        |

### 2.5 AuthorityRule（授权规则）

| 字段     | 类型   | 说明                         |
| -------- | ------ | ---------------------------- |
| id       | number | 规则 ID                      |
| app      | string | 应用名                       |
| ip       | string | 机器 IP                      |
| port     | number | 机器端口                     |
| resource | string | 资源名                       |
| limitApp | string | 流控应用（逗号分隔）         |
| strategy | number | 授权类型：0=白名单, 1=黑名单 |

---

## 3. 集群模型

### 3.1 ClusterState（集群状态）

| 字段      | 类型             | 说明                              |
| --------- | ---------------- | --------------------------------- |
| ip        | string           | 机器 IP                           |
| port      | number           | 机器端口                          |
| mode      | number           | 模式：-1=未知, 0=Client, 1=Server |
| stateInfo | ClusterStateInfo | 状态详情                          |

### 3.2 ClusterStateInfo

| 字段            | 类型    | 说明            |
| --------------- | ------- | --------------- |
| mode            | number  | 运行模式        |
| clientAvailable | boolean | Client 是否可用 |
| serverAvailable | boolean | Server 是否可用 |

### 3.3 ClusterFlowConfig（集群流控配置）

| 字段                    | 类型    | 说明                             |
| ----------------------- | ------- | -------------------------------- |
| flowId                  | number  | 流控规则 ID                      |
| thresholdType           | number  | 阈值模式：0=单机均摊, 1=全局阈值 |
| fallbackToLocalWhenFail | boolean | 降级为本地                       |
| strategy                | number  | 策略                             |
| sampleCount             | number  | 采样数                           |
| windowIntervalMs        | number  | 窗口时长                         |

### 3.4 TokenServerInfo（Token Server 信息）

| 字段         | 类型     | 说明         |
| ------------ | -------- | ------------ |
| ip           | string   | IP 地址      |
| port         | number   | 端口         |
| state        | number   | 状态         |
| embedded     | boolean  | 是否嵌入模式 |
| namespaceSet | string[] | 命名空间集合 |

---

## 4. 监控数据

### 4.1 MetricEntity（监控指标）

| 字段         | 类型   | 说明     |
| ------------ | ------ | -------- |
| app          | string | 应用名   |
| resource     | string | 资源名   |
| timestamp    | number | 时间戳   |
| passQps      | number | 通过 QPS |
| blockQps     | number | 拒绝 QPS |
| successQps   | number | 成功 QPS |
| exceptionQps | number | 异常 QPS |
| rt           | number | 平均 RT  |
| count        | number | 样本数   |

### 4.2 ResourceVO（资源信息）

| 字段         | 类型   | 说明     |
| ------------ | ------ | -------- |
| resource     | string | 资源名   |
| passQps      | number | 通过 QPS |
| blockQps     | number | 拒绝 QPS |
| successQps   | number | 成功 QPS |
| exceptionQps | number | 异常 QPS |
| rt           | number | 平均 RT  |
| threadNum    | number | 线程数   |

---

## 5. 网关模型

### 5.1 ApiDefinition（网关 API）

| 字段           | 类型               | 说明     |
| -------------- | ------------------ | -------- |
| id             | number             | ID       |
| app            | string             | 应用名   |
| ip             | string             | 机器 IP  |
| port           | number             | 机器端口 |
| apiName        | string             | API 名称 |
| predicateItems | ApiPredicateItem[] | 匹配规则 |

### 5.2 GatewayFlowRule（网关流控规则）

| 字段                 | 类型                 | 说明                              |
| -------------------- | -------------------- | --------------------------------- |
| id                   | number               | ID                                |
| app                  | string               | 应用名                            |
| ip                   | string               | 机器 IP                           |
| port                 | number               | 机器端口                          |
| resource             | string               | 资源名                            |
| resourceMode         | number               | 资源模式：0=路由 ID, 1=自定义 API |
| grade                | number               | 阈值类型                          |
| count                | number               | 阈值                              |
| intervalSec          | number               | 统计窗口（秒）                    |
| controlBehavior      | number               | 流控效果                          |
| burst                | number               | 突发数量                          |
| maxQueueingTimeoutMs | number               | 最大排队时间                      |
| paramItem            | GatewayParamFlowItem | 参数限流配置                      |

---

## 6. 枚举定义

### 6.1 FlowGrade（流控阈值类型）

| 值  | 说明   |
| --- | ------ |
| 0   | 线程数 |
| 1   | QPS    |

### 6.2 FlowStrategy（流控模式）

| 值  | 说明 |
| --- | ---- |
| 0   | 直接 |
| 1   | 关联 |
| 2   | 链路 |

### 6.3 ControlBehavior（流控效果）

| 值  | 说明      |
| --- | --------- |
| 0   | 快速失败  |
| 1   | Warm Up   |
| 2   | 排队等待  |
| 3   | 预热+排队 |

### 6.4 DegradeGrade（降级策略）

| 值  | 说明       |
| --- | ---------- |
| 0   | 慢调用比例 |
| 1   | 异常比例   |
| 2   | 异常数     |

### 6.5 ClusterMode（集群模式）

| 值  | 说明   |
| --- | ------ |
| -1  | 未知   |
| 0   | Client |
| 1   | Server |

### 6.6 AuthorityStrategy（授权类型）

| 值  | 说明   |
| --- | ------ |
| 0   | 白名单 |
| 1   | 黑名单 |
