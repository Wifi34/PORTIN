import React, { useState, useEffect } from 'react';
import {
  Ship, CheckCircle2, AlertTriangle, XCircle, ArrowRight,
  TrendingDown, ShieldAlert, Clock, BarChart3, Info
} from 'lucide-react';
import { apiClient } from '../api/client';
import { DataProvenanceBadge } from '../components/common/DataProvenanceBadge';
import { VesselEvaluation } from '../types';

export const VesselOptimizerPage: React.FC = () => {
  const [cargoMt, setCargoMt] = useState(70000);
  const [originCountry, setOriginCountry] = useState('Australia');
  const [destinationPort, setDestinationPort] = useState('Paradip');
  const [cargoType, setCargoType] = useState('Coking Coal');
  const [vessels, setVessels] = useState<VesselEvaluation[]>([]);
  const [loading, setLoading] = useState(false);

  const evaluateVessels = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post('/optimizer/vessel', {
        cargo_mt: Number(cargoMt),
        origin_country: originCountry,
        destination_port: destinationPort,
        cargo_type: cargoType,
        desired_date: '2026-09-20',
      });
      setVessels(res.data);
    } catch (err) {
      console.error('Vessel evaluation failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    evaluateVessels();
  }, []);

  const recommendedVessel = vessels.find((v) => v.is_recommended);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Vessel Category Optimizer</span>
            <DataProvenanceBadge sourceType="OFFICIAL STATIC" sourceName="Berth Specifications & Vessel DWT Master Data" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Vessel Allocation & Berth Compatibility Matrix
          </h1>
        </div>

        <button
          onClick={evaluateVessels}
          disabled={loading}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
        >
          {loading ? 'Optimizing...' : 'Re-Evaluate Vessels'}
        </button>
      </div>

      {/* Parameter Filter Bar */}
      <div className="p-4 rounded-xl bg-[#081426] border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block text-slate-400 font-semibold mb-1">Cargo Parcel (MT)</label>
          <input
            type="number"
            step="5000"
            value={cargoMt}
            onChange={(e) => setCargoMt(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-semibold mb-1">Commodity Type</label>
          <select
            value={cargoType}
            onChange={(e) => setCargoType(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
          >
            <option value="Coking Coal">Coking Coal</option>
            <option value="Thermal Coal">Thermal Coal</option>
            <option value="Iron Ore">Iron Ore</option>
            <option value="Limestone">Limestone</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-400 font-semibold mb-1">Origin Country</label>
          <select
            value={originCountry}
            onChange={(e) => setOriginCountry(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
          >
            <option value="Australia">Australia</option>
            <option value="Indonesia">Indonesia</option>
            <option value="Mozambique">Mozambique</option>
            <option value="Russia">Russia</option>
            <option value="USA">USA</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-400 font-semibold mb-1">Discharge Port</label>
          <select
            value={destinationPort}
            onChange={(e) => setDestinationPort(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
          >
            <option value="Paradip">Paradip (Odisha)</option>
            <option value="Visakhapatnam">Visakhapatnam (AP)</option>
            <option value="Gangavaram">Gangavaram (AP)</option>
            <option value="Dhamra">Dhamra (Odisha)</option>
            <option value="Gopalpur">Gopalpur (Odisha)</option>
            <option value="Haldia">Haldia (WB)</option>
          </select>
        </div>
      </div>

      {/* Top Banner: Recommended Vessel Card */}
      {recommendedVessel && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-[#081426] to-[#081426] border-2 border-cyan-400/50 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                <Ship className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                  OPTIMIZATION VERDICT
                </span>
                <h2 className="text-xl font-black text-white">
                  {recommendedVessel.vessel_class} Recommended for {cargoMt.toLocaleString()} MT Parcel
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full font-bold bg-cyan-950 border border-cyan-400 text-cyan-300">
                Score: {recommendedVessel.recommendation_score} / 100
              </span>
              <span className="text-xs px-3 py-1 rounded-full font-bold bg-emerald-950 border border-emerald-500/40 text-emerald-400">
                ${recommendedVessel.freight_rate_per_mt.toFixed(2)}/MT
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 text-xs text-slate-300 mt-3 pt-3 border-t border-slate-800">
            <div>
              <span className="text-slate-500 block">Cargo Load Factor:</span>
              <span className="font-bold text-white text-sm">{recommendedVessel.cargo_utilization_pct}% Load Utilization</span>
            </div>
            <div>
              <span className="text-slate-500 block">Port Compatibility:</span>
              <span className="font-bold text-emerald-400 text-sm">
                {recommendedVessel.compatible_berths_count} / {recommendedVessel.total_berths_count} Berths Permissible
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Est. Discharge Turnaround:</span>
              <span className="font-bold text-white text-sm">{recommendedVessel.turnaround_days} Days Total</span>
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-300">
            <span className="text-slate-400 font-semibold mr-1.5">Optimization Rationale:</span>
            {recommendedVessel.key_drivers.join(' • ')}
          </div>
        </div>
      )}

      {/* Side-by-Side Vessel Comparison Table */}
      <div className="bg-[#081426] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Vessel Class Performance & Physical Feasibility Matrix
          </h3>
          <span className="text-xs text-slate-400">Destination: {destinationPort}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Vessel Class</th>
                <th className="py-3 px-4">Deadweight (DWT)</th>
                <th className="py-3 px-4">Cargo Utilization</th>
                <th className="py-3 px-4">Unit Freight</th>
                <th className="py-3 px-4">Total Voyage Freight</th>
                <th className="py-3 px-4">Port Compatibility</th>
                <th className="py-3 px-4">Turnaround</th>
                <th className="py-3 px-4">Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {vessels.map((v) => {
                let compBadge = 'bg-emerald-950/70 text-emerald-400 border-emerald-500/40';
                if (v.port_compatibility_status === 'CONDITIONALLY COMPATIBLE') {
                  compBadge = 'bg-amber-950/70 text-amber-400 border-amber-500/40';
                } else if (v.port_compatibility_status === 'NOT COMPATIBLE') {
                  compBadge = 'bg-rose-950/70 text-rose-400 border-rose-500/40';
                }

                return (
                  <tr key={v.vessel_class} className={`hover:bg-slate-900/50 transition-colors ${v.is_recommended ? 'bg-cyan-950/20' : ''}`}>
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      <Ship className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{v.vessel_class}</span>
                      {v.is_recommended && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500 text-black font-black uppercase">
                          BEST
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono">
                      {v.vessel_class === 'Handysize' ? '35,000' :
                       v.vessel_class === 'Supramax' ? '58,000' :
                       v.vessel_class === 'Panamax' ? '76,000' : '180,000'} MT
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{v.cargo_utilization_pct}%</span>
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${v.cargo_utilization_pct >= 85 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                            style={{ width: `${v.cargo_utilization_pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">
                      ${v.freight_rate_per_mt.toFixed(2)}/MT
                    </td>
                    <td className="py-3.5 px-4 font-mono text-white">
                      ${v.estimated_voyage_cost_usd.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${compBadge}`}>
                        {v.port_compatibility_status === 'COMPATIBLE' ? <CheckCircle2 className="w-3 h-3" /> :
                         v.port_compatibility_status === 'CONDITIONALLY COMPATIBLE' ? <AlertTriangle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{v.port_compatibility_status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono">
                      {v.turnaround_days} Days
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-mono font-bold ${v.is_recommended ? 'text-cyan-400' : 'text-slate-400'}`}>
                        {v.recommendation_score} / 100
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
