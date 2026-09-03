import React, { useState, useEffect } from 'react';
import {
  FileText, TrendingDown, CheckCircle2, AlertTriangle, ShieldCheck,
  Clock, DollarSign, ArrowRight, Award, Zap, Layers
} from 'lucide-react';
import { apiClient } from '../api/client';
import { DataProvenanceBadge } from '../components/common/DataProvenanceBadge';
import { ContractOption } from '../types';

export const ContractIntelligencePage: React.FC = () => {
  const [cargoMt, setCargoMt] = useState(70000);
  const [numVoyages, setNumVoyages] = useState(3);
  const [originCountry, setOriginCountry] = useState('Australia');
  const [destinationPort, setDestinationPort] = useState('Paradip');
  const [vesselClass, setVesselClass] = useState('Panamax');
  const [contracts, setContracts] = useState<ContractOption[]>([]);
  const [loading, setLoading] = useState(false);

  const evaluateContracts = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post('/optimizer/contract', {
        cargo_mt: Number(cargoMt),
        num_voyages: Number(numVoyages),
        origin_country: originCountry,
        destination_port: destinationPort,
        vessel_class: vesselClass,
        desired_date: '2026-09-20',
      });
      setContracts(res.data);
    } catch (err) {
      console.error('Contract evaluation failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    evaluateContracts();
  }, []);

  const recommendedContract = contracts.find((c) => c.is_recommended);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#081426] via-[#0A2540] to-[#081426] border border-cyan-500/30 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1 rounded bg-cyan-500/20 text-cyan-400">
                <Zap className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Official SIH Core Objective</span>
              <DataProvenanceBadge sourceType="SIMULATED DEMO" sourceName="Multi-Voyage Volatility Optimization Model" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Spot Chartering &rarr; Multi-Voyage Contract Optimization
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Evaluates financial savings, rate volatility insulation, and priority berthing benefits of transitioning from repeated spot fixtures to structured Consecutive Voyage Contracts (COA).
            </p>
          </div>

          <button
            onClick={evaluateContracts}
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-light-cyan hover:from-cyan-300 text-black font-bold text-xs rounded-xl shadow-lg transition-all self-start cursor-pointer"
          >
            {loading ? 'Optimizing...' : 'Calculate Contract Strategies'}
          </button>
        </div>
      </div>

      {/* Recommended Strategy Spotlight Card */}
      {recommendedContract && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-950/40 to-[#081426] border-2 border-cyan-400 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <Award className="w-6 h-6 text-cyan-400" />
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                  RECOMMENDED STRATEGY FOR SAIL
                </span>
                <h2 className="text-2xl font-black text-white">
                  {recommendedContract.contract_type}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                Direct Savings: ${recommendedContract.savings_vs_spot_usd.toLocaleString()} USD
              </span>
              <span className="text-xs px-3 py-1 rounded-full font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                Certainty: {recommendedContract.planning_certainty_pct}%
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-4 gap-4 text-xs text-slate-300 mt-4 pt-4 border-t border-slate-800">
            <div>
              <span className="text-slate-400 block text-[11px]">Negotiated Unit Freight:</span>
              <span className="text-lg font-black text-white font-mono">${recommendedContract.avg_freight_per_mt.toFixed(2)} / MT</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Total Cargo Commitment:</span>
              <span className="text-lg font-black text-white font-mono">{recommendedContract.total_cargo_mt.toLocaleString()} MT</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Anchorage Waiting:</span>
              <span className="text-lg font-black text-cyan-300 font-mono">{recommendedContract.idle_time_days} Days Total</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Volatility Exposure:</span>
              <span className="text-lg font-black text-emerald-400 font-mono">{recommendedContract.rate_volatility_exposure}</span>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            <span className="font-bold text-cyan-300 block mb-1">Key Operational Advantages:</span>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              {recommendedContract.pros.map((pro, idx) => (
                <li key={idx}>{pro}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Side-by-Side Three Strategies Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {contracts.map((c, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-2xl border transition-all ${
              c.is_recommended
                ? 'bg-[#081426] border-cyan-400 shadow-xl shadow-cyan-500/5'
                : 'bg-[#081426]/70 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-200">
                {c.contract_type}
              </span>
              {c.is_recommended && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500 text-black uppercase">
                  Selected
                </span>
              )}
            </div>

            <div className="text-3xl font-black text-white tracking-tight my-2">
              ${c.avg_freight_per_mt.toFixed(2)}
              <span className="text-xs font-normal text-slate-400 ml-1">/ MT</span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300 border-t border-slate-800 pt-3 my-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Voyages:</span>
                <span className="font-semibold text-white">{c.num_voyages} Voyages</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Logistics Cost:</span>
                <span className="font-mono font-bold text-white">${c.total_logistics_cost_usd.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Volatility Risk:</span>
                <span className={`font-bold ${c.rate_volatility_exposure === 'HIGH' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {c.rate_volatility_exposure}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Anchorage Idle Days:</span>
                <span className="font-semibold text-white">{c.idle_time_days} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Planning Certainty:</span>
                <span className="font-semibold text-cyan-400">{c.planning_certainty_pct}%</span>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 space-y-2">
              <div className="text-[11px] text-slate-300">
                <span className="text-cyan-400 font-bold block mb-1">Pros:</span>
                {c.pros.map((p, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-slate-400">
                    <span className="text-cyan-400 font-bold">✓</span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>

              <div className="text-[11px] text-slate-300 mt-2">
                <span className="text-rose-400 font-bold block mb-1">Cons:</span>
                {c.cons.map((con, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-slate-400">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>{con}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
