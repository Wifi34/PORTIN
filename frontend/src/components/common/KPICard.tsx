import React from 'react';
import { DataProvenanceBadge } from './DataProvenanceBadge';

interface Props {
  title: string;
  value: string | number;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendText?: string;
  icon: React.ReactNode;
  sourceType?: string;
  sourceName?: string;
  badgeText?: string;
  badgeVariant?: 'success' | 'warning' | 'danger' | 'info';
}

export const KPICard: React.FC<Props> = ({
  title,
  value,
  subtext,
  trend,
  trendText,
  icon,
  sourceType = 'OFFICIAL STATIC',
  sourceName,
  badgeText,
  badgeVariant = 'info',
}) => {
  // Enterprise badge styling with authentic institutional colors
  let badgeClasses = 'bg-[#F8F7F3] text-[#0F2747] border-[#E4E2DC]';
  if (badgeVariant === 'success') badgeClasses = 'bg-[#F3FAF7] text-[#2F7D4B] border-[#BCF0DA]';
  if (badgeVariant === 'warning') badgeClasses = 'bg-[#FEF7EC] text-[#D98A27] border-[#FBE6C2]';
  if (badgeVariant === 'danger') badgeClasses = 'bg-[#FDF2F2] text-[#C64A3B] border-[#F8B4B4]';

  return (
    <div className="bg-[#FFFFFF] border border-[#E4E2DC] rounded-[10px] p-4 shadow-[0_1px_3px_rgba(15,39,71,0.04)] hover:border-[#D6A63B] transition-all relative">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] font-bold text-[#68717D] uppercase tracking-wider">{title}</span>
        <div className="flex items-center gap-1.5">
          {badgeText && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${badgeClasses}`}>
              {badgeText}
            </span>
          )}
          <div className="p-1.5 rounded-lg bg-[#F8F7F3] text-[#D6A63B] border border-[#E4E2DC]">
            {icon}
          </div>
        </div>
      </div>

      <div className="text-xl sm:text-2xl font-black text-[#0F2747] tracking-tight my-1">
        {value}
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E4E2DC]">
        <div className="text-[11px] text-[#68717D] flex items-center gap-1">
          {trend && (
            <span className={trend === 'up' ? 'text-[#C64A3B] font-bold' : trend === 'down' ? 'text-[#2F7D4B] font-bold' : 'text-[#68717D]'}>
              {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '●'} {trendText}
            </span>
          )}
          {subtext && !trend && <span>{subtext}</span>}
        </div>
        <DataProvenanceBadge sourceType={sourceType} sourceName={sourceName} />
      </div>
    </div>
  );
};
