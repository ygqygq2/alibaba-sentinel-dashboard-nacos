/**
 * 响应式图表容器 - 自动适配 dark/light 模式
 */

import * as React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  AreaChart,
  Tooltip,
  Legend,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  Area,
} from 'recharts';
import { Box } from '@chakra-ui/react';

import { useColorMode } from '@/hooks/use-color-mode';
import {
  CHART_COLORS,
  getChartTheme,
  getTooltipStyle,
  getAxisConfig,
  getGridConfig,
  type LineSeriesConfig,
} from '@/lib/theme/chart-colors';

interface ChartContainerProps {
  data: any[];
  height?: number;
  type?: 'line' | 'area';
  series: LineSeriesConfig[];
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
  const { colorMode } = useColorMode();
  const theme = getChartTheme(colorMode);
  const axisConfig = getAxisConfig(colorMode);
  const gridConfig = getGridConfig(colorMode);
  const tooltipStyle = getTooltipStyle(colorMode);

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
        {series.map((s) => (
          <DataComponent
            key={s.dataKey}
            type={s.type || 'monotone'}
            dataKey={s.dataKey}
            stroke={s.stroke}
            name={s.name}
            strokeWidth={s.strokeWidth}
            dot={s.dot}
            isAnimationActive={false}
          />
        ))}
        {children}
      </ChartComponent>
    </ResponsiveContainer>
  );
}

export { CHART_COLORS } from '@/lib/theme/chart-colors';
