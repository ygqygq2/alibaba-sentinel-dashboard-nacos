# Chinge Admin 文档索引

本目录包含 Chinge Admin 项目的架构设计、实现细节和最佳实践文档。

## 📚 文档列表

### 测试

- **[05-testing.md](./05-testing.md)** - 端到端测试指南
  - Playwright 测试配置
  - Storage State 认证复用
  - 测试命令使用
  - 开发/生产模式测试

### 主题系统

- **[01-theme-architecture.md](./01-theme-architecture.md)** - 主题系统架构设计
  - Chakra UI v3 主题系统概览
  - 当前架构分析
  - 设计目标与约束

- **[02-color-system-design.md](./02-color-system-design.md)** - 颜色系统设计方案
  - 自定义颜色定义（colors.ts）
  - Primary Color 切换机制
  - Light/Dark 模式支持
  - 语义化 Token 设计

- **[03-implementation-guide.md](./03-implementation-guide.md)** - 实现指南
  - 主题系统实现步骤
  - 代码示例
  - 组件使用模式
  - 故障排除

- **[04-best-practices.md](./04-best-practices.md)** - 最佳实践
  - Token 结构设计原则
  - 组件开发模式
  - Recipe 开发指南
  - 常见错误及解决方案
  - 性能优化建议

## 🎯 快速导航

### 我想了解...

- **主题系统如何工作？** → 查看 [01-theme-architecture.md](./01-theme-architecture.md)
- **如何添加新的主题颜色？** → 查看 [02-color-system-design.md](./02-color-system-design.md)
- **如何实现主题切换？** → 查看 [03-implementation-guide.md](./03-implementation-guide.md)
- **如何避免常见错误？** → 查看 [04-best-practices.md](./04-best-practices.md)

### 我遇到问题...

- **Button 颜色不生效** → 查看 [03-implementation-guide.md#问题-1-颜色不生效](./03-implementation-guide.md#7-故障排除)
- **Dark 模式不工作** → 查看 [03-implementation-guide.md#问题-2-dark-模式不工作](./03-implementation-guide.md#7-故障排除)
- **Text 组件颜色问题** → 查看 [04-best-practices.md#错误-4-text-组件使用-colorpalette-prop](./04-best-practices.md#4-常见错误及解决方案)
- **Recipe 没有应用** → 查看 [04-best-practices.md#错误-3-recipe-key-使用大写](./04-best-practices.md#4-常见错误及解决方案)

## 📖 阅读建议

1. **新手入门**: 按顺序阅读 01 → 02 → 03 → 04
2. **快速参考**: 直接查看 03-implementation-guide.md 和 04-best-practices.md
3. **问题排查**: 查看 03-implementation-guide.md 的故障排除章节

## 🔑 核心要点

### Token 设计

- ✅ **Colors Tokens**: 使用简单值 `{ value: "#color" }`
- ✅ **Semantic Tokens**: 使用 `base/_dark` 条件支持深色模式
- ❌ **避免**: 在 tokens 中使用嵌套的 `_light/_dark` 对象

### 组件使用

- ✅ **支持 colorPalette 的组件** (Button, Badge): 使用 `colorPalette={settings.primaryColor}` prop
- ✅ **不支持的组件** (Text, Heading): 使用模板字符串 `color={\`${settings.primaryColor}.500\`}`
- ❌ **避免**: 硬编码颜色值

### Recipe 开发

- ✅ **Recipe key**: 使用小写（`button` 不是 `Button`）
- ✅ **Dark 模式**: 使用 `{ base: value, _dark: value }` 条件
- ✅ **colorPalette**: 在 recipe 中使用 `colorPalette.500` 等 tokens

## 🔄 文档更新

文档会随着项目演进持续更新。如有疑问或建议，请提交 Issue。

**最后更新**: 2025-10-15
**版本**: v1.0.0
**Chakra UI**: v3.26.0
