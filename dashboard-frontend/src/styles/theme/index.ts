/**
 * 主题系统入口
 *
 * 使用 Chakra UI v3 静态主题系统
 * - 所有主色在 colors.ts 中定义
 * - 主题通过 colorPalette 属性动态切换
 * - 支持 light/dark 模式自动反转
 */

export * as colors from './colors';
export { system } from './system';
export * from './types';
