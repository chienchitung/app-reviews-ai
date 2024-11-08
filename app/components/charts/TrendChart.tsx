'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { Feedback } from '@/types/feedback';

interface TrendChartProps {
  data: Feedback[];
}

// 定義裝置顏色映射 - 使用更專業的品牌色系
const DEVICE_COLORS: Record<string, string> = {
  'iOS': '#147EFB',     // Apple 深藍色
  'Android': '#78C257', // Android 清新綠色
  '未知': '#A3A3A3'     // 中性灰色
};

// 每月評論數趨勢圖（按裝置區分）
export const MonthlyTrendChart = ({ data }: TrendChartProps) => {
  const monthlyData = data.reduce((acc, feedback) => {
    const date = new Date(feedback.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: monthKey,
        total: 0,
        devices: {}
      };
    }
    
    acc[monthKey].total += 1;
    acc[monthKey].devices[feedback.device] = (acc[monthKey].devices[feedback.device] || 0) + 1;
    
    return acc;
  }, {} as Record<string, any>);

  // 獲取所有不同的裝置類型
  const devices = Array.from(new Set(data.map(item => item.device)));

  const chartData = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, value]) => ({
      month,
      ...value.devices
    }));

  return (
    <div className="w-full h-full">
      <h3 className="text-center text-sm font-medium mb-4">每月評論數量趨勢 (按裝置分)</h3>
      <div className="w-full h-[calc(100%-2rem)]">
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend 
              verticalAlign="top" 
              height={36}
            />
            {devices.map((device) => (
              <Bar 
                key={device} 
                dataKey={device} 
                stackId="a"
                fill={DEVICE_COLORS[device] || '#94A3B8'} // 使用預定義的顏色或預設灰色
                name={device}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 評分分布圖（按裝置區分）
export const RatingDistributionChart = ({ data }: TrendChartProps) => {
  const deviceGroups = data.reduce((acc, item) => {
    if (!acc[item.device]) {
      acc[item.device] = [];
    }
    acc[item.device].push(item);
    return acc;
  }, {} as Record<string, Feedback[]>);

  const ratingDistribution = Object.entries(deviceGroups).map(([device, feedbacks]) => {
    const ratings = feedbacks.reduce((acc, item) => {
      const rating = Math.floor(item.rating);
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      device,
      ratings,
      total: feedbacks.length
    };
  });

  const chartData = Array.from({ length: 5 }, (_, i) => i + 1).map(rating => ({
    rating: `${rating}星`,
    ...Object.fromEntries(
      ratingDistribution.map(({ device, ratings }) => [
        device,
        (ratings[rating] || 0)
      ])
    )
  }));

  const devices = Object.keys(deviceGroups);

  return (
    <div className="w-full h-full">
      <h3 className="text-center text-sm font-medium mb-4">評分分布 (按裝置分)</h3>
      <div className="w-full h-[calc(100%-2rem)]">
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="rating" />
            <YAxis />
            <Tooltip />
            <Legend 
              verticalAlign="top" 
              height={36}
            />
            {devices.map((device) => (
              <Bar 
                key={device} 
                dataKey={device} 
                fill={DEVICE_COLORS[device] || '#94A3B8'} // 使用預定義的顏色或預設灰色
                name={device}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};