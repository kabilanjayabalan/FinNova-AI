import React from 'react';

const Badge = ({ label, variant }) => {
  const autoVariant = variant || (
    label === 'BUY' ? 'buy' :
    label === 'SELL' ? 'sell' :
    label === 'HOLD' ? 'hold' :
    label === 'BULLISH' ? 'bullish' :
    label === 'BEARISH' ? 'bearish' :
    label === 'NEUTRAL' ? 'neutral' :
    'default'
  );

  const styles = {
    buy: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    sell: 'bg-red-100 text-red-700 border-red-200',
    hold: 'bg-amber-100 text-amber-700 border-amber-200',
    bullish: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    bearish: 'bg-red-100 text-red-700 border-red-200',
    neutral: 'bg-gray-100 text-gray-600 border-gray-200',
    primary: 'bg-blue-100 text-blue-700 border-blue-200',
    purple: 'bg-purple-100 text-purple-700 border-purple-200',
    default: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide uppercase ${styles[autoVariant] || styles.default}`}
    >
      {label}
    </span>
  );
};

export default Badge;
