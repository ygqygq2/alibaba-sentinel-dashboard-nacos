/**
 * 实例选择器组件
 */

import { NativeSelect } from '@chakra-ui/react';
import * as React from 'react';

import { useInstances } from '@/hooks/api';
import { getInstanceHostPort } from '@/lib/utils/instance';
import type { InstanceInfo } from '@/types/sentinel';

export interface InstanceSelectorProps {
  /** 应用名称 */
  app: string;
  /** 当前选中的实例 (ip:port 格式) */
  value?: string;
  /** 选择变化回调 */
  onChange: (instance: { ip: string; port: number } | null) => void;
  /** 自动选择回调（当有健康实例且未手动选择时触发） */
  onAutoSelect?: (instance: { ip: string; port: number } | null) => void;
}

export function InstanceSelector({ app, value, onChange, onAutoSelect }: InstanceSelectorProps): React.JSX.Element {
  const { data: instances = [], isLoading } = useInstances(app);

  // 只显示健康的实例
  const healthyInstances = React.useMemo(() => instances.filter((m: InstanceInfo) => m.healthy), [instances]);

  // 自动选择第一个实例
  React.useEffect(() => {
    if (onAutoSelect && healthyInstances.length > 0 && !value && !isLoading) {
      const firstInstance = healthyInstances[0];
      if (firstInstance) {
        onAutoSelect({ ip: firstInstance.ip, port: firstInstance.port });
      }
    }
  }, [healthyInstances, value, isLoading, onAutoSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (!selected) {
      onChange(null);
      return;
    }
    const parts = selected.split(':');
    const address = parts[0]; // 可能是 ip/domain/name
    const portStr = parts[1];
    if (!address || !portStr) {
      onChange(null);
      return;
    }
    // 尝试从实例列表中找到匹配的实例，获取真实的 ip
    const instance = healthyInstances.find((inst) => getInstanceHostPort(inst) === selected);
    onChange({ ip: instance?.ip || address, port: Number(portStr) });
  };

  return (
    <NativeSelect.Root
      size="sm"
      width="200px"
      disabled={isLoading || healthyInstances.length === 0}
    >
      <NativeSelect.Field
        value={value ?? ''}
        onChange={handleChange}
        placeholder={isLoading ? '加载中...' : healthyInstances.length === 0 ? '无可用实例' : '选择实例'}
      >
        {healthyInstances.map((instance: InstanceInfo) => {
          const hostPort = getInstanceHostPort(instance);
          return (
            <option
              key={hostPort}
              value={hostPort}
            >
              {hostPort}
            </option>
          );
        })}
      </NativeSelect.Field>
    </NativeSelect.Root>
  );
}
