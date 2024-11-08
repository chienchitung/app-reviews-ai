'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Feedback } from '@/types/feedback';

interface CategoryBarChartProps {
  data: Feedback[];
}

export const CategoryBarChart = ({ data }: CategoryBarChartProps) => {
  // 統計各分類的出現次數
  const categoryCount = data.reduce((acc, feedback) => {
    const categories = feedback.category.split(/[,，]/).map(c => c.trim());
    categories.forEach(category => {
      acc[category] = (acc[category] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  // 轉換為圖表數據格式並排序
  const chartData = Object.entries(categoryCount)
    .map(([category, count]) => ({
      category,
      count
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis 
          dataKey="category" 
          type="category" 
          width={80}
        />
        <Tooltip />
        <Bar 
          dataKey="count" 
          fill="#9333EA" // 使用紫色系，與其他圖表區分
        />
      </BarChart>
    </ResponsiveContainer>
  );
}; 