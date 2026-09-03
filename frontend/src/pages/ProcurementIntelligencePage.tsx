import React, { useState } from 'react';
import {
  ShoppingCart, Globe, ArrowRight, ShieldCheck, TrendingUp,
  Clock, Ship, DollarSign, CheckCircle2
} from 'lucide-react';
import { DataProvenanceBadge } from '../components/common/DataProvenanceBadge';

interface SourcingNode {
  country: string;
  port: string;
  distance_nm: number;
  transit_days: number;
  freight_usd_mt: number;
  comm_benchmark_usd: number;
  comm_trend: string;
  total_landed_usd_mt: number;
  weather_risk: string;
  vessel: string;
  recommendation: string;
}

export const ProcurementIntelligencePage: React.FC = () => {
  const [commodity, setCommodity] = useState('Coking Coal');
  const [cargoMt, setCargoMt] = useState(70000);
  const [destinationPort, setDestinationPort] = useState('Paradip');

  const sourcingNodes: SourcingNode[] = [
    {
      country: 'Australia',
      port: 'Gladstone',
      distance_nm: 5200,
      transit_days: 14.5,
      freight_usd_mt: 14.80,
      comm_benchmark_usd: 245.50,
      comm_trend: 'MODERATING',
      total_landed_usd_mt: 260.30,
      weather_risk: 'MODERATE',
      vessel: 'Panamax',
      recommendation: 'Primary Strategic Origin (Optimal Quality / Logistics Match)',
    },
    {
      country: 'Indonesia',
      port: 'Balikpapan',
      distance_nm: 2400,
      transit_days: 7.2,
      freight_usd_mt: 10.90,
      comm_benchmark_usd: 138.20,
      comm_trend: 'STABLE',
      total_landed_usd_mt: 149.10,
      weather_risk: 'LOW',
      vessel: 'Panamax / Supramax',
      recommendation: 'Shortest Haul Transit (High Liquidity for Rapid Stocking)',
    },
    {
      country: 'Mozambique',
      port: 'Maputo',
      distance_nm: 4600,
      transit_days: 13.0,
      freight_usd_mt: 16.20,
      comm_benchmark_usd: 238.00,
      comm_trend: 'STABLE',
      total_landed_usd_mt: 254.20,
      weather_risk: 'MODERATE',
      vessel: 'Panamax',
      recommendation: 'Competitive Alternative Corridors to Vizag & Gangavaram',
    },
    {
      country: 'Russia',
      port: 'Ust-Luga',
      distance_nm: 9800,
      transit_days: 26.0,
      freight_usd_mt: 29.80,
      comm_benchmark_usd: 215.00,
      comm_trend: 'DISCOUNTED',
      total_landed_usd_mt: 244.80,
      weather_risk: 'HIGH',
      vessel: 'Panamax',
      recommendation: 'FOB Price Discount Offsets Higher Marine Freight',
    },
    {
      country: 'USA',
      port: 'Hampton Roads',
      distance_nm: 11200,
      transit_days: 31.0,
      freight_usd_mt: 34.50,
      comm_benchmark_usd: 252.00,
      comm_trend: 'FIRMER',
      total_landed_usd_mt: 286.50,
      weather_risk: 'HIGH',
      vessel: 'Panamax',
      recommendation: 'Long Transit Buffer Required for Steel Plant Silos',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Global Supply Node Comparison</span>
            <DataProvenanceBadge sourceType="PUBLIC HISTORICAL + SIMULATED FREIGHT" sourceName="World Bank Pink Sheet & PortIN Model" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Procurement Logistics & Landed Cost Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Multi-origin comparative sourcing evaluating freight rates, transit days, and FOB commodity benchmarks.
          </p>
        </div>
      </div>

      {/* Control Selector Bar */}
      <div className="p-4 rounded-xl bg-[#081426] border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <label className="block text-slate-400 font-semibold mb-1">Procured Commodity</label>
          <select
            value={commodity}
            onChange={(e) => setCommodity(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
          >
            <option value="Coking Coal">Coking Coal (Metallurgical)</option>
            <option value="Thermal Coal">Thermal Coal</option>
            <option value="Iron Ore">Iron Ore</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-400 font-semibold mb-1">Parcel Requirement (MT)</label>
          <input
            type="number"
            value={cargoMt}
            onChange={(e) => setCargoMt(Number(e.target.value))}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-semibold mb-1">Discharge Destination</label>
          <select
            value={destinationPort}
            onChange={(e) => setDestinationPort(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
          >
            <option value="Paradip">Paradip (Odisha)</option>
            <option value="Visakhapatnam">Visakhapatnam (AP)</option>
            <option value="Gangavaram">Gangavaram (AP)</option>
            <option value="Dhamra">Dhamra (Odisha)</option>
          </select>
        </div>
      </div>

      {/* Sourcing Node Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sourcingNodes.map((n) => (
          <div key={n.country} className="p-5 rounded-2xl bg-[#081426] border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-black text-white">{n.country} ({n.port})</span>
                <span className="text-xs font-mono font-bold text-cyan-400">{n.distance_nm.toLocaleString()} NM</span>
              </div>

              <div className="text-2xl font-black text-white my-2">
                ${n.total_landed_usd_mt.toFixed(2)}
                <span className="text-xs font-normal text-slate-400 ml-1">Est. Landed / MT</span>
              </div>

              <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-3 my-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Freight Rate:</span>
                  <span className="font-mono font-bold text-cyan-300">${n.freight_usd_mt.toFixed(2)} / MT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">FOB Price Benchmark:</span>
                  <span className="font-mono text-slate-200">${n.comm_benchmark_usd.toFixed(2)} / MT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Transit Days:</span>
                  <span className="font-semibold text-white">{n.transit_days} Days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vessel Class:</span>
                  <span className="font-semibold text-white">{n.vessel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Commodity Trend:</span>
                  <span className="font-bold text-emerald-400">{n.comm_trend}</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300">
              {n.recommendation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
