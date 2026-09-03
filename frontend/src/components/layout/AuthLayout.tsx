import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, TrendingUp, Sparkles, Lock } from 'lucide-react';
import { PortINLogo } from '../common/PortINLogo';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  heroHeadline?: string;
  heroHighlight?: string;
  heroSubheadline?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  heroHeadline = "Smarter Freight Forecasting for",
  heroHighlight = "Maritime Decisions",
  heroSubheadline = "Predict Freight. Optimize Chartering. Procure Smarter.",
}) => {
  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between relative overflow-hidden"
      style={{ backgroundColor: '#0B1F38' }}
    >
      {/* Background Visual Layer: Real Maritime Bulk Vessel Photography + Texture */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/assets/ship_hero_poster.jpg"
          alt="Dry bulk cargo vessel underway at open sea"
          className="w-full h-full object-cover object-center opacity-35 scale-105"
        />
        {/* Navy Gradient overlay for text contrast and enterprise platform atmosphere */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(11, 31, 56, 0.96) 0%, rgba(15, 39, 71, 0.88) 45%, rgba(11, 31, 56, 0.94) 100%)',
          }}
        />
        {/* Subtle coordinate navigational grid texture */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'radial-gradient(#D6A63B 1px, transparent 1px), linear-gradient(to right, rgba(214, 166, 59, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(214, 166, 59, 0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* TOP BAR: Back to Home Link (Visible on ALL devices) */}
      <header className="relative z-20 px-6 sm:px-10 pt-6 pb-2 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-white/90 hover:text-[#D6A63B] transition-colors group focus:outline-none"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#D6A63B] group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Home</span>
        </Link>

        {/* Mobile Header Logo fallback */}
        <div className="lg:hidden">
          <PortINLogo size="sm" variant="light" showTagline={false} />
        </div>
      </header>

      {/* MAIN CONTENT AREA: Split View Desktop (Visual + Form Card) */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT COLUMN: Maritime Intelligence Context (Desktop only, 45-55% width) */}
          <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-center pr-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#D6A63B]/30 bg-[#0F2747]/80 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D6A63B]" />
              <span className="text-[11px] uppercase tracking-widest font-bold text-[#F3E3B7]">
                DATA. INTELLIGENCE. CONFIDENCE.
              </span>
            </div>

            <h1 className="text-3xl xl:text-4xl font-black tracking-tight text-white leading-tight">
              {heroHeadline}{' '}
              <span style={{ color: '#D6A63B' }}>{heroHighlight}</span>
            </h1>

            <p className="text-sm xl:text-base text-slate-300 font-medium leading-relaxed max-w-xl">
              PortIN combines freight forecasting, vessel optimization, port intelligence, route analytics, and AI-powered decision support to help chartering and procurement teams make confident bulk cargo decisions for India’s East Coast.
            </p>

            <div className="pt-2 border-t border-slate-700/60 max-w-md">
              <p className="text-xs font-bold uppercase tracking-wider text-[#F3E3B7]">
                {heroSubheadline}
              </p>
            </div>

            {/* Institutional Trust Indicators */}
            <div className="grid grid-cols-2 gap-4 pt-4 max-w-lg">
              <div className="p-3.5 rounded-xl bg-[#0F2747]/60 border border-slate-700/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Standardized For</span>
                <span className="text-xs font-bold text-white mt-0.5 block">SAIL Coking Coal & Bulk Cargo</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0F2747]/60 border border-slate-700/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Coverage Scope</span>
                <span className="text-xs font-bold text-white mt-0.5 block">7 Major East Coast Indian Ports</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: The Warm White / Ivory Auth Card (Desktop 420px-520px, Mobile full) */}
          <div className="lg:col-span-6 xl:col-span-5 flex justify-center lg:justify-end w-full">
            <div
              className="w-full max-w-[480px] rounded-2xl p-6 sm:p-8 shadow-2xl transition-all"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E4E2DC',
                color: '#172033',
              }}
            >
              {/* Top Logo & Tagline */}
              <div className="text-center pb-6 border-b border-[#E4E2DC]">
                <PortINLogo size="md" variant="dark" showTagline={true} />
              </div>

              {/* Form Title & Subtitle */}
              <div className="pt-6 mb-6">
                <h2 className="text-xl sm:text-2xl font-black text-[#0F2747] tracking-tight">
                  {title}
                </h2>
                <p className="text-xs text-[#68717D] mt-1 font-medium">
                  {subtitle}
                </p>
              </div>

              {/* Form Body */}
              {children}
            </div>
          </div>

        </div>
      </main>

      {/* BOTTOM MARITIME TRUST STRIP (Desktop & Tablet) */}
      <footer className="relative z-20 py-4 px-6 border-t border-slate-800/80 bg-[#071526]/80 backdrop-blur-sm max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2.5 justify-center sm:justify-start">
            <Shield className="w-4 h-4 text-[#D6A63B] shrink-0" />
            <div>
              <span className="text-[11px] font-bold text-white block">Secure & Trusted</span>
              <span className="text-[10px] text-slate-400 block">Enterprise-grade authentication</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 justify-center sm:justify-start">
            <TrendingUp className="w-4 h-4 text-[#D6A63B] shrink-0" />
            <div>
              <span className="text-[11px] font-bold text-white block">Real-time Intelligence</span>
              <span className="text-[10px] text-slate-400 block">Market and freight insights</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 justify-center sm:justify-start">
            <Sparkles className="w-4 h-4 text-[#D6A63B] shrink-0" />
            <div>
              <span className="text-[11px] font-bold text-white block">Smarter Decisions</span>
              <span className="text-[10px] text-slate-400 block">AI-powered maritime analytics</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 justify-center sm:justify-start">
            <Lock className="w-4 h-4 text-[#D6A63B] shrink-0" />
            <div>
              <span className="text-[11px] font-bold text-white block">Data Protection</span>
              <span className="text-[10px] text-slate-400 block">Your data stays protected</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
