import React from 'react';
import { TrendingUp, type LucideIcon  } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number | undefined;
  subValue?: string;
  icon: LucideIcon;
  /** Tailwind background color class for the icon container (e.g., "bg-[#006B5D]" or "bg-blue-500") */
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  subValue, 
  icon: Icon, 
  color 
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-md hover:border-gray-200 group">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          {/* Label */}
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
            {title}
          </p>
          
          {/* Main Value */}
          <h3 className="text-3xl font-black text-slate-800 tracking-tight">
            {value !== undefined ? value : '0'}
          </h3>
          
          {/* Subtext / Trend */}
          {subValue && (
            <div className="flex items-center mt-2">
              <div className="flex items-center bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                <TrendingUp size={10} className="mr-1" />
                {subValue}
              </div>
            </div>
          )}
        </div>

        {/* Icon Container */}
        <div className={`
          p-3 rounded-2xl text-white shadow-lg transition-transform duration-500 group-hover:scale-110
          ${color} 
          shadow-current/20
        `}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;