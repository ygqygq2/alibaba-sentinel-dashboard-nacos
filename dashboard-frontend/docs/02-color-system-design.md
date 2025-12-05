# 颜色系统设计方案

## 1. 自定义颜色定义 (colors.ts)

### 1.1 颜色系列结构

每个颜色系列包含 11 个级别 (50-950):

```typescript
// colors.ts
export const chateauGreen = {
  50: '#edfcf2', // 最浅
  100: '#d2f9de',
  200: '#aaf0c4',
  300: '#72e3a3',
  400: '#3acd7e',
  500: '#16b364', // 主色调
  600: '#0a9150',
  700: '#087442',
  800: '#095c37',
  900: '#094b2f',
  950: '#032b1a', // 最深
} satisfies PaletteRange;
```

### 1.2 当前颜色系列

项目定义了 **11 种颜色系列**:

| 颜色名称       | 用途              | 主色 (500) |
| -------------- | ----------------- | ---------- |
| `california`   | 金黄色            | #fb9c0c    |
| `chateauGreen` | **主题色** 翠绿   | #16b364    |
| `kepple`       | 青绿色            | #15b79f    |
| `neonBlue`     | **主题色** 霓虹蓝 | #635bff    |
| `nevada`       | 中性灰            | #636b74    |
| `redOrange`    | 红橙色            | #f04438    |
| `royalBlue`    | **主题色** 宝蓝   | #5265ff    |
| `shakespeare`  | 天蓝色            | #04aad6    |
| `stormGrey`    | 风暴灰            | #667085    |
| `tomatoOrange` | **主题色** 番茄橙 | #ff6c47    |

**Primary Colors** (用户可选):

- chateauGreen
- neonBlue
- royalBlue
- tomatoOrange

### 1.3 扩展新颜色

要添加新颜色系列:

```typescript
// 1. 在 colors.ts 中定义
export const brandPurple = {
  50: '#faf5ff',
  100: '#f3e8ff',
  // ... 定义 50-950 所有级别
  500: '#a855f7', // 主色调
  // ...
  950: '#3b0764',
} satisfies PaletteRange;

// 2. 在 types.d.ts 中添加类型
export type PrimaryColor = 'chateauGreen' | 'neonBlue' | 'royalBlue' | 'tomatoOrange' | 'brandPurple'; // ← 新增

// 3. 在 color-schemes.ts 中配置 light/dark 方案
```

## 2. Primary Color 切换机制

### 2.1 核心概念

使用 Chakra UI v3 的 `colorPalette` 机制:

```tsx
// Provider 设置全局 colorPalette
<Box colorPalette="chateauGreen">
  {/* 所有子组件继承此颜色 */}
  <Button>使用 chateauGreen 颜色</Button>
  <Badge>使用 chateauGreen 颜色</Badge>
</Box>

// 切换到其他颜色
<Box colorPalette="neonBlue">
  <Button>使用 neonBlue 颜色</Button>
</Box>
```

### 2.2 颜色 Tokens 注册

在静态 system 中注册所有自定义颜色:

```typescript
// theme/system.ts
import * as colors from './colors';

// 生成颜色 tokens (直接使用颜色值，不含条件)
function generateColorTokens(colorPalette: PaletteRange) {
  const levels = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
  const tokens: Record<number, any> = {};
  levels.forEach((level) => {
    const color = colorPalette[level as keyof typeof colorPalette] || colorPalette[500];
    tokens[level] = {
      value: color, // 直接使用颜色值，如 "#16b364"
    };
  });
  return tokens;
}

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        // 注册自定义颜色
        chateauGreen: generateColorTokens(colors.chateauGreen),
        neonBlue: generateColorTokens(colors.neonBlue),
        royalBlue: generateColorTokens(colors.royalBlue),
        tomatoOrange: generateColorTokens(colors.tomatoOrange),
      },
    },
  },
});
```

**关键点:**

- ✅ **简单结构**: 直接使用颜色值 `{ value: "#16b364" }`，不使用嵌套对象
- ✅ **无条件映射**: tokens 不包含 `_light/_dark` 条件，保持简单
- ✅ **Dark 模式支持**: 通过 semanticTokens 中的 `base/_dark` 条件实现

### 2.3 语义化 Tokens

Chakra UI v3 要求为每个颜色定义 7 个语义 tokens，**使用 `base/_dark` 条件**支持深色模式:

```typescript
// 生成语义化 tokens (支持 light/dark 模式，引用 tokens)
function generateSemanticTokens(colorName: string) {
  return {
    solid: {
      value: {
        base: `{colors.${colorName}.500}`,  // Light 模式
        _dark: `{colors.${colorName}.400}`  // Dark 模式
      }
    },
    contrast: {
      value: {
        base: 'white',
        _dark: 'black'
      }
    },
    fg: {
      value: {
        base: `{colors.${colorName}.700}`,
        _dark: `{colors.${colorName}.300}`
      }
    },
    muted: {
      value: {
        base: `{colors.${colorName}.200}`,
        _dark: `{colors.${colorName}.800}`
      }
    },
    subtle: {
      value: {
        base: `{colors.${colorName}.100}`,
        _dark: `{colors.${colorName}.900}`
      }
    },
    emphasized: {
      value: {
        base: `{colors.${colorName}.300}`,
        _dark: `{colors.${colorName}.700}`
      }
    },
    focusRing: {
      value: {
        base: `{colors.${colorName}.500}`,
        _dark: `{colors.${colorName}.500}`
      }
    },
  };
}

// 应用到配置
semanticTokens: {
  colors: {
    chateauGreen: generateSemanticTokens('chateauGreen'),
    neonBlue: generateSemanticTokens('neonBlue'),
    royalBlue: generateSemanticTokens('royalBlue'),
    tomatoOrange: generateSemanticTokens('tomatoOrange'),
  }
}
```

**语义 Token 用途:**

| Token        | Light Mode (base) | Dark Mode (\_dark) | 用途          |
| ------------ | ----------------- | ------------------ | ------------- |
| `solid`      | 500               | 400                | 实心背景色    |
| `contrast`   | white             | black              | 对比文本色    |
| `fg`         | 700               | 300                | 前景色/文本色 |
| `muted`      | 200               | 800                | 柔和背景色    |
| `subtle`     | 100               | 900                | 微妙背景色    |
| `emphasized` | 300               | 700                | 强调背景色    |
| `focusRing`  | 500               | 500                | 焦点环颜色    |

**关键点:**

- ✅ **使用 base/\_dark**: Chakra UI v3 推荐使用 `base/_dark` 代替 `_light/_dark`
- ✅ **引用 tokens**: 使用 `{colors.colorName.level}` 语法引用已定义的颜色 tokens
- ✅ **自动适配**: 当 ColorModeProvider 切换模式时，这些 tokens 会自动更新

### 2.4 组件中使用

**重要原则:**

1. **支持 `colorPalette` 的组件** (如 Button, Badge 等): 使用 `colorPalette={settings.primaryColor}` prop
2. **不支持 `colorPalette` 的组件** (如 Text, Box 等): 使用模板字符串 `color={\`${settings.primaryColor}.500\`}`

```tsx
// ✅ Button 组件 - 支持 colorPalette
<Button
  variant="solid"
  colorPalette={settings.primaryColor}
>
  按钮
</Button>

// ✅ Text 组件 - 使用模板字符串
<Text color={`${settings.primaryColor}.500`}>
  文本颜色
</Text>

// ✅ Box 组件 - 使用模板字符串
<Box borderColor={`${settings.primaryColor}.200`}>
  边框
</Box>

// ✅ 也可以在 Recipe 中使用 colorPalette tokens
// components/button.tsx
export const Button = defineRecipe({
  variants: {
    variant: {
      solid: {
        bg: { base: 'colorPalette.500', _dark: 'colorPalette.400' },
        color: 'white',
        _hover: {
          bg: { base: 'colorPalette.600', _dark: 'colorPalette.500' },
        },
      },
    },
  },
});

// ❌ 错误: 硬编码颜色
<Button bg="blue.500" color="white">
  按钮
</Button>
```

## 3. Light/Dark 模式支持

### 3.1 ColorMode Provider

使用 `next-themes` 管理颜色模式:

```tsx
// components/ui/color-mode.tsx
import { ThemeProvider, useTheme } from 'next-themes';

export function ColorModeProvider(props) {
  return (
    <ThemeProvider
      attribute="class" // ← 通过 CSS class 切换
      disableTransitionOnChange
      {...props}
    />
  );
}

export function useColorMode() {
  const { resolvedTheme, setTheme } = useTheme();
  return {
    colorMode: resolvedTheme, // 'light' | 'dark'
    setColorMode: setTheme,
  };
}
```

### 3.2 条件 Tokens 原理

Chakra UI v3 使用 `base/_dark` 条件（不是 `_light/_dark`）:

```typescript
// 定义条件 token
semanticTokens: {
  colors: {
    brand: {
      solid: {
        value: {
          base: '{colors.brand.500}',  // 默认 (light 模式)
          _dark: '{colors.brand.400}'  // dark 模式
        }
      }
    }
  }
}

// 编译后的 CSS
:root {
  --chakra-colors-brand-solid: var(--chakra-colors-brand-500);
}

:root.dark {
  --chakra-colors-brand-solid: var(--chakra-colors-brand-400);
}
```

**关键点:**

- ✅ **使用 base/\_dark**: `base` 代表默认值（通常是 light 模式），`_dark` 代表深色模式
- ✅ **避免使用 \_light/\_dark**: 虽然也能工作，但 `base/_dark` 是推荐的语法
- ✅ **CSS 类切换**: 通过在 `<html>` 或 `<body>` 上添加/移除 `.dark` 类来切换模式

### 3.3 System Mode

支持跟随系统主题:

```tsx
// 用户选择 "System"
<select value="system">
  <option value="light">Light</option>
  <option value="dark">Dark</option>
  <option value="system">System</option>
</select>;

// next-themes 自动监听系统主题
useEffect(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  // 自动切换...
}, []);
```

### 3.4 禁用过渡动画

避免切换主题时闪烁:

```tsx
<ThemeProvider disableTransitionOnChange>
  {children}
</ThemeProvider>

// 或者使用 CSS
* {
  transition: none !important;
}
```

## 4. 完整示例

### 4.1 主题系统文件

```typescript
// theme/system.ts
import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';
import * as colors from './colors';

const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        // 注册所有自定义颜色
        chateauGreen: generateColorTokens(colors.chateauGreen),
        neonBlue: generateColorTokens(colors.neonBlue),
        royalBlue: generateColorTokens(colors.royalBlue),
        tomatoOrange: generateColorTokens(colors.tomatoOrange),
      },
    },
    semanticTokens: {
      colors: {
        // 为每个颜色生成语义 tokens
        chateauGreen: generateSemanticTokens('chateauGreen'),
        neonBlue: generateSemanticTokens('neonBlue'),
        royalBlue: generateSemanticTokens('royalBlue'),
        tomatoOrange: generateSemanticTokens('tomatoOrange'),
      },
    },
  },
});

// 创建静态 system (只执行一次)
export const system = createSystem(defaultConfig, config);

// 辅助函数: 生成颜色 tokens
function generateColorTokens(colorPalette: PaletteRange) {
  const tokens = {};
  const levels = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

  levels.forEach((level, index) => {
    const reversedLevel = levels[levels.length - 1 - index];
    tokens[level] = {
      value: {
        _light: colorPalette[level],
        _dark: colorPalette[reversedLevel],
      },
    };
  });

  return tokens;
}

// 辅助函数: 生成语义 tokens
function generateSemanticTokens(colorName: string) {
  return {
    solid: {
      value: {
        _light: `{colors.${colorName}.500}`,
        _dark: `{colors.${colorName}.400}`,
      },
    },
    contrast: { value: { _light: 'white', _dark: 'black' } },
    fg: {
      value: {
        _light: `{colors.${colorName}.700}`,
        _dark: `{colors.${colorName}.300}`,
      },
    },
    muted: {
      value: {
        _light: `{colors.${colorName}.200}`,
        _dark: `{colors.${colorName}.800}`,
      },
    },
    subtle: {
      value: {
        _light: `{colors.${colorName}.100}`,
        _dark: `{colors.${colorName}.900}`,
      },
    },
    emphasized: {
      value: {
        _light: `{colors.${colorName}.300}`,
        _dark: `{colors.${colorName}.700}`,
      },
    },
    focusRing: {
      value: {
        _light: `{colors.${colorName}.500}`,
        _dark: `{colors.${colorName}.500}`,
      },
    },
  };
}
```

### 4.2 Provider 实现

```tsx
// components/ui/provider.tsx
import { Box, ChakraProvider } from '@chakra-ui/react';
import { useSettings } from '@/hooks/use-settings';
import { system } from '@/styles/theme/system';
import { ColorModeProvider } from './color-mode';

export function Provider({ children }) {
  const { settings } = useSettings();

  return (
    <ChakraProvider value={system}>
      <ColorModeProvider>
        {/* 设置全局 colorPalette */}
        <Box
          colorPalette={settings.primaryColor}
          minH="100vh"
        >
          {children}
        </Box>
      </ColorModeProvider>
    </ChakraProvider>
  );
}
```

### 4.3 Settings 组件

```tsx
// components/settings/options-primary-color.tsx
export function OptionsPrimaryColor({ value, onChange }) {
  const colors = [
    { name: 'chateauGreen', label: 'Chateau Green' },
    { name: 'neonBlue', label: 'Neon Blue' },
    { name: 'royalBlue', label: 'Royal Blue' },
    { name: 'tomatoOrange', label: 'Tomato Orange' },
  ];

  return (
    <Stack
      direction="row"
      gap={2}
    >
      {colors.map((color) => (
        // 每个选项显示对应颜色
        <Box
          key={color.name}
          colorPalette={color.name}
        >
          <Button
            variant={value === color.name ? 'solid' : 'outline'}
            onClick={() => onChange(color.name)}
          >
            {color.label}
          </Button>
        </Box>
      ))}
    </Stack>
  );
}
```

## 5. 最佳实践

### 5.1 ✅ 推荐做法

```tsx
// 1. 使用语义 token
<Button bg="colorPalette.solid" color="colorPalette.contrast" />

// 2. 局部覆盖 colorPalette
<Box colorPalette="red">
  <Alert status="error">错误提示</Alert>
</Box>

// 3. 使用条件样式
<Box
  bg="colorPalette.subtle"
  _hover={{ bg: 'colorPalette.muted' }}
  _dark={{ borderColor: 'colorPalette.700' }}
/>
```

### 5.2 ❌ 避免做法

```tsx
// 1. 硬编码颜色
<Button bg="#3182ce" />  // ❌

// 2. 运行时创建 system
const theme = useMemo(() => createSystem(...), [color]);  // ❌

// 3. 直接使用内部 CSS 变量
<Box style={{ background: 'var(--chakra-colors-blue-500)' }} />  // ❌
```

## 6. 性能优化

### 6.1 静态 System

- ✅ System 在模块顶层创建一次
- ✅ 不依赖运行时状态
- ✅ Tree-shakeable

### 6.2 CSS 变量

- ✅ 浏览器原生支持
- ✅ 无需 JavaScript 计算
- ✅ 切换主题零性能损耗

### 6.3 类型生成

```bash
# 生成类型以获得更好的 IDE 支持
npx @chakra-ui/cli typegen src/styles/theme/system.ts
```

## 7. 下一步

实现细节和代码示例,请查看 [03-implementation-guide.md](./03-implementation-guide.md)。
