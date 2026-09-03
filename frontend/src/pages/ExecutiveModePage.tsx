import React, { useState } from 'react';
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
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
                C-Suite 10-Second Briefing
              </span>
              <DataProvenanceBadge sourceType="OFFICIAL STATIC + SIMULATED DEMO" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Executive Chartering Cockpit
            </h1>
          </div>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
        >
          Standard View
        </button>
      </div>

      {/* 10-Second Core Action Decision Card */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-cyan-950/60 via-[#081426] to-[#0A1F38] border-2 border-cyan-400 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Primary Tactical Directive
              </span>
              <div className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight mt-1">
                EXECUTE SHORT-TERM COA NOW
              </div>
              <p className="text-sm text-slate-300 mt-2 font-medium">
                Window: Enter within 7–14 Days • 210,000 MT Coking Coal (3 x 70,000 MT Panamax Voyages)
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-5 py-3 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Market Signal</span>
                <span className="text-xl font-black text-emerald-300">BOOK NOW</span>
              </div>
            </div>
          </div>

          {/* 6 High-Impact Executive Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-left my-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Recommended Vessel</span>
              <div className="text-2xl font-black text-white mt-1">Panamax</div>
              <span className="text-xs text-cyan-400 font-semibold">93.3% Deadweight Load</span>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Contract Structure</span>
              <div className="text-2xl font-black text-cyan-300 mt-1">3-Voyage COA</div>
              <span className="text-xs text-emerald-400 font-semibold">Saves $380,000 vs. Spot</span>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">30-Day Trend</span>
              <div className="text-2xl font-black text-rose-400 mt-1">+4.4% Rising</div>
              <span className="text-xs text-slate-400">Escalating to $15.45/MT</span>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Discharge Port Status</span>
              <div className="text-2xl font-black text-white mt-1">Paradip CQ-1</div>
              <span className="text-xs text-emerald-400 font-semibold">0.3m Draft Clearance (Safe)</span>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Demurrage Mitigation</span>
              <div className="text-2xl font-black text-white mt-1">1.8 Days</div>
              <span className="text-xs text-emerald-400 font-semibold">-44% Anchorage Delay</span>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Operational Risk</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">24.5 / 100</div>
              <span className="text-xs text-slate-400">Low Comprehensive Risk</span>
            </div>
          </div>

          {/* Bottom Executive Rationale */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              <strong className="text-white">Bottom-Line Justification:</strong> Immediate 3-voyage commitment protects SAIL steel production against pre-monsoon rate spikes, eliminates vessel draft rejection at Paradip, and guarantees priority unloading berthing slots.
            </div>

            <button
              onClick={() => navigate('/decision-twin')}
              className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Explore Decision Twin</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
