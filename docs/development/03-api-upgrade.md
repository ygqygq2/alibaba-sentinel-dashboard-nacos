# API 升级说明

> 本文档详细说明了 Dashboard 后端 API 的改进和升级

## 官方 Sentinel Dashboard API 现状

### 1. 流控规则（唯一有 V2 版本）

官方提供了 V2 版本的流控规则 API：

**控制器**：`FlowControllerV2.java`  
**路径前缀**：`/v2/flow`

| 方法   | 路径                 | 参数                         | 说明                   |
| ------ | -------------------- | ---------------------------- | ---------------------- |
| GET    | `/v2/flow/rules`     | `app`                        | 获取应用的所有流控规则 |
| POST   | `/v2/flow/rule`      | Body: `FlowRuleEntity`       | 创建流控规则           |
| PUT    | `/v2/flow/rule/{id}` | `id`, Body: `FlowRuleEntity` | 更新流控规则           |
| DELETE | `/v2/flow/rule/{id}` | `id`                         | 删除流控规则           |

**特点**：

- ✅ 只需要 `app` 参数（应用级别）
- ✅ 使用 `DynamicRuleProvider` 和 `DynamicRulePublisher` 模式
- ✅ 支持从 Nacos 等外部数据源读写规则

### 2. 降级规则（仅 V1 版本）

**控制器**：`DegradeController.java`  
**路径前缀**：`/degrade`

| 方法   | 路径                  | 参数                            | 说明                       |
| ------ | --------------------- | ------------------------------- | -------------------------- |
| GET    | `/degrade/rules.json` | `app`, `ip`, `port`             | 获取**指定机器**的降级规则 |
| POST   | `/degrade/rule`       | Body: `DegradeRuleEntity`       | 创建降级规则               |
| PUT    | `/degrade/rule/{id}`  | `id`, Body: `DegradeRuleEntity` | 更新降级规则               |
| DELETE | `/degrade/rule/{id}`  | `id`                            | 删除降级规则               |

**限制**：

- ❌ 需要 `app`、`ip`、`port` 三个参数（机器级别）
- ❌ 从指定机器拉取规则，无法获取应用所有机器的规则
- ❌ 不支持 Nacos 持久化

### 3. 热点参数规则（仅 V1 版本）

**控制器**：`ParamFlowRuleController.java`  
**路径前缀**：`/paramFlow`

| 方法   | 路径                   | 参数                              | 说明                       |
| ------ | ---------------------- | --------------------------------- | -------------------------- |
| GET    | `/paramFlow/rules`     | `app`, `ip`, `port`               | 获取**指定机器**的热点规则 |
| POST   | `/paramFlow/rule`      | Body: `ParamFlowRuleEntity`       | 创建热点规则               |
| PUT    | `/paramFlow/rule/{id}` | `id`, Body: `ParamFlowRuleEntity` | 更新热点规则               |
| DELETE | `/paramFlow/rule/{id}` | `id`                              | 删除热点规则               |

**限制**：与降级规则相同

### 4. 系统规则（仅 V1 版本）

**控制器**：`SystemController.java`  
**路径前缀**：`/system`

| 方法     | 路径                                      | 参数                     | 说明                       |
| -------- | ----------------------------------------- | ------------------------ | -------------------------- |
| GET      | `/system/rules.json`                      | `app`, `ip`, `port`      | 获取**指定机器**的系统规则 |
| POST/PUT | `/system/new.json` 或 `/system/save.json` | Body: `SystemRuleEntity` | 创建/更新系统规则          |
| DELETE   | `/system/delete.json`                     | `id`                     | 删除系统规则               |

**限制**：

- ❌ API 路径不统一（`.json` 后缀混乱）
- ❌ 创建和更新使用不同的路径
- ❌ 仍然是机器级别的规则管理

### 5. 授权规则（仅 V1 版本）

**控制器**：`AuthorityRuleController.java`  
**路径前缀**：`/authority`

| 方法   | 路径                   | 参数                              | 说明                       |
| ------ | ---------------------- | --------------------------------- | -------------------------- |
| GET    | `/authority/rules`     | `app`, `ip`, `port`               | 获取**指定机器**的授权规则 |
| POST   | `/authority/rule`      | Body: `AuthorityRuleEntity`       | 创建授权规则               |
| PUT    | `/authority/rule/{id}` | `id`, Body: `AuthorityRuleEntity` | 更新授权规则               |
| DELETE | `/authority/rule/{id}` | `id`                              | 删除授权规则               |

**限制**：与降级规则相同

---

## 我们的改进方案

### 核心改进思路

**问题**：官方除了流控规则，其他规则都是机器级别的管理，无法：

1. 一次性获取应用所有机器的规则
2. 支持 Nacos 等外部持久化
3. 实现应用级别的规则统一管理

**解决方案**：为所有规则类型创建 V2 版本的 API，统一使用应用级别的规则管理

### 新增的 V2 控制器

#### 1. DegradeControllerV2（降级规则 V2）

**路径**：`/v2/degrade`  
**持久化**：✅ **已集成 Nacos**

```java
@RestController
@RequestMapping(value = "/v2/degrade")
public class DegradeControllerV2 {
    @Autowired
    @Qualifier("degradeRuleNacosProvider")
    private DynamicRuleProvider<List<DegradeRuleEntity>> ruleProvider;

    @Autowired
    @Qualifier("degradeRuleNacosPublisher")
    private DynamicRulePublisher<List<DegradeRuleEntity>> rulePublisher;

    @GetMapping("/rules")
    public Result<List<DegradeRuleEntity>> apiQueryRules(@RequestParam String app)

    @PostMapping("/rule")
    public Result<DegradeRuleEntity> apiAddRule(@RequestBody DegradeRuleEntity entity)

    @PutMapping("/rule/{id}")
    public Result<DegradeRuleEntity> apiUpdateRule(@PathVariable Long id, @RequestBody DegradeRuleEntity entity)

    @DeleteMapping("/rule/{id}")
    public Result<Long> apiDeleteRule(@PathVariable Long id)
}
```

**改进点**：

- ✅ 只需 `app` 参数，返回应用所有规则
- ✅ **使用 Nacos 持久化**（NacosProvider/Publisher）
- ✅ 统一的 RESTful API 风格
- ✅ **Dashboard 重启后规则不丢失**
- ✅ **支持多实例配置同步**

**Nacos 配置**：

- **dataId**：`${app}-degrade-rules`
- **group**：`SENTINEL_GROUP`

#### 2. ParamFlowControllerV2（热点规则 V2）

**路径**：`/v2/paramFlow`  
**持久化**：✅ **已集成 Nacos**

API 结构同上，实体类型为 `ParamFlowRuleEntity`

**Nacos 配置**：

- **dataId**：`${app}-param-flow-rules`
- **group**：`SENTINEL_GROUP`

#### 3. SystemControllerV2（系统规则 V2）

**路径**：`/v2/system`  
**持久化**：✅ **已集成 Nacos**

API 结构同上，实体类型为 `SystemRuleEntity`

**额外改进**：

- ✅ 统一 API 路径，去除 `.json` 后缀
- ✅ 创建和更新使用标准的 POST/PUT 方法
- ✅ **Nacos 持久化**

**Nacos 配置**：

- **dataId**：`${app}-system-rules`
- **group**：`SENTINEL_GROUP`

#### 4. AuthorityControllerV2（授权规则 V2）

**路径**：`/v2/authority`  
**持久化**：✅ **已集成 Nacos**

API 结构同上，实体类型为 `AuthorityRuleEntity`

**Nacos 配置**：

- **dataId**：`${app}-authority-rules`
- **group**：`SENTINEL_GROUP`

#### 5. FlowControllerV2（流控规则 V2）

**路径**：`/v2/flow`  
**持久化**：✅ **已集成 Nacos**（官方接口，我们切换到 Nacos 实现）

**Nacos 配置**：

- **dataId**：`${app}-flow-rules`
- **group**：`SENTINEL_GROUP`

---

## Nacos 持久化实现

### Provider/Publisher 模式

所有规则类型统一使用 `DynamicRuleProvider` 和 `DynamicRulePublisher` 接口：

```java
// 读取规则
public interface DynamicRuleProvider<T> {
    T getRules(String appName) throws Exception;
}

// 发布规则
public interface DynamicRulePublisher<T> {
    void publish(String app, T rules) throws Exception;
}
```

### 已实现的 Nacos Provider/Publisher

| 规则类型 | Provider                     | Publisher                     | dataId 后缀         |
| -------- | ---------------------------- | ----------------------------- | ------------------- |
| 流控     | `FlowRuleNacosProvider`      | `FlowRuleNacosPublisher`      | `-flow-rules`       |
| 降级     | `DegradeRuleNacosProvider`   | `DegradeRuleNacosPublisher`   | `-degrade-rules`    |
| 热点     | `ParamFlowRuleNacosProvider` | `ParamFlowRuleNacosPublisher` | `-param-flow-rules` |
| 系统     | `SystemRuleNacosProvider`    | `SystemRuleNacosPublisher`    | `-system-rules`     |
| 授权     | `AuthorityRuleNacosProvider` | `AuthorityRuleNacosPublisher` | `-authority-rules`  |

### Nacos 配置类

```java
@Configuration
public class NacosConfig {
    // 为每种规则类型配置 Encoder/Decoder
    @Bean
    public Converter<List<FlowRuleEntity>, String> flowRuleEntityEncoder() {
        return JSON::toJSONString;
    }

    @Bean
    public Converter<String, List<FlowRuleEntity>> flowRuleEntityDecoder() {
        return s -> JSON.parseArray(s, FlowRuleEntity.class);
    }

    // ... (其他规则类型的 Converter)

    @Bean
    public ConfigService nacosConfigService() throws Exception {
        return ConfigFactory.createConfigService("localhost");
    }
}
```

### 工作流程

```
┌────────────────────────────────────────────────────────┐
│  1. 用户在 Dashboard UI 修改规则                        │
└───────────────────┬────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────────────┐
│  2. FlowControllerV2 调用 ruleProvider.getRules()      │
│     → 从 Nacos 读取现有规则                             │
│     → 与新规则合并                                      │
│     → repository.save() (保存到内存)                    │
│     → rulePublisher.publish() (推送到 Nacos)           │
└───────────────────┬────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────────────┐
│  3. Nacos 存储规则                                     │
│     dataId: my-app-flow-rules                          │
│     group: SENTINEL_GROUP                              │
│     content: [{"resource": "/api", "count": 100, ...}] │
└───────────────────┬────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────────────┐
│  4. 应用客户端监听 Nacos 配置变化                       │
│     → sentinel-datasource-nacos 自动更新规则            │
│     → 规则立即生效                                      │
└────────────────────────────────────────────────────────┘
```

---

## API 对比总结

| 规则类型     | 官方 API                                   | 我们的 V2 API                | 改进                       |
| ------------ | ------------------------------------------ | ---------------------------- | -------------------------- |
| **流控规则** | `/v2/flow/*` (已有)                        | `/v2/flow/*`                 | ✅ 切换到 Nacos 持久化     |
| **降级规则** | `/degrade/rules.json?app={}&ip={}&port={}` | `/v2/degrade/rules?app={}`   | ✅ 应用级别 + Nacos 持久化 |
| **热点规则** | `/paramFlow/rules?app={}&ip={}&port={}`    | `/v2/paramFlow/rules?app={}` | ✅ 应用级别 + Nacos 持久化 |
| **系统规则** | `/system/rules.json?app={}&ip={}&port={}`  | `/v2/system/rules?app={}`    | ✅ 应用级别 + Nacos 持久化 |
| **授权规则** | `/authority/rules?app={}&ip={}&port={}`    | `/v2/authority/rules?app={}` | ✅ 应用级别 + Nacos 持久化 |

---

## 前端适配

前端 API 客户端（`dashboard-frontend/src/lib/api/rule.ts`）统一使用 V2 路径：

```typescript
// 所有规则 API 统一格式
export const {rule}Api = {
  getRules(app: string): Promise<Rule[]> {
    return apiClient.get(`/v2/{rule}/rules`, { app });
  },

  createRule(rule: Omit<Rule, 'id'>): Promise<Rule> {
    return apiClient.post(`/v2/{rule}/rule`, rule);
  },

  updateRule(rule: Rule): Promise<Rule> {
    return apiClient.put(`/v2/{rule}/rule/${rule.id}`, rule);
  },

  deleteRule(id: number): Promise<void> {
    return apiClient.delete(`/v2/{rule}/rule/${id}`);
  },
};
```

---

## 实施状态

### ✅ 已完成

1. **V2 API 控制器**

   - [x] FlowControllerV2（官方）- 切换到 Nacos 持久化
   - [x] DegradeControllerV2 - 应用级别 + Nacos 持久化
   - [x] ParamFlowControllerV2 - 应用级别 + Nacos 持久化
   - [x] SystemControllerV2 - 应用级别 + Nacos 持久化
   - [x] AuthorityControllerV2 - 应用级别 + Nacos 持久化

2. **Nacos 持久化实现**

   - [x] FlowRuleNacosProvider/Publisher
   - [x] DegradeRuleNacosProvider/Publisher
   - [x] ParamFlowRuleNacosProvider/Publisher
   - [x] SystemRuleNacosProvider/Publisher
   - [x] AuthorityRuleNacosProvider/Publisher
   - [x] NacosConfig 配置类（所有规则类型的 Converter）
   - [x] NacosConfigUtil 常量定义

3. **前端集成**
   - [x] 所有规则页面统一使用 V2 API
   - [x] 统一的 API 客户端模式

### 🎯 核心优势

1. **持久化保障**

   - 规则存储在 Nacos，Dashboard 重启不丢失
   - 支持多 Dashboard 实例部署
   - 配置变更自动同步到所有应用实例

2. **云原生友好**

   - 应用级别管理，不需要关心具体机器
   - 适合 K8s 自动扩缩容场景
   - 所有 Pod 配置自动一致

3. **开发体验**
   - 统一的 API 设计模式
   - 清晰的 dataId 命名规范
   - 完整的类型定义和错误处理

### 📊 Nacos DataId 命名规范

| 规则类型 | dataId 格式               | 示例                          |
| -------- | ------------------------- | ----------------------------- |
| 流控     | `${app}-flow-rules`       | `my-service-flow-rules`       |
| 降级     | `${app}-degrade-rules`    | `my-service-degrade-rules`    |
| 热点     | `${app}-param-flow-rules` | `my-service-param-flow-rules` |
| 系统     | `${app}-system-rules`     | `my-service-system-rules`     |
| 授权     | `${app}-authority-rules`  | `my-service-authority-rules`  |

**group**: 统一使用 `SENTINEL_GROUP`

---

## 后续优化方向

### 高级功能

- [ ] 规则版本管理（基于 Nacos 版本号）
- [ ] 规则灰度发布（基于 Nacos 灰度机制）
- [ ] 规则审批流程（Dashboard 层面）
- [ ] 规则变更历史记录（集成 Nacos 历史版本）
- [ ] Nacos 高可用配置（多节点集群）

### 监控增强

- [ ] 规则推送成功率监控
- [ ] Nacos 连接状态监控
- [ ] 规则同步延迟监控
- [ ] 配置变更审计日志

---

## 注意事项

1. **向后兼容**：旧的 V1 API 仍然保留，不影响现有集成
2. **渐进升级**：前端已全面切换到 V2 API
3. **数据一致性**：内存仓库和 Nacos 双写，确保实时性
4. **Nacos 配置**：确保 Nacos 服务器地址配置正确（默认 localhost）

---

## 客户端接入

应用端需要添加 Nacos 数据源依赖并配置相应的规则类型：

```xml
<dependency>
    <groupId>com.alibaba.csp</groupId>
    <artifactId>sentinel-datasource-nacos</artifactId>
    <version>1.8.9</version>
</dependency>
```

配置示例（Spring Boot）：

```yaml
spring:
  cloud:
    sentinel:
      datasource:
        # 流控规则
        flow:
          nacos:
            server-addr: nacos:8848
            dataId: ${spring.application.name}-flow-rules
            groupId: SENTINEL_GROUP
            rule-type: flow
        # 降级规则
        degrade:
          nacos:
            server-addr: nacos:8848
            dataId: ${spring.application.name}-degrade-rules
            groupId: SENTINEL_GROUP
            rule-type: degrade
        # 其他规则类型...
```

---

## 参考资料

- [Sentinel 官方文档 - 规则持久化](https://sentinelguard.io/zh-cn/docs/dynamic-rule-configuration.html)
- [Sentinel 源码 - FlowControllerV2](https://github.com/alibaba/Sentinel/blob/master/sentinel-dashboard/src/main/java/com/alibaba/csp/sentinel/dashboard/controller/v2/FlowControllerV2.java)
- [Nacos 官方文档](https://nacos.io/zh-cn/docs/quick-start.html)
- [本项目 - Nacos 集成指南](../03-NACOS-INTEGRATION.md)
- [本项目 - 架构决策文档](../design/04-architecture-decision.md)
