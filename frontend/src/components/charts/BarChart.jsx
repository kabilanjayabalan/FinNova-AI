import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';

const CustomTooltip = ({ active, payload, label, color }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    const formatted = val >= 1e9
      ? `${(val / 1e9).toFixed(2)}B`
      : val >= 1e6
      ? `${(val / 1e6).toFixed(2)}M`
      : val >= 1e3
      ? `${(val / 1e3).toFixed(2)}K`
      : val.toFixed(2);

    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-sm font-bold" style={{ color }}>{formatted}</p>
      </div>
    );
  }
  return null;
};

const StockBarChart = ({
  data = [],
  xKey = 'date',
  yKey = 'value',
  height = 300,
  color = '#3B82F6',
  showGrid = true,
  colorPositive = '#10B981',
  colorNegative = '#EF4444',
  usePositiveNegative = false,
}) => {
  const formatYAxis = (value) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toFixed(0);
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} barSize={12}>
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        )}
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 11, fill: '#94A3B8' }}
          tickLine={false}
          axisLine={false}
          dy={8}
        />
        <YAxis
          tickFormatter={formatYAxis}
          tick={{ fontSize: 11, fill: '#94A3B8' }}
          tickLine={false}
          axisLine={false}
          width={50}
        />
        <Tooltip content={<CustomTooltip color={color} />} />
        <Bar dataKey={yKey} radius={[4, 4, 0, 0]}>
          {usePositiveNegative
            ? data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry[yKey] >= 0 ? colorPositive : colorNegative}
                />
              ))
            : data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={color} fillOpacity={0.85} />
              ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default StockBarChart;
