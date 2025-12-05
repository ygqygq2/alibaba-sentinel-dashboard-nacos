import { Button, Menu } from '@chakra-ui/react';
import { Icon } from '@iconify/react';
import * as React from 'react';

// `T` should be `string`, `number` or `boolean`
export interface MultiSelectProps<T = string> {
  label: string;
  onChange?: (value: T[]) => void;
  options: readonly { label: string; value: T }[];
  value: T[];
}

export function MultiSelect<T = string>({
  label,
  onChange,
  options,
  value = [],
}: MultiSelectProps<T>): React.JSX.Element {
  const handleValueChange = React.useCallback(
    (v: T, checked: boolean) => {
      let updateValue = [...value] as T[];

      if (checked) {
        updateValue.push(v);
      } else {
        updateValue = updateValue.filter((item) => item !== v);
      }

      onChange?.(updateValue);
    },
    [onChange, value]
  );

  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Button>
          {label}
          <Icon icon="ph:caret-down" />
        </Button>
      </Menu.Trigger>
      <Menu.Content>
        {options.map((option) => {
          const selected = value.includes(option.value);

          return (
            <Menu.Item
              key={option.label}
              value={option.label}
              onClick={() => {
                handleValueChange(option.value, !selected);
              }}
              style={{
                backgroundColor: selected ? 'var(--chakra-colors-blue-100)' : 'transparent',
              }}
            >
              {option.label}
            </Menu.Item>
          );
        })}
      </Menu.Content>
    </Menu.Root>
  );
}
