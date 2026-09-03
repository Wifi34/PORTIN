import React from 'react';
import { Link } from 'react-router-dom';
import { PortINLogo } from '../common/PortINLogo';

export const Footer: React.FC = () => {
  return (
    <footer id="footer" className="w-full relative z-10" style={{ backgroundColor: '#0B1F38', borderTop: '1px solid rgba(214, 166, 59, 0.2)' }}>
      <div className="max-w-7xl mx-auto px-6 py-14 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* LEFT: Logo & Institutional Tagline */}
          <div className="lg:col-span-2 space-y-4">
            <PortINLogo size="md" variant="light" showTagline={true} />
            <p className="text-xs text-slate-300 max-w-sm leading-relaxed font-medium">
              Intelligent maritime freight forecasting, vessel optimization, and procurement decision support engineered for overseas dry bulk supply chains to the East Coast of India.
            </p>
            <div className="text-[11px] text-[#F3E3B7] font-semibold pt-1">
              Ministry of Steel / SAIL • Smart India Hackathon 2026 (PS 26006)
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
              <li><a href="#trusted-data" className="hover:text-white transition-colors">Integrations</a></li>
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
              <li><Link to="/executive" className="hover:text-white transition-colors">Management</Link></li>
            </ul>
          </div>

          {/* GROUP 3: RESOURCES & COMPANY */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#D6A63B]">
              RESOURCES & LEGAL
            </h4>
            <ul className="space-y-2 text-xs font-medium text-slate-300">
              <li><a href="#intelligence-strip" className="hover:text-white transition-colors">Market Intelligence</a></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Reports</Link></li>
              <li><a href="#trusted-data" className="hover:text-white transition-colors">Documentation</a></li>
              <li><span className="text-slate-400">Terms of Service</span></li>
              <li><span className="text-slate-400">Privacy Policy</span></li>
            </ul>
          </div>
        </div>

        {/* FOOTER BOTTOM */}
        <div className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} PortIN — All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span className="text-[11px] text-slate-400 font-medium">
              Standardized for Paradip, Vizag, Gangavaram, Dhamra, Gopalpur & Haldia
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
