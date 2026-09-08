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
  const [cargoType, setCargoType] = useState('Coal - Coking');
  const [customCargoName, setCustomCargoName] = useState('');
  const [vessels, setVessels] = useState<VesselEvaluation[]>([]);
  const [loading, setLoading] = useState(false);

  const effectiveCargoName = cargoType === 'Other Bulk Cargo' && customCargoName.trim()
    ? customCargoName.trim()
    : cargoType;

  const evaluateVessels = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post('/optimizer/vessel', {
        cargo_mt: Number(cargoMt),
        origin_country: originCountry,
        destination_port: destinationPort,
        cargo_type: effectiveCargoName,
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[16px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] border-t-[3px] border-t-[#D6A63B]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D6A63B]">
              Vessel Category Optimizer
            </span>
            <DataProvenanceBadge sourceType="OFFICIAL STATIC" sourceName="Berth Specifications & Vessel DWT Master Data" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F2747] tracking-tight">
            Vessel Allocation & Berth Compatibility Matrix
          </h2>
          <p className="text-xs text-[#68717D] mt-0.5 font-medium">
            Physical draft, LOA, beam limits and deadweight utilization optimizer for bulk parcels.
          </p>
        </div>

        <button
          onClick={evaluateVessels}
          disabled={loading}
          className="px-4 py-2.5 rounded-[8px] text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
          style={{
            backgroundColor: '#D6A63B',
            color: '#0F2747',
          }}
        >
          {loading ? 'Optimizing...' : 'Re-Evaluate Vessels'}
        </button>
      </div>

      {/* Parameter Filter Bar */}
      <div className="p-6 rounded-[16px] bg-white border border-[#E4E2DC] shadow-sm border-t-[3px] border-t-[#D6A63B]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div>
          <label className="block text-[#172033] font-bold mb-1">Cargo Parcel (MT)</label>
          <input
            type="number"
            step="5000"
            value={cargoMt}
            onChange={(e) => setCargoMt(Number(e.target.value))}
            className="w-full px-3 py-2 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-[#172033] font-medium focus:bg-white focus:border-[#D6A63B] transition-colors"
          />
        </div>

        <div>
          <label className="block text-[#172033] font-bold mb-1">Commodity Type</label>
          <select
            value={cargoType}
            onChange={(e) => setCargoType(e.target.value)}
            className="w-full px-3 py-2 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-[#172033] font-bold focus:bg-white focus:border-[#D6A63B] transition-colors"
          >
            <option value="Coal - Thermal">Coal - Thermal</option>
            <option value="Coal - Coking">Coal - Coking</option>
            <option value="Iron Ore">Iron Ore</option>
            <option value="Grain">Grain</option>
            <option value="Fertilizer">Fertilizer</option>
            <option value="Bauxite">Bauxite</option>
            <option value="Steel">Steel</option>
            <option value="Limestone">Limestone</option>
            <option value="Other Bulk Cargo">Other Bulk Cargo</option>
          </select>
          {cargoType === 'Other Bulk Cargo' && (
            <div className="mt-2 p-2 rounded-lg bg-[#FAF9F5] border border-[#D6A63B]">
              <label className="block text-[10px] uppercase font-bold text-[#0F2747] mb-1">
                Specify Custom Cargo Name *
              </label>
              <input
                type="text"
                value={customCargoName}
                onChange={(e) => setCustomCargoName(e.target.value)}
                placeholder="e.g. Copper Concentrate, Manganese Ore"
                className="w-full px-2.5 py-1.5 bg-white border border-[#D6A63B] rounded text-xs font-bold text-[#172033]"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-[#172033] font-bold mb-1">Origin Country</label>
          <select
            value={originCountry}
            onChange={(e) => setOriginCountry(e.target.value)}
            className="w-full px-3 py-2 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-[#172033] font-medium focus:bg-white focus:border-[#D6A63B] transition-colors"
          >
            <option value="Australia">Australia</option>
            <option value="Indonesia">Indonesia</option>
            <option value="Mozambique">Mozambique</option>
            <option value="Russia">Russia</option>
            <option value="USA">USA</option>
          </select>
        </div>

        <div>
          <label className="block text-[#172033] font-bold mb-1">Discharge Port</label>
          <select
            value={destinationPort}
            onChange={(e) => setDestinationPort(e.target.value)}
            className="w-full px-3 py-2 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-[#172033] font-medium focus:bg-white focus:border-[#D6A63B] transition-colors"
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
      </div>

      {/* Top Banner: Recommended Vessel Card */}
      {recommendedVessel && (
        <div className="p-6 rounded-[10px] bg-white border-2 border-[#D6A63B] shadow-[0_1px_3px_rgba(15,39,71,0.04)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E2DC]">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-lg bg-[#F8F7F3] text-[#D6A63B] border border-[#E4E2DC]">
                <Ship className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#D6A63B] block">
                  OPTIMIZATION VERDICT
                </span>
                <h3 className="text-xl font-black text-[#0F2747]">
                  {recommendedVessel.vessel_class} Recommended for {cargoMt.toLocaleString()} MT Parcel
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-[6px] font-bold bg-[#F8F7F3] border border-[#E4E2DC] text-[#0F2747]">
                Score: {recommendedVessel.recommendation_score} / 100
              </span>
              <span className="text-xs px-3 py-1 rounded-[6px] font-black bg-[#F3FAF7] border border-[#BCF0DA] text-[#2F7D4B]">
                ${recommendedVessel.freight_rate_per_mt.toFixed(2)}/MT
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 text-xs text-[#68717D]">
            <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
              <span className="text-[10px] font-bold uppercase block text-[#68717D]">Cargo Load Factor:</span>
              <span className="font-black text-[#0F2747] text-base mt-0.5 block">{recommendedVessel.cargo_utilization_pct}% Load Utilization</span>
            </div>
            <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
              <span className="text-[10px] font-bold uppercase block text-[#68717D]">Port Compatibility:</span>
              <span className="font-black text-[#2F7D4B] text-base mt-0.5 block">
                {recommendedVessel.compatible_berths_count} / {recommendedVessel.total_berths_count} Berths Permissible
              </span>
            </div>
            <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
              <span className="text-[10px] font-bold uppercase block text-[#68717D]">Est. Discharge Turnaround:</span>
              <span className="font-black text-[#0F2747] text-base mt-0.5 block">{recommendedVessel.turnaround_days} Days Total</span>
            </div>
          </div>

          <div className="text-xs text-[#172033] font-medium pt-1">
            <span className="text-[#68717D] font-bold mr-1.5">Optimization Rationale:</span>
            {recommendedVessel.key_drivers.join(' • ')}
          </div>
        </div>
      )}

      {/* Side-by-Side Vessel Comparison Table */}
      <div className="bg-white border border-[#E4E2DC] rounded-[10px] overflow-hidden shadow-[0_1px_3px_rgba(15,39,71,0.04)]">
        <div className="p-4 border-b border-[#E4E2DC] flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#0F2747] uppercase tracking-wider">
            Vessel Class Performance & Physical Feasibility Matrix
          </h3>
          <span className="text-xs text-[#68717D] font-semibold">Destination: {destinationPort}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F7F3] text-[#68717D] uppercase tracking-wider text-[10px] font-bold border-b border-[#E4E2DC]">
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
            <tbody className="divide-y divide-[#E4E2DC]">
              {vessels.map((v) => {
                let compBadge = 'bg-[#F3FAF7] text-[#2F7D4B] border-[#BCF0DA]';
                if (v.port_compatibility_status === 'CONDITIONALLY COMPATIBLE') {
                  compBadge = 'bg-[#FEF7EC] text-[#D98A27] border-[#FBE6C2]';
                } else if (v.port_compatibility_status === 'NOT COMPATIBLE') {
                  compBadge = 'bg-[#FDF2F2] text-[#C64A3B] border-[#F8B4B4]';
                }

                return (
                  <tr key={v.vessel_class} className={`hover:bg-[#F8F7F3] transition-colors ${v.is_recommended ? 'bg-[#F3FAF7]' : ''}`}>
                    <td className="py-3.5 px-4 font-bold text-[#0F2747] flex items-center gap-2">
                      <Ship className="w-3.5 h-3.5 text-[#D6A63B]" />
                      <span>{v.vessel_class}</span>
                      {v.is_recommended && (
                        <span className="text-[9px] px-2 py-0.5 rounded-[4px] bg-[#D6A63B] text-[#0F2747] font-black uppercase">
                          BEST
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#68717D] font-mono">
                      {v.vessel_class === 'Handysize' ? '35,000' :
                       v.vessel_class === 'Supramax' ? '58,000' :
                       v.vessel_class === 'Panamax' ? '76,000' : '180,000'} MT
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0F2747]">{v.cargo_utilization_pct}%</span>
                        <div className="w-16 h-1.5 bg-[#E4E2DC] rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${v.cargo_utilization_pct >= 85 ? 'bg-[#2F7D4B]' : 'bg-[#D98A27]'}`}
                            style={{ width: `${v.cargo_utilization_pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-[#0F2747]">
                      ${v.freight_rate_per_mt.toFixed(2)}/MT
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0F2747]">
                      ${v.estimated_voyage_cost_usd.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[6px] border text-[10px] font-bold ${compBadge}`}>
                        {v.port_compatibility_status === 'COMPATIBLE' ? <CheckCircle2 className="w-3 h-3" /> :
                         v.port_compatibility_status === 'CONDITIONALLY COMPATIBLE' ? <AlertTriangle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{v.port_compatibility_status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#68717D] font-mono">
                      {v.turnaround_days} Days
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-mono font-black ${v.is_recommended ? 'text-[#0F2747]' : 'text-[#68717D]'}`}>
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
