/**
 * 通用表单字段组件
 * 统一表单输入框、下拉框、开关等的样式和行为
 */

import { Field, Input, NativeSelect, Switch, Textarea } from '@chakra-ui/react';
import * as React from 'react';

/** 基础字段属性 */
interface BaseFieldProps {
  /** 字段标签 */
  label: string;
  /** 是否必填（显示 * 标记） */
  required?: boolean;
  /** 错误信息 */
  error?: string;
  /** 帮助文本 */
  helperText?: string;
  /** 是否禁用 */
  disabled?: boolean;
}

/** 输入框属性 */
export interface FormInputProps extends BaseFieldProps {
  /** 字段名称（用于表单提交和测试定位） */
  name?: string;
  /** 值 */
  value: string | number;
  /** 值变化回调 */
  onChange: (value: string) => void;
  /** 占位符 */
  placeholder?: string;
  /** 输入类型 */
  type?: 'text' | 'number' | 'password' | 'email';
  /** 最小值（number 类型） */
  min?: number;
  /** 最大值（number 类型） */
  max?: number;
  /** 步进值（number 类型） */
  step?: number;
}

/** 通用输入框组件 */
export function FormInput({
  label,
  name,
  required,
  error,
  helperText,
  disabled,
  value,
  onChange,
  placeholder,
  type = 'text',
  min,
  max,
  step,
}: FormInputProps): React.JSX.Element {
  return (
    <Field.Root invalid={!!error}>
      <Field.Label>
        {label}
        {required && ' *'}
      </Field.Label>
      <Input
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
      />
      {helperText && !error && <Field.HelperText>{helperText}</Field.HelperText>}
      {error && <Field.ErrorText>{error}</Field.ErrorText>}
    </Field.Root>
  );
}

/** 下拉框选项 */
export interface SelectOption {
  value: string | number;
  label: string;
}

/** 下拉框属性 */
export interface FormSelectProps extends BaseFieldProps {
  /** 字段名称（用于表单提交和测试定位） */
  name?: string;
  /** 值 */
  value: string | number;
  /** 值变化回调 */
  onChange: (value: string) => void;
  /** 选项列表 */
  options: SelectOption[];
  /** 占位符 */
  placeholder?: string;
}

/** 通用下拉框组件 */
export function FormSelect({
  label,
  name,
  required,
  error,
  helperText,
  disabled,
  value,
  onChange,
  options,
  placeholder,
}: FormSelectProps): React.JSX.Element {
  return (
    <Field.Root invalid={!!error}>
      <Field.Label>
        {label}
        {required && ' *'}
      </Field.Label>
      <NativeSelect.Root disabled={disabled}>
        <NativeSelect.Field
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {placeholder && (
            <option
              value=""
              disabled
            >
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
            >
              {opt.label}
            </option>
          ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
      {helperText && !error && <Field.HelperText>{helperText}</Field.HelperText>}
      {error && <Field.ErrorText>{error}</Field.ErrorText>}
    </Field.Root>
  );
}

/** 开关属性 */
export interface FormSwitchProps {
  /** 字段标签 */
  label: string;
  /** 字段名称 */
  name?: string;
  /** 值 */
  checked: boolean;
  /** 值变化回调 */
  onChange: (checked: boolean) => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 帮助文本 */
  helperText?: string;
}

/** 通用开关组件 */
export function FormSwitch({
  label,
  name,
  checked,
  onChange,
  disabled,
  helperText,
}: FormSwitchProps): React.JSX.Element {
  return (
    <Field.Root>
      <Switch.Root
        checked={checked}
        onCheckedChange={(e) => onChange(e.checked)}
        disabled={disabled}
      >
        <Switch.HiddenInput name={name} />
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Switch.Label>{label}</Switch.Label>
      </Switch.Root>
      {helperText && <Field.HelperText>{helperText}</Field.HelperText>}
    </Field.Root>
  );
}

/** 文本域属性 */
export interface FormTextareaProps extends BaseFieldProps {
  /** 字段名称 */
  name?: string;
  /** 值 */
  value: string;
  /** 值变化回调 */
  onChange: (value: string) => void;
  /** 占位符 */
  placeholder?: string;
  /** 行数 */
  rows?: number;
}

/** 通用文本域组件 */
export function FormTextarea({
  label,
  name,
  required,
  error,
  helperText,
  disabled,
  value,
  onChange,
  placeholder,
  rows = 3,
}: FormTextareaProps): React.JSX.Element {
  return (
    <Field.Root invalid={!!error}>
      <Field.Label>
        {label}
        {required && ' *'}
      </Field.Label>
      <Textarea
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
      />
      {helperText && !error && <Field.HelperText>{helperText}</Field.HelperText>}
      {error && <Field.ErrorText>{error}</Field.ErrorText>}
    </Field.Root>
  );
}
