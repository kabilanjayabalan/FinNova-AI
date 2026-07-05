import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

const RADIAN = Math.PI / 180;

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3">
        <p className="text-xs text-gray-500 mb-1">{payload[0].name}</p>
        <p className="text-sm font-bold" style={{ color: payload[0].payload.color }}>
          {typeof payload[0].value === 'number' && payload[0].value > 100
            ? `$${payload[0].value.toLocaleString()}`
            : `${payload[0].value}%`}
        </p>
      </div>
    );
  }
  return null;
};

const AllocationPieChart = ({ data = [], height = 300, donut = true }) => {
  const DEFAULT_COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#F97316', '#EC4899', '#14B8A6', '#6366F1',
  ];

  const enrichedData = data.map((item, i) => ({
    ...item,
    color: item.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={enrichedData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={CustomLabel}
          outerRadius={height / 2.5}
          innerRadius={donut ? height / 5 : 0}
          dataKey="value"
          strokeWidth={2}
          stroke="#fff"
        >
          {enrichedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span className="text-xs text-gray-600 font-medium">{value}</span>
          )}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default AllocationPieChart;
