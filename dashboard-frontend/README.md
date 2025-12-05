# Sentinel Dashboard Frontend

Sentinel Dashboard 前端项目，基于 React 19 + TypeScript + Vite + Chakra UI 构建。

## 技术栈

- **React 19** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Chakra UI v3** - 组件库
- **React Router v7** - 路由
- **React Query** - 服务端状态管理
- **Vitest** - 单元测试

## 快速开始

### 开发模式

```bash
# 使用 Makefile（推荐）
make dev

# 或直接运行
pnpm install
pnpm dev
```

访问 http://localhost:3000

### 构建

```bash
# 使用 Makefile（会自动复制到后端 webapp）
make frontend

# 或仅构建
pnpm build
```

### 测试

```bash
# 使用 Makefile
make test-fe

# 或直接运行
pnpm test           # 运行测试
pnpm test --watch   # 监听模式
pnpm test:coverage  # 覆盖率报告
```

## 项目结构

```
src/
├── components/           # 组件目录
│   ├── core/            # 核心组件
│   └── dashboard/       # Dashboard 组件
├── hooks/               # 自定义 Hooks
│   └── api/             # React Query Hooks
├── lib/                 # 工具库
│   └── api/             # API 客户端
├── pages/               # 页面组件
│   └── dashboard/       # Dashboard 页面
├── routes/              # 路由配置
├── styles/              # 样式文件
└── types/               # TypeScript 类型定义
```

本项目针对 GitHub Copilot 等 AI 工具进行了优化配置。

### GitHub Copilot 配置

项目中的 `.vscode/settings.json` 和 `.vscode/copilot-docs.json` 文件已经配置了 Chakra UI v3 相关设置，使 Copilot 能够更好地理解 Chakra UI 的组件和 API。

引用的 Chakra UI AI 文档：

# <<<<<<< HEAD

引用的 Chakra UI AI 文档包括：

> > > > > > > ce13689b3210113415bc5612f3fba3c2431d401e

- https://chakra-ui.com/llms.txt - 主要的 LLMs.txt 文件
- https://chakra-ui.com/llms-components.txt - 组件文档
- https://chakra-ui.com/llms-styling.txt - 样式文档
- https://chakra-ui.com/llms-theming.txt - 主题文档
- https://chakra-ui.com/llms-v3-migration.txt - v3 迁移文档

使用这些配置，GitHub Copilot 将能够提供更准确的 Chakra UI v3 代码建议和补全。

## 核心组件使用示例

### Dropdown 组件

```tsx
import { Dropdown, DropdownTrigger, DropdownPopover } from '@/components/core/dropdown';
import { Icon } from '@iconify/react';

function MyNav() {
  return (
    <Dropdown
      delay={150}
      placement="bottom-start"
      gutter={0}
    >
      <DropdownTrigger>
        <Box cursor="pointer">
          Pages <Icon icon="ph:caret-down" />
        </Box>
      </DropdownTrigger>
      <DropdownPopover
        width="800px"
        animationDuration="slow"
      >
        <YourDropdownContent />
      </DropdownPopover>
    </Dropdown>
  );
}
```

**特性**：

- `delay`: Hover 延迟时间（毫秒）
- `placement`: 弹出位置（bottom-start、top-end 等）
- `gutter`: 触发器与内容的间距
- `animationDuration`: 动画速度（fastest/fast/slow/slower/slowest）
- 支持受控模式：`open` + `onOpenChange`

### 图标使用

```tsx
import { Icon } from '@iconify/react';

// 基础使用
<Icon icon="ph:upload" />

// 自定义样式
<Icon icon="ph:eye" fontSize="24px" color="blue.500" />

// 在按钮中
<IconButton aria-label="Close">
  <Icon icon="ph:x" />
</IconButton>
```

可用图标：访问 https://icon-sets.iconify.design/ph/ 查看所有 Phosphor Icons

## Chakra UI v3 迁移指南

### 主要 API 变化

1. **命名空间组件**：

   ```tsx
   // v2
   <Popover>
     <PopoverTrigger>...</PopoverTrigger>
     <PopoverContent>...</PopoverContent>
   </Popover>

   // v3
   <Popover.Root>
     <Popover.Trigger>...</Popover.Trigger>
     <Popover.Content>...</Popover.Content>
   </Popover.Root>
   ```

2. **定位 API**：

   ```tsx
   // v2
   <Popover placement="bottom-start">

   // v3
   <Popover.Root positioning={{ placement: "bottom-start", gutter: 8 }}>
   ```

3. **图标迁移**：

   ```tsx
   // v2 (Phosphor)
   import { Upload } from '@phosphor-icons/react';
   <Upload />;

   // v3 (Iconify)
   import { Icon } from '@iconify/react';
   <Icon icon="ph:upload" />;
   ```

## 部署

<<<<<<< HEAD
支持静态资源部署到以下平台：

- Vercel
- Netlify
- GitHub Pages
- Nginx
- 其他静态托管服务

### Vercel 部署

```bash
pnpm run build
vercel --prod
```

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 开发指南

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 配置
- 使用 Prettier 格式化代码
- 组件使用函数式组件 + Hooks

### 组件开发原则

1. **优先封装**：重复的 UI 模式应封装为可复用组件
2. **Context Pattern**：复杂组件使用 Context 管理状态
3. **类型安全**：所有 props 都要有 TypeScript 类型
4. **可配置性**：通过 props 提供灵活的配置选项
5. **文档完善**：复杂组件需要 README 和使用示例

### 性能优化

- 使用 `React.memo` 优化不必要的重渲染
- 合理使用 `useMemo` 和 `useCallback`
- 路由懒加载：`React.lazy` + `Suspense`
- 图标按需加载（Iconify 自动处理）

## 常见问题

### Q: 如何自定义主题颜色？

A: 编辑 `src/styles/theme/create-theme.ts` 中的 `tokens.colors` 配置。

### Q: 如何添加新的图标？

A: 访问 https://icon-sets.iconify.design/ 搜索图标，使用 `<Icon icon="prefix:name" />` 即可。

### Q: Dropdown 如何实现受控模式？

A: 使用 `open` 和 `onOpenChange` props：

```tsx
const [isOpen, setIsOpen] = useState(false);
<Dropdown open={isOpen} onOpenChange={setIsOpen}>
```

### Q: 如何调试 Chakra UI 组件样式？

A: 使用浏览器开发者工具查看生成的 CSS 变量，或参考 Chakra UI v3 官方文档。

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

## 许可证

MIT License

## 相关链接

- [Chakra UI v3 官方文档](https://chakra-ui.com)
- [Iconify 图标搜索](https://icon-sets.iconify.design/)
- [Vite 文档](https://vitejs.dev/)
- # [React 文档](https://react.dev/)
  支持静态资源部署（如 Vercel、Netlify、Nginx 等）。
  > > > > > > > ce13689b3210113415bc5612f3fba3c2431d401e
