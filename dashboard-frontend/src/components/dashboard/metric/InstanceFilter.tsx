/**
 * 实例过滤选择器组件 - 支持搜索和下拉指示器
 */

import { Box, Input, Portal, Stack } from '@chakra-ui/react';
import * as React from 'react';

import { useInstances } from '@/hooks/api';
import { getInstanceHostPort } from '@/lib/utils/instance';
import type { InstanceInfo } from '@/types/sentinel';

export interface InstanceFilterProps {
  /** 应用名称 */
  app: string;
  /** 当前选中的实例 (ip:port 格式) */
  value: string | null;
  /** 选择变化回调 */
  onChange: (instance: string | null) => void;
}

export function InstanceFilter({ app, value, onChange }: InstanceFilterProps): React.JSX.Element {
  const { data: instances = [], isLoading } = useInstances(app);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // 只显示健康的实例
  const healthyInstances = React.useMemo(() => instances.filter((m: InstanceInfo) => m.healthy), [instances]);

  // 过滤实例列表
  const filteredInstances = React.useMemo(() => {
    if (!searchTerm) return healthyInstances;
    const term = searchTerm.toLowerCase();
    return healthyInstances.filter((instance: InstanceInfo) => {
      const hostPort = getInstanceHostPort(instance);
      return hostPort.toLowerCase().includes(term);
    });
  }, [healthyInstances, searchTerm]);

  // 当健康实例列表变化且当前无选中时，自动选择第一个
  React.useEffect(() => {
    if (!value && healthyInstances.length > 0) {
      const first = healthyInstances[0];
      if (first) {
        onChange(getInstanceHostPort(first));
      }
    }
  }, [healthyInstances, value, onChange]);

  // 点击外部关闭下拉框
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleSelect = (hostPort: string) => {
    onChange(hostPort);
    setSearchTerm('');
    setIsOpen(false);
  };

  const displayValue = value || '';

  return (
    <Box
      position="relative"
      width="200px"
      ref={containerRef}
    >
      <Input
        size="sm"
        value={isOpen ? searchTerm : displayValue}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        placeholder={isLoading ? '加载中...' : healthyInstances.length === 0 ? '无可用实例' : '选择实例'}
        disabled={isLoading || healthyInstances.length === 0}
        paddingRight="30px"
      />
      <Box
        position="absolute"
        right="8px"
        top="50%"
        transform="translateY(-50%)"
        pointerEvents="none"
        fontSize="12px"
        color="fg.muted"
      >
        ▼
      </Box>
      {isOpen && filteredInstances.length > 0 && (
        <Portal>
          <Box
            position="absolute"
            top={containerRef.current ? containerRef.current.getBoundingClientRect().bottom + window.scrollY : 0}
            left={containerRef.current ? containerRef.current.getBoundingClientRect().left + window.scrollX : 0}
            width="200px"
            maxHeight="200px"
            overflowY="auto"
            bg="bg"
            border="1px solid"
            borderColor="border"
            borderRadius="md"
            boxShadow="lg"
            zIndex={1000}
          >
            <Stack gap={0}>
              {filteredInstances.map((instance: InstanceInfo) => {
                const hostPort = getInstanceHostPort(instance);
                return (
                  <Box
                    key={hostPort}
                    px={3}
                    py={2}
                    cursor="pointer"
                    bg={value === hostPort ? 'bg.muted' : 'bg'}
                    _hover={{ bg: 'bg.muted' }}
                    onClick={() => handleSelect(hostPort)}
                    fontSize="sm"
                  >
                    {hostPort}
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </Portal>
      )}
    </Box>
  );
}
