import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts';
import { format, parseISO } from 'date-fns';

const CustomTooltip = ({ active, payload, label, color }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="text-sm font-bold" style={{ color }}>
          ${Number(payload[0].value).toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

const StockLineChart = ({ data = [], height = 300, color = '#3B82F6', showGrid = true, showArea = true }) => {
  const formatXAxis = (tick) => {
    try {
      if (tick && tick.includes('-')) {
        return format(parseISO(tick), 'MMM d');
      }
      return tick;
    } catch {
      return tick;
    }
  };

  const formatYAxis = (value) => {
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
    return `$${value.toFixed(0)}`;
  };

  const minVal = data.length > 0 ? Math.min(...data.map(d => d.close || d.value || 0)) : 0;
  const maxVal = data.length > 0 ? Math.max(...data.map(d => d.close || d.value || 0)) : 0;
  const padding = (maxVal - minVal) * 0.1;

  return (
    <ResponsiveContainer width="100%" height={height}>
      {showArea ? (
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.15} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          )}
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
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
            domain={[minVal - padding, maxVal + padding]}
            width={55}
          />
          <Tooltip content={<CustomTooltip color={color} />} />
          <Area
            type="monotone"
            dataKey="close"
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${color.replace('#', '')})`}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: color }}
          />
        </AreaChart>
      ) : (
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          )}
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
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
            domain={[minVal - padding, maxVal + padding]}
            width={55}
          />
          <Tooltip content={<CustomTooltip color={color} />} />
          <Line
            type="monotone"
            dataKey="close"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: color }}
          />
        </LineChart>
      )}
    </ResponsiveContainer>
  );
};

export default StockLineChart;
