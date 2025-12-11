/**
 * InstanceFilter 组件单元测试
 */

import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { appApi } from '@/lib/api';
import type { InstanceInfo } from '@/types/sentinel';

import { InstanceFilter } from '../InstanceFilter';

// Mock API
vi.mock('@/lib/api', () => ({
  appApi: {
    getApps: vi.fn(),
    getInstances: vi.fn(),
    removeInstance: vi.fn(),
  },
}));

const mockAppApi = appApi as {
  getApps: ReturnType<typeof vi.fn>;
  getInstances: ReturnType<typeof vi.fn>;
  removeInstance: ReturnType<typeof vi.fn>;
};

// 创建测试用实例数据
const createMockInstance = (ip: string, port: number, healthy = true): InstanceInfo => ({
  id: `${ip}:${port}`,
  ip,
  port,
  app: 'test-app',
  hostname: `host-${ip}`,
  healthy,
  heartbeatVersion: 1,
  version: '1.8.0',
  lastHeartbeat: Date.now(),
});

const mockInstances: InstanceInfo[] = [
  createMockInstance('192.168.1.1', 8719),
  createMockInstance('192.168.1.2', 8719),
  createMockInstance('192.168.1.3', 8719),
  createMockInstance('192.168.1.4', 8719, false), // 不健康的实例
];

// Wrapper 组件
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>
    </QueryClientProvider>
  );
}

describe('InstanceFilter', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('加载状态', () => {
    test('显示加载中占位符', async () => {
      // Mock API 返回 pending promise (模拟加载中)
      mockAppApi.getInstances.mockReturnValue(new Promise(() => {}));

      render(
        <InstanceFilter
          app="test-app"
          value={null}
          onChange={mockOnChange}
        />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('加载中...')).toBeInTheDocument();
      });
    });

    test('无实例时显示无可用实例', async () => {
      mockAppApi.getInstances.mockResolvedValue([]);

      render(
        <InstanceFilter
          app="test-app"
          value={null}
          onChange={mockOnChange}
        />,
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(screen.getByPlaceholderText('无可用实例')).toBeInTheDocument();
      });
    });
  });

  describe('实例列表显示', () => {
    beforeEach(() => {
      mockAppApi.getInstances.mockResolvedValue(mockInstances);
    });

    test('只显示健康的实例', async () => {
      const user = userEvent.setup();

      render(
        <InstanceFilter
          app="test-app"
          value={null}
          onChange={mockOnChange}
        />,
        { wrapper: createWrapper() }
      );

      // 等待自动选择完成
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      });

      // 点击输入框展开下拉列表
      const input = screen.getByPlaceholderText('选择实例');
      await user.click(input);

      // 等待下拉列表出现
      await waitFor(() => {
        expect(screen.getByText('192.168.1.1:8719')).toBeInTheDocument();
        expect(screen.getByText('192.168.1.2:8719')).toBeInTheDocument();
        expect(screen.getByText('192.168.1.3:8719')).toBeInTheDocument();
        // 不健康的实例不应该显示
        expect(screen.queryByText('192.168.1.4:8719')).not.toBeInTheDocument();
      });
    });

    test('自动选择第一个健康实例', async () => {
      render(
        <InstanceFilter
          app="test-app"
          value={null}
          onChange={mockOnChange}
        />,
        { wrapper: createWrapper() }
      );

      // 应该自动调用 onChange 并传入第一个实例
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('192.168.1.1:8719');
      });
    });

    test('已有选中值时不自动选择', async () => {
      render(
        <InstanceFilter
          app="test-app"
          value="192.168.1.2:8719"
          onChange={mockOnChange}
        />,
        { wrapper: createWrapper() }
      );

      // 等待一下确保不会调用
      await new Promise((resolve) => setTimeout(resolve, 100));

      // 不应该调用 onChange
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('搜索过滤', () => {
    beforeEach(() => {
      mockAppApi.getInstances.mockResolvedValue(mockInstances);
    });

    test('根据搜索词过滤实例', async () => {
      const user = userEvent.setup();

      render(
        <InstanceFilter
          app="test-app"
          value="192.168.1.1:8719"
          onChange={mockOnChange}
        />,
        { wrapper: createWrapper() }
      );

      // 等待初始化完成
      await waitFor(() => {
        expect(screen.getByDisplayValue('192.168.1.1:8719')).toBeInTheDocument();
      });

      const input = screen.getByDisplayValue('192.168.1.1:8719') as HTMLInputElement;
      await user.click(input);
      await user.clear(input);

      // 输入搜索词
      await user.type(input, '192.168.1.2');

      await waitFor(() => {
        // 应该只显示匹配的实例
        expect(screen.getByText('192.168.1.2:8719')).toBeInTheDocument();
        expect(screen.queryByText('192.168.1.1:8719')).not.toBeInTheDocument();
        expect(screen.queryByText('192.168.1.3:8719')).not.toBeInTheDocument();
      });
    });
  });

  // Note: 下拉选择交互测试因 Chakra UI Portal 在测试环境渲染问题暂时跳过
  // 该功能已通过 E2E 测试覆盖 (e2e/specs/instances.spec.ts)

  describe('边缘情况', () => {
    test('实例列表为空时不自动选择', async () => {
      mockAppApi.getInstances.mockResolvedValue([]);

      render(
        <InstanceFilter
          app="test-app"
          value={null}
          onChange={mockOnChange}
        />,
        { wrapper: createWrapper() }
      );

      // 等待一下
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    test('所有实例都不健康时不自动选择', async () => {
      const unhealthyInstances = [createMockInstance('192.168.1.1', 8719, false)];
      mockAppApi.getInstances.mockResolvedValue(unhealthyInstances);

      render(
        <InstanceFilter
          app="test-app"
          value={null}
          onChange={mockOnChange}
        />,
        { wrapper: createWrapper() }
      );

      // 等待一下
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });
});
