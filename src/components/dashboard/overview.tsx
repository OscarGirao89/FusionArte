'use client';
import { Bar, BarChart, XAxis, YAxis, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

const data = [
  { name: 'Elena G.', total: 42 },
  { name: 'Carlos R.', total: 35 },
  { name: 'Aisha J.', total: 51 },
  { name: 'Liam S.', total: 28 },
  { name: 'Studio', total: 12 },
];

const chartConfig = {
  total: {
    label: 'Classes',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export function Overview() {
  return (
    <ChartContainer config={chartConfig} className="h-[350px] w-full">
      <BarChart accessibilityLayer data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          cursor={{ fill: 'hsl(var(--accent) / 0.2)' }}
          content={<ChartTooltipContent />}
        />
        <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
