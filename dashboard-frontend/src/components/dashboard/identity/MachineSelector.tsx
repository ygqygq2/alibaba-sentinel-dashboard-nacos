/**
 * 机器选择器组件
 */

import { NativeSelect } from '@chakra-ui/react';
import * as React from 'react';

import { useMachines } from '@/hooks/api';
import type { MachineInfo } from '@/types/sentinel';

export interface MachineSelectorProps {
  /** 应用名称 */
  app: string;
  /** 当前选中的机器 (ip:port 格式) */
  value?: string;
  /** 选择变化回调 */
  onChange: (machine: { ip: string; port: number } | null) => void;
}

export function MachineSelector({ app, value, onChange }: MachineSelectorProps): React.JSX.Element {
  const { data: machines = [], isLoading } = useMachines(app);

  // 只显示健康的机器
  const healthyMachines = React.useMemo(() => machines.filter((m: MachineInfo) => m.healthy), [machines]);

  // 自动选中第一台机器（如果当前没有选中）
  React.useEffect(() => {
    if (!isLoading && healthyMachines.length > 0 && !value) {
      const first = healthyMachines[0];
      onChange({ ip: first.ip, port: first.port });
    }
  }, [healthyMachines, isLoading, value, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (!selected) {
      onChange(null);
      return;
    }
    const parts = selected.split(':');
    const ip = parts[0];
    const portStr = parts[1];
    if (!ip || !portStr) {
      onChange(null);
      return;
    }
    onChange({ ip, port: Number(portStr) });
  };

  return (
    <NativeSelect.Root
      size="sm"
      width="200px"
      disabled={isLoading || healthyMachines.length === 0}
    >
      <NativeSelect.Field
        value={value ?? ''}
        onChange={handleChange}
        placeholder={isLoading ? '加载中...' : '选择机器'}
      >
        <option value="">{isLoading ? '加载中...' : healthyMachines.length === 0 ? '无可用机器' : '选择机器'}</option>
        {healthyMachines.map((machine: MachineInfo) => (
          <option
            key={`${machine.ip}:${machine.port}`}
            value={`${machine.ip}:${machine.port}`}
          >
            {machine.ip}:{machine.port}
          </option>
        ))}
      </NativeSelect.Field>
    </NativeSelect.Root>
  );
}
