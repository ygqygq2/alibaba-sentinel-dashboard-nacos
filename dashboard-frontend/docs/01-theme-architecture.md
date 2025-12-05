# 主题系统架构设计

## 1. Chakra UI v3 主题系统核心特性

### 1.1 静态主题 System

Chakra UI v3 采用**编译时主题生成**的方式:

```typescript
// ✅ 正确: 创建一次静态 system
const system = createSystem(defaultConfig, customConfig);

// ❌ 错误: 运行时动态创建 system (性能差)
const system = useMemo(() => createSystem(...), [theme]);
```

**关键点:**

- `createSystem()` 应该在模块顶层调用一次
- System 是静态的,包含所有可能的主题配置
- 运行时通过 CSS 变量和条件 tokens 实现动态切换

### 1.2 ColorPalette 机制

Chakra UI v3 通过 `colorPalette` prop 实现动态颜色切换:

```tsx
// 父组件设置 colorPalette
<Box colorPalette="blue">
  {/* 子组件自动继承 */}
  <Button>使用 blue 颜色</Button>
</Box>

// 更换颜色
<Box colorPalette="green">
  <Button>使用 green 颜色</Button>
</Box>
```

**原理:**

- 通过 CSS 变量 `--chakra-colors-color-palette-*` 实现
- 父级的 `colorPalette` 会映射到 CSS 变量
- 子组件使用 `colorPalette.solid` 等 token 引用

### 1.3 条件 Tokens (Light/Dark 模式)

使用 `_light` 和 `_dark` 条件自动适配主题模式:

```typescript
tokens: {
  colors: {
    brand: {
      500: {
        value: {
          _light: '#3182ce',  // light 模式
          _dark: '#63b3ed'    // dark 模式
        }
      }
    }
  }
}
```

**原理:**

- Chakra UI v3 通过 CSS 类名 `.light` / `.dark` 切换
- 条件 token 会编译成 CSS 变量的条件值
- 不需要重新创建主题系统

## 2. 当前项目架构分析

### 2.1 文件结构

```
src/styles/theme/
├── colors.ts              # 自定义颜色定义 (11种颜色系列)
├── color-schemes.ts       # 颜色方案映射 (primaryColor → light/dark)
├── create-theme.ts        # 主题创建函数 (动态生成)
├── shadows.ts            # 阴影配置
├── types.d.ts            # 类型定义
└── components/           # 组件样式
    └── components.ts
```

### 2.2 当前实现方式

```typescript
// provider.tsx
export function Provider(props) {
  const { settings } = useSettings();
  const { colorMode } = useColorMode();

  // ❌ 问题: 每次切换都创建新 theme
  const theme = React.useMemo(
    () => createTheme({
      primaryColor: settings.primaryColor,
      colorScheme: colorMode
    }),
    [settings.primaryColor, colorMode]
  );

  return <ChakraProvider value={theme}>...</ChakraProvider>;
}
```

**问题分析:**

1. **性能问题**: 每次切换 primaryColor 或 colorMode 都会调用 `createSystem()`
2. **违背设计**: Chakra UI v3 不建议运行时创建 system
3. **内存开销**: 创建多个 system 实例占用内存

### 2.3 优势

✅ **清晰的颜色定义**: `colors.ts` 中定义了11种颜色系列  
✅ **完整的类型支持**: TypeScript 类型定义完善  
✅ **灵活的配置**: 支持 4 种 primaryColor 选择  
✅ **持久化支持**: 设置保存到 localStorage

## 3. 设计目标

### 3.1 核心目标

1. **静态主题系统**: 遵循 Chakra UI v3 最佳实践,创建静态 system
2. **动态颜色切换**: 通过 `colorPalette` prop 实现 primaryColor 切换
3. **Light/Dark 支持**: 通过条件 tokens 自动适配
4. **性能优化**: 避免运行时重新创建 system
5. **保持灵活性**: 继续支持自定义颜色 (colors.ts)

### 3.2 非目标

❌ 不支持运行时添加新颜色系列 (需要重新构建)  
❌ 不支持同一页面多个 primaryColor (可以但不推荐)  
❌ 不支持超过 Chakra UI v3 capability 的功能

## 4. 设计约束

### 4.1 技术约束

- **Chakra UI v3**: 必须遵循 v3 的 API 和最佳实践
- **TypeScript**: 保持完整的类型安全
- **浏览器兼容**: CSS Variables 支持 (Modern Browsers)

### 4.2 业务约束

- **4 种 PrimaryColor**: chateauGreen, neonBlue, royalBlue, tomatoOrange
- **3 种 ColorMode**: light, dark, system
- **设置持久化**: 保存到 localStorage
- **即时生效**: 切换后立即反映到 UI

## 5. 关键设计决策

### 5.1 静态 vs 动态主题

**决策: 采用静态主题 + 动态 colorPalette**

| 方案                       | 优点                  | 缺点                       | 结论        |
| -------------------------- | --------------------- | -------------------------- | ----------- |
| 动态创建 System            | 灵活,易理解           | 性能差,违背设计            | ❌ 不采用   |
| 预生成多个 System          | 性能好                | 内存开销大,复杂            | ⚠️ 备选方案 |
| 静态 System + colorPalette | 符合最佳实践,性能最优 | 需要理解 colorPalette 机制 | ✅ **采用** |

### 5.2 颜色注册策略

**决策: 在 system 中注册所有自定义颜色**

```typescript
// 将 colors.ts 中的颜色注册到 system
tokens: {
  colors: {
    chateauGreen: {
      50: { value: { _light: '#edfcf2', _dark: '#032b1a' } },
      100: { value: { _light: '#d2f9de', _dark: '#094b2f' } },
      // ... 更多级别
      500: { value: { _light: '#16b364', _dark: '#3acd7e' } },
      // ... 完整的 50-950
    },
    neonBlue: { /* ... */ },
    royalBlue: { /* ... */ },
    tomatoOrange: { /* ... */ },
  }
}
```

**原因:**

- 让 Chakra UI v3 的 `colorPalette` 机制能识别这些颜色
- 支持 `<Box colorPalette="chateauGreen">` 的用法
- 自动生成 `colorPalette.solid` 等语义 tokens

### 5.3 Primary Color 映射

**决策: 直接使用颜色名称,不需要映射**

```tsx
// ❌ 不需要映射
const COLOR_PALETTE_MAP = {
  chateauGreen: 'green',
  neonBlue: 'cyan',
  ...
};

// ✅ 直接使用
<Box colorPalette={settings.primaryColor}>
  {/* settings.primaryColor = 'chateauGreen' */}
</Box>
```

## 6. 架构示意图

```
┌─────────────────────────────────────────────────────────┐
│                   Application Root                       │
│  <ChakraProvider value={staticSystem}>                  │
│    <Box colorPalette={primaryColor}>  ← 动态切换         │
│      <ColorModeProvider>  ← Light/Dark 切换             │
│        {children}                                        │
└─────────────────────────────────────────────────────────┘
           │                       │
           ├─────────────┬────────────────┐
           ▼             ▼                ▼
    ┌──────────┐  ┌──────────┐    ┌──────────┐
    │  colors  │  │semanticT │    │components│
    │   .ts    │  │  okens   │    │  .ts     │
    └──────────┘  └──────────┘    └──────────┘
         │              │                │
         └──────────────┴────────────────┘
                        │
                        ▼
              ┌──────────────────┐
              │  createSystem()  │ ← 编译时执行一次
              │   staticSystem   │
              └──────────────────┘
```

## 7. 数据流

### 7.1 主题切换流程

```
用户操作
  │
  ├─ 选择 Primary Color (chateauGreen)
  │   └─> localStorage.setItem('primaryColor', 'chateauGreen')
  │   └─> useSettings() 更新
  │   └─> <Box colorPalette="chateauGreen"> 重新渲染
  │   └─> CSS 变量更新: --chakra-colors-color-palette-*
  │   └─> UI 使用新颜色
  │
  ├─ 切换 Color Mode (dark)
  │   └─> setTheme('dark')
  │   └─> document.documentElement.classList.add('dark')
  │   └─> 条件 tokens (_dark) 生效
  │   └─> UI 适配 dark 模式
  │
  └─ System Mode (auto)
      └─> 监听系统主题变化
      └─> 自动切换 light/dark
```

### 7.2 颜色解析流程

```
组件代码: <Button>Click</Button>
  │
  ├─ Button 使用 recipe
  │   └─> variant="solid"
  │   └─> colorPalette 从父级继承
  │
  ├─ 查找颜色值
  │   └─> bg="colorPalette.solid"
  │   └─> 解析为 CSS 变量: var(--chakra-colors-color-palette-solid)
  │
  ├─ CSS 变量映射
  │   └─> --chakra-colors-color-palette-solid
  │   └─> 映射到 --chakra-colors-chateauGreen-500
  │
  └─ 最终渲染
      └─> background-color: #16b364 (light mode)
      └─> background-color: #3acd7e (dark mode)
```

## 8. 下一步

详细的颜色系统设计,请查看 [02-color-system-design.md](./02-color-system-design.md)。
