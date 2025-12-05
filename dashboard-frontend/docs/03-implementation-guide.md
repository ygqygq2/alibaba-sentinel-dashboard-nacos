# 实现指南

## 1. 快速开始

### 1.1 项目结构

```
src/
├── styles/theme/
│   ├── colors.ts           # 颜色定义
│   ├── system.ts           # 主题系统 (新建)
│   ├── types.d.ts          # 类型定义
│   └── components/
│       └── components.ts   # 组件样式
├── components/ui/
│   ├── provider.tsx        # 主题 Provider (修改)
│   └── color-mode.tsx      # 颜色模式组件
└── hooks/
    ├── use-settings.ts     # 设置 Hook
    └── use-color-mode.ts   # 颜色模式 Hook
```

### 1.2 安装依赖

```bash
pnpm add @chakra-ui/react@^3.0.0
pnpm add next-themes
```

## 2. 实现步骤

### 步骤 1: 创建静态主题系统

创建 `src/styles/theme/system.ts`:

```typescript
import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';
import * as colors from './colors';
import { components } from './components/components';
import type { PaletteRange } from './types';

/**
 * 生成颜色 tokens (直接使用颜色值，不含条件)
 * 每个级别直接映射到对应的颜色值
 */
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

/**
 * 生成语义化 tokens (支持 light/dark 模式，使用 base/_dark 条件)
 * Chakra UI v3 要求: solid, contrast, fg, muted, subtle, emphasized, focusRing
 */
function generateSemanticTokens(colorName: string) {
  return {
    solid: {
      value: {
        base: `{colors.${colorName}.500}`, // Light 模式
        _dark: `{colors.${colorName}.400}`, // Dark 模式
      },
    },
    contrast: {
      value: {
        base: 'white',
        _dark: 'black',
      },
    },
    fg: {
      value: {
        base: `{colors.${colorName}.700}`,
        _dark: `{colors.${colorName}.300}`,
      },
    },
    muted: {
      value: {
        base: `{colors.${colorName}.200}`,
        _dark: `{colors.${colorName}.800}`,
      },
    },
    subtle: {
      value: {
        base: `{colors.${colorName}.100}`,
        _dark: `{colors.${colorName}.900}`,
      },
    },
    emphasized: {
      value: {
        base: `{colors.${colorName}.300}`,
        _dark: `{colors.${colorName}.700}`,
      },
    },
    focusRing: {
      value: {
        base: `{colors.${colorName}.500}`,
        _dark: `{colors.${colorName}.500}`,
      },
    },
  };
}

// 定义主题配置
const config = defineConfig({
  theme: {
    breakpoints: {
      xs: '0px',
      sm: '600px',
      md: '900px',
      lg: '1200px',
      xl: '1440px',
      '2xl': '1600px',
    },
    tokens: {
      colors: {
        // 注册所有 Primary Colors (使用简单的颜色值)
        chateauGreen: generateColorTokens(colors.chateauGreen),
        neonBlue: generateColorTokens(colors.neonBlue),
        royalBlue: generateColorTokens(colors.royalBlue),
        tomatoOrange: generateColorTokens(colors.tomatoOrange),
      },
      fonts: {
        body: { value: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
        heading: { value: 'Georgia, serif' },
      },
    },
    semanticTokens: {
      colors: {
        // 为每个颜色生成语义 tokens (使用 base/_dark 条件)
        chateauGreen: generateSemanticTokens('chateauGreen'),
        neonBlue: generateSemanticTokens('neonBlue'),
        royalBlue: generateSemanticTokens('royalBlue'),
        tomatoOrange: generateSemanticTokens('tomatoOrange'),
      },
    },
    recipes: components, // 注册组件 recipes
  },
});

// 创建静态主题系统 (只执行一次)
export const system = createSystem(defaultConfig, config);
```

**关键点:**

1. **简单 Tokens**: `generateColorTokens` 返回简单的 `{ value: color }` 结构
2. **语义 Tokens**: `generateSemanticTokens` 使用 `base/_dark` 条件支持深色模式
3. **静态创建**: `createSystem` 在模块顶层执行一次，不依赖运行时状态
4. **Recipe 注册**: 通过 `recipes: components` 注册所有组件样式

### 步骤 2: 更新 Provider

修改 `src/components/ui/provider.tsx`:

```typescript
'use client';

import { Box, ChakraProvider } from '@chakra-ui/react';
import * as React from 'react';
import { Helmet } from 'react-helmet-async';

import { useSettings } from '@/hooks/use-settings';
import { system } from '@/styles/theme/system';

import { Rtl } from '../core/rtl';
import { ColorModeProvider, type ColorModeProviderProps } from './color-mode';

export function Provider(props: ColorModeProviderProps) {
  const { settings } = useSettings();

  return (
    <ChakraProvider value={system}>
      <Helmet>
        <meta
          content={settings.colorScheme}
          name="color-scheme"
        />
      </Helmet>
      <Rtl direction={settings.direction}>
        <ColorModeProvider {...props}>
          {/* 设置全局 colorPalette - 动态切换主题色 */}
          <Box
            colorPalette={settings.primaryColor}
            minH="100vh"
          >
            {props.children}
          </Box>
        </ColorModeProvider>
      </Rtl>
    </ChakraProvider>
  );
}
```

**关键点:**

1. **静态 system**: 使用导入的 `system`，不在运行时创建
2. **colorPalette 切换**: 通过 `Box` 的 `colorPalette` prop 设置全局主题色
3. **ColorModeProvider**: 使用 next-themes 管理 light/dark 模式

## 4. Settings 组件实现

### 4.1 Primary Color 选择器

创建 `src/styles/theme/components/button.tsx`:

```typescript
import { defineRecipe } from '@chakra-ui/react';

export const Button = defineRecipe({
  base: {
    borderRadius: '8px',
    fontWeight: 'medium',
    transition: 'all 0.2s',
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'colorPalette.500',
      outlineOffset: '2px',
    },
    _disabled: {
      opacity: 0.4,
      cursor: 'not-allowed',
    },
  },
  variants: {
    variant: {
      // Chakra UI v3 标准 variant: solid (支持 dark mode)
      solid: {
        bg: { base: 'colorPalette.500', _dark: 'colorPalette.400' },
        color: 'white',
        _hover: {
          bg: { base: 'colorPalette.600', _dark: 'colorPalette.500' },
          _disabled: {
            bg: { base: 'colorPalette.500', _dark: 'colorPalette.400' },
          },
        },
        _active: {
          bg: { base: 'colorPalette.700', _dark: 'colorPalette.600' },
        },
      },
      // Chakra UI v3 标准 variant: outline
      outline: {
        borderWidth: '1px',
        borderColor: 'colorPalette.500',
        color: 'colorPalette.700',
        _hover: {
          bg: 'colorPalette.50',
          _disabled: {
            bg: 'transparent',
          },
        },
        _active: {
          bg: 'colorPalette.100',
        },
      },
      // 其他 variants: ghost, subtle, surface, plain...
    },
    size: {
      xs: {
        fontSize: 'xs',
        px: 3,
        h: 8,
        minW: 8,
      },
      sm: {
        fontSize: 'sm',
        px: 4,
        h: 9,
        minW: 9,
      },
      md: {
        fontSize: 'md',
        px: 5,
        h: 10,
        minW: 10,
      },
      lg: {
        fontSize: 'lg',
        px: 6,
        h: 11,
        minW: 11,
      },
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'solid',
  },
});
```

### 3.2 注册 Recipe

在 `src/styles/theme/components/components.ts` 中:

```typescript
import { Button } from './button';
// 导入其他组件...

export const components = {
  button: Button, // 注意: 小写的 key
  // 其他组件...
};
```

**关键点:**

1. **base/\_dark 条件**: 使用 `{ base: value, _dark: value }` 支持深色模式
2. **colorPalette tokens**: 在 recipe 中使用 `colorPalette.500` 等引用当前颜色
3. **小写 key**: recipes 对象的 key 必须是小写（如 `button` 不是 `Button`）

```tsx
// components/core/settings/options-primary-color.tsx
export function OptionsPrimaryColor({ onChange, value }) {
  const colors = [
    { label: 'Chateau Green', value: 'chateauGreen', colorPalette: 'chateauGreen' },
    { label: 'Neon Blue', value: 'neonBlue', colorPalette: 'neonBlue' },
    { label: 'Royal Blue', value: 'royalBlue', colorPalette: 'royalBlue' },
    { label: 'Tomato Orange', value: 'tomatoOrange', colorPalette: 'tomatoOrange' },
  ];

  return (
    <Stack
      direction="row"
      gap={2}
      flexWrap="wrap"
    >
      {colors.map((option) => (
        <Box
          key={option.value}
          colorPalette={option.colorPalette}
        >
          <Option
            label={option.label}
            onClick={() => onChange?.(option.value)}
            selected={option.value === value}
          />
        </Box>
      ))}
    </Stack>
  );
}
```

## 5. 组件使用模式

### 5.1 支持 colorPalette 的组件

对于 Chakra UI 提供的支持 `colorPalette` prop 的组件（如 Button, Badge 等）:

```tsx
import { Button } from '@chakra-ui/react';
import { useSettings } from '@/hooks/use-settings';

export function MyComponent() {
  const { settings } = useSettings();

  return (
    <Button
      variant="solid"
      colorPalette={settings.primaryColor}
    >
      点击按钮
    </Button>
  );
}
```

### 5.2 不支持 colorPalette 的组件

对于不支持 `colorPalette` prop 的组件（如 Text, Heading 等）:

```tsx
import { Text, Heading } from '@chakra-ui/react';
import { useSettings } from '@/hooks/use-settings';

export function MyComponent() {
  const { settings } = useSettings();

  return (
    <>
      {/* 使用模板字符串动态引用颜色 */}
      <Text color={`${settings.primaryColor}.500`}>彩色文本</Text>

      <Heading color={`${settings.primaryColor}.700`}>标题颜色</Heading>

      {/* 边框颜色 */}
      <Box borderColor={`${settings.primaryColor}.200`}>内容区域</Box>
    </>
  );
}
```

### 5.3 Recipe 中使用 colorPalette

在组件 recipe 中可以直接使用 `colorPalette.*` tokens:

```tsx
// 定义 recipe
export const Card = defineRecipe({
  variants: {
    variant: {
      outline: {
        borderWidth: '1px',
        borderColor: { base: 'colorPalette.200', _dark: 'colorPalette.700' },
      },
      solid: {
        bg: { base: 'colorPalette.500', _dark: 'colorPalette.400' },
        color: 'white',
      },
    },
  },
});

// 使用 recipe
<Card
  variant="outline"
  colorPalette={settings.primaryColor}
>
  卡片内容
</Card>;
```

### 5.4 深色模式条件样式

使用 `_dark` 条件在深色模式下应用不同样式:

```tsx
<Box
  bg={{ base: 'white', _dark: 'gray.800' }}
  color={{ base: 'gray.900', _dark: 'white' }}
  borderColor={{ base: `${settings.primaryColor}.200`, _dark: `${settings.primaryColor}.700` }}
>
  自适应内容
</Box>
```

## 6. 测试清单

- [ ] **Primary Color 切换测试** (4种颜色)
  - [ ] chateauGreen → Button 显示绿色系
  - [ ] neonBlue → Button 显示青色系
  - [ ] royalBlue → Button 显示蓝色系
  - [ ] tomatoOrange → Button 显示橙色系

- [ ] **Color Mode 切换测试** (3种模式)
  - [ ] Light Mode → 浅色背景，深色文本
  - [ ] Dark Mode → 深色背景，浅色文本
  - [ ] System → 跟随系统设置自动切换

- [ ] **组合测试**
  - [ ] 在 Light Mode 下切换 Primary Color
  - [ ] 在 Dark Mode 下切换 Primary Color
  - [ ] Button hover 状态颜色正确
  - [ ] Button active 状态颜色正确

- [ ] **持久化测试**
  - [ ] 刷新页面后设置保持不变
  - [ ] 打开新标签页设置保持一致
  - [ ] localStorage 正确存储设置

- [ ] **不同组件测试**
  - [ ] Button 组件使用 colorPalette prop
  - [ ] Text 组件使用模板字符串
  - [ ] Badge/Alert 等组件颜色正确
  - [ ] 自定义 Recipe 组件颜色正确

## 7. 故障排除

### 问题 1: 颜色不生效

**症状**: Button 或其他组件颜色显示为默认蓝色，不随 Primary Color 切换

**解决方案**:

1. 检查是否在 `system.ts` 中注册了颜色:

   ```typescript
   tokens: {
     colors: {
       chateauGreen: generateColorTokens(colors.chateauGreen),
       // ...其他颜色
     }
   }
   ```

2. 确认 Provider 中设置了 `colorPalette` prop:

   ```tsx
   <Box colorPalette={settings.primaryColor}>{children}</Box>
   ```

3. 检查组件是否正确使用颜色:
   - 支持 colorPalette 的组件: `<Button colorPalette={settings.primaryColor} />`
   - 不支持的组件: `<Text color={\`${settings.primaryColor}.500\`} />`

### 问题 2: Dark 模式不工作

**症状**: 切换到 Dark Mode 后颜色没有变化

**解决方案**:

1. 确认使用了 `next-themes` 的 `ColorModeProvider`:

   ```tsx
   import { ColorModeProvider } from './color-mode';

   <ColorModeProvider>{children}</ColorModeProvider>;
   ```

2. 检查 `attribute="class"` 是否设置:

   ```tsx
   // components/ui/color-mode.tsx
   <ThemeProvider attribute="class">{children}</ThemeProvider>
   ```

3. 确认语义 tokens 使用了 `base/_dark` 格式:

   ```typescript
   solid: {
     value: {
       base: '{colors.colorName.500}',  // ✅ 使用 base
       _dark: '{colors.colorName.400}'  // ✅ 使用 _dark
     }
   }
   ```

4. 检查 Recipe 中是否使用了 dark mode 条件:
   ```typescript
   bg: { base: 'colorPalette.500', _dark: 'colorPalette.400' }
   ```

### 问题 3: colorPalette tokens 未定义

**症状**: 控制台警告 "Token colorPalette.500 not found"

**解决方案**:

1. 检查 tokens 结构是否正确（应该是简单值，不是嵌套对象）:

   ```typescript
   // ✅ 正确
   tokens[500] = { value: '#16b364' };

   // ❌ 错误
   tokens[500] = { value: { _light: '#16b364', _dark: '#3acd7e' } };
   ```

2. 确认在 semanticTokens 中定义了必需的 tokens:
   ```typescript
   semanticTokens: {
     colors: {
       colorName: {
         solid: { ... },
         contrast: { ... },
         fg: { ... },
         // ... 其他 7 个必需的 tokens
       }
     }
   }
   ```

### 问题 4: Recipe 没有应用

**症状**: 自定义 Button recipe 样式不生效

**解决方案**:

1. 检查 recipe 是否在 system 中注册（使用小写 key）:

   ```typescript
   recipes: {
     button: Button,  // ✅ 小写
     // ❌ 不要用: Button: Button
   }
   ```

2. 确认导入了正确的组件:

   ```tsx
   // ✅ 使用 Chakra UI 的 Button
   import { Button } from '@chakra-ui/react';

   // ❌ 不要自己创建 Button 组件
   ```

3. 检查 recipe 文件是否正确导出:
   ```typescript
   // components/button.tsx
   export const Button = defineRecipe({ ... });
   ```

### 问题 5: Text 组件颜色不工作

**症状**: Text 组件的 `colorPalette` prop 不生效

**解决方案**:

Text 组件不支持 `colorPalette` prop，应该使用模板字符串:

```tsx
// ❌ 错误
<Text colorPalette={settings.primaryColor}>文本</Text>

// ✅ 正确
<Text color={`${settings.primaryColor}.500`}>文本</Text>
```

**不支持 colorPalette 的常见组件**:

- Text, Heading
- Box (用于颜色属性，但支持作为容器设置 colorPalette)
- Stack, Flex, Grid
- Image, Icon

**支持 colorPalette 的常见组件**:

- Button
- Badge
- Alert
- Progress
- 自定义 Recipe 组件
