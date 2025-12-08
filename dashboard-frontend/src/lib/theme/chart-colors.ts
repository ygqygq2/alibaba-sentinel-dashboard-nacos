/**
 * 图表颜色主题
 * 统一管理 recharts 和其他图表的颜色配置
 */

export type ColorMode = 'light' | 'dark';

/**
 * 图表色板 - 数据序列颜色
 */
export const CHART_COLORS = {
  // 主要指标
  passQps: '#10b981', // 绿色 - 通过
  blockQps: '#ef4444', // 红色 - 拒绝
  successQps: '#06b6d4', // 青色 - 成功
  exceptionQps: '#f97316', // 橙色 - 异常
  rt: '#8b5cf6', // 紫色 - 响应时间
  count: '#6366f1', // 靛蓝 - 并发数

  // Token Server 集群
  clusterPass: '#14b8a6', // 深青色
  clusterBlock: '#dc2626', // 深红色
  clusterException: '#ea580c', // 深橙色
} as const;

/**
 * 图表主题配置
 * 根据浅色/深色模式调整文本、网格等颜色
 */
export const CHART_THEME = {
  light: {
    textColor: '#1f2937', // 深灰色 - 坐标轴标签
    axisLineColor: '#d1d5db', // 浅灰色 - 坐标轴线
    gridColor: '#e5e7eb', // 淡灰色 - 网格线
    tooltipBg: '#ffffff', // 白色背景
    tooltipText: '#1f2937', // 深灰色文本
    tooltipBorder: '#e5e7eb', // 淡灰色边框
  },
  dark: {
    textColor: '#e5e7eb', // 浅灰色 - 坐标轴标签
    axisLineColor: '#4b5563', // 深灰色 - 坐标轴线
    gridColor: '#374151', // 深灰色 - 网格线
    tooltipBg: '#1f2937', // 深灰色背景
    tooltipText: '#f3f4f6', // 浅灰色文本（亮度更高，易读）
    tooltipBorder: '#4b5563', // 深灰色边框
  },
} as const;

/**
 * 获取当前模式的图表主题
 */
export function getChartTheme(colorMode: ColorMode) {
  return CHART_THEME[colorMode];
}

/**
 * 图表数据序列配置基础接口
 */
export interface LineSeriesConfig {
  dataKey: string;
  stroke: string;
  name: string;
  strokeWidth?: number;
  type?: 'monotone' | 'linear' | 'natural' | 'stepBefore' | 'stepAfter';
  dot?: boolean | object;
}

/**
 * Area 图表序列配置（支持渐变）
 */
export interface AreaSeriesConfig extends LineSeriesConfig {
  fill?: string; // 可以是颜色或渐变 ID
  fillOpacity?: number;
}

/**
 * 图表渐变配置 - 用于 Area 图表
 */
export const CHART_GRADIENTS = {
  light: {
    passQps: '#10b98108', // 绿色
    blockQps: '#ef444408', // 红色
    successQps: '#06b6d408', // 青色
    exceptionQps: '#f9731608', // 橙色
    rt: '#8b5cf608', // 紫色
    count: '#6366f108', // 靛蓝
  },
  dark: {
    passQps: '#10b98110', // 绿色 - 深色模式亮度更高
    blockQps: '#ef444410', // 红色
    successQps: '#06b6d410', // 青色
    exceptionQps: '#f9731610', // 橙色
    rt: '#8b5cf610', // 紫色
    count: '#6366f110', // 靛蓝
  },
} as const;

/**
 * 获取图表渐变配置
 */
export function getChartGradients(colorMode: ColorMode) {
  return CHART_GRADIENTS[colorMode];
}

/**
 * 获取 Tooltip 样式
 */
export function getTooltipStyle(colorMode: ColorMode) {
  const theme = CHART_THEME[colorMode];
  return {
    contentStyle: {
      backgroundColor: theme.tooltipBg,
      border: `1px solid ${theme.tooltipBorder}`,
      borderRadius: '6px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      padding: '8px 12px',
    },
    labelStyle: {
      color: theme.tooltipText,
      fontSize: '13px',
      fontWeight: '500',
    },
    itemStyle: {
      color: theme.tooltipText,
      fontSize: '13px',
    },
    cursor: { fill: 'rgba(0, 0, 0, 0.05)' },
  };
}

/**
 * 获取坐标轴配置
 */
export function getAxisConfig(colorMode: ColorMode) {
  const theme = CHART_THEME[colorMode];
  return {
    tick: {
      fontSize: 12,
      fill: theme.textColor,
    },
    axisLine: {
      stroke: theme.axisLineColor,
    },
    tickLine: {
      stroke: theme.axisLineColor,
    },
  };
}

/**
 * 获取网格配置
 */
export function getGridConfig(colorMode: ColorMode) {
  const theme = CHART_THEME[colorMode];
  return {
    strokeDasharray: '3 3',
    stroke: theme.gridColor,
    opacity: 0.5,
  };
}

/**
 * 常用图表序列配置
 */
export const CHART_SERIES = {
  qps: [
    {
      dataKey: 'passQps',
      stroke: CHART_COLORS.passQps,
      name: '通过 QPS',
      strokeWidth: 2,
    },
    {
      dataKey: 'blockQps',
      stroke: CHART_COLORS.blockQps,
      name: '拒绝 QPS',
      strokeWidth: 2,
    },
    {
      dataKey: 'successQps',
      stroke: CHART_COLORS.successQps,
      name: '成功 QPS',
      strokeWidth: 2,
    },
    {
      dataKey: 'exceptionQps',
      stroke: CHART_COLORS.exceptionQps,
      name: '异常 QPS',
      strokeWidth: 2,
    },
  ] as LineSeriesConfig[],

  qpsArea: (colorMode: ColorMode) => {
    const gradients = getChartGradients(colorMode);
    return [
      {
        dataKey: 'passQps',
        stroke: CHART_COLORS.passQps,
        name: '通过 QPS',
        strokeWidth: 2,
        fill: gradients.passQps,
        fillOpacity: 1,
      },
      {
        dataKey: 'blockQps',
        stroke: CHART_COLORS.blockQps,
        name: '拒绝 QPS',
        strokeWidth: 2,
        fill: gradients.blockQps,
        fillOpacity: 1,
      },
      {
        dataKey: 'successQps',
        stroke: CHART_COLORS.successQps,
        name: '成功 QPS',
        strokeWidth: 2,
        fill: gradients.successQps,
        fillOpacity: 1,
      },
      {
        dataKey: 'exceptionQps',
        stroke: CHART_COLORS.exceptionQps,
        name: '异常 QPS',
        strokeWidth: 2,
        fill: gradients.exceptionQps,
        fillOpacity: 1,
      },
    ] as AreaSeriesConfig[];
  },

  rt: [
    {
      dataKey: 'rt',
      stroke: CHART_COLORS.rt,
      name: '平均响应时间 (ms)',
      strokeWidth: 2,
    },
  ] as LineSeriesConfig[],

  rtArea: (colorMode: ColorMode) => {
    const gradients = getChartGradients(colorMode);
    return [
      {
        dataKey: 'rt',
        stroke: CHART_COLORS.rt,
        name: '平均响应时间 (ms)',
        strokeWidth: 2,
        fill: gradients.rt,
        fillOpacity: 1,
      },
    ] as AreaSeriesConfig[];
  },

  concurrency: [
    {
      dataKey: 'count',
      stroke: CHART_COLORS.count,
      name: '并发数',
      strokeWidth: 2,
    },
  ] as LineSeriesConfig[],
} as const;
