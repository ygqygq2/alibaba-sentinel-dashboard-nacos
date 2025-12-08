/**
 * 响应式图表容器 - 自动适配 dark/light 模式
 */

import * as React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useColorMode } from '@/hooks/use-color-mode';
import {
  type AreaSeriesConfig,
  getAxisConfig,
  getChartTheme,
  getGridConfig,
  getTooltipStyle,
  type LineSeriesConfig,
} from '@/lib/theme/chart-colors';

interface ChartContainerProps {
  data: unknown[];
  height?: number;
  type?: 'line' | 'area';
  series: (LineSeriesConfig | AreaSeriesConfig)[];
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  children?: React.ReactNode;
}

export function ChartContainer({
  data,
  height = 300,
  type = 'line',
  series,
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  children,
}: ChartContainerProps) {
  const { resolvedColorMode } = useColorMode();
  const theme = getChartTheme(resolvedColorMode);
  const axisConfig = getAxisConfig(resolvedColorMode);
  const gridConfig = getGridConfig(resolvedColorMode);
  const tooltipStyle = getTooltipStyle(resolvedColorMode);

  const ChartComponent = type === 'area' ? AreaChart : LineChart;
  const DataComponent = type === 'area' ? Area : Line;

  return (
    <ResponsiveContainer
      width="100%"
      height={height}
    >
      <ChartComponent data={data}>
        {showGrid && <CartesianGrid {...gridConfig} />}
        <XAxis
          {...axisConfig}
          dataKey="time"
        />
        <YAxis {...axisConfig} />
        {showTooltip && <Tooltip {...tooltipStyle} />}
        {showLegend && <Legend wrapperStyle={{ color: theme.textColor }} />}
        {series.map((s) => {
          const areaProps =
            type === 'area' && 'fill' in s
              ? {
                  fill: s.fill,
                  fillOpacity: s.fillOpacity,
                }
              : {};

          return (
            <DataComponent
              key={s.dataKey}
              type={s.type || 'monotone'}
              dataKey={s.dataKey}
              stroke={s.stroke}
              name={s.name}
              strokeWidth={s.strokeWidth}
              dot={s.dot}
              {...areaProps}
              isAnimationActive={false}
            />
          );
        })}
        {children}
      </ChartComponent>
    </ResponsiveContainer>
  );
}

export { CHART_COLORS } from '@/lib/theme/chart-colors';
