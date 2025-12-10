/**
 * 实例相关工具函数
 */

import type { InstanceInfo } from '@/types/sentinel';

/**
 * 获取实例的通信地址（优先级：name > domain > ip）
 */
export function getInstanceAddress(instance: InstanceInfo): string {
  if (instance.name) {
    return instance.name;
  }
  if (instance.domain) {
    return instance.domain;
  }
  return instance.ip;
}

/**
 * 获取实例的完整地址（地址:端口）
 */
export function getInstanceHostPort(instance: InstanceInfo): string {
  return `${getInstanceAddress(instance)}:${instance.port}`;
}

/**
 * 获取实例的显示名称
 */
export function getInstanceDisplayName(instance: InstanceInfo): string {
  const address = getInstanceAddress(instance);
  return `${address}:${instance.port}`;
}
