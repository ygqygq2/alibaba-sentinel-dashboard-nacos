# Chakra UI v3 主题系统最佳实践

## 1. 核心原则

### 1.1 Token 结构设计

**✅ 正确: 简单的 Token 值**

```typescript
// colors tokens - 使用简单的颜色值
function generateColorTokens(colorPalette: PaletteRange) {
  const tokens: Record<number, any> = {};
  levels.forEach((level) => {
    tokens[level] = {
      value: colorPalette[level], // 直接使用颜色值 "#16b364"
    };
  });
  return tokens;
}
```

**❌ 错误: 嵌套的条件对象**

```typescript
// ❌ 不要在 tokens 中使用条件
tokens[500] = {
  value: {
    _light: '#16b364',
    _dark: '#3acd7e',
  },
};
```

### 1.2 语义 Tokens 设计

**✅ 正确: 使用 base/\_dark 条件**

```typescript
// semanticTokens - 支持 light/dark 模式
function generateSemanticTokens(colorName: string) {
  return {
    solid: {
      value: {
        base: `{colors.${colorName}.500}`, // 默认 (light 模式)
        _dark: `{colors.${colorName}.400}`, // dark 模式
      },
    },
    // ... 其他 tokens
  };
}
```

**❌ 错误: 使用 \_light/\_dark**

```typescript
// ❌ 虽然能工作，但不推荐
solid: {
  value: {
    _light: `{colors.${colorName}.500}`,
    _dark: `{colors.${colorName}.400}`
  }
}
```

**关键点:**

- ✅ Tokens: 使用简单值 `{ value: color }`
- ✅ Semantic Tokens: 使用 `base/_dark` 条件
- ✅ Recipe: 使用 `{ base: value, _dark: value }` 支持深色模式

## 2. 组件使用模式

### 2.1 判断组件是否支持 colorPalette

**规则:**

1. **Recipe 组件** (如 Button, Badge, Alert): 支持 `colorPalette` prop
2. **布局组件** (如 Text, Heading, Box): 不支持 `colorPalette` prop（但 Box 可作为容器设置）

### 2.2 支持 colorPalette 的组件

```tsx
import { Button, Badge } from '@chakra-ui/react';
import { useSettings } from '@/hooks/use-settings';

export function MyComponent() {
  const { settings } = useSettings();

  return (
    <>
      {/* ✅ 直接使用 colorPalette prop */}
      <Button
        variant="solid"
        colorPalette={settings.primaryColor}
      >
        按钮
      </Button>

      <Badge colorPalette={settings.primaryColor}>标签</Badge>
    </>
  );
}
```

### 2.3 不支持 colorPalette 的组件

```tsx
import { Text, Heading, Box } from '@chakra-ui/react';
import { useSettings } from '@/hooks/use-settings';

export function MyComponent() {
  const { settings } = useSettings();

  return (
    <>
      {/* ✅ 使用模板字符串动态引用颜色 */}
      <Text color={`${settings.primaryColor}.500`}>彩色文本</Text>

      <Heading color={`${settings.primaryColor}.700`}>标题</Heading>

      {/* ✅ Box 作为容器设置 colorPalette，影响子组件 */}
      <Box colorPalette={settings.primaryColor}>
        <Button>这个按钮会继承 colorPalette</Button>
      </Box>

      {/* ✅ Box 自身样式使用模板字符串 */}
      <Box
        borderColor={`${settings.primaryColor}.200`}
        bg={`${settings.primaryColor}.50`}
      >
        内容
      </Box>
    </>
  );
}
```

### 2.4 深色模式条件样式

```tsx
// ✅ 使用 base/_dark 对象语法
<Box
  bg={{ base: 'white', _dark: 'gray.800' }}
  color={{ base: 'gray.900', _dark: 'white' }}
  borderColor={{
    base: `${settings.primaryColor}.200`,
    _dark: `${settings.primaryColor}.700`,
  }}
>
  自适应内容
</Box>;

// ✅ Recipe 中也使用 base/_dark
export const Card = defineRecipe({
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
```

## 3. Recipe 开发指南

### 3.1 Recipe 基本结构

```typescript
import { defineRecipe } from '@chakra-ui/react';

export const ComponentName = defineRecipe({
  // 1. base: 所有变体共享的基础样式
  base: {
    borderRadius: '8px',
    fontWeight: 'medium',
    transition: 'all 0.2s',
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'colorPalette.500',
    },
  },

  // 2. variants: 不同的变体定义
  variants: {
    variant: {
      solid: {
        bg: { base: 'colorPalette.500', _dark: 'colorPalette.400' },
        color: 'white',
      },
      outline: {
        borderWidth: '1px',
        borderColor: 'colorPalette.500',
      },
    },
    size: {
      sm: { fontSize: 'sm', px: 4, h: 9 },
      md: { fontSize: 'md', px: 5, h: 10 },
      lg: { fontSize: 'lg', px: 6, h: 11 },
    },
  },

  // 3. defaultVariants: 默认变体
  defaultVariants: {
    size: 'md',
    variant: 'solid',
  },
});
```

### 3.2 Recipe 注册

```typescript
// src/styles/theme/components/components.ts
import { Button } from './button';
import { Card } from './card';

export const components = {
  button: Button, // ✅ 小写 key
  card: Card,
  // ❌ 不要用: Button: Button
};
```

**关键点:**

- ✅ Recipe key 必须小写（`button` 不是 `Button`）
- ✅ 使用 `defineRecipe` 定义
- ✅ 在 system.ts 中通过 `recipes: components` 注册

### 3.3 在 Recipe 中使用 colorPalette

```typescript
// ✅ 正确: 使用 colorPalette tokens
export const Button = defineRecipe({
  variants: {
    variant: {
      solid: {
        // 使用 colorPalette.level 引用当前颜色
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
export const Button = defineRecipe({
  variants: {
    variant: {
      solid: {
        bg: 'blue.500', // 硬编码，无法响应 colorPalette
        color: 'white',
      },
    },
  },
});
```

## 4. 常见错误及解决方案

### 错误 1: Token 嵌套结构

**❌ 错误代码:**

```typescript
function generateColorTokens(colorPalette: PaletteRange) {
  return {
    500: {
      value: {
        _light: colorPalette[500],
        _dark: colorPalette[400],
      },
    },
  };
}
```

**✅ 正确代码:**

```typescript
function generateColorTokens(colorPalette: PaletteRange) {
  return {
    500: {
      value: colorPalette[500], // 直接使用颜色值
    },
  };
}
```

**原因:** Chakra UI v3 的 colorPalette 机制要求 tokens 是简单值，深色模式通过 semanticTokens 处理。

### 错误 2: 使用 \_light/\_dark 代替 base/\_dark

**❌ 错误代码:**

```typescript
semanticTokens: {
  colors: {
    brand: {
      solid: {
        value: {
          _light: '{colors.brand.500}',
          _dark: '{colors.brand.400}'
        }
      }
    }
  }
}
```

**✅ 正确代码:**

```typescript
semanticTokens: {
  colors: {
    brand: {
      solid: {
        value: {
          base: '{colors.brand.500}',   // 使用 base
          _dark: '{colors.brand.400}'
        }
      }
    }
  }
}
```

**原因:** Chakra UI v3 推荐使用 `base/_dark`，`base` 代表默认值。

### 错误 3: Recipe key 使用大写

**❌ 错误代码:**

```typescript
recipes: {
  Button: Button,  // 大写 key
  Card: Card,
}
```

**✅ 正确代码:**

```typescript
recipes: {
  button: Button,  // 小写 key
  card: Card,
}
```

**原因:** Chakra UI v3 要求 recipe key 必须小写，否则无法正确应用样式。

### 错误 4: Text 组件使用 colorPalette prop

**❌ 错误代码:**

```tsx
<Text colorPalette={settings.primaryColor}>文本内容</Text>
```

**✅ 正确代码:**

```tsx
<Text color={`${settings.primaryColor}.500`}>文本内容</Text>
```

**原因:** Text 组件不支持 `colorPalette` prop，需要使用模板字符串。

### 错误 5: 运行时创建 System

**❌ 错误代码:**

```tsx
export function Provider() {
  const { settings } = useSettings();

  // ❌ 每次切换都创建新 system
  const theme = React.useMemo(() => createSystem(defaultConfig, config), [settings.primaryColor]);

  return <ChakraProvider value={theme}>...</ChakraProvider>;
}
```

**✅ 正确代码:**

```tsx
// system.ts - 模块顶层创建一次
export const system = createSystem(defaultConfig, config);

// provider.tsx
export function Provider() {
  const { settings } = useSettings();

  return (
    <ChakraProvider value={system}>
      {/* 通过 colorPalette 切换颜色 */}
      <Box colorPalette={settings.primaryColor}>...</Box>
    </ChakraProvider>
  );
}
```

**原因:** System 应该是静态的，通过 colorPalette 机制实现动态切换。

## 5. 性能优化建议

### 5.1 静态 System 优势

- ✅ **编译时优化**: System 只创建一次，所有 CSS 在构建时生成
- ✅ **零运行时开销**: 颜色切换通过 CSS 变量，无需 JavaScript 计算
- ✅ **Tree-shakeable**: 未使用的样式可以被移除

### 5.2 避免的性能陷阱

- ❌ 不要在 render 中创建 system
- ❌ 不要在每次颜色切换时重新创建 theme
- ❌ 不要使用内联 style 设置主题色（使用 colorPalette）

## 6. 类型安全

### 6.1 定义 Primary Color 类型

```typescript
// types/settings.ts
export type PrimaryColor = 'chateauGreen' | 'neonBlue' | 'royalBlue' | 'tomatoOrange';

export interface Settings {
  primaryColor: PrimaryColor;
  colorScheme: 'light' | 'dark' | 'system';
  // ... 其他设置
}
```

### 6.2 颜色 Palette 类型

```typescript
// types.d.ts
export type PaletteLevel = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

export type PaletteRange = {
  [key in PaletteLevel]: string;
};
```

### 6.3 使用类型断言

```tsx
// ✅ 使用类型安全的颜色值
const colorLevels = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

colorLevels.forEach((level) => {
  const color = colorPalette[level as keyof typeof colorPalette];
  // ...
});
```

## 7. 测试策略

### 7.1 单元测试

```typescript
// 测试颜色 token 生成
describe('generateColorTokens', () => {
  it('应该生成正确的 token 结构', () => {
    const tokens = generateColorTokens(colors.chateauGreen);
    expect(tokens[500]).toEqual({ value: '#16b364' });
  });
});
```

### 7.2 集成测试

```typescript
// 测试 colorPalette 切换
describe('Primary Color 切换', () => {
  it('应该在切换后更新 Button 颜色', () => {
    const { getByRole } = render(<App />);
    const button = getByRole('button');

    // 切换到 neonBlue
    updateSettings({ primaryColor: 'neonBlue' });

    // 验证颜色更新
    expect(button).toHaveStyle({ backgroundColor: '#635bff' });
  });
});
```

### 7.3 视觉回归测试

```typescript
// 使用 Storybook + Chromatic 进行视觉测试
export const AllColors = () => (
  <Stack gap={4}>
    {['chateauGreen', 'neonBlue', 'royalBlue', 'tomatoOrange'].map((color) => (
      <Box key={color} colorPalette={color}>
        <Button variant="solid">{color}</Button>
      </Box>
    ))}
  </Stack>
);
```

## 8. 总结

### 8.1 核心要点

1. **简单 Tokens**: tokens 使用简单值 `{ value: color }`
2. **语义 Tokens**: semanticTokens 使用 `base/_dark` 条件
3. **colorPalette 机制**: 支持的组件用 prop，不支持的用模板字符串
4. **Recipe 小写 key**: recipes 对象的 key 必须小写
5. **静态 System**: 在模块顶层创建一次，不依赖运行时

### 8.2 快速检查清单

- [ ] tokens 结构是简单值（不是嵌套对象）
- [ ] semanticTokens 使用 `base/_dark` 条件
- [ ] Recipe 使用小写 key 注册
- [ ] Recipe 中使用 `colorPalette.*` tokens
- [ ] 支持 colorPalette 的组件使用 prop
- [ ] 不支持的组件使用模板字符串
- [ ] System 在模块顶层创建
- [ ] Provider 中设置全局 colorPalette

### 8.3 参考资源

- [Chakra UI v3 文档](https://www.chakra-ui.com/)
- [Color Palette 机制](https://www.chakra-ui.com/docs/theming/semantic-tokens)
- [Recipe 系统](https://www.chakra-ui.com/docs/theming/recipes)
- [next-themes](https://github.com/pacocoursey/next-themes)
