import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap, ArrowRight, ShieldCheck, CheckCircle2, TrendingUp,
  Ship, FileText, Clock, AlertTriangle, Layers
} from 'lucide-react';
import { DataProvenanceBadge } from '../components/common/DataProvenanceBadge';

export const ExecutiveModePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* EXECUTIVE HEADER CARD */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[16px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] border-t-[3px] border-t-[#D6A63B]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#D6A63B]">
              C-Suite 10-Second Briefing
            </span>
            <DataProvenanceBadge sourceType="OFFICIAL GAZETTED + REAL-TIME" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F2747] tracking-tight">
            Executive Chartering Cockpit
          </h1>
          <p className="text-xs sm:text-sm text-[#68717D] mt-1 font-medium">
            High-level decisive briefing synthesizing multi-voyage contractual commitments, financial savings, and risk indicators.
          </p>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2.5 rounded-xl bg-[#FAF9F5] hover:bg-[#F3E3B7]/50 border border-[#E4E2DC] text-[#0F2747] text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          Standard View
        </button>
      </div>

      {/* 10-Second Core Action Decision Card */}
      <div className="p-8 rounded-[16px] bg-white border border-[#E4E2DC] shadow-sm border-t-[3px] border-t-[#D6A63B] relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-[#E4E2DC]">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#68717D]">
                Primary Tactical Directive
              </span>
              <div className="text-3xl sm:text-4xl font-black text-[#0F2747] tracking-tight mt-1">
                EXECUTE SHORT-TERM COA NOW
              </div>
              <p className="text-sm text-[#68717D] mt-2 font-medium">
                Window: Enter within 7–14 Days • 210,000 MT Coking Coal (3 x 70,000 MT Panamax Voyages)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-5 py-3 rounded-[8px] bg-[#F3FAF7] border border-[#BCF0DA] text-center">
                <span className="text-[10px] uppercase font-bold text-[#68717D] block">Market Signal</span>
                <span className="text-xl font-black text-[#2F7D4B]">BOOK NOW</span>
              </div>
            </div>
          </div>

          {/* 6 High-Impact Executive Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-left my-4">
            <div className="p-4 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
              <span className="text-[11px] font-black text-[#68717D] uppercase tracking-wider block">Recommended Vessel</span>
              <div className="text-2xl font-black text-[#0F2747] mt-1">Panamax</div>
              <span className="text-xs text-[#0F2747] font-semibold mt-0.5 block">93.3% Deadweight Load</span>
            </div>

            <div className="p-4 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
              <span className="text-[11px] font-black text-[#68717D] uppercase tracking-wider block">Contract Structure</span>
              <div className="text-2xl font-black text-[#0F2747] mt-1">3-Voyage COA</div>
              <span className="text-xs text-[#2F7D4B] font-bold mt-0.5 block">Saves $380,000 vs. Spot</span>
            </div>

            <div className="p-4 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
              <span className="text-[11px] font-black text-[#68717D] uppercase tracking-wider block">30-Day Trend</span>
              <div className="text-2xl font-black text-[#C64A3B] mt-1">+4.4% Rising</div>
              <span className="text-xs text-[#68717D] mt-0.5 block">Escalating to $15.45/MT</span>
            </div>

            <div className="p-4 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
              <span className="text-[11px] font-black text-[#68717D] uppercase tracking-wider block">Discharge Port Status</span>
              <div className="text-2xl font-black text-[#0F2747] mt-1">Paradip CQ-1</div>
              <span className="text-xs text-[#2F7D4B] font-bold mt-0.5 block">0.3m Draft Clearance (Safe)</span>
            </div>

            <div className="p-4 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
              <span className="text-[11px] font-black text-[#68717D] uppercase tracking-wider block">Demurrage Mitigation</span>
              <div className="text-2xl font-black text-[#0F2747] mt-1">1.8 Days</div>
              <span className="text-xs text-[#2F7D4B] font-bold mt-0.5 block">-44% Anchorage Delay</span>
            </div>

            <div className="p-4 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
              <span className="text-[11px] font-black text-[#68717D] uppercase tracking-wider block">Operational Risk</span>
              <div className="text-2xl font-black text-[#2F7D4B] mt-1">24.5 / 100</div>
              <span className="text-xs text-[#68717D] mt-0.5 block">Low Comprehensive Risk</span>
            </div>
          </div>

          {/* Bottom Executive Rationale */}
          <div className="mt-8 pt-6 border-t border-[#E4E2DC] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#172033] max-w-2xl leading-relaxed">
              <strong className="text-[#0F2747]">Bottom-Line Justification:</strong> Immediate 3-voyage commitment protects SAIL steel production against pre-monsoon rate spikes, eliminates vessel draft rejection at Paradip, and guarantees priority unloading berthing slots.
            </div>

            <button
              onClick={() => navigate('/decision-twin')}
              className="px-6 py-3 bg-[#D6A63B] hover:bg-[#c49530] text-[#0F2747] font-black uppercase tracking-wider text-xs rounded-[8px] shadow-sm transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Explore Comparison Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
