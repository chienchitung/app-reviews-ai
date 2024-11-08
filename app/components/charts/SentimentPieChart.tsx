'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { Feedback } from '@/types/feedback';

interface SentimentPieChartProps {
  data: Feedback[];
}

export const SentimentPieChart = ({ data }: SentimentPieChartProps) => {
  const sentimentCounts = data.reduce((acc, feedback) => {
    const sentiment = feedback.sentiment;
    acc[sentiment] = (acc[sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(sentimentCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = {
    '正面': '#4ade80',
    '中性': '#93c5fd',
    '負面': '#f87171'
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={false}
          outerRadius="80%"
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[entry.name as keyof typeof COLORS]} 
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}; 