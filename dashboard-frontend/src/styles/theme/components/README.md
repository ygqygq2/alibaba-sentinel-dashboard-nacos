# Button 组件使用指南

## 基本用法

Button 组件现在完全支持主题颜色切换，使用 `colorPalette` 属性：

```tsx
import { Button } from '@chakra-ui/react';

// 使用当前主题色（从 Provider 继承）
<Button variant="solid">Primary Button</Button>

// 指定特定颜色系列
<Button colorPalette="neonBlue" variant="solid">Neon Blue</Button>
<Button colorPalette="royalBlue" variant="solid">Royal Blue</Button>
<Button colorPalette="tomatoOrange" variant="solid">Tomato Orange</Button>
<Button colorPalette="chateauGreen" variant="solid">Chateau Green</Button>
```

## Variant 变体

### solid - 实心按钮（默认）

主色背景，白色文字，适合主要操作

```tsx
<Button variant="solid">Solid Button</Button>
```

### outline - 描边按钮

透明背景，主色描边和文字

```tsx
<Button variant="outline">Outline Button</Button>
```

### ghost - 幽灵按钮

完全透明，hover 时显示背景

```tsx
<Button variant="ghost">Ghost Button</Button>
```

### subtle - 浅色按钮

浅色背景，主色文字

```tsx
<Button variant="subtle">Subtle Button</Button>
```

### surface - 表面按钮

带阴影的卡片样式

```tsx
<Button variant="surface">Surface Button</Button>
```

### plain - 纯文本按钮

无背景，仅文字

```tsx
<Button variant="plain">Plain Button</Button>
```

## Size 尺寸

```tsx
<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="md">Medium (默认)</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>
```

## 组合使用

```tsx
// 不同颜色 + 不同变体
<Button colorPalette="neonBlue" variant="solid" size="lg">
  大号蓝色实心按钮
</Button>

<Button colorPalette="tomatoOrange" variant="outline" size="sm">
  小号橙色描边按钮
</Button>

// 在容器中设置 colorPalette，子组件自动继承
<Box colorPalette="royalBlue">
  <Button variant="solid">继承父级颜色</Button>
  <Button variant="outline">继承父级颜色</Button>
</Box>
```

## 状态

```tsx
// 禁用状态
<Button disabled>Disabled Button</Button>

// Loading 状态
<Button loading>Loading...</Button>
```

## 主题切换

当用户在设置中切换主色时，所有使用 `colorPalette` 的 Button 会自动更新颜色：

```tsx
// Provider 层级设置主色
<Box colorPalette={settings.primaryColor}>
  {/* 所有 Button 自动使用当前主色 */}
  <Button variant="solid">跟随主题色</Button>
</Box>
```

## Light/Dark 模式

Button 会自动适配 light 和 dark 模式，无需额外配置。
