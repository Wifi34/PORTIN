import React from 'react';
import { Link } from 'react-router-dom';
import { PortINLogo } from '../common/PortINLogo';
import { IndiaEmblemSvg, SailLogoSvg } from '../common/GovtLogos';

export const Footer: React.FC = () => {
  return (
    <footer id="footer" className="w-full relative z-10 select-none" style={{ backgroundColor: '#071626', borderTop: '1px solid rgba(214, 166, 59, 0.25)' }}>
      {/* Institutional Co-Branding Banner */}
      <div className="border-b border-white/10 bg-[#0B1F38]/60 py-5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <IndiaEmblemSvg size={38} color="#F3E3B7" />
            <div className="leading-tight">
              <div className="text-xs font-black text-white tracking-wide">
                भारत सरकार <span className="text-white/40">|</span> Government of India
              </div>
              <div className="text-xs font-bold text-[#D6A63B] uppercase tracking-wider">
                इस्पात मंत्रालय <span className="text-white/40">|</span> Ministry of Steel
              </div>
              <div className="text-[10px] text-slate-400">
                Official Strategic Freight Decision Framework
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <SailLogoSvg size={32} showText={true} variant="light" />
              <div className="hidden sm:block pl-3 border-l border-white/20 text-left">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#D6A63B] block">Maharatna CPSE</span>
                <span className="text-[9px] text-slate-400">Steel Authority of India Limited</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* LEFT: Logo & Institutional Tagline */}
          <div className="lg:col-span-2 space-y-4">
            <PortINLogo size="md" variant="light" showTagline={true} />
            <p className="text-xs text-slate-300 max-w-sm leading-relaxed font-medium">
              Intelligent maritime freight forecasting, vessel optimization, and procurement decision support engineered for overseas dry bulk supply chains to the East Coast of India.
            </p>
            <div className="text-[11px] text-[#F3E3B7] font-semibold pt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Ministry of Steel • Steel Authority of India Limited (SAIL)</span>
            </div>
          </div>

          {/* GROUP 1: PLATFORM */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#D6A63B]">
              PLATFORM
            </h4>
            <ul className="space-y-2 text-xs font-medium text-slate-300">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#workflow" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#platform" className="hover:text-white transition-colors">Architecture</a></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Security</Link></li>
            </ul>
          </div>

          {/* GROUP 2: SOLUTIONS */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#D6A63B]">
              SOLUTIONS
            </h4>
            <ul className="space-y-2 text-xs font-medium text-slate-300">
              <li><a href="#value" className="hover:text-white transition-colors">Chartering Teams</a></li>
              <li><a href="#value" className="hover:text-white transition-colors">Procurement Teams</a></li>
              <li><a href="#value" className="hover:text-white transition-colors">Freight Analysts</a></li>
              <li><Link to="/executive" className="hover:text-white transition-colors">Executive Mode</Link></li>
            </ul>
          </div>

          {/* GROUP 3: OFFICIAL GOVT PORTALS */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#D6A63B]">
              OFFICIAL PORTALS
            </h4>
            <ul className="space-y-2 text-xs font-medium text-slate-300">
              <li>
                <a href="https://steel.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-[#D6A63B] transition-colors flex items-center gap-1">
                  <span>steel.gov.in</span>
                  <span className="text-[10px]">↗</span>
                </a>
              </li>
              <li>
                <a href="https://sail.co.in" target="_blank" rel="noopener noreferrer" className="hover:text-[#D6A63B] transition-colors flex items-center gap-1">
                  <span>sail.co.in</span>
                  <span className="text-[10px]">↗</span>
                </a>
              </li>
              <li>
                <a href="https://shipmin.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-[#D6A63B] transition-colors flex items-center gap-1">
                  <span>shipmin.gov.in</span>
                  <span className="text-[10px]">↗</span>
                </a>
              </li>
              <li>
                <a href="https://india.gov.in" target="_blank" rel="noopener noreferrer" className="hover:text-[#D6A63B] transition-colors flex items-center gap-1">
                  <span>india.gov.in</span>
                  <span className="text-[10px]">↗</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* FOOTER BOTTOM */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} PortIN — Ministry of Steel & SAIL Decision Platform.
          </div>
          <div className="flex items-center gap-6">
            <span className="text-[11px] text-slate-400 font-medium">
              Standardized for Paradip, Vizag, Gangavaram, Dhamra, Gopalpur & Haldia
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Tricolor Accent Ribbon */}
      <div className="w-full h-[3px] flex">
        <div className="h-full flex-1 bg-[#FF9933]" />
        <div className="h-full flex-1 bg-[#FFFFFF]" />
        <div className="h-full flex-1 bg-[#138808]" />
      </div>
    </footer>
  );
};
