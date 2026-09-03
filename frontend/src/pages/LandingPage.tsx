import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, TrendingUp, Ship, MapPin, Compass, BarChart3,
  Sparkles, CheckCircle2, Shield, Activity, FileText, ChevronRight,
  Clock, Database, Award
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Force play background video programmatically to override browser autoplay restrictions
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Fallback gracefully to poster if autoplay blocked
      });
    }
  }, []);

  return (
    <div className="min-h-screen selection:bg-[#D6A63B] selection:text-[#0F2747]" style={{ backgroundColor: '#0B1F38', color: '#F8F7F3' }}>
      <Navbar />

      {/* ========================================================================= */}
      {/* 4 & 5. FULL-SCREEN CINEMATIC VIDEO HERO WITH PRESCRIBED NAVY OVERLAY */}
      {/* ========================================================================= */}
      <section id="hero" className="relative w-full min-h-screen flex flex-col justify-center items-center overflow-hidden pt-24 pb-20">
        {/* Cinematic Ocean Bulk Vessel Video with Poster Fallback */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/assets/ship_hero_poster.jpg"
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src="/assets/ship_hero.mp4" type="video/mp4" />
          <img
            src="/assets/ship_hero_poster.jpg"
            alt="Real modern dry bulk cargo vessel moving naturally through open blue sea"
            className="w-full h-full object-cover"
          />
        </video>

        {/* Hero Video Navy Gradient Overlay (Prescribed exact formula) */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, rgba(7, 27, 50, 0.92) 0%, rgba(7, 27, 50, 0.72) 42%, rgba(7, 27, 50, 0.22) 100%)',
          }}
        />

        {/* Coordinate Navigational Grid Texture */}
        <div
          className="absolute inset-0 z-10 pointer-events-none opacity-5"
          style={{
            backgroundImage:
              'radial-gradient(#D6A63B 1px, transparent 1px), linear-gradient(to right, rgba(214, 166, 59, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(214, 166, 59, 0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* 7. Hero Content: Positioned Primarily on the LEFT */}
        <div className="relative z-20 max-w-7xl mx-auto px-6 w-full my-auto">
          <div className="max-w-2xl text-left space-y-6">
            {/* Small Gold Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md border border-[#D6A63B]/40 bg-[#0F2747]/80 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D6A63B] animate-pulse" />
              <span className="text-[11px] uppercase tracking-widest font-bold text-[#F3E3B7]">
                DATA. INTELLIGENCE. CONFIDENCE.
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Smarter Freight Forecasting for{' '}
              <span style={{ color: '#D6A63B' }}>Maritime Decisions</span>
            </h1>

            {/* Supporting Brand Statement */}
            <div className="text-sm sm:text-base font-bold uppercase tracking-widest text-[#F3E3B7]">
              Predict Freight. Optimize Chartering. Procure Smarter.
            </div>

            {/* Supporting Paragraph */}
            <p className="text-base sm:text-lg text-slate-200 font-medium leading-relaxed max-w-xl">
              PortIN combines freight forecasting, vessel optimization, port intelligence, route analytics and AI-powered decision support to help chartering and procurement teams make confident bulk cargo decisions for India’s East Coast.
            </p>

            {/* 8. Hero CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/signup"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs sm:text-sm font-black tracking-wider uppercase transition-all shadow-xl cursor-pointer"
                style={{
                  backgroundColor: '#D6A63B',
                  color: '#0F2747',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#C7962F')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#D6A63B')}
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#platform"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs sm:text-sm font-semibold text-white border border-white/40 hover:border-[#D6A63B] hover:text-[#D6A63B] transition-all backdrop-blur-sm"
              >
                <span>Explore Platform</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 9. LIVE INTELLIGENCE STRIP: Overlapping bottom of hero */}
        {/* ========================================================================= */}
        <div id="intelligence-strip" className="relative z-30 max-w-6xl mx-auto px-4 w-full -mb-16 mt-12">
          <div
            className="rounded-2xl p-4 sm:p-5 shadow-2xl transition-all"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E4E2DC',
              color: '#172033',
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E4E2DC]">
              {/* Metric 1: Current Freight Signal */}
              <div className="pt-2 sm:pt-0 sm:px-4 first:pl-0">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#68717D] uppercase tracking-wider mb-1">
                  <span>Current Freight Signal</span>
                  <TrendingUp className="w-4 h-4 text-[#D6A63B]" />
                </div>
                <div className="text-xl font-black text-[#0F2747] font-mono">$23.45 / MT</div>
                <div className="text-xs font-semibold text-[#2F7D4B] mt-0.5">
                  +1.8% vs last 7 days (BOOK NOW)
                </div>
              </div>

              {/* Metric 2: Recommended Vessel */}
              <div className="pt-3 sm:pt-0 sm:px-4">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#68717D] uppercase tracking-wider mb-1">
                  <span>Recommended Vessel</span>
                  <Ship className="w-4 h-4 text-[#D6A63B]" />
                </div>
                <div className="text-xl font-black text-[#0F2747]">Supramax</div>
                <div className="text-xs font-semibold text-[#68717D] mt-0.5">
                  70,000 MT Parcel • 12.8m Draft Fit
                </div>
              </div>

              {/* Metric 3: Voyage Duration */}
              <div className="pt-3 sm:pt-0 sm:px-4">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#68717D] uppercase tracking-wider mb-1">
                  <span>Voyage Duration</span>
                  <Compass className="w-4 h-4 text-[#D6A63B]" />
                </div>
                <div className="text-xl font-black text-[#0F2747] font-mono">14.6 Days</div>
                <div className="text-xs font-semibold text-[#68717D] mt-0.5">
                  Newcastle &rarr; Paradip (CQ-1)
                </div>
              </div>

              {/* Metric 4: Risk Outlook */}
              <div className="pt-3 sm:pt-0 sm:px-4 last:pr-0">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#68717D] uppercase tracking-wider mb-1">
                  <span>Risk Outlook</span>
                  <Shield className="w-4 h-4 text-[#D6A63B]" />
                </div>
                <div className="text-xl font-black text-[#2F7D4B]">Low Risk</div>
                <div className="text-xs font-semibold text-[#68717D] mt-0.5">
                  Stable Marine & Queue Conditions
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. PLATFORM INTRODUCTION: Transition to Warm Ivory Background */}
      {/* ========================================================================= */}
      <section id="platform" className="w-full pt-28 pb-20 relative z-20" style={{ backgroundColor: '#F8F7F3', color: '#172033' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* LEFT COLUMN: Capabilities */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest" style={{ color: '#D6A63B' }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#D6A63B' }} />
                <span>ONE PLATFORM. EVERY DECISION.</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0F2747] leading-tight">
                Your End-to-End Maritime Intelligence Platform
              </h2>

              <p className="text-sm sm:text-base text-[#68717D] leading-relaxed font-medium">
                PortIN combines predictive analytics, live market intelligence, vessel and port data, route analysis and AI-powered decision support within one unified platform.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-lg bg-white border border-[#E4E2DC] text-[#D6A63B] shrink-0 mt-0.5 shadow-sm">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F2747]">Explainable 90-Day Freight Curves</h3>
                    <p className="text-xs text-[#68717D] mt-0.5">
                      Probabilistic forecasts with 10th, 50th, and 90th percentile bands calibrated on historical dry-bulk cycles.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-lg bg-white border border-[#E4E2DC] text-[#D6A63B] shrink-0 mt-0.5 shadow-sm">
                    <Ship className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F2747]">Multi-Voyage COA vs Spot Contract Optimizer</h3>
                    <p className="text-xs text-[#68717D] mt-0.5">
                      Evaluates 3 to 6-voyage volume commitments vs spot fixtures, locking in laycan certainty and volume discounts.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="p-2 rounded-lg bg-white border border-[#E4E2DC] text-[#D6A63B] shrink-0 mt-0.5 shadow-sm">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#0F2747]">Berth-Level Restriction Validation</h3>
                    <p className="text-xs text-[#68717D] mt-0.5">
                      Enforces draft, LOA, and beam limits across Paradip, Vizag, Gangavaram, Dhamra, Gopalpur, and Haldia lock entrances.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-[#0F2747] hover:bg-[#0B1F38] transition-colors shadow-md"
                >
                  <span>Explore All Capabilities</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D6A63B]" />
                </Link>
              </div>
            </div>

            {/* RIGHT COLUMN: 12. DASHBOARD PRODUCT PREVIEW */}
            <div className="lg:col-span-6">
              <div
                className="rounded-2xl overflow-hidden shadow-2xl border transition-all"
                style={{
                  backgroundColor: '#0B1F38',
                  borderColor: 'rgba(214, 166, 59, 0.3)',
                }}
              >
                {/* Window header */}
                <div className="px-4 py-3 border-b border-slate-800 bg-[#071526] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                    <span className="text-[11px] font-mono text-slate-400 ml-2">PortIN Operational Cockpit • v1.0.0</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#D6A63B]/20 text-[#D6A63B]">
                    SAIL PRODUCTION
                  </span>
                </div>

                {/* Dashboard Screenshot */}
                <div className="relative group">
                  <img
                    src="/assets/dashboard_e2e_screenshot.png"
                    alt="PortIN Maritime Cockpit showing Predicted Freight Rate, Recommended Vessel, and Risk Monitor"
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-[#0B1F38]/10 group-hover:bg-transparent transition-colors" />
                </div>

                {/* Footnote bar */}
                <div className="p-3 bg-[#0F2747] border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
                  <span className="font-semibold text-[#D6A63B]">Decision Twin: Plan A (Best Overall) Recommended</span>
                  <Link to="/login" className="text-white hover:underline flex items-center gap-1 font-bold">
                    <span>Live Console Preview</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11. CORE FEATURE GRID (3x2 Desktop, 2x3 Tablet, 1 Mobile) */}
      {/* ========================================================================= */}
      <section id="features" className="w-full py-20 relative z-20" style={{ backgroundColor: '#FFFFFF', color: '#172033', borderTop: '1px solid #E4E2DC' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#D6A63B' }}>
              INTELLIGENCE MODULES
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0F2747] tracking-tight">
              Built for Specialized Maritime Bulk Operations
            </h2>
            <p className="text-xs sm:text-sm text-[#68717D] font-medium">
              Every tool in PortIN addresses a physical, contractual, or economic constraint encountered in overseas dry bulk chartering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: Freight Forecast */}
            <div className="p-6 rounded-2xl border border-[#E4E2DC] bg-[#F8F7F3] hover:border-[#D6A63B] transition-all shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0F2747] text-[#D6A63B] flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0F2747]">Freight Forecast</h3>
              <p className="text-xs text-[#68717D] leading-relaxed">
                AI-powered freight predictions. Quantile regression models generate probabilistic 90-day spot rate trajectories for bulk coking coal and iron ore.
              </p>
              <Link to="/forecast" className="inline-flex items-center gap-1 text-xs font-bold text-[#D6A63B] hover:underline pt-1">
                <span>View Forecast Engine</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 2: Vessel Optimizer */}
            <div className="p-6 rounded-2xl border border-[#E4E2DC] bg-[#F8F7F3] hover:border-[#D6A63B] transition-all shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0F2747] text-[#D6A63B] flex items-center justify-center">
                <Ship className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0F2747]">Vessel Optimizer</h3>
              <p className="text-xs text-[#68717D] leading-relaxed">
                Find the most economical compatible vessel. Compares Handysize, Supramax, Panamax, and Capesize load factors and draft clearances.
              </p>
              <Link to="/vessel-optimizer" className="inline-flex items-center gap-1 text-xs font-bold text-[#D6A63B] hover:underline pt-1">
                <span>Run Vessel Selection</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 3: Port Intelligence */}
            <div className="p-6 rounded-2xl border border-[#E4E2DC] bg-[#F8F7F3] hover:border-[#D6A63B] transition-all shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0F2747] text-[#D6A63B] flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0F2747]">Port Intelligence</h3>
              <p className="text-xs text-[#68717D] leading-relaxed">
                Port restrictions, congestion and operational intelligence. Live queue tracking and gazetted berth specs across 7 East Coast Indian ports.
              </p>
              <Link to="/port-intelligence" className="inline-flex items-center gap-1 text-xs font-bold text-[#D6A63B] hover:underline pt-1">
                <span>Inspect East Coast Berths</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 4: Market Intelligence */}
            <div className="p-6 rounded-2xl border border-[#E4E2DC] bg-[#F8F7F3] hover:border-[#D6A63B] transition-all shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0F2747] text-[#D6A63B] flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0F2747]">Market Intelligence</h3>
              <p className="text-xs text-[#68717D] leading-relaxed">
                Freight trends and charter timing signals. Actionable BUY / WAIT alerts derived from bunker benchmarks and seasonal monsoon cycles.
              </p>
              <Link to="/market" className="inline-flex items-center gap-1 text-xs font-bold text-[#D6A63B] hover:underline pt-1">
                <span>Track Market Indicators</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 5: Route Analysis */}
            <div className="p-6 rounded-2xl border border-[#E4E2DC] bg-[#F8F7F3] hover:border-[#D6A63B] transition-all shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0F2747] text-[#D6A63B] flex items-center justify-center">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0F2747]">Route Analysis</h3>
              <p className="text-xs text-[#68717D] leading-relaxed">
                Distance, duration, fuel and route-risk optimization. Trade lanes from Gladstone, Hay Point, Balikpapan, Maputo, and US Gulf to Indian ports.
              </p>
              <Link to="/route-analysis" className="inline-flex items-center gap-1 text-xs font-bold text-[#D6A63B] hover:underline pt-1">
                <span>Simulate Trade Lanes</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Feature 6: AI Advisor */}
            <div className="p-6 rounded-2xl border border-[#E4E2DC] bg-[#F8F7F3] hover:border-[#D6A63B] transition-all shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#0F2747] text-[#D6A63B] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0F2747]">AI Advisor</h3>
              <p className="text-xs text-[#68717D] leading-relaxed">
                Explainable maritime decision intelligence. Queries backed by mathematical optimizer outputs, draft limits, and SAIL procurement standards.
              </p>
              <Link to="/ai-advisor" className="inline-flex items-center gap-1 text-xs font-bold text-[#D6A63B] hover:underline pt-1">
                <span>Query Decision Advisor</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 14. DECISION INTELLIGENCE WORKFLOW */}
      {/* ========================================================================= */}
      <section id="workflow" className="w-full py-20 relative z-20" style={{ backgroundColor: '#0B1F38', color: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-[#D6A63B]">
              DECISION ARCHITECTURE
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              From Market Signal to Chartering Decision
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              An enterprise pipeline synthesizing market inputs into actionable, compliant fixture instructions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {/* Step 1 */}
            <div className="p-5 rounded-xl bg-[#0F2747] border border-slate-800 space-y-2 text-center">
              <div className="w-8 h-8 rounded-full bg-[#D6A63B]/20 text-[#D6A63B] font-bold text-xs flex items-center justify-center mx-auto mb-3">
                1
              </div>
              <h4 className="text-xs font-bold text-white uppercase">Market Data</h4>
              <p className="text-[11px] text-slate-300">
                Bunker benchmarks, commodity indices & historical spot fixtures.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-xl bg-[#0F2747] border border-slate-800 space-y-2 text-center">
              <div className="w-8 h-8 rounded-full bg-[#D6A63B]/20 text-[#D6A63B] font-bold text-xs flex items-center justify-center mx-auto mb-3">
                2
              </div>
              <h4 className="text-xs font-bold text-white uppercase">Freight Forecast</h4>
              <p className="text-[11px] text-slate-300">
                Machine learning forecast with 90-day probabilistic quantile bands.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-xl bg-[#0F2747] border border-slate-800 space-y-2 text-center">
              <div className="w-8 h-8 rounded-full bg-[#D6A63B]/20 text-[#D6A63B] font-bold text-xs flex items-center justify-center mx-auto mb-3">
                3
              </div>
              <h4 className="text-xs font-bold text-white uppercase">Vessel & Port</h4>
              <p className="text-[11px] text-slate-300">
                Draft limits, LOA clearance & parcel deadweight utilization check.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-xl bg-[#0F2747] border border-slate-800 space-y-2 text-center">
              <div className="w-8 h-8 rounded-full bg-[#D6A63B]/20 text-[#D6A63B] font-bold text-xs flex items-center justify-center mx-auto mb-3">
                4
              </div>
              <h4 className="text-xs font-bold text-white uppercase">Risk Assessment</h4>
              <p className="text-[11px] text-slate-300">
                Demurrage exposure, pre-monsoon swell, and queue delay index.
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-5 rounded-xl bg-[#0F2747] border border-[#D6A63B]/40 space-y-2 text-center">
              <div className="w-8 h-8 rounded-full bg-[#D6A63B] text-[#0F2747] font-black text-xs flex items-center justify-center mx-auto mb-3">
                5
              </div>
              <h4 className="text-xs font-bold text-[#D6A63B] uppercase">PortIN Recommendation</h4>
              <p className="text-[11px] text-slate-200">
                Synthesizes Plan A (Best Overall), Plan B (Low Risk), and Plan C (Low Cost).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 13. BUILT ON TRUSTED DATA & INTELLIGENCE STRIP */}
      {/* ========================================================================= */}
      <section id="trusted-data" className="w-full py-16 relative z-20" style={{ backgroundColor: '#071526', borderTop: '1px solid rgba(214, 166, 59, 0.2)', borderBottom: '1px solid rgba(214, 166, 59, 0.2)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <span className="text-xs font-black uppercase tracking-widest text-[#D6A63B]">
              DATA GOVERNANCE & PROVENANCE
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              BUILT ON TRUSTED DATA & INTELLIGENCE
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xl mx-auto">
              Every data feed in PortIN is explicitly attributed with authentic source origin and operational status.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 rounded-xl bg-[#0B1F38] border border-slate-800 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">AIS Vessel Feeds</span>
              <span className="text-xs font-bold text-white block">Pacific & Bay of Bengal</span>
              <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#D6A63B]/20 text-[#D6A63B]">
                Configured
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0B1F38] border border-slate-800 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Port Master Data</span>
              <span className="text-xs font-bold text-white block">Official Port Trusts</span>
              <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300">
                Connected
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0B1F38] border border-slate-800 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Commodity Pricing</span>
              <span className="text-xs font-bold text-white block">Alpha Vantage Feed</span>
              <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300">
                Connected
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0B1F38] border border-slate-800 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Marine Weather</span>
              <span className="text-xs font-bold text-white block">Open-Meteo Marine API</span>
              <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300">
                Connected
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0B1F38] border border-slate-800 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Forecast Engine</span>
              <span className="text-xs font-bold text-white block">HistGradientBoosting</span>
              <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-950 text-emerald-300">
                Active v1.2.0
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0B1F38] border border-slate-800 text-center space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Decision Advisor</span>
              <span className="text-xs font-bold text-white block">OpenAI GPT-5.6 / Rules</span>
              <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#D6A63B]/20 text-[#D6A63B]">
                Configured
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 15. BUSINESS VALUE SECTION */}
      {/* ========================================================================= */}
      <section id="value" className="w-full py-20 relative z-20" style={{ backgroundColor: '#F8F7F3', color: '#172033' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#D6A63B' }}>
              PROVEN BUSINESS VALUE
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0F2747] tracking-tight">
              Quantifiable Impact on Steel Supply Chains
            </h2>
            <p className="text-xs sm:text-sm text-[#68717D] font-medium">
              Transforming individual spot fixtures into structured, highly predictable multi-voyage procurement programs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-[#E4E2DC] shadow-sm space-y-3">
              <div className="text-3xl font-black text-[#0F2747] font-mono">$380,000+</div>
              <h3 className="text-sm font-bold text-[#0F2747]">Average Savings per 3-Voyage COA</h3>
              <p className="text-xs text-[#68717D] leading-relaxed">
                By transitioning from spot market exposure to 3-voyage structured consecutive commitments, procurement teams capture 4.5% volume discounts and lower demurrage fees.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E4E2DC] shadow-sm space-y-3">
              <div className="text-3xl font-black text-[#2F7D4B] font-mono">44% Reduction</div>
              <h3 className="text-sm font-bold text-[#0F2747]">Anchorage Idle Queue Waiting Time</h3>
              <p className="text-xs text-[#68717D] leading-relaxed">
                PortIN's idle-time intelligence and berth congestion scheduling reduces vessel delay from 3.2 days to 1.8 days per voyage at Paradip and Vizag.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#E4E2DC] shadow-sm space-y-3">
              <div className="text-3xl font-black text-[#0F2747] font-mono">93.3% Utilization</div>
              <h3 className="text-sm font-bold text-[#0F2747]">Vessel Deadweight Optimization</h3>
              <p className="text-xs text-[#68717D] leading-relaxed">
                Matches parcel sizes precisely with permissible berth drafts to eliminate dead freight penalties and minimize landed cost per metric ton.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 16. PORTIN DECISION ADVISOR PREVIEW (Grounding in Real Domain Results) */}
      {/* ========================================================================= */}
      <section id="advisor" className="w-full py-20 relative z-20" style={{ backgroundColor: '#0B1F38', color: '#FFFFFF' }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10 space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#D6A63B]">
              DECISION REASONING ENGINE
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              PortIN Decision Advisor
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-medium">
              Natural language domain reasoning strictly grounded in physical port constraints and quantitative optimizer outputs.
            </p>
          </div>

          <div
            className="rounded-2xl p-6 sm:p-8 shadow-2xl border"
            style={{
              backgroundColor: '#0F2747',
              borderColor: 'rgba(214, 166, 59, 0.3)',
            }}
          >
            {/* User Question */}
            <div className="p-4 rounded-xl bg-[#0B1F38] border border-slate-700/60 mb-6">
              <span className="text-[10px] uppercase font-bold text-[#D6A63B] block mb-1">
                Chartering Manager Query:
              </span>
              <p className="text-sm font-semibold text-white">
                “What vessel and chartering window should we consider for 70,000 MT coal from Newcastle to Paradip?”
              </p>
            </div>

            {/* Structured Advisor Response */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#0B1F38] border border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Recommendation</span>
                  <span className="text-base font-black text-[#D6A63B] block mt-0.5">Supramax / Panamax</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0B1F38] border border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Market Signal</span>
                  <span className="text-base font-black text-emerald-400 block mt-0.5">BOOK NOW (7-14 Days)</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0B1F38] border border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Risk Outlook</span>
                  <span className="text-base font-black text-white block mt-0.5">Low–Medium (Score 28)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0B1F38] border border-slate-700 space-y-2 text-xs text-slate-300">
                <span className="text-[10px] uppercase font-bold text-[#D6A63B] block">
                  Supporting Factors & Domain Validation:
                </span>
                <ul className="space-y-1.5 pl-4 list-disc marker:text-[#D6A63B]">
                  <li><strong>Freight Trend:</strong> Spot rates are projected to increase by +4.8% over the next 30 days due to pre-monsoon restocking.</li>
                  <li><strong>Port Compatibility:</strong> Paradip CQ-1/CQ-2 allows max 14.5m draft. A 70,000 MT Panamax draws 14.0m, fitting safely within draft safety margins.</li>
                  <li><strong>Voyage Economics:</strong> Committing to a 3-voyage short-term COA locks in $14.80/MT, saving $385,000 compared to repeated spot fixtures.</li>
                  <li><strong>Market Conditions:</strong> VLSFO bunker prices are firming; early fixing eliminates positioning premiums.</li>
                </ul>
              </div>
            </div>

            <div className="pt-6 text-center">
              <Link
                to="/ai-advisor"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-[#0F2747]"
                style={{ backgroundColor: '#D6A63B' }}
              >
                <span>Launch Interactive Decision Advisor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 17. FINAL LANDING PAGE CTA */}
      {/* ========================================================================= */}
      <section className="w-full py-24 relative z-20 text-center" style={{ backgroundColor: '#071526', borderTop: '1px solid rgba(214, 166, 59, 0.2)' }}>
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0F2747] border border-[#D6A63B]/30 text-xs font-bold text-[#F3E3B7]">
            <Award className="w-3.5 h-3.5 text-[#D6A63B]" />
            <span>Ministry of Steel • Smart India Hackathon 2026</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Make Every Maritime Decision with Confidence.
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
            Bring freight forecasting, chartering intelligence, vessel optimization and procurement analysis into one platform.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-xs sm:text-sm font-black tracking-wider uppercase transition-all shadow-xl cursor-pointer"
              style={{
                backgroundColor: '#D6A63B',
                color: '#0F2747',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#C7962F')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#D6A63B')}
            >
              <span>Launch PortIN</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/signup"
              className="px-7 py-3.5 rounded-xl text-xs sm:text-sm font-bold text-white border border-white/40 hover:border-[#D6A63B] hover:text-[#D6A63B] transition-all"
            >
              Request Demo
            </Link>
          </div>
        </div>
      </section>

      {/* 18. MASTER FOOTER */}
      <Footer />
    </div>
  );
};
