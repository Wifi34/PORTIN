import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, X, ArrowRight } from 'lucide-react';
import { PortINLogo } from '../common/PortINLogo';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'py-3 shadow-xl backdrop-blur-md'
          : 'py-5 bg-transparent'
      }`}
      style={{
        backgroundColor: scrolled ? 'rgba(11, 31, 56, 0.95)' : 'transparent',
        borderBottom: scrolled ? '1px solid rgba(214, 166, 59, 0.2)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* LEFT: Master PortIN Logo */}
        <PortINLogo size="md" variant="light" showTagline={true} linkTo="/" />

        {/* CENTER: Enterprise Navigation with Subtle Dropdowns */}
        <div className="hidden lg:flex items-center gap-7 text-xs font-semibold tracking-wide text-white/90">
          <Link to="/" className="hover:text-[#D6A63B] transition-colors">
            Home
          </Link>

          {/* Platform Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown('platform')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              type="button"
              className="flex items-center gap-1 hover:text-[#D6A63B] transition-colors focus:outline-none"
            >
              <span>Platform</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#D6A63B]" />
            </button>
            {activeDropdown === 'platform' && (
              <div
                className="absolute top-full left-0 mt-2 w-56 rounded-xl shadow-2xl p-2 border animate-in fade-in duration-150"
                style={{
                  backgroundColor: '#0F2747',
                  borderColor: 'rgba(214, 166, 59, 0.25)',
                }}
              >
                <a href="#platform" className="block px-3 py-2 rounded-lg hover:bg-[#17355B] text-slate-200 hover:text-white transition-colors">
                  <div className="font-bold text-xs">Overview & Architecture</div>
                  <div className="text-[10px] text-slate-400">Integrated decision framework</div>
                </a>
                <a href="#features" className="block px-3 py-2 rounded-lg hover:bg-[#17355B] text-slate-200 hover:text-white transition-colors">
                  <div className="font-bold text-xs">Core Capabilities</div>
                  <div className="text-[10px] text-slate-400">Forecasting, vessel & ports</div>
                </a>
                <a href="#workflow" className="block px-3 py-2 rounded-lg hover:bg-[#17355B] text-slate-200 hover:text-white transition-colors">
                  <div className="font-bold text-xs">Decision Workflow</div>
                  <div className="text-[10px] text-slate-400">Signal to contract execution</div>
                </a>
              </div>
            )}
          </div>

          {/* Solutions Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown('solutions')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              type="button"
              className="flex items-center gap-1 hover:text-[#D6A63B] transition-colors focus:outline-none"
            >
              <span>Solutions</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#D6A63B]" />
            </button>
            {activeDropdown === 'solutions' && (
              <div
                className="absolute top-full left-0 mt-2 w-64 rounded-xl shadow-2xl p-2 border animate-in fade-in duration-150"
                style={{
                  backgroundColor: '#0F2747',
                  borderColor: 'rgba(214, 166, 59, 0.25)',
                }}
              >
                <a href="#value" className="block px-3 py-2 rounded-lg hover:bg-[#17355B] text-slate-200 hover:text-white transition-colors">
                  <div className="font-bold text-xs">Chartering Managers</div>
                  <div className="text-[10px] text-slate-400">Multi-voyage COA vs spot savings</div>
                </a>
                <a href="#value" className="block px-3 py-2 rounded-lg hover:bg-[#17355B] text-slate-200 hover:text-white transition-colors">
                  <div className="font-bold text-xs">Procurement Teams</div>
                  <div className="text-[10px] text-slate-400">Total landed cost minimization</div>
                </a>
                <a href="#value" className="block px-3 py-2 rounded-lg hover:bg-[#17355B] text-slate-200 hover:text-white transition-colors">
                  <div className="font-bold text-xs">Freight Analysts</div>
                  <div className="text-[10px] text-slate-400">90-day probabilistic quantile bands</div>
                </a>
              </div>
            )}
          </div>

          {/* Market Intelligence Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setActiveDropdown('market')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <button
              type="button"
              className="flex items-center gap-1 hover:text-[#D6A63B] transition-colors focus:outline-none"
            >
              <span>Market Intelligence</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#D6A63B]" />
            </button>
            {activeDropdown === 'market' && (
              <div
                className="absolute top-full left-0 mt-2 w-64 rounded-xl shadow-2xl p-2 border animate-in fade-in duration-150"
                style={{
                  backgroundColor: '#0F2747',
                  borderColor: 'rgba(214, 166, 59, 0.25)',
                }}
              >
                <a href="#intelligence-strip" className="block px-3 py-2 rounded-lg hover:bg-[#17355B] text-slate-200 hover:text-white transition-colors">
                  <div className="font-bold text-xs">Live Freight Signals</div>
                  <div className="text-[10px] text-slate-400">Pacific & Indian Ocean bulk rates</div>
                </a>
                <a href="#advisor" className="block px-3 py-2 rounded-lg hover:bg-[#17355B] text-slate-200 hover:text-white transition-colors">
                  <div className="font-bold text-xs">PortIN Decision Advisor</div>
                  <div className="text-[10px] text-slate-400">Quantitative AI decision reasoning</div>
                </a>
              </div>
            )}
          </div>

          <a href="#trusted-data" className="hover:text-[#D6A63B] transition-colors">
            Technology
          </a>

          <a href="#footer" className="hover:text-[#D6A63B] transition-colors">
            About
          </a>
        </div>

        {/* RIGHT: Sign In & Request Demo CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            to={isAuthenticated ? "/dashboard" : "/login"}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all border"
            style={{
              backgroundColor: 'transparent',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: '#FFFFFF',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#D6A63B';
              e.currentTarget.style.color = '#D6A63B';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.color = '#FFFFFF';
            }}
          >
            {isAuthenticated ? 'Console' : 'Sign In'}
          </Link>

          <Link
            to="/signup"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black tracking-wider uppercase transition-all shadow-md cursor-pointer"
            style={{
              backgroundColor: '#D6A63B',
              color: '#0F2747',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#C7962F')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#D6A63B')}
          >
            <span>Request Demo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="lg:hidden flex items-center gap-2">
          <Link
            to={isAuthenticated ? "/dashboard" : "/login"}
            className="px-3 py-1.5 rounded-lg text-xs font-bold border border-white/30 text-white"
          >
            {isAuthenticated ? 'Console' : 'Sign In'}
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-white hover:text-[#D6A63B] transition-colors focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden px-6 pt-4 pb-6 border-b shadow-2xl animate-in slide-in-from-top duration-200"
          style={{
            backgroundColor: '#0B1F38',
            borderColor: 'rgba(214, 166, 59, 0.2)',
          }}
        >
          <div className="flex flex-col space-y-3 text-sm font-semibold text-white">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#D6A63B]"
            >
              Home
            </Link>
            <a
              href="#platform"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#D6A63B]"
            >
              Platform
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#D6A63B]"
            >
              Solutions
            </a>
            <a
              href="#advisor"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#D6A63B]"
            >
              Market Intelligence
            </a>
            <a
              href="#trusted-data"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#D6A63B]"
            >
              Technology
            </a>
            <a
              href="#footer"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-[#D6A63B]"
            >
              About
            </a>

            <div className="pt-3 border-t border-slate-700/60 flex flex-col gap-2">
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-xl text-center font-black text-xs uppercase tracking-wider text-[#0F2747]"
                style={{ backgroundColor: '#D6A63B' }}
              >
                Request Demo
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
