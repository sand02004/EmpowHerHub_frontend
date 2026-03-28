import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  accent?: 'primary' | 'secondary' | 'amber' | 'rose';
  trend?: string;
}

const accentMap = {
  primary: 'border-l-primary text-primary bg-primary/5',
  secondary: 'border-l-secondary text-secondary bg-secondary/5',
  amber: 'border-l-amber-500 text-amber-600 bg-amber-50',
  rose: 'border-l-rose-500 text-rose-600 bg-rose-50',
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  accent = 'primary',
  trend,
}) => {
  const colors = accentMap[accent];
  const [borderColor, textColor, bgColor] = colors.split(' ');

  return (
    <div
      className={`bg-white p-6 rounded-2xl border border-gray-100 border-l-4 ${borderColor} shadow-xs hover:shadow-sm transition-shadow`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</p>
          <p className={`text-4xl font-black mt-2 ${textColor}`}>{value}</p>
          {trend && <p className="text-xs text-gray-400 mt-1 font-medium">{trend}</p>}
        </div>
        {Icon && (
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${bgColor}`}>
            <Icon className={`h-5 w-5 ${textColor}`} />
          </div>
        )}
      </div>
    </div>
  );
};
