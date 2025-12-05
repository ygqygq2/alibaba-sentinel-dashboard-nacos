# 开发指南

本文档介绍如何在本地进行开发和测试。

## 开发环境

### 前置条件

- JDK 17+
- Maven 3.6+
- Docker 20.10+
- Node.js 16+ (前端开发)
- Python 3.10+ (E2E 测试)

### 推荐 IDE

- IntelliJ IDEA
- VS Code + Java Extension Pack

## 本地开发

### 1. 克隆项目

```bash
git clone https://github.com/ygqygq2/alibaba-sentinel-dashboard-nacos.git
cd alibaba-sentinel-dashboard-nacos
```

### 2. 启动依赖服务

```bash
# 只启动 Nacos
docker run -d --name nacos \
  -e MODE=standalone \
  -p 8848:8848 \
  nacos/nacos-server:v2.3.0
```

### 3. 编译运行 Dashboard

```bash
# 使用 Makefile（推荐）
make build        # 构建前端 + 后端
make dev          # 启动前端开发服务器
make help         # 查看所有命令

# 或手动编译
cd sentinel-dashboard
mvn clean package -DskipTests

# 运行
java -Dserver.port=8080 \
     -Dnacos.server.addr=localhost:8848 \
     -jar target/sentinel-dashboard.jar
```

### 4. 编译运行 Token Server

```bash
cd token-server

# 编译
mvn clean package -DskipTests

# 运行
java -Dserver.port=8081 \
     -Dsentinel.cluster.server.port=18730 \
     -Dnacos.server-addr=localhost:8848 \
     -Dcsp.sentinel.dashboard.server=localhost:8080 \
     -jar target/token-server-1.0.0.jar
```

## 开发脚本

项目提供了便捷的开发脚本：

```bash
# 启动全栈服务
./scripts/dev.sh start

# 停止服务
./scripts/dev.sh stop

# 重启服务（重新构建镜像）
./scripts/dev.sh restart

# 查看日志
./scripts/dev.sh logs

# 清理资源
./scripts/dev.sh clean
```

## 代码结构

### 前端模块

```
dashboard-frontend/
├── src/
│   ├── components/          # 通用组件
│   │   ├── core/            # 核心组件
│   │   └── dashboard/       # Dashboard 组件
│   ├── hooks/               # 自定义 Hooks
│   │   └── api/             # React Query Hooks
│   ├── lib/                 # 工具库
│   │   └── api/             # API 客户端
│   ├── pages/               # 页面组件
│   │   └── dashboard/       # Dashboard 页面
│   ├── routes/              # 路由配置
│   └── types/               # TypeScript 类型
├── tests/                   # 单元测试
├── package.json
└── vite.config.mts
```

### Dashboard 后端模块

```
sentinel-dashboard/src/main/java/com/alibaba/csp/sentinel/dashboard/
├── auth/                    # 认证授权
├── client/                  # Sentinel API 客户端
├── config/                  # Spring 配置
├── controller/              # REST 控制器
│   ├── FlowControllerV1.java
│   ├── DegradeController.java
│   └── ...
├── datasource/              # 数据源抽象
├── discovery/               # 服务发现
├── domain/                  # 领域模型
├── repository/              # 数据仓库
├── rule/                    # 规则相关
│   └── nacos/              # Nacos 实现 ⭐
│       ├── FlowRuleNacosProvider.java
│       ├── FlowRuleNacosPublisher.java
│       └── ...
├── service/                 # 业务服务
└── util/                    # 工具类
```

### Token Server 模块

```
token-server/src/main/java/com/alibaba/csp/tokenserver/
├── config/
│   ├── ClusterServerConfig.java  # 集群配置 ⭐
│   └── SentinelConfig.java       # Sentinel 初始化
├── controller/
│   └── HomeController.java       # 状态接口
└── TokenServerApplication.java   # 启动类
```

## 添加新规则类型

### 1. 创建 Provider

```java
@Component("myRuleNacosProvider")
public class MyRuleNacosProvider implements DynamicRuleProvider<List<MyRuleEntity>> {

    @Autowired
    private NacosConfigService configService;

    @Value("${nacos.group}")
    private String groupId;

    @Override
    public List<MyRuleEntity> getRules(String appName) throws Exception {
        String dataId = appName + "-my-rules";
        String config = configService.getConfig(dataId, groupId, 5000);
        if (StringUtil.isEmpty(config)) {
            return new ArrayList<>();
        }
        return JSON.parseArray(config, MyRuleEntity.class);
    }
}
```

### 2. 创建 Publisher

```java
@Component("myRuleNacosPublisher")
public class MyRuleNacosPublisher implements DynamicRulePublisher<List<MyRuleEntity>> {

    @Autowired
    private NacosConfigService configService;

    @Value("${nacos.group}")
    private String groupId;

    @Override
    public void publish(String app, List<MyRuleEntity> rules) throws Exception {
        String dataId = app + "-my-rules";
        configService.publishConfig(dataId, groupId, JSON.toJSONString(rules));
    }
}
```

### 3. 注入 Controller

```java
@RestController
@RequestMapping("/my-rule")
public class MyRuleController {

    @Autowired
    @Qualifier("myRuleNacosProvider")
    private DynamicRuleProvider<List<MyRuleEntity>> ruleProvider;

    @Autowired
    @Qualifier("myRuleNacosPublisher")
    private DynamicRulePublisher<List<MyRuleEntity>> rulePublisher;

    // ... 实现 CRUD 接口
}
```

## 测试

### 前端测试

```bash
# 使用 Makefile
make test-fe

# 或直接运行
cd dashboard-frontend
pnpm test              # 运行测试
pnpm test --watch      # 监听模式
pnpm test --coverage   # 覆盖率报告
```

### 后端测试

```bash
# 使用 Makefile
make test-be

# 或直接运行
cd sentinel-dashboard
mvn test
```

### E2E 测试

```bash
# 安装依赖
cd tests/e2e
pip install -r requirements.txt
playwright install chromium

# 启动服务
cd ../..
docker-compose up -d

# 运行测试
cd tests/e2e
pytest -v
```

### 测试覆盖率

```bash
mvn test jacoco:report
# 报告位置: target/site/jacoco/index.html
```

## 调试

### 远程调试

```bash
# 启动时添加调试参数
java -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005 \
     -jar target/sentinel-dashboard.jar
```

### Docker 调试

```yaml
# docker-compose.override.yml
services:
  sentinel-dashboard:
    environment:
      - JAVA_OPTS=-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005
    ports:
      - "5005:5005"
```

### 日志级别

```properties
# application.properties
logging.level.com.alibaba.csp.sentinel=DEBUG
logging.level.com.alibaba.nacos=DEBUG
```

## 代码规范

### Java 代码

- 遵循 Google Java Style Guide
- 使用 Lombok 简化代码
- 添加必要的注释

### 提交规范

```
<type>(<scope>): <subject>

<body>

<footer>
```

类型：

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具

示例：

```
feat(rule): add support for gateway flow rules

- Add GatewayFlowRuleNacosProvider
- Add GatewayFlowRuleNacosPublisher
- Update FlowControllerV2

Closes #123
```

## CI/CD

### GitHub Actions

项目配置了两个 Workflow：

1. **CI** (`.github/workflows/ci.yml`)

   - 触发: Push/PR 到 main
   - 步骤: 编译 → 测试 → 构建镜像 → E2E 测试

2. **Release** (`.github/workflows/release.yml`)
   - 触发: Tag 推送
   - 步骤: 构建多架构镜像 → 推送到 GHCR

### 本地模拟 CI

```bash
# 安装 act
brew install act

# 运行 CI workflow
act push
```

## 常见开发问题

### Maven 下载慢

使用阿里云镜像：

```xml
<!-- ~/.m2/settings.xml -->
<mirrors>
  <mirror>
    <id>aliyun</id>
    <url>https://maven.aliyun.com/repository/public</url>
    <mirrorOf>central</mirrorOf>
  </mirror>
</mirrors>
```

### 端口冲突

```bash
# 查看端口占用
lsof -i :8080
netstat -tlnp | grep 8080

# 杀死进程
kill -9 <PID>
```

### Docker 构建慢

使用国内镜像源：

```bash
# 构建时使用镜像
docker-compose build --build-arg USE_CHINA_MIRROR=true
```

## 下一步

- [API 参考](07-API-REFERENCE.md) - REST API 文档
- [故障排查](08-TROUBLESHOOTING.md) - 问题解决
