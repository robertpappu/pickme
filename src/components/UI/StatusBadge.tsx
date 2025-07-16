import React from 'react';

interface StatusBadgeProps {
  status: 'Active' | 'Inactive' | 'Suspended' | 'Success' | 'Failed' | 'Pending' | 'Processing';
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const baseClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm';
  
  const statusClasses = {
    Active: 'bg-green-500/20 text-green-400 border-green-500/30',
    Inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    Suspended: 'bg-red-500/20 text-red-400 border-red-500/30',
    Success: 'bg-green-500/20 text-green-400 border-green-500/30',
    Failed: 'bg-red-500/20 text-red-400 border-red-500/30',
    Pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  };

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${baseClasses} ${statusClasses[status]}`}>
      <span className="w-2 h-2 bg-current rounded-full mr-1.5" />
      {status}
    </span>
  );
};