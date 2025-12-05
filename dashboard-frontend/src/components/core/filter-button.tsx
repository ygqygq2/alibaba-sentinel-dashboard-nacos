import { Box, Button, Popover, Stack, Text, useDisclosure } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';

function noop(..._: unknown[]): void {
  // Do nothing
}

export interface FilterContextValue<T = unknown> {
  anchorEl: HTMLElement | null;
  onApply: (value: unknown) => void;
  onClose: () => void;
  open: boolean;
  value?: T;
}

export const FilterContext = React.createContext<FilterContextValue>({
  anchorEl: null,
  onApply: noop,
  onClose: noop,
  open: false,
  value: undefined,
});

export function useFilterContext(): FilterContextValue {
  const context = React.useContext(FilterContext);

  if (!context) {
    throw new Error('useFilterContext must be used within a FilterProvider');
  }

  return context;
}

export interface FilterButtonProps {
  displayValue?: string;
  label: string;
  onFilterApply?: (value: unknown) => void;
  onFilterDelete?: () => void;
  popover: React.ReactNode;
  value?: unknown;
}

export function FilterButton({
  displayValue,
  label,
  onFilterApply,
  onFilterDelete,
  popover,
  value,
}: FilterButtonProps): React.JSX.Element {
  const { open, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef<HTMLButtonElement>(null);

  const handleApply = React.useCallback(
    (newValue: unknown) => {
      onClose();
      onFilterApply?.(newValue);
    },
    [onClose, onFilterApply]
  );

  return (
    <FilterContext.Provider value={{ anchorEl: btnRef.current, onApply: handleApply, onClose, open, value }}>
      <Popover.Root
        open={open}
        onOpenChange={({ open: isOpen }) => (isOpen ? onOpen() : onClose())}
        positioning={{ placement: 'bottom-start' }}
        closeOnInteractOutside={false}
      >
        <Popover.Trigger asChild>
          <Button
            colorPalette="teal"
            onClick={onOpen}
            ref={btnRef}
            variant="outline"
          >
            {value ? (
              <Box
                onClick={(event) => {
                  event.stopPropagation();
                  event.preventDefault();
                  onFilterDelete?.();
                }}
                onKeyUp={(event) => {
                  event.stopPropagation();
                  event.preventDefault();

                  if (event.key === 'Enter' || event.key === ' ') {
                    onFilterDelete?.();
                  }
                }}
                role="button"
                display="flex"
                tabIndex={0}
              >
                <Icon icon="ph:minus-circle" />
              </Box>
            ) : (
              <Icon icon="ph:plus-circle" />
            )}
            <span>
              {label}
              {displayValue ? (
                <React.Fragment>
                  :{' '}
                  <Box
                    as="span"
                    color="teal.500"
                  >
                    {displayValue}
                  </Box>
                </React.Fragment>
              ) : null}
            </span>
          </Button>
        </Popover.Trigger>
        <Popover.Positioner>
          <Popover.Content>{popover}</Popover.Content>
        </Popover.Positioner>
      </Popover.Root>
    </FilterContext.Provider>
  );
}

interface FilterPopoverProps {
  anchorEl: HTMLElement | null;
  children: React.ReactNode;
  onClose: () => void;
  open: boolean;
  title: string;
}

export function FilterPopover({ children, title }: FilterPopoverProps): React.JSX.Element {
  return (
    <Stack
      gap={2}
      p={2}
    >
      <Text fontSize="md">{title}</Text>
      {children}
    </Stack>
  );
}
