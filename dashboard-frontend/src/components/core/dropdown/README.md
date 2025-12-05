# Dropdown Component

基于 Chakra UI v3 Popover 的 hover 触发下拉菜单组件，设计灵感来自 MUI。

## 特性

- ✅ **Hover 触发**：鼠标悬停时自动打开，离开后延迟关闭
- ✅ **键盘导航**：支持 Enter/Space 打开，Escape 关闭
- ✅ **受控/非受控**：支持完全受控模式和默认非受控模式
- ✅ **平滑动画**：可配置的打开/关闭动画速度
- ✅ **无缝体验**：trigger 与 popover 之间无间隙，鼠标移动无阻断
- ✅ **Chakra UI v3**：使用最新的 Popover.Root namespace API

## 基础用法

```tsx
import { Dropdown, DropdownTrigger, DropdownPopover } from '@/components/core/dropdown';

function MyComponent() {
  return (
    <Dropdown delay={150}>
      <DropdownTrigger>
        <Button>Hover me</Button>
      </DropdownTrigger>
      <DropdownPopover width="300px">
        <Box p={4}>
          <Text>Dropdown content</Text>
        </Box>
      </DropdownPopover>
    </Dropdown>
  );
}
```

## API

### Dropdown Props

| 属性           | 类型                        | 默认值  | 说明                                          |
| -------------- | --------------------------- | ------- | --------------------------------------------- |
| `children`     | `ReactNode`                 | -       | 必需，包含 DropdownTrigger 和 DropdownPopover |
| `delay`        | `number`                    | `150`   | 鼠标离开后关闭的延迟时间（毫秒）              |
| `open`         | `boolean`                   | -       | 受控模式：控制打开状态                        |
| `defaultOpen`  | `boolean`                   | `false` | 非受控模式：初始打开状态                      |
| `onOpenChange` | `(isOpen: boolean) => void` | -       | 打开状态变化时的回调                          |

### DropdownPopover Props

| 属性                | 类型                                                                               | 默认值           | 说明                                  |
| ------------------- | ---------------------------------------------------------------------------------- | ---------------- | ------------------------------------- |
| `children`          | `ReactNode`                                                                        | -                | Popover 内容                          |
| `width`             | `string \| number`                                                                 | `'auto'`         | Popover 宽度                          |
| `height`            | `string \| number`                                                                 | `'auto'`         | Popover 高度                          |
| `animationDuration` | `'fastest' \| 'faster' \| 'fast' \| 'moderate' \| 'slow' \| 'slower' \| 'slowest'` | `'slow'`         | 动画速度                              |
| `placement`         | `'top' \| 'bottom' \| 'left' \| 'right' \| ...`                                    | `'bottom-start'` | Popover 位置                          |
| `gutter`            | `number`                                                                           | `0`              | Trigger 和 Popover 之间的间距（像素） |
| `contentStyles`     | `SystemStyleObject`                                                                | -                | 额外的样式配置                        |

### DropdownTrigger Props

| 属性       | 类型           | 默认值 | 说明                        |
| ---------- | -------------- | ------ | --------------------------- |
| `children` | `ReactElement` | -      | 触发元素（单个 React 元素） |

## 受控模式示例

```tsx
function ControlledDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dropdown
      open={isOpen}
      onOpenChange={setIsOpen}
      delay={200}
    >
      <DropdownTrigger>
        <Button>Controlled Dropdown</Button>
      </DropdownTrigger>
      <DropdownPopover
        width="400px"
        animationDuration="slower"
      >
        <Box p={4}>
          <Button onClick={() => setIsOpen(false)}>Close me</Button>
        </Box>
      </DropdownPopover>
    </Dropdown>
  );
}
```

## 导航菜单示例

参见 `src/components/marketing/layout/main-nav.tsx` 中的 `NavItem` 组件实现。

## 键盘交互

- **Enter / Space**：打开 dropdown
- **Escape**：关闭 dropdown
- **鼠标悬停**：打开 dropdown
- **鼠标离开**：延迟后关闭 dropdown

## 设计模式

本组件采用 Compound Component 模式（类似 MUI 的 Dropdown 设计）：

- `Dropdown`：Context Provider，管理状态和交互逻辑
- `DropdownTrigger`：包装触发元素，添加 hover/keyboard 事件
- `DropdownPopover`：Chakra Popover 的封装，处理定位和动画

## 注意事项

1. `DropdownTrigger` 的 `children` 必须是单个 React 元素
2. 使用 `gutter={0}` 可以让 trigger 和 popover 无间隙连接
3. 动画速度建议使用 `slow` 或 `slower`，避免过快的视觉效果
4. 受控模式下，`open` 和 `onOpenChange` 必须同时使用

## 迁移指南

如果你之前直接使用 Chakra UI 的 Popover：

```diff
- <Popover.Root open={isOpen} ...>
-   <Popover.Trigger>...</Popover.Trigger>
-   <Popover.Content>...</Popover.Content>
- </Popover.Root>
+ <Dropdown open={isOpen} onOpenChange={setIsOpen}>
+   <DropdownTrigger>...</DropdownTrigger>
+   <DropdownPopover>...</DropdownPopover>
+ </Dropdown>
```

好处：

- 自动处理 hover 延迟逻辑
- 自动处理键盘导航
- 统一的 API 和动画配置
- 更少的样板代码
