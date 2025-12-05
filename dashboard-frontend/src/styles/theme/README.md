# 主题系统

## 文件结构

```
src/styles/theme/
├── system.ts              # 静态主题系统（核心，导出 system）
├── colors.ts              # 自定义颜色系列定义
├── color-schemes.ts       # 颜色方案（用于旧组件兼容）
├── shadows.ts             # 阴影配置
├── types.d.ts             # 类型定义
├── index.ts               # 导出入口
└── components/            # 组件样式配置
```

## 核心概念

### 静态主题系统

使用 Chakra UI v3 的静态主题系统，一次创建，全局复用：

```typescript
// system.ts
export const system = createSystem(defaultConfig, config);
```

### 动态主色切换

通过 `colorPalette` 属性实现运行时主色切换：

```tsx
// provider.tsx
<Box colorPalette={settings.primaryColor}>{children}</Box>
```

### Light/Dark 模式

通过条件 tokens 自动适配：

```typescript
tokens: {
  colors: {
    neonBlue: {
      500: {
        value: {
          _light: '#3B82F6',  // light 模式
          _dark: '#60A5FA'    // dark 模式（自动反转）
        }
      }
    }
  }
}
```

## 使用方式

### 1. 应用入口使用 Provider

```tsx
import { Provider } from '@/components/ui/provider';

<Provider>
  <App />
</Provider>;
```

### 2. 组件中使用语义 token

```tsx
<Button colorPalette="neonBlue">按钮</Button>

<Box bg="colorPalette.solid" color="colorPalette.contrast">
  使用当前主色
</Box>
```

### 3. 添加新颜色系列

1. 在 `colors.ts` 中定义新颜色
2. 在 `system.ts` 的 `tokens.colors` 中注册
3. 在 `semanticTokens.colors` 中注册语义 tokens
4. 在 `types.d.ts` 的 `PrimaryColor` 类型中添加

## 相关组件

- `src/components/ui/provider.tsx` - 主题 Provider
- `src/components/core/rtl/` - RTL 支持
- `src/components/core/settings/` - 主题设置 UI
