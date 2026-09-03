import React, { useState } from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface Props {
  sourceType: 'LIVE' | 'OFFICIAL STATIC' | 'SIMULATED DEMO' | 'IMPORTED' | string;
  sourceName?: string;
  lastVerified?: string;
  confidence?: string;
}

export const DataProvenanceBadge: React.FC<Props> = ({
  sourceType,
  sourceName = 'Official Port Trust Master Plan',
  lastVerified = '2026-08-20',
  confidence = 'High Confidence (Verified Ground Truth)',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Muted, enterprise palette styling
  let badgeClasses = 'bg-[#F8F7F3] text-[#0F2747] border-[#E4E2DC]';
  if (sourceType === 'LIVE') {
    badgeClasses = 'bg-[#F3FAF7] text-[#2F7D4B] border-[#BCF0DA]';
  } else if (sourceType === 'OFFICIAL STATIC') {
    badgeClasses = 'bg-[#F0F4F9] text-[#0F2747] border-[#D0D9E5]';
  } else if (sourceType === 'SIMULATED DEMO') {
    badgeClasses = 'bg-[#FEF7EC] text-[#D98A27] border-[#FBE6C2]';
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase rounded border ${badgeClasses} transition-all cursor-help`}
      >
        <ShieldCheck className="w-3 h-3 text-[#D6A63B]" />
        <span>{sourceType}</span>
        <Info className="w-2.5 h-2.5 opacity-60" />
      </button>

      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-[#FFFFFF] border border-[#E4E2DC] rounded-xl shadow-xl text-xs text-[#172033] pointer-events-none">
          <div className="font-bold text-[#0F2747] mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D6A63B]" />
            Data Provenance & Trust Layer
          </div>
          <div className="space-y-1 text-[11px] text-[#68717D]">
            <div><span className="text-[#172033] font-semibold">Classification:</span> {sourceType}</div>
            <div><span className="text-[#172033] font-semibold">Source:</span> {sourceName}</div>
            <div><span className="text-[#172033] font-semibold">Verified:</span> {lastVerified}</div>
            <div><span className="text-[#172033] font-semibold">Integrity:</span> {confidence}</div>
          </div>
          <div className="mt-2 text-[9px] text-[#68717D] border-t border-[#E4E2DC] pt-1">
            Standardized for Ministry of Steel / SAIL Bulk Operations
          </div>
        </div>
      )}
    </div>
  );
};
