
import React from 'react';
import { KPI } from '../types';

export const StatCard: React.FC<{ kpi: KPI }> = ({ kpi }) => {
  const getColorClass = (color: string) => {
    switch (color) {
      case 'blue': return 'text-blue-600';
      case 'teal': return 'text-teal-600';
      case 'orange': return 'text-orange-500';
      case 'red': return 'text-red-500';
      default: return 'text-gray-600';
    }
  };

  const getBorderClass = (color: string) => {
    switch (color) {
      case 'blue': return 'border-l-4 border-blue-600';
      case 'teal': return 'border-l-4 border-teal-600';
      case 'orange': return 'border-l-4 border-orange-500';
      case 'red': return 'border-l-4 border-red-500';
      default: return 'border-l-4 border-gray-600';
    }
  };

  return (
    <div className={`bg-white rounded-sm shadow-sm p-5 ${getBorderClass(kpi.color)} border-t border-r border-b border-gray-100`}>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{kpi.label}</p>
      <div className="flex items-end justify-between">
        <h3 className={`text-2xl font-bold text-gray-900`}>{kpi.value}</h3>
      </div>
      <p className="text-xs text-gray-500 font-medium mt-1">{kpi.subtext}</p>
    </div>
  );
};
