import React from 'react';
import { STATUS_COLOR_MAP } from '../../utils/constants';

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', size = 'md' }) => {
  const style = STATUS_COLOR_MAP[status] || {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    dot: 'bg-slate-500',
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs sm:text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-md border ${style.bg} ${style.text} ${style.border} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot} shrink-0`} />
      <span className="truncate">{status}</span>
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: 'High' | 'Medium' | 'Low' }> = ({ priority }) => {
  const map = {
    High: 'bg-red-50 text-red-700 border-red-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    Low: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${map[priority]}`}>
      {priority}
    </span>
  );
};
