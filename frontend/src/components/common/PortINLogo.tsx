import React from 'react';
import { Link } from 'react-router-dom';
import { Anchor } from 'lucide-react';

interface PortINLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark';
  showTagline?: boolean;
  linkTo?: string;
  className?: string;
}

export const PortINLogo: React.FC<PortINLogoProps> = ({
  size = 'md',
  variant = 'light',
  showTagline = true,
  linkTo = '/',
  className = '',
}) => {
  const iconSizeClasses = {
    sm: 'p-1.5 rounded-lg',
    md: 'p-2 rounded-xl',
    lg: 'p-2.5 rounded-xl',
    xl: 'p-3 rounded-2xl',
  };

  const anchorDimensions = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const taglineSizes = {
    sm: 'text-[8px]',
    md: 'text-[9px]',
    lg: 'text-[10px]',
    xl: 'text-[11px]',
  };

  const isLight = variant === 'light';

  const logoContent = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Anchor Emblem */}
      <div
        className={`${iconSizeClasses[size]} shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-md`}
        style={{
          background: 'linear-gradient(135deg, #0F2747 0%, #0B1F38 100%)',
          border: '1px solid rgba(214, 166, 59, 0.4)',
        }}
      >
        <Anchor className={`${anchorDimensions[size]}`} style={{ color: '#D6A63B' }} />
      </div>

      {/* Brand Typography */}
      <div className="leading-tight">
        <span
          className={`${titleSizes[size]} font-black tracking-tight flex items-center gap-0.5`}
          style={{ color: isLight ? '#FFFFFF' : '#0F2747' }}
        >
          Port<span style={{ color: '#D6A63B' }}>IN</span>
        </span>
        {showTagline && (
          <span
            className={`${taglineSizes[size]} uppercase tracking-widest block font-semibold`}
            style={{ color: isLight ? '#D6A63B' : '#68717D' }}
          >
            Intelligent Maritime Decisions
          </span>
        )}
      </div>
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="inline-block group focus:outline-none" aria-label="PortIN Home">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};
