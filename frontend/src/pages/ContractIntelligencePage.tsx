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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D6A63B]">
              Core Decision Objective
            </span>
            <DataProvenanceBadge sourceType="SIMULATED DEMO" sourceName="Multi-Voyage Volatility Optimization Model" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F2747] tracking-tight">
            Spot Chartering &rarr; Multi-Voyage Contract Optimization
          </h2>
          <p className="text-xs text-[#68717D] mt-0.5 font-medium">
            Evaluates financial savings, rate volatility insulation, and priority berthing benefits of transitioning from repeated spot fixtures to structured Consecutive Voyage Contracts (COA).
          </p>
        </div>

        <button
          onClick={evaluateContracts}
          disabled={loading}
          className="px-4 py-2.5 rounded-[8px] text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm self-start"
          style={{
            backgroundColor: '#D6A63B',
            color: '#0F2747',
          }}
        >
          {loading ? 'Optimizing...' : 'Calculate Contract Strategies'}
        </button>
      </div>

      {/* Recommended Strategy Spotlight Card */}
      {recommendedContract && (
        <div className="p-6 rounded-[10px] bg-white border-2 border-[#D6A63B] shadow-[0_1px_3px_rgba(15,39,71,0.04)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E2DC]">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-[#F8F7F3] text-[#D6A63B] border border-[#E4E2DC]">
                <Award className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#D6A63B] block">
                  RECOMMENDED STRATEGY FOR SAIL
                </span>
                <h3 className="text-2xl font-black text-[#0F2747]">
                  {recommendedContract.contract_type}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-[6px] font-black bg-[#F3FAF7] text-[#2F7D4B] border border-[#BCF0DA]">
                Direct Savings: ${recommendedContract.savings_vs_spot_usd.toLocaleString()} USD
              </span>
              <span className="text-xs px-3 py-1 rounded-[6px] font-bold bg-[#F8F7F3] text-[#0F2747] border border-[#E4E2DC]">
                Certainty: {recommendedContract.planning_certainty_pct}%
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-4 gap-3 text-xs text-[#68717D]">
            <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
              <span className="text-[10px] font-bold uppercase block text-[#68717D]">Negotiated Unit Freight:</span>
              <span className="text-xl font-black text-[#0F2747] font-mono mt-0.5 block">${recommendedContract.avg_freight_per_mt.toFixed(2)} / MT</span>
            </div>
            <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
              <span className="text-[10px] font-bold uppercase block text-[#68717D]">Total Cargo Commitment:</span>
              <span className="text-xl font-black text-[#0F2747] font-mono mt-0.5 block">{recommendedContract.total_cargo_mt.toLocaleString()} MT</span>
            </div>
            <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
              <span className="text-[10px] font-bold uppercase block text-[#68717D]">Anchorage Waiting:</span>
              <span className="text-xl font-black text-[#2F7D4B] font-mono mt-0.5 block">{recommendedContract.idle_time_days} Days Total</span>
            </div>
            <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
              <span className="text-[10px] font-bold uppercase block text-[#68717D]">Volatility Exposure:</span>
              <span className="text-xl font-black text-[#2F7D4B] font-mono mt-0.5 block">{recommendedContract.rate_volatility_exposure}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC] text-xs text-[#172033] font-medium leading-relaxed">
            <span className="font-bold text-[#0F2747] block mb-1">Key Operational Advantages:</span>
            <ul className="list-disc list-inside space-y-1 text-[#68717D]">
              {recommendedContract.pros.map((pro, idx) => (
                <li key={idx}><span className="text-[#172033]">{pro}</span></li>
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
            className={`p-6 rounded-[10px] border transition-all ${
              c.is_recommended
                ? 'bg-white border-2 border-[#D6A63B] shadow-[0_1px_3px_rgba(15,39,71,0.04)]'
                : 'bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)]'
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#E4E2DC] mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-[#0F2747]">
                {c.contract_type}
              </span>
              {c.is_recommended && (
                <span className="text-[9px] font-black px-2 py-0.5 rounded-[4px] bg-[#D6A63B] text-[#0F2747] uppercase">
                  SELECTED
                </span>
              )}
            </div>

            <div className="text-3xl font-black text-[#0F2747] tracking-tight my-2">
              ${c.avg_freight_per_mt.toFixed(2)}
              <span className="text-xs font-normal text-[#68717D] ml-1">/ MT</span>
            </div>

            <div className="space-y-2.5 text-xs text-[#68717D] border-t border-[#E4E2DC] pt-3 my-3">
              <div className="flex justify-between">
                <span>Voyages:</span>
                <span className="font-bold text-[#0F2747]">{c.num_voyages} Voyages</span>
              </div>
              <div className="flex justify-between">
                <span>Total Logistics Cost:</span>
                <span className="font-mono font-bold text-[#0F2747]">${c.total_logistics_cost_usd.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Volatility Risk:</span>
                <span className={`font-bold ${c.rate_volatility_exposure === 'HIGH' ? 'text-[#C64A3B]' : 'text-[#2F7D4B]'}`}>
                  {c.rate_volatility_exposure}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Anchorage Idle Days:</span>
                <span className="font-bold text-[#0F2747]">{c.idle_time_days} days</span>
              </div>
              <div className="flex justify-between">
                <span>Planning Certainty:</span>
                <span className="font-bold text-[#0F2747]">{c.planning_certainty_pct}%</span>
              </div>
            </div>

            <div className="border-t border-[#E4E2DC] pt-3 space-y-2">
              <div className="text-[11px] text-[#172033]">
                <span className="text-[#2F7D4B] font-bold block mb-1">Pros:</span>
                {c.pros.map((p, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[#68717D]">
                    <span className="text-[#2F7D4B] font-bold">✓</span>
                    <span>{p}</span>
                  </div>
                ))}
              </div>

              <div className="text-[11px] text-[#172033] mt-2">
                <span className="text-[#C64A3B] font-bold block mb-1">Cons:</span>
                {c.cons.map((con, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[#68717D]">
                    <span className="text-[#C64A3B] font-bold">✕</span>
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
