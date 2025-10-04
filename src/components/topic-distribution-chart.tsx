'use client';
import { Pie, PieChart, Cell, Legend, ResponsiveContainer } from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { TopicDistribution } from '@/lib/types';
import { useMemo, useState } from 'react';

interface TopicDistributionChartProps {
  data: TopicDistribution[];
}

// Enhanced color palette with vibrant, accessible colors
const PALETTE = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6366F1', // Indigo
];

export function TopicDistributionChart({ data }: TopicDistributionChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const chartData = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      name: item.topic,
      value: item.count,
      fill: PALETTE[index % PALETTE.length],
    }));
  }, [data]);

  const chartConfig = useMemo(() => {
    return chartData.reduce((acc, item) => {
        acc[item.topic] = {
            label: item.topic,
            color: item.fill,
        };
        return acc;
    }, {} as any);
  }, [chartData]);

  const totalQuestions = useMemo(() => {
    return data.reduce((sum, item) => sum + item.count, 0);
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>No topic distribution data available</p>
      </div>
    );
  }

  return (
    <div className="w-full h-80 sm:h-96 flex flex-col items-center space-y-3 sm:space-y-4">
      {/* Summary Stats */}
      <div className="text-center">
        <h3 className="text-base sm:text-lg font-semibold text-foreground">Topic Distribution</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {totalQuestions} total questions across {data.length} topic{data.length > 1 ? 's' : ''}
        </p>
      </div>

      <ChartContainer 
        config={chartConfig} 
        className="w-full h-full min-h-[280px] sm:min-h-[320px]"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent 
                hideLabel 
                formatter={(value: any, name: any) => [
                  `${value} questions (${((Number(value) / totalQuestions) * 100).toFixed(1)}%)`,
                  String(name)
                ]}
              />
            }
          />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={activeIndex !== null ? 90 : 80}
            innerRadius={40}
            strokeWidth={3}
            stroke="#fff"
            animationBegin={0}
            animationDuration={800}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.fill}
                stroke={activeIndex === index ? entry.fill : '#fff'}
                strokeWidth={activeIndex === index ? 4 : 3}
                style={{
                  filter: activeIndex === index ? 'brightness(1.1)' : 'none',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </Pie>
          <Legend 
            verticalAlign="bottom" 
            height={50}
            iconType="circle"
            wrapperStyle={{
              paddingTop: '15px',
              fontSize: '12px',
              fontWeight: '500'
            }}
            formatter={(value: string, entry: any) => [
              `${value} (${entry.payload.value})`,
              ''
            ]}
          />
        </PieChart>
      </ChartContainer>
    </div>
  );
}
