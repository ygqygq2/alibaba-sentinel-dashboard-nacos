'use client';

import { Checkbox, Table } from '@chakra-ui/react';
import * as React from 'react';

export interface ColumnDef<TRowModel> {
  align?: 'left' | 'right' | 'center';
  field?: keyof TRowModel;
  formatter?: (row: TRowModel, index: number) => React.ReactNode;
  hideName?: boolean;
  name: string;
  width?: number | string;
}

type RowId = number | string;

export interface DataTableProps<TRowModel> extends Omit<React.ComponentProps<typeof Table.Root>, 'onClick'> {
  columnDefs: ColumnDef<TRowModel>[];
  hideHead?: boolean;
  hover?: boolean;
  onClick?: (event: React.MouseEvent, row: TRowModel) => void;
  onDeselectAll?: (event: unknown) => void;
  onDeselectOne?: (event: unknown, row: TRowModel) => void;
  onSelectAll?: (event: unknown) => void;
  onSelectOne?: (event: unknown, row: TRowModel) => void;
  rows: TRowModel[];
  selectable?: boolean;
  selected?: Set<RowId>;
  uniqueRowId?: (row: TRowModel) => RowId;
}

// ... 其他类型定义保持不变 ...

export function DataTable<TRowModel extends object & { id?: RowId | null }>({
  columnDefs,
  hideHead,
  _hover,
  onClick,
  onDeselectAll,
  onDeselectOne,
  onSelectOne,
  onSelectAll,
  rows,
  selectable,
  selected,
  uniqueRowId,
  ...props
}: DataTableProps<TRowModel>): React.JSX.Element {
  const selectedSome = (selected?.size ?? 0) > 0 && (selected?.size ?? 0) < rows.length;
  const selectedAll = rows.length > 0 && selected?.size === rows.length;

  return (
    <Table.Root {...props}>
      <Table.Header visibility={hideHead ? 'collapse' : 'visible'}>
        <Table.Row>
          {selectable ? (
            <Table.ColumnHeader>
              <Checkbox.Root
                checked={selectedAll ? true : selectedSome ? 'indeterminate' : false}
                onCheckedChange={(e) => {
                  if (selectedAll) {
                    onDeselectAll?.(e);
                  } else {
                    onSelectAll?.(e);
                  }
                }}
              >
                <Checkbox.Control />
              </Checkbox.Root>
            </Table.ColumnHeader>
          ) : null}
          {columnDefs.map(
            (column): React.JSX.Element => (
              <Table.ColumnHeader
                key={column.name}
                textAlign={column.align}
              >
                {column.hideName ? null : column.name}
              </Table.ColumnHeader>
            )
          )}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {rows.map((row, index): React.JSX.Element => {
          const rowId = row.id ? row.id : uniqueRowId?.(row);
          const rowSelected = rowId ? selected?.has(rowId) : false;

          return (
            <Table.Row
              key={rowId ?? index}
              onClick={
                onClick
                  ? (event: React.MouseEvent) => {
                      onClick(event, row);
                    }
                  : undefined
              }
              cursor={onClick ? 'pointer' : undefined}
              data-selected={rowSelected ? 'true' : undefined}
            >
              {selectable ? (
                <Table.Cell>
                  <Checkbox.Root
                    checked={rowId ? rowSelected : false}
                    onCheckedChange={(e) => {
                      if (rowSelected) {
                        onDeselectOne?.(e, row);
                      } else {
                        onSelectOne?.(e, row);
                      }
                    }}
                    onClick={(event: React.MouseEvent) => {
                      if (onClick) {
                        event.stopPropagation();
                      }
                    }}
                  >
                    <Checkbox.Control />
                  </Checkbox.Root>
                </Table.Cell>
              ) : null}
              {columnDefs.map(
                (column): React.JSX.Element => (
                  <Table.Cell
                    key={column.name}
                    textAlign={column.align}
                  >
                    {
                      (column.formatter
                        ? column.formatter(row, index)
                        : column.field
                          ? String((row as Record<string, unknown>)[column.field as string] ?? '')
                          : null) as React.ReactNode
                    }
                  </Table.Cell>
                )
              )}
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table.Root>
  );
}
