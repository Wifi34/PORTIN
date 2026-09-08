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
  const [commodity, setCommodity] = useState('Coal - Coking');
  const [customCommodity, setCustomCommodity] = useState('');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[16px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] border-t-[3px] border-t-[#D6A63B]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D6A63B]">Global Supply Node Comparison</span>
            <DataProvenanceBadge sourceType="PUBLIC HISTORICAL + REAL-TIME FREIGHT" sourceName="World Bank Pink Sheet & PortIN Model" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F2747] tracking-tight">
            Procurement Logistics & Landed Cost Intelligence
          </h2>
          <p className="text-xs text-[#68717D] mt-0.5 font-medium">
            Multi-origin comparative sourcing evaluating freight rates, transit days, and FOB commodity benchmarks.
          </p>
        </div>
      </div>

      {/* Control Selector Bar */}
      <div className="p-6 rounded-[16px] bg-white border border-[#E4E2DC] shadow-sm border-t-[3px] border-t-[#D6A63B]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-[#172033] font-bold mb-1">Procured Commodity</label>
            <select
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-[#172033] font-bold focus:bg-white focus:border-[#D6A63B] transition-colors"
            >
              <option value="Coal - Coking">Coal - Coking (Metallurgical)</option>
              <option value="Coal - Thermal">Coal - Thermal</option>
              <option value="Iron Ore">Iron Ore</option>
              <option value="Limestone">Limestone</option>
              <option value="Grain">Grain</option>
              <option value="Fertilizer">Fertilizer</option>
              <option value="Bauxite">Bauxite</option>
              <option value="Steel">Steel</option>
              <option value="Other Bulk Cargo">Other Bulk Cargo</option>
            </select>
            {commodity === 'Other Bulk Cargo' && (
              <div className="mt-2 p-2 rounded-lg bg-[#FAF9F5] border border-[#D6A63B]">
                <label className="block text-[10px] uppercase font-bold text-[#0F2747] mb-1">
                  Specify Custom Cargo Name *
                </label>
                <input
                  type="text"
                  value={customCommodity}
                  onChange={(e) => setCustomCommodity(e.target.value)}
                  placeholder="e.g. Copper Concentrate, Petcoke"
                  className="w-full px-2.5 py-1.5 bg-white border border-[#D6A63B] rounded text-xs font-bold text-[#172033]"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-[#172033] font-bold mb-1">Parcel Requirement (MT)</label>
            <input
              type="number"
              value={cargoMt}
              onChange={(e) => setCargoMt(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-[#172033] font-medium focus:bg-white focus:border-[#D6A63B] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[#172033] font-bold mb-1">Discharge Destination</label>
            <select
              value={destinationPort}
              onChange={(e) => setDestinationPort(e.target.value)}
              className="w-full px-3 py-2 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-[#172033] font-medium focus:bg-white focus:border-[#D6A63B] transition-colors"
            >
              <option value="Paradip">Paradip (Odisha)</option>
              <option value="Visakhapatnam">Visakhapatnam (AP)</option>
              <option value="Gangavaram">Gangavaram (AP)</option>
              <option value="Dhamra">Dhamra (Odisha)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sourcing Node Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sourcingNodes.map((n) => (
          <div key={n.country} className="p-6 rounded-[10px] bg-white border border-[#E4E2DC] hover:border-[#D6A63B] shadow-[0_1px_3px_rgba(15,39,71,0.04)] transition-all flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#E4E2DC]">
                <span className="text-sm font-black text-[#0F2747]">{n.country} ({n.port})</span>
                <span className="text-xs font-mono font-bold text-[#0F2747]">{n.distance_nm.toLocaleString()} NM</span>
              </div>

              <div className="text-2xl font-black text-[#0F2747] my-3">
                ${n.total_landed_usd_mt.toFixed(2)}
                <span className="text-xs font-normal text-[#68717D] ml-1">Est. Landed / MT</span>
              </div>

              <div className="space-y-2 text-xs text-[#68717D] border-t border-[#E4E2DC] pt-3">
                <div className="flex justify-between">
                  <span>Freight Rate:</span>
                  <span className="font-mono font-black text-[#0F2747]">${n.freight_usd_mt.toFixed(2)} / MT</span>
                </div>
                <div className="flex justify-between">
                  <span>FOB Price Benchmark:</span>
                  <span className="font-mono text-[#172033] font-bold">${n.comm_benchmark_usd.toFixed(2)} / MT</span>
                </div>
                <div className="flex justify-between">
                  <span>Transit Days:</span>
                  <span className="font-bold text-[#0F2747]">{n.transit_days} Days</span>
                </div>
                <div className="flex justify-between">
                  <span>Vessel Class:</span>
                  <span className="font-bold text-[#0F2747]">{n.vessel}</span>
                </div>
                <div className="flex justify-between">
                  <span>Commodity Trend:</span>
                  <span className="font-bold text-[#2F7D4B]">{n.comm_trend}</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC] text-[11px] text-[#172033] font-medium leading-relaxed">
              {n.recommendation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
