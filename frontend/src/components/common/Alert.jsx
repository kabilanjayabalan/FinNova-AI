import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const Alert = ({ type = 'info', message, onClose }) => {
  const config = {
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      icon: CheckCircle,
      iconColor: 'text-emerald-500',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: XCircle,
      iconColor: 'text-red-500',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: Info,
      iconColor: 'text-blue-500',
    },
  };

  const { bg, border, text, icon: Icon, iconColor } = config[type] || config.info;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${bg} ${border} animate-fade-in`}>
      <Icon size={18} className={`${iconColor} mt-0.5 flex-shrink-0`} />
      <p className={`flex-1 text-sm font-medium ${text}`}>{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className={`${iconColor} hover:opacity-70 transition-opacity flex-shrink-0`}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default Alert;
