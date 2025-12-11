# 自动化测试完善计划

## 一、现状分析

### 1.1 前端测试现状

**已有测试：**

- ✅ **E2E 测试**：13 个 spec 文件（auth, dashboard, flow-rules, instances, metric 等）
- ✅ **API Hooks 单元测试**：8 个文件（use-app, use-flow-rule, use-cluster 等）
- ✅ **API 客户端测试**：client.test.ts

**缺失测试：**

- ❌ **组件单元测试**：InstanceFilter, ChartContainer, RuleForm 等关键组件无测试
- ❌ **工具函数测试**：lib/utils/ 中的工具函数无覆盖
- ❌ **状态管理测试**：stores/ 中的 Zustand store 无测试
- ❌ **完整用户流程**：规则创建 → 编辑 → 删除完整流程覆盖不足

### 1.2 后端测试现状

**已有测试：**

- ✅ **配置类测试**：DashboardConfigTest, NoAuthConfigurationTest
- ✅ **实体类测试**：AppInfoTest, InstanceInfoTest, SentinelVersionTest
- ✅ **工具类测试**：VersionUtilsTest
- ⚠️ **示例代码**：Apollo/Zookeeper/Nacos Provider 和 Publisher（非真正的测试）

**缺失测试：**

- ❌ **Controller 层测试**：MetricController, FlowRuleController 等无测试
- ❌ **Service 层测试**：业务逻辑无单元测试
- ❌ **Repository 层测试**：Nacos 集成无测试
- ❌ **集成测试**：完整的 API 调用链路测试

---

## 二、测试完善计划

### 2.1 前端测试完善（优先级高）

#### Phase 1: 组件单元测试

**目标组件：**

1. **InstanceFilter** - 实例选择下拉框
2. **ChartContainer** - 图表容器
3. **RuleForm** 系列 - FlowRuleForm, DegradeRuleForm, SystemRuleForm
4. **DataTable** - 数据表格
5. **FilterButton** - 筛选按钮

**测试工具：**

- Vitest
- @testing-library/react
- @testing-library/user-event

**示例测试文件：**

```typescript
// src/components/dashboard/metric/__tests__/InstanceFilter.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import { InstanceFilter } from "../InstanceFilter";

describe("InstanceFilter", () => {
  test("显示加载状态", () => {
    render(<InstanceFilter app="test-app" value={null} onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText("加载中...")).toBeInTheDocument();
  });

  test("选择实例时触发回调", async () => {
    const onChange = vi.fn();
    render(<InstanceFilter app="test-app" value={null} onChange={onChange} />);
    // ... 测试交互
  });
});
```

#### Phase 2: E2E 测试扩展

**新增场景：**

1. **规则完整流程**：创建 → 编辑 → 启用/禁用 → 删除
2. **批量操作**：批量删除、批量导出
3. **错误处理**：网络错误、权限错误、表单验证错误
4. **主题切换**：验证 dark/light 模式、主题色切换
5. **响应式布局**：移动端、平板端布局验证

**优化现有测试：**

- 增加断言，不仅验证页面加载，还验证数据正确性
- 添加性能测试（页面加载时间、API 响应时间）
- 增加视觉回归测试（Playwright screenshot diff）

#### Phase 3: 集成测试

**测试范围：**

- API Hooks + 后端 Mock
- 表单提交 + 数据持久化
- 页面导航 + 路由跳转
- 认证流程 + Token 管理

---

### 2.2 后端测试完善

#### Phase 1: Controller 层单元测试

**测试目标：**

```java
// src/test/java/com/alibaba/csp/sentinel/dashboard/controller/FlowRuleControllerTest.java
@WebMvcTest(FlowRuleController.class)
class FlowRuleControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FlowRuleService flowRuleService;

    @Test
    void testGetFlowRules() throws Exception {
        mockMvc.perform(get("/v1/flow/rules")
                .param("app", "test-app"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(0));
    }
}
```

**覆盖 Controller：**

- FlowRuleController
- MetricController
- AppController
- MachineRegistryController
- ClusterConfigController

#### Phase 2: Service 层单元测试

**测试目标：**

- 规则校验逻辑
- Nacos 配置发布逻辑
- 机器心跳处理逻辑
- 集群流控逻辑

#### Phase 3: 集成测试

**使用 TestContainers：**

```java
@SpringBootTest
@Testcontainers
class NacosIntegrationTest {
    @Container
    static NacosContainer nacos = new NacosContainer();

    @Test
    void testPublishFlowRule() {
        // 测试与 Nacos 的完整集成
    }
}
```

---

## 三、实施步骤

### Step 1: 前端组件单元测试（本周）

创建测试文件：

```bash
dashboard-frontend/src/components/
├── dashboard/
│   ├── metric/
│   │   └── __tests__/
│   │       └── InstanceFilter.test.tsx
│   ├── rules/
│   │   └── __tests__/
│   │       ├── FlowRuleForm.test.tsx
│   │       └── DegradeRuleForm.test.tsx
│   └── chart/
│       └── __tests__/
│           └── ChartContainer.test.tsx
└── core/
    └── __tests__/
        ├── DataTable.test.tsx
        └── FilterButton.test.tsx
```

**验收标准：**

- [ ] 5 个关键组件有单元测试
- [ ] 每个组件测试覆盖率 > 70%
- [ ] 测试通过 `pnpm test`

### Step 2: 扩展 E2E 测试（下周）

新增测试文件：

```bash
dashboard-frontend/e2e/specs/
├── flow-rules-crud.spec.ts      # 完整 CRUD 流程
├── batch-operations.spec.ts     # 批量操作
├── error-handling.spec.ts       # 错误处理
├── theme-switch.spec.ts         # 主题切换
└── responsive.spec.ts           # 响应式布局
```

**验收标准：**

- [ ] 5 个新的 E2E 测试场景
- [ ] 覆盖关键用户流程
- [ ] 测试通过 `make test-all`

### Step 3: 后端单元测试（第 3 周）

创建测试文件：

```bash
sentinel-dashboard/src/test/java/
└── com/alibaba/csp/sentinel/dashboard/
    ├── controller/
    │   ├── FlowRuleControllerTest.java
    │   ├── MetricControllerTest.java
    │   └── AppControllerTest.java
    ├── service/
    │   └── FlowRuleServiceTest.java
    └── integration/
        └── NacosIntegrationTest.java
```

**验收标准：**

- [ ] 3 个 Controller 有单元测试
- [ ] 核心 Service 逻辑有测试
- [ ] 测试覆盖率 > 60%

### Step 4: CI 集成（第 4 周）

修改 GitHub Actions：

```yaml
# .github/workflows/test.yml
jobs:
  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run frontend tests
        run: |
          cd dashboard-frontend
          pnpm install
          pnpm test
          pnpm test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  backend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run backend tests
        run: |
          cd sentinel-dashboard
          mvn test
```

**验收标准：**

- [ ] PR 自动运行测试
- [ ] 测试失败时阻止合并
- [ ] 生成测试覆盖率报告

---

## 四、测试覆盖率目标

| 层级            | 当前覆盖率 | 目标覆盖率 | 优先级 |
| --------------- | ---------- | ---------- | ------ |
| 前端组件        | ~0%        | > 70%      | 高     |
| 前端 Hooks      | ~60%       | > 80%      | 中     |
| 前端 E2E        | ~40%       | > 60%      | 高     |
| 后端 Controller | ~0%        | > 70%      | 高     |
| 后端 Service    | ~0%        | > 60%      | 中     |
| 后端集成测试    | ~0%        | > 40%      | 低     |

---

## 五、工具和配置

### 5.1 前端测试工具

**已配置：**

- ✅ Vitest（单元测试）
- ✅ Playwright（E2E 测试）
- ✅ @testing-library/react

**待配置：**

- [ ] Vitest coverage reporter
- [ ] Playwright visual regression
- [ ] MSW（Mock Service Worker，用于 API Mock）

### 5.2 后端测试工具

**需要添加：**

```xml
<!-- pom.xml -->
<dependencies>
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
  </dependency>
  <dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>testcontainers</artifactId>
    <scope>test</scope>
  </dependency>
</dependencies>
```

---

## 六、参考资料

- [Vitest 文档](https://vitest.dev/)
- [Playwright 文档](https://playwright.dev/)
- [Testing Library 文档](https://testing-library.com/react)
- [Spring Boot Testing](https://spring.io/guides/gs/testing-web)
- [TestContainers](https://www.testcontainers.org/)

---

## 附录：快速命令

```bash
# 前端测试
cd dashboard-frontend
pnpm test                # 单元测试
pnpm test:e2e            # E2E 测试（无头模式）
pnpm test:e2e:headed     # E2E 测试（有头模式）
pnpm test:e2e:report     # 查看测试报告
make fe-check            # 类型+Lint+测试

# 后端测试
cd sentinel-dashboard
mvn test                 # 单元测试
mvn verify               # 集成测试

# 完整测试
make test                # 前端 E2E 测试
make test-all            # 前端所有测试
```
