import React from 'react';

/**
 * High-fidelity State Emblem of India (Lion Capital of Ashoka)
 * With Ashoka Chakra, caparisoned horse, galloping bull, and 'सत्यमेव जयते'
 */
export const IndiaEmblemSvg: React.FC<{
  className?: string;
  size?: number;
  color?: string;
}> = ({ className = '', size = 36, color = '#D6A63B' }) => (
  <svg
    width={size}
    height={size * 1.15}
    viewBox="0 0 100 115"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    aria-label="State Emblem of India"
  >
    <g fill={color}>
      {/* Crown / Top crest */}
      <path d="M50 8C48 8 46.5 9.5 46.5 11.5C46.5 13 47.5 14 49 14.5V17H51V14.5C52.5 14 53.5 13 53.5 11.5C53.5 9.5 52 8 50 8Z" />
      
      {/* Center Lion Head */}
      <path d="M42 16C42 16 40 18 39 21C38 24 38.5 28 40 30C40.5 29 42 27.5 44 27.5C45.5 27.5 47 28.5 47 30C47 31 46 32 45 32C43 32 41 33.5 41 36C41 38.5 43 40 45 40C47 40 48.5 39 49 37.5C49.5 39 51 40 53 40C55 40 57 38.5 57 36C57 33.5 55 32 53 32C52 32 51 31 51 30C51 28.5 52.5 27.5 54 27.5C56 27.5 57.5 29 58 30C59.5 28 60 24 59 21C58 18 56 16 56 16C54 18 52 19 50 19C48 19 46 18 42 16Z" />

      {/* Left Lion Head & Mane */}
      <path d="M36 22C33 22 29 25 28 29C27 33 28 38 31 41C31.5 39.5 33 38 34.5 38C35.5 38 36.5 38.5 37 39.5C36 41 35 43 36 45C37 47 39 48 40.5 47C39.5 49 38 52 38 56H43C43 51 44 48 45 45C42 45 39 43 38 41C40 41 41 39 41 37C39 37 37 35 37 33C37 30 38.5 27 39 25C38 23.5 37 22.5 36 22Z" />

      {/* Right Lion Head & Mane */}
      <path d="M64 22C67 22 71 25 72 29C73 33 72 38 69 41C68.5 39.5 67 38 65.5 38C64.5 38 63.5 38.5 63 39.5C64 41 65 43 64 45C63 47 61 48 59.5 47C60.5 49 62 52 62 56H57C57 51 56 48 55 45C58 45 61 43 62 41C60 41 59 39 59 37C61 37 63 35 63 33C63 30 61.5 27 61 25C62 23.5 63 22.5 64 22Z" />

      {/* Front Paws & Chest */}
      <path d="M43 43C43 43 41 47 41 53C41 57 43 60 46 62V67H54V62C57 60 59 57 59 53C59 47 57 43 57 43C55 45 53 46 50 46C47 46 45 45 43 43Z" />
      
      {/* Abacus / Base Platform */}
      <rect x="18" y="69" width="64" height="15" rx="2" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.5" />

      {/* Central Ashoka Chakra */}
      <circle cx="50" cy="76.5" r="5.5" stroke={color} strokeWidth="1.5" fill="none" />
      <circle cx="50" cy="76.5" r="1.5" fill={color} />
      <line x1="50" y1="71.5" x2="50" y2="81.5" stroke={color} strokeWidth="0.9" />
      <line x1="45" y1="76.5" x2="55" y2="76.5" stroke={color} strokeWidth="0.9" />

      {/* Animals on frieze */}
      <path d="M26 78C27 75 29 74 31 75C32 75.5 33 77 34 76C35 75 36 73 38 74C37 76 36 78 35 79C33 79 32 78 30 79C28 80 27 79 26 78Z" />
      <path d="M63 78C64 74 67 74 69 75C71 76 72 75 73 74C74 76 73 78 72 79C70 79 69 78 67 79C65 80 64 79 63 78Z" />

      {/* Bell-shaped Lotus Base */}
      <path d="M24 86C30 92 40 94 50 94C60 94 70 92 76 86C72 88 62 90 50 90C38 90 28 88 24 86Z" />
      <rect x="22" y="93" width="56" height="2.5" rx="1" fill={color} />

      {/* 'सत्यमेव जयते' Motto */}
      <text
        x="50"
        y="108"
        textAnchor="middle"
        fontSize="9.5"
        fontFamily="serif"
        fontWeight="bold"
        letterSpacing="0.8"
        fill={color}
      >
        सत्यमेव जयते
      </text>
    </g>
  </svg>
);

/**
 * Official SAIL (Steel Authority of India Limited) Logo
 */
export const SailLogoSvg: React.FC<{
  className?: string;
  size?: number;
  showText?: boolean;
  variant?: 'light' | 'dark';
}> = ({ className = '', size = 38, showText = true, variant = 'light' }) => {
  const textColor = variant === 'light' ? '#FFFFFF' : '#0F2747';
  const subTextColor = variant === 'light' ? '#F3E3B7' : '#68717D';

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-label="Steel Authority of India Limited Logo"
      >
        {/* SAIL Background Circular Crest */}
        <circle cx="50" cy="50" r="47" fill="#0A2540" stroke="#D6A63B" strokeWidth="2" />
        <circle cx="50" cy="50" r="41" fill="#0D2E50" />

        {/* Iconic SAIL Crucible Triangle (Steel Blue) */}
        <path
          d="M50 20L76 70H24L50 20Z"
          fill="#005A9C"
          stroke="#FFFFFF"
          strokeWidth="1.2"
        />

        {/* Molten Steel Stream / Diagonal Beam (Bright Orange-Red) */}
        <path
          d="M50 20L36 70H48L62 20H50Z"
          fill="#F26522"
        />

        {/* Golden Ingot Accent */}
        <path
          d="M44 48L55 48L52 57L41 57Z"
          fill="#FFC72C"
        />
      </svg>

      {showText && (
        <div className="leading-tight flex flex-col justify-center">
          <div className="flex items-center gap-1.5">
            <span
              className="text-sm font-black tracking-tight"
              style={{ color: textColor }}
            >
              सेल <span style={{ color: '#F26522' }}>SAIL</span>
            </span>
          </div>
          <span
            className="text-[9px] font-bold uppercase tracking-wider"
            style={{ color: subTextColor }}
          >
            Steel Authority of India
          </span>
        </div>
      )}
    </div>
  );
};

/**
 * Top National Government Header Banner (Clean & Authentic)
 * Saffron-White-Green Tricolor Strip with Official National Emblem & Ministry of Steel
 */
export const GovtTopBar: React.FC = () => {
  return (
    <aside aria-label="Official Government Header" className="w-full relative z-50 text-white select-none border-b border-white/10" style={{ backgroundColor: '#071626' }}>
      {/* National Tricolor Top Line */}
      <div className="w-full h-[3px] flex">
        <div className="h-full flex-1 bg-[#FF9933]" />
        <div className="h-full flex-1 bg-[#FFFFFF]" />
        <div className="h-full flex-1 bg-[#138808]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 flex items-center justify-between text-xs">
        {/* LEFT: Government of India & Ministry of Steel */}
        <div className="flex items-center gap-2.5">
          <IndiaEmblemSvg size={24} color="#F3E3B7" />
          <div className="leading-tight">
            <span className="text-[11px] font-black text-white tracking-wide">
              भारत सरकार <span className="text-white/40 font-normal">|</span> Government of India
            </span>
            <span className="text-[10px] font-bold text-[#D6A63B] uppercase tracking-wider block sm:inline sm:ml-2">
              इस्पात मंत्रालय <span className="text-white/40 font-normal">|</span> Ministry of Steel
            </span>
          </div>
        </div>

        {/* RIGHT: Official Portal Links */}
        <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-300">
          <div className="hidden sm:flex items-center gap-2 text-slate-400">
            <a
              href="https://steel.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#D6A63B] transition-colors"
            >
              steel.gov.in ↗
            </a>
            <span>•</span>
            <a
              href="https://sail.co.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#D6A63B] transition-colors"
            >
              sail.co.in ↗
            </a>
          </div>

          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/10 text-slate-200 text-[9px] font-bold">
            <span className="text-[#D6A63B]">IN</span>
            <span>English / हिंदी</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

/**
 * Compact Government & Ministry of Steel Official Hero Badge
 */
export const GovtHeroBadge: React.FC = () => {
  return (
    <div className="inline-flex items-center gap-3 px-3.5 py-2 rounded-xl border border-[#D6A63B]/40 bg-[#071B32]/85 backdrop-blur-md shadow-lg select-none">
      <IndiaEmblemSvg size={28} color="#F3E3B7" />
      <div className="leading-tight text-left">
        <div className="text-[11px] font-black text-white tracking-wide">
          भारत सरकार <span className="text-white/40">|</span> इस्पात मंत्रालय
        </div>
        <div className="text-[10px] font-bold text-[#D6A63B] uppercase tracking-wider">
          Ministry of Steel • SAIL Decision Platform
        </div>
      </div>
      <div className="h-7 w-px bg-white/20 hidden sm:block" />
      <div className="hidden sm:flex items-center">
        <SailLogoSvg size={26} showText={false} variant="light" />
      </div>
    </div>
  );
};
