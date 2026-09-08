import React, { ReactNode, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Shield, TrendingUp, Sparkles, Lock,
  Ship, Anchor, Navigation, Activity, CheckCircle2,
  Compass, Waves, DollarSign
} from 'lucide-react';
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
  heroHeadline,
  heroHighlight,
  heroSubheadline,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.85; // Majestic cinematic speed
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback
      });
    }
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col justify-between relative overflow-hidden bg-[#07192F]">
      {/* Embedded 3D Keyframe Animations & Lighting Styles */}
      <style>{`
        @keyframes floatSlow3D {
          0%, 100% {
            transform: translateY(0px) rotateX(0deg) rotateY(0deg);
          }
          50% {
            transform: translateY(-8px) rotateX(2deg) rotateY(-1deg);
          }
        }
        @keyframes floatDelayed3D {
          0%, 100% {
            transform: translateY(0px) rotateX(0deg) rotateY(0deg);
          }
          50% {
            transform: translateY(-6px) rotateX(-1deg) rotateY(2deg);
          }
        }
        @keyframes pulseBeacon {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(46, 213, 115, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 8px rgba(46, 213, 115, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(46, 213, 115, 0);
          }
        }
        .card-3d-perspective {
          perspective: 1200px;
        }
        .animate-float-1 {
          animation: floatSlow3D 6s ease-in-out infinite;
        }
        .animate-float-2 {
          animation: floatDelayed3D 7s ease-in-out infinite 1s;
        }
        .beacon-glow {
          animation: pulseBeacon 2s infinite;
        }
      `}</style>

      {/* ========================================================================= */}
      {/* BACKGROUND CINEMATIC RUNNING VIDEO LAYER — CRISP & HIGHLY VISIBLE */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/assets/ship_hero_poster.jpg"
          className="w-full h-full object-cover object-center scale-105 transition-opacity duration-1000"
        >
          <source src="/assets/ship_hero.mp4" type="video/mp4" />
          <img
            src="/assets/ship_hero_poster.jpg"
            alt="Dry bulk cargo vessel underway at open sea"
            className="w-full h-full object-cover object-center"
          />
        </video>

        {/* Cinematic Luminous Navy Overlay — Perfectly balanced for clear ship visibility */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(7, 25, 48, 0.84) 0%, rgba(9, 31, 58, 0.58) 45%, rgba(6, 20, 39, 0.76) 100%)',
          }}
        />

        {/* Ambient Gold & Ocean Depth Lighting */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#D6A63B]/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 left-1/3 w-[500px] h-[300px] rounded-full bg-[#1B4D89]/20 blur-[100px] pointer-events-none" />

        {/* Subtle Coordinate Navigational Grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(#D6A63B 1px, transparent 1px), linear-gradient(to right, rgba(214, 166, 59, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(214, 166, 59, 0.08) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* ========================================================================= */}
      {/* TOP BAR: Back to Home + Live Status */}
      {/* ========================================================================= */}
      <header className="relative z-20 px-6 sm:px-10 pt-6 pb-2 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-[8px] bg-[#0F2747]/70 hover:bg-[#0F2747] border border-white/10 hover:border-[#D6A63B]/50 text-xs font-bold text-white transition-all group backdrop-blur-md shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#D6A63B] group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        {/* Live Marine Status Indicator */}
        <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#0F2747]/80 border border-[#D6A63B]/30 backdrop-blur-md text-[11px] font-semibold text-white/90">
          <span className="w-2 h-2 rounded-full bg-emerald-400 beacon-glow" />
          <span className="font-mono text-[#D6A63B]">LIVE AIS TELEMETRY</span>
          <span className="text-white/40">•</span>
          <span>East Coast Fleet Corridor Online</span>
        </div>

        {/* Mobile Header Logo */}
        <div className="lg:hidden">
          <PortINLogo size="sm" variant="light" showTagline={false} />
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA: Split View Desktop (Short & Specific 3D + Auth Card) */}
      {/* ========================================================================= */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-8 py-8 max-w-7xl mx-auto w-full">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ===================================================================== */}
          {/* LEFT COLUMN: SHORT, SPECIFIC, 3D ANIMATED MARITIME INTELLIGENCE */}
          {/* ===================================================================== */}
          <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-center pr-4 space-y-6 card-3d-perspective">
            
            {/* 3D Floating Enterprise Eyebrow */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-[#D6A63B]/50 bg-[#0F2747]/80 backdrop-blur-md shadow-[0_4px_20px_rgba(214,166,59,0.15)] w-fit transform hover:scale-105 transition-transform duration-300">
              <span className="w-2 h-2 rounded-full bg-[#D6A63B] animate-ping" />
              <span className="text-[11px] uppercase tracking-widest font-black text-[#F3E3B7]">
                ENTERPRISE MARITIME INTELLIGENCE
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#D6A63B] text-[#0F2747]">
                PRODUCTION
              </span>
            </div>

            {/* Master 3D Headline: Short & Specific */}
            <div className="space-y-2.5">
              <h1 className="text-3xl xl:text-5xl font-black tracking-tight text-white leading-[1.15] drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
                {heroHeadline ? (
                  <>
                    {heroHeadline}{' '}
                    <span className="bg-gradient-to-r from-[#F3E3B7] via-[#D6A63B] to-[#FFD54F] bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(214,166,59,0.4)]">
                      {heroHighlight}
                    </span>
                  </>
                ) : (
                  <>
                    Maritime Freight Intelligence &{' '}
                    <span className="bg-gradient-to-r from-[#F3E3B7] via-[#D6A63B] to-[#FFD54F] bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(214,166,59,0.4)]">
                      Chartering Cockpit
                    </span>
                  </>
                )}
              </h1>
              
              <p className="text-sm xl:text-base text-slate-200 font-medium leading-relaxed max-w-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                Predict landed bulk freight rates, verify port draft clearances, and optimize multi-voyage contracts across India's East Coast corridors.
              </p>
            </div>

            {/* 3D FLOATING TELEMETRY GLASS CARDS: Short & Specific */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 max-w-xl">
              
              {/* 3D Card 1: Vessel Hydrodynamics */}
              <div className="animate-float-1 p-4 rounded-[12px] bg-[#0F2747]/80 hover:bg-[#0F2747]/95 border border-white/15 hover:border-[#D6A63B]/60 backdrop-blur-xl shadow-[0_12px_30px_rgba(0,0,0,0.4)] transition-all duration-300 group">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-[8px] bg-white/10 text-[#D6A63B] group-hover:bg-[#D6A63B] group-hover:text-[#0F2747] transition-colors">
                    <Ship className="w-4 h-4" />
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 beacon-glow" />
                    BERTH CLEARED
                  </span>
                </div>
                <div className="text-sm font-black text-white group-hover:text-[#F3E3B7] transition-colors">
                  Panamax 75k DWT
                </div>
                <div className="text-[11px] text-slate-300 mt-1 font-medium flex items-center justify-between">
                  <span>Draft Margin: <strong className="text-emerald-300 font-mono">+0.30m Safe</strong></span>
                  <span className="text-[#D6A63B] font-bold">Paradip CQ-1</span>
                </div>
              </div>

              {/* 3D Card 2: Strategic Alpha */}
              <div className="animate-float-2 p-4 rounded-[12px] bg-[#0F2747]/80 hover:bg-[#0F2747]/95 border border-white/15 hover:border-[#D6A63B]/60 backdrop-blur-xl shadow-[0_12px_30px_rgba(0,0,0,0.4)] transition-all duration-300 group">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-[8px] bg-white/10 text-[#D6A63B] group-hover:bg-[#D6A63B] group-hover:text-[#0F2747] transition-colors">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#F3E3B7] bg-[#D6A63B]/20 border border-[#D6A63B]/40 px-2 py-0.5 rounded-full">
                    OPTIMIZED
                  </span>
                </div>
                <div className="text-sm font-black text-white group-hover:text-[#F3E3B7] transition-colors">
                  3-Voyage COA Lock
                </div>
                <div className="text-[11px] text-slate-300 mt-1 font-medium flex items-center justify-between">
                  <span>Verified Savings:</span>
                  <span className="text-emerald-400 font-black font-mono">$380,000</span>
                </div>
              </div>

            </div>

            {/* 3D Floating Live Corridor Ticker */}
            <div className="p-3 rounded-[10px] bg-[#091D36]/85 border border-[#D6A63B]/30 backdrop-blur-md max-w-xl flex items-center justify-between text-xs text-slate-200 shadow-lg">
              <div className="flex items-center gap-2 font-mono">
                <Compass className="w-4 h-4 text-[#D6A63B] animate-spin" style={{ animationDuration: '14s' }} />
                <span className="font-bold text-white">Hay Point &rarr; Paradip</span>
                <span className="text-white/40">•</span>
                <span className="text-slate-300">5,420 NM</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-slate-300">Transit: <strong className="text-white font-mono">14.8 Days</strong></span>
                <span className="text-[11px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">Eco-Speed 13.5kn</span>
              </div>
            </div>

          </div>

          {/* ===================================================================== */}
          {/* RIGHT COLUMN: THE WARM WHITE / IVORY AUTH CARD */}
          {/* ===================================================================== */}
          <div className="lg:col-span-6 xl:col-span-5 flex justify-center lg:justify-end w-full">
            <div
              className="w-full max-w-[480px] rounded-[16px] p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.65)] relative backdrop-blur-md transition-all duration-300 border-t-4 border-t-[#D6A63B]"
              style={{
                backgroundColor: '#FFFFFF',
                borderLeft: '1px solid #E4E2DC',
                borderRight: '1px solid #E4E2DC',
                borderBottom: '1px solid #E4E2DC',
                color: '#172033',
              }}
            >
              {/* Top Logo & Tagline */}
              <div className="text-center pb-5 border-b border-[#E4E2DC]">
                <PortINLogo size="md" variant="dark" showTagline={true} />
              </div>

              {/* Form Title & Subtitle */}
              <div className="pt-5 mb-5">
                <h2 className="text-xl sm:text-2xl font-black text-[#0F2747] tracking-tight">
                  {title}
                </h2>
                <p className="text-xs text-[#68717D] mt-1 font-medium">
                  {subtitle}
                </p>
              </div>

              {/* Form Body (Login / Register / Password Reset) */}
              {children}
            </div>
          </div>

        </div>
      </main>

      {/* ========================================================================= */}
      {/* BOTTOM MARITIME TRUST STRIP (Desktop & Tablet) */}
      {/* ========================================================================= */}
      <footer className="relative z-20 py-3.5 px-6 border-t border-white/10 bg-[#061426]/90 backdrop-blur-md max-w-7xl mx-auto w-full rounded-t-xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2.5 justify-center sm:justify-start">
            <Shield className="w-4 h-4 text-[#D6A63B] shrink-0" />
            <div>
              <span className="text-[11px] font-bold text-white block">Enterprise Security</span>
              <span className="text-[10px] text-slate-400 block">RBAC & bcrypt-encrypted auth</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 justify-center sm:justify-start">
            <Activity className="w-4 h-4 text-[#D6A63B] shrink-0" />
            <div>
              <span className="text-[11px] font-bold text-white block">Stochastic Decision Engine</span>
              <span className="text-[10px] text-slate-400 block">Real-time predictive simulation</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 justify-center sm:justify-start">
            <Waves className="w-4 h-4 text-[#D6A63B] shrink-0" />
            <div>
              <span className="text-[11px] font-bold text-white block">Marine Weather Telemetry</span>
              <span className="text-[10px] text-slate-400 block">Live wave heights, wind & swell</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 justify-center sm:justify-start">
            <DollarSign className="w-4 h-4 text-[#D6A63B] shrink-0" />
            <div>
              <span className="text-[11px] font-bold text-white block">Cost Savings Verification</span>
              <span className="text-[10px] text-slate-400 block">SAIL procurement benchmarks</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
