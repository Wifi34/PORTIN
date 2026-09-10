import React, { useState, useEffect } from 'react';
import {
  Ship, CheckCircle2, AlertTriangle, XCircle, ArrowRight,
  Crown, X, Anchor, ShieldCheck, DollarSign, Clock,
  BarChart3, Info, Scale
} from 'lucide-react';
import { apiClient } from '../api/client';
import { DataProvenanceBadge } from '../components/common/DataProvenanceBadge';
import { VesselEvaluation } from '../types';

interface VesselMeta {
  dwt: string;
  descriptor: string;
  image: string;
  alt: string;
}

const VESSEL_METADATA: Record<string, VesselMeta> = {
  Handysize: {
    dwt: '35,000 MT',
    descriptor: 'Versatile. Port friendly. Cost efficient.',
    image: '/assets/vessels/handysize.jpg',
    alt: 'Handysize compact bulk carrier navigating coastal waters',
  },
  Supramax: {
    dwt: '58,000 MT',
    descriptor: 'Flexible. Global workhorse.',
    image: '/assets/vessels/supramax.jpg',
    alt: 'Supramax geared bulk carrier with onboard cargo cranes',
  },
  Panamax: {
    dwt: '76,000 MT',
    descriptor: 'Higher capacity. Ocean-going reach.',
    image: '/assets/vessels/panamax.jpg',
    alt: 'Panamax gearless bulk carrier with wide beam',
  },
  Capesize: {
    dwt: '180,000 MT',
    descriptor: 'Maximum capacity. Major haulage.',
    image: '/assets/vessels/capesize.jpg',
    alt: 'Capesize massive dry bulk carrier in open ocean',
  },
};

const ORDERED_CLASSES = ['Handysize', 'Supramax', 'Panamax', 'Capesize'];

export const VesselOptimizerPage: React.FC = () => {
  const [cargoMt, setCargoMt] = useState<number>(70000);
  const [originCountry, setOriginCountry] = useState<string>('Australia');
  const [destinationPort, setDestinationPort] = useState<string>('Paradip');
  const [cargoType, setCargoType] = useState<string>('Coal - Coking');
  const [customCargoName, setCustomCargoName] = useState<string>('');
  const [vessels, setVessels] = useState<VesselEvaluation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedModalVessel, setSelectedModalVessel] = useState<VesselEvaluation | null>(null);

  const effectiveCargoName =
    cargoType === 'Other Bulk Cargo' && customCargoName.trim()
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

  // Sort vessels according to ORDERED_CLASSES
  const displayVessels = [...vessels].sort((a, b) => {
    const idxA = ORDERED_CLASSES.indexOf(a.vessel_class);
    const idxB = ORDERED_CLASSES.indexOf(b.vessel_class);
    return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
  });

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[14px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] border-t-[3px] border-t-[#D6A63B]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#D6A63B]">
              VESSEL CATEGORY OPTIMIZER
            </span>
            <DataProvenanceBadge
              sourceType="OFFICIAL STATIC"
              sourceName="Berth Specifications & Vessel DWT Master Data"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0F2747] tracking-tight">
            Vessel Allocation & Berth Compatibility Matrix
          </h1>
          <p className="text-xs text-[#68717D] mt-0.5 font-medium">
            Physical draft, LOA, beam limits and deadweight utilization optimizer for bulk parcels.
          </p>
        </div>

        <button
          onClick={evaluateVessels}
          disabled={loading}
          className="px-5 py-2.5 rounded-[8px] text-xs font-black uppercase tracking-wider transition-all duration-150 cursor-pointer shadow-sm active:scale-95 disabled:opacity-60 shrink-0"
          style={{
            backgroundColor: '#D6A63B',
            color: '#0F2747',
          }}
        >
          {loading ? 'Evaluating...' : 'RE-EVALUATE VESSELS'}
        </button>
      </div>

      {/* 2. Cargo Input Filters Section */}
      <div className="p-5 rounded-[14px] bg-[#F8F7F3] border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.03)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-[#172033] font-bold mb-1.5">Cargo Parcel (MT)</label>
            <input
              type="number"
              step="5000"
              value={cargoMt}
              onChange={(e) => setCargoMt(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white border border-[#E4E2DC] rounded-[8px] text-[#0F2747] font-semibold text-xs focus:border-[#D6A63B] focus:outline-none focus:ring-1 focus:ring-[#D6A63B] transition-colors shadow-sm"
            />
          </div>

          <div>
            <label className="block text-[#172033] font-bold mb-1.5">Commodity Type</label>
            <select
              value={cargoType}
              onChange={(e) => setCargoType(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E4E2DC] rounded-[8px] text-[#0F2747] font-semibold text-xs focus:border-[#D6A63B] focus:outline-none focus:ring-1 focus:ring-[#D6A63B] transition-colors shadow-sm"
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
            <label className="block text-[#172033] font-bold mb-1.5">Origin Country</label>
            <select
              value={originCountry}
              onChange={(e) => setOriginCountry(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E4E2DC] rounded-[8px] text-[#0F2747] font-semibold text-xs focus:border-[#D6A63B] focus:outline-none focus:ring-1 focus:ring-[#D6A63B] transition-colors shadow-sm"
            >
              <option value="Australia">🇦🇺 Australia</option>
              <option value="Indonesia">🇮🇩 Indonesia</option>
              <option value="Mozambique">🇲🇿 Mozambique</option>
              <option value="Russia">🇷🇺 Russia</option>
              <option value="USA">🇺🇸 USA</option>
            </select>
          </div>

          <div>
            <label className="block text-[#172033] font-bold mb-1.5">Discharge Port</label>
            <select
              value={destinationPort}
              onChange={(e) => setDestinationPort(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E4E2DC] rounded-[8px] text-[#0F2747] font-semibold text-xs focus:border-[#D6A63B] focus:outline-none focus:ring-1 focus:ring-[#D6A63B] transition-colors shadow-sm"
            >
              <option value="Paradip">🇮🇳 Paradip (Odisha)</option>
              <option value="Visakhapatnam">🇮🇳 Visakhapatnam (AP)</option>
              <option value="Gangavaram">🇮🇳 Gangavaram (AP)</option>
              <option value="Dhamra">🇮🇳 Dhamra (Odisha)</option>
              <option value="Gopalpur">🇮🇳 Gopalpur (Odisha)</option>
              <option value="Haldia">🇮🇳 Haldia (WB)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Optimization Verdict Section */}
      {recommendedVessel && (
        <div className="p-6 rounded-[14px] bg-white border-2 border-[#D6A63B] shadow-[0_2px_8px_rgba(214,166,59,0.12)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E2DC]">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-lg bg-[#FAF8F3] text-[#D6A63B] border border-[#E4E2DC]">
                <Ship className="w-5 h-5 text-[#D6A63B]" />
              </span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#D6A63B] block">
                  OPTIMIZATION VERDICT
                </span>
                <h2 className="text-xl font-black text-[#0F2747]">
                  {recommendedVessel.vessel_class} Recommended for {cargoMt.toLocaleString()} MT Parcel
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1.5 rounded-[6px] font-bold bg-[#F8F7F3] border border-[#E4E2DC] text-[#0F2747]">
                Score: {recommendedVessel.recommendation_score} / 100
              </span>
              <span className="text-xs px-3 py-1.5 rounded-[6px] font-black bg-[#F3FAF7] border border-[#BCF0DA] text-[#2F7D4B]">
                ${recommendedVessel.freight_rate_per_mt.toFixed(2)} / MT
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#68717D]">
            <div className="p-3.5 rounded-[10px] bg-[#F8F7F3] border border-[#E4E2DC]">
              <span className="text-[10px] font-bold uppercase block text-[#68717D]">
                Cargo Load Factor
              </span>
              <span className="font-black text-[#0F2747] text-base mt-0.5 block">
                {recommendedVessel.cargo_utilization_pct}% Load Utilization
              </span>
            </div>
            <div className="p-3.5 rounded-[10px] bg-[#F8F7F3] border border-[#E4E2DC]">
              <span className="text-[10px] font-bold uppercase block text-[#68717D]">
                Port Compatibility
              </span>
              <span className="font-black text-[#2F7D4B] text-base mt-0.5 block">
                {recommendedVessel.compatible_berths_count} / {recommendedVessel.total_berths_count} Berths Permissible
              </span>
            </div>
            <div className="p-3.5 rounded-[10px] bg-[#F8F7F3] border border-[#E4E2DC]">
              <span className="text-[10px] font-bold uppercase block text-[#68717D]">
                Estimated Discharge Turnaround
              </span>
              <span className="font-black text-[#0F2747] text-base mt-0.5 block">
                {recommendedVessel.turnaround_days} Days Total
              </span>
            </div>
          </div>

          <div className="text-xs text-[#172033] font-medium pt-1">
            <span className="text-[#68717D] font-bold mr-1.5">Optimization Rationale:</span>
            {recommendedVessel.key_drivers.join(' • ')}
          </div>
        </div>
      )}

      {/* 4. Four Vessel Comparison Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-[#0F2747] uppercase tracking-wider">
            Vessel Class Performance & Physical Feasibility Matrix
          </h3>
          <span className="text-xs text-[#68717D] font-semibold">
            Destination: {destinationPort}
          </span>
        </div>

        {/* 4 Cards Grid: 1 col on mobile, 2 cols on tablet, 4 cols on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
          {displayVessels.map((v, index) => {
            const isWinner = Boolean(v.is_recommended);
            const meta = VESSEL_METADATA[v.vessel_class] || {
              dwt: 'N/A',
              descriptor: 'Bulk carrier vessel class.',
              image: '/assets/vessels/handysize.jpg',
              alt: `${v.vessel_class} bulk carrier`,
            };

            // Compatibility status badge styling
            let compBadgeClass = 'bg-[#F3FAF7] text-[#2F7D4B] border-[#BCF0DA]';
            let CompIcon = CheckCircle2;
            if (v.port_compatibility_status === 'CONDITIONALLY COMPATIBLE') {
              compBadgeClass = 'bg-[#FEF7EC] text-[#D98A27] border-[#FBE6C2]';
              CompIcon = AlertTriangle;
            } else if (v.port_compatibility_status === 'NOT COMPATIBLE') {
              compBadgeClass = 'bg-[#FDF2F2] text-[#C64A3B] border-[#F8B4B4]';
              CompIcon = XCircle;
            }

            // Progress bar color based on utilization
            const isEfficient = v.cargo_utilization_pct >= 85;
            const progressColor = isEfficient ? 'bg-[#2F7D4B]' : 'bg-[#D98A27]';

            return (
              <div
                key={v.vessel_class}
                style={{ animationDelay: `${index * 80}ms` }}
                className={`group flex flex-col justify-between rounded-[12px] overflow-hidden transition-all duration-200 hover:-translate-y-1 ${
                  isWinner
                    ? 'border-2 border-[#D6A63B] bg-[#FCFAF6] shadow-[0_4px_20px_rgba(214,166,59,0.14)]'
                    : 'border border-[#E4E2DC] bg-white shadow-[0_1px_3px_rgba(15,39,71,0.04)] hover:shadow-md hover:border-[#D6A63B]/60'
                }`}
              >
                <div>
                  {/* Top Vessel Image */}
                  <div className="relative w-full h-44 bg-[#0F2747] overflow-hidden">
                    <img
                      src={meta.image}
                      alt={meta.alt}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />

                    {/* Gradient scrim at bottom for text clarity */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

                    {/* BEST RECOMMENDATION Overlay Badge (Dynamic) */}
                    {isWinner && (
                      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] bg-[#D6A63B] text-[#0B1F38] text-[10px] font-black uppercase tracking-wider shadow-md">
                        <Crown className="w-3.5 h-3.5 text-[#0B1F38]" />
                        <span>BEST RECOMMENDATION</span>
                      </div>
                    )}
                  </div>

                  {/* Vessel Title Area */}
                  <div className="p-4 pb-2 border-b border-[#E4E2DC]/80">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-black text-[#0F2747] tracking-tight">
                        {v.vessel_class}
                      </h4>
                      {isWinner && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-[4px] bg-[#D6A63B] text-[#0F2747] font-black uppercase tracking-wider">
                          BEST
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#68717D] font-medium mt-0.5 leading-snug">
                      {meta.descriptor}
                    </p>
                  </div>

                  {/* Metrics Section */}
                  <div className="p-4 space-y-3 text-xs">
                    {/* Deadweight (DWT) */}
                    <div className="flex items-center justify-between">
                      <span className="text-[#68717D] font-medium">Deadweight:</span>
                      <span className="font-mono font-bold text-[#0F2747]">
                        {meta.dwt}
                      </span>
                    </div>

                    {/* Cargo Utilization */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[#68717D] font-medium">Cargo Utilization:</span>
                        <span className="font-mono font-bold text-[#0F2747]">
                          {v.cargo_utilization_pct}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-[#E4E2DC] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${progressColor}`}
                          style={{ width: `${Math.min(v.cargo_utilization_pct, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Unit Freight */}
                    <div className="flex items-center justify-between">
                      <span className="text-[#68717D] font-medium">Unit Freight:</span>
                      <span className="font-mono font-black text-[#0F2747] text-sm">
                        ${v.freight_rate_per_mt.toFixed(2)} / MT
                      </span>
                    </div>

                    {/* Total Voyage Freight */}
                    <div className="flex items-center justify-between">
                      <span className="text-[#68717D] font-medium">Total Voyage Freight:</span>
                      <span className="font-mono font-bold text-[#0F2747]">
                        ${Math.round(v.estimated_voyage_cost_usd).toLocaleString()}
                      </span>
                    </div>

                    {/* Port Compatibility */}
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-[#68717D] font-medium">Port Compatibility:</span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] border text-[10px] font-bold ${compBadgeClass}`}
                      >
                        <CompIcon className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[130px]">
                          {v.port_compatibility_status === 'CONDITIONALLY COMPATIBLE'
                            ? 'Conditional'
                            : v.port_compatibility_status === 'COMPATIBLE'
                            ? 'Compatible'
                            : 'Not Compatible'}
                        </span>
                      </span>
                    </div>

                    {/* Turnaround */}
                    <div className="flex items-center justify-between">
                      <span className="text-[#68717D] font-medium">Turnaround:</span>
                      <span className="font-mono font-bold text-[#0F2747]">
                        {v.turnaround_days} Days
                      </span>
                    </div>

                    {/* Recommendation Score */}
                    <div className="flex items-center justify-between pt-1 border-t border-[#E4E2DC]/80">
                      <span className="text-[#68717D] font-bold">Recommendation Score:</span>
                      <span
                        className={`font-mono font-black text-xs ${
                          isWinner ? 'text-[#0F2747]' : 'text-[#68717D]'
                        }`}
                      >
                        {v.recommendation_score} / 100
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="p-4 pt-0">
                  {isWinner ? (
                    <button
                      onClick={() => setSelectedModalVessel(v)}
                      className="w-full py-2.5 px-3 rounded-[8px] text-xs font-black uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-1.5 shadow-sm active:scale-98 cursor-pointer"
                      style={{
                        backgroundColor: '#D6A63B',
                        color: '#0F2747',
                      }}
                    >
                      <span>Why Recommended</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedModalVessel(v)}
                      className="w-full py-2.5 px-3 rounded-[8px] bg-white border border-[#E4E2DC] text-[#0F2747] font-bold text-xs hover:bg-[#F8F7F3] hover:border-[#D6A63B] transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                    >
                      <span>View Vessel Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Detailed Rationale & Berth Analysis Modal */}
      {selectedModalVessel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white rounded-[16px] border border-[#E4E2DC] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E4E2DC] bg-[#F8F7F3] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-lg bg-white border border-[#E4E2DC] text-[#0F2747]">
                  <Ship className="w-5 h-5 text-[#D6A63B]" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-[#0F2747]">
                      {selectedModalVessel.vessel_class} Technical & Berth Analysis
                    </h3>
                    {selectedModalVessel.is_recommended && (
                      <span className="text-[9px] px-2 py-0.5 rounded-[4px] bg-[#D6A63B] text-[#0F2747] font-black uppercase">
                        RECOMMENDED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#68717D] mt-0.5">
                    Evaluation for {cargoMt.toLocaleString()} MT {cargoType} at {destinationPort}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedModalVessel(null)}
                className="p-1.5 rounded-full hover:bg-[#E4E2DC] text-[#68717D] hover:text-[#0F2747] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Key Driver Highlights */}
              <div className="p-4 rounded-[10px] bg-[#FCFAF6] border border-[#D6A63B]/60 space-y-2">
                <span className="text-[10px] font-black uppercase text-[#D6A63B] tracking-wider block">
                  OPTIMIZER KEY DRIVERS & RATIONALE
                </span>
                <ul className="space-y-1.5 text-[#172033]">
                  {selectedModalVessel.key_drivers.map((driver, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#D6A63B] font-bold mt-0.5">•</span>
                      <span>{driver}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Physical & Commercial Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
                  <span className="text-[10px] uppercase font-bold text-[#68717D] block">
                    Cargo Utilization
                  </span>
                  <span className="text-base font-black text-[#0F2747] mt-0.5 block">
                    {selectedModalVessel.cargo_utilization_pct}%
                  </span>
                </div>
                <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
                  <span className="text-[10px] uppercase font-bold text-[#68717D] block">
                    Unit Freight Rate
                  </span>
                  <span className="text-base font-black text-[#0F2747] mt-0.5 block">
                    ${selectedModalVessel.freight_rate_per_mt.toFixed(2)}/MT
                  </span>
                </div>
                <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
                  <span className="text-[10px] uppercase font-bold text-[#68717D] block">
                    Est. Voyage Cost
                  </span>
                  <span className="text-base font-black text-[#0F2747] mt-0.5 block">
                    ${Math.round(selectedModalVessel.estimated_voyage_cost_usd).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
                  <span className="text-[10px] uppercase font-bold text-[#68717D] block">
                    Turnaround Time
                  </span>
                  <span className="text-base font-black text-[#0F2747] mt-0.5 block">
                    {selectedModalVessel.turnaround_days} Days
                  </span>
                </div>
              </div>

              {/* Berth by Berth Physical Feasibility */}
              <div>
                <h4 className="text-xs font-black text-[#0F2747] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Anchor className="w-4 h-4 text-[#D6A63B]" />
                  <span>Berth Compatibility at {destinationPort}</span>
                </h4>

                <div className="border border-[#E4E2DC] rounded-[8px] overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8F7F3] text-[#68717D] uppercase tracking-wider text-[10px] font-bold border-b border-[#E4E2DC]">
                      <tr>
                        <th className="py-2.5 px-3">Berth Name</th>
                        <th className="py-2.5 px-3">Draft Margin</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Evaluation Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4E2DC]">
                      {selectedModalVessel.berth_details &&
                      selectedModalVessel.berth_details.length > 0 ? (
                        selectedModalVessel.berth_details.map((b, i) => {
                          const isOk = b.status === 'COMPATIBLE';
                          const isCond = b.status === 'CONDITIONALLY COMPATIBLE';
                          return (
                            <tr key={i} className="hover:bg-[#F8F7F3]">
                              <td className="py-2.5 px-3 font-bold text-[#0F2747]">
                                {b.berth_name}
                              </td>
                              <td className="py-2.5 px-3 font-mono font-medium text-[#172033]">
                                {b.draft_margin_m >= 0 ? `+${b.draft_margin_m.toFixed(1)}m` : `${b.draft_margin_m.toFixed(1)}m`}
                              </td>
                              <td className="py-2.5 px-3">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-bold border ${
                                    isOk
                                      ? 'bg-[#F3FAF7] text-[#2F7D4B] border-[#BCF0DA]'
                                      : isCond
                                      ? 'bg-[#FEF7EC] text-[#D98A27] border-[#FBE6C2]'
                                      : 'bg-[#FDF2F2] text-[#C64A3B] border-[#F8B4B4]'
                                  }`}
                                >
                                  {b.status}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-[#68717D] font-medium">
                                {b.reasons && b.reasons.length > 0
                                  ? b.reasons.join(' • ')
                                  : 'Physical parameters compliant.'}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-3 px-3 text-center text-[#68717D]">
                            No specific berth constraint violations recorded.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#E4E2DC] bg-[#F8F7F3] flex items-center justify-between">
              <span className="text-[11px] text-[#68717D]">
                Recommendation Score: <strong className="text-[#0F2747] font-mono">{selectedModalVessel.recommendation_score} / 100</strong>
              </span>
              <button
                onClick={() => setSelectedModalVessel(null)}
                className="px-4 py-2 rounded-[8px] bg-[#0F2747] text-white text-xs font-bold hover:bg-[#0B1F38] transition-colors"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
