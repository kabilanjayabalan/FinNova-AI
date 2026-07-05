import React from 'react';

const Loader = ({ fullPage = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  const spinner = (
    <div
      className={`${sizeClasses[size]} rounded-full border-blue-100 border-t-primary animate-spin`}
      style={{ borderTopColor: '#3B82F6' }}
    />
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-blue-100 border-t-primary animate-spin"
            style={{ borderTopColor: '#3B82F6' }} />
          <p className="text-sm font-medium text-gray-500 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return spinner;
};

export const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 rounded-full border-4 border-blue-100 border-t-primary animate-spin"
        style={{ borderTopColor: '#3B82F6' }} />
      <p className="text-sm text-gray-500">Loading...</p>
    </div>
  </div>
);

export default Loader;
