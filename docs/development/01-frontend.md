# 前端开发指南

> 版本：1.0
> 更新日期：2024-12-05

---

## 1. 环境准备

### 1.1 依赖

- Node.js >= 18
- pnpm >= 8

### 1.2 安装

```bash
cd sentinel-dashboard/webapp/resources
pnpm install
```

### 1.3 开发

```bash
pnpm dev
```

访问 http://localhost:5173

### 1.4 构建

```bash
pnpm build
```

输出到 `dist/` 目录

---

## 2. 项目结构

见 `docs/design/01-architecture.md` 中的目录结构说明。

---

## 3. 开发流程

### 3.1 新增页面

1. 在 `src/pages/dashboard/` 下创建目录
2. 创建页面组件
3. 在 `src/routes/dashboard.tsx` 添加路由
4. 在侧边栏菜单添加入口

### 3.2 新增 API

1. 在 `src/types/` 定义类型
2. 在 `src/lib/api/` 创建 API 函数
3. 在 `src/hooks/` 创建 React Query hook

### 3.3 新增组件

1. 通用组件放 `src/components/ui/`
2. Dashboard 专用组件放 `src/components/dashboard/`
3. 导出通过 `index.ts`

---

## 4. 代码规范

### 4.1 组件模板

```tsx
import { FC } from "react";
import { Box } from "@chakra-ui/react";

interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export const MyComponent: FC<MyComponentProps> = ({ title, onAction }) => {
  return (
    <Box>
      <h1>{title}</h1>
      <button onClick={onAction}>Action</button>
    </Box>
  );
};
```

### 4.2 Hook 模板

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFlowRules, createFlowRule } from "@/lib/api/flow";

export function useFlowRules(app: string) {
  return useQuery({
    queryKey: ["flow-rules", app],
    queryFn: () => getFlowRules(app),
    enabled: !!app,
  });
}

export function useCreateFlowRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFlowRule,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["flow-rules", variables.app] });
    },
  });
}
```

### 4.3 API 模板

```tsx
import { apiClient } from "./client";
import type { FlowRule, ApiResponse } from "@/types";

export async function getFlowRules(app: string): Promise<FlowRule[]> {
  const response = await apiClient.get<ApiResponse<FlowRule[]>>("/v1/flow/rules", {
    params: { app },
  });
  return response.data.data;
}

export async function createFlowRule(rule: Omit<FlowRule, "id">): Promise<void> {
  await apiClient.post("/v1/flow/rule", rule);
}
```

---

## 5. 状态管理

### 5.1 服务端状态（React Query）

用于：API 数据、缓存、同步

```tsx
// 查询
const { data, isLoading, error } = useQuery({...});

// 变更
const { mutate, isPending } = useMutation({...});
```

### 5.2 客户端状态（Zustand）

用于：UI 状态、用户偏好

```tsx
// stores/ui.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarWidth: 220,
      setSidebarWidth: (width) => set({ sidebarWidth: width }),
    }),
    { name: "ui-storage" }
  )
);
```

---

## 6. 表单处理

使用 React Hook Form + Zod：

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  resource: z.string().min(1, "资源名不能为空"),
  count: z.number().min(0, "阈值不能为负数"),
  grade: z.number(),
});

type FormData = z.infer<typeof schema>;

export function RuleForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    // 提交逻辑
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("resource")} />
      {errors.resource && <span>{errors.resource.message}</span>}
      {/* ... */}
    </form>
  );
}
```

---

## 7. 国际化

使用 i18next：

```tsx
// 使用
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('dashboard.title')}</h1>;
}

// 翻译文件 public/locales/zh-CN/translation.json
{
  "dashboard": {
    "title": "Sentinel 控制台"
  }
}
```

---

## 8. 测试

### 8.1 单元测试

```tsx
// src/hooks/use-apps.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { useApps } from "./use-apps";

describe("useApps", () => {
  it("should fetch apps", async () => {
    const { result } = renderHook(() => useApps());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });
});
```

### 8.2 E2E 测试

```tsx
// tests/e2e/login.spec.ts
import { test, expect } from "@playwright/test";

test("should login successfully", async ({ page }) => {
  await page.goto("/auth/sign-in");
  await page.fill('[name="username"]', "sentinel");
  await page.fill('[name="password"]', "sentinel");
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL("/dashboard");
});
```

---

## 9. 常见问题

### 9.1 代理配置

开发时需要代理到后端 API：

```typescript
// vite.config.mts
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
```

### 9.2 认证 Token

登录后 Token 存储在 localStorage，API 客户端自动携带。

### 9.3 错误处理

使用 toast 显示用户友好的错误信息。
