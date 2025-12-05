/**
 * 分页组件
 */

import { Button, Flex, Text } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';

export interface PaginationProps {
  /** 当前页（从 1 开始） */
  page: number;
  /** 每页数量 */
  pageSize: number;
  /** 总条数 */
  total: number;
  /** 页码变化回调 */
  onPageChange: (page: number) => void;
  /** 每页数量变化回调 */
  onPageSizeChange?: (pageSize: number) => void;
  /** 可选的每页数量选项 */
  pageSizeOptions?: number[];
}

export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps): React.JSX.Element {
  const totalPages = Math.ceil(total / pageSize);
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  const canPrevious = page > 1;
  const canNext = page < totalPages;

  return (
    <Flex
      alignItems="center"
      justifyContent="space-between"
      py={3}
      px={4}
      borderTopWidth="1px"
    >
      <Text
        fontSize="sm"
        color="fg.muted"
      >
        显示 {startItem}-{endItem} 条，共 {total} 条
      </Text>
      <Flex
        alignItems="center"
        gap={2}
      >
        <Button
          size="sm"
          variant="outline"
          disabled={!canPrevious}
          onClick={() => onPageChange(1)}
        >
          <Icon icon="mdi:chevron-double-left" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={!canPrevious}
          onClick={() => onPageChange(page - 1)}
        >
          <Icon icon="mdi:chevron-left" />
        </Button>
        <Text
          fontSize="sm"
          px={2}
        >
          第 {page} / {totalPages || 1} 页
        </Text>
        <Button
          size="sm"
          variant="outline"
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
        >
          <Icon icon="mdi:chevron-right" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={!canNext}
          onClick={() => onPageChange(totalPages)}
        >
          <Icon icon="mdi:chevron-double-right" />
        </Button>
      </Flex>
    </Flex>
  );
}
