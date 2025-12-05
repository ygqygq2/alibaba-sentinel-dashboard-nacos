/**
 * 搜索输入框组件
 */

import { IconButton, Input } from '@chakra-ui/react';
import { InputGroup } from '@chakra-ui/react/input-group';
import { Icon } from '@iconify/react';
import * as React from 'react';

export interface SearchInputProps {
  /** 当前搜索值 */
  value: string;
  /** 值变化回调 */
  onChange: (value: string) => void;
  /** 搜索回调 */
  onSearch?: (value: string) => void;
  /** 占位符 */
  placeholder?: string;
  /** 宽度 */
  width?: string | number;
  /** 搜索延迟（毫秒），默认 300ms */
  debounceMs?: number;
}

export function SearchInput({
  value,
  onChange,
  onSearch,
  placeholder = '搜索...',
  width = '250px',
  debounceMs = 300,
}: SearchInputProps): React.JSX.Element {
  const [localValue, setLocalValue] = React.useState(value);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // 同步外部值变化
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 延迟触发搜索
    timeoutRef.current = setTimeout(() => {
      onChange(newValue);
      onSearch?.(newValue);
    }, debounceMs);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
    onSearch?.('');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // 立即搜索
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      onChange(localValue);
      onSearch?.(localValue);
    }
  };

  // 清理定时器
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <InputGroup
      width={width}
      endElement={
        localValue ? (
          <IconButton
            aria-label="清除"
            size="xs"
            variant="ghost"
            onClick={handleClear}
          >
            <Icon icon="mdi:close" />
          </IconButton>
        ) : (
          <Icon
            icon="mdi:magnify"
            style={{ color: 'var(--chakra-colors-fg-muted)' }}
          />
        )
      }
    >
      <Input
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        size="sm"
      />
    </InputGroup>
  );
}
