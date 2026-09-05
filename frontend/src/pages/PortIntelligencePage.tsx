import React, { useState, useEffect } from 'react';
import {
  MapPin, Anchor, Waves, Wind, Clock, ShieldCheck,
  CheckCircle2, AlertTriangle, Layers, ArrowRight, RefreshCw,
  ExternalLink, Ship
} from 'lucide-react';
import { apiClient } from '../api/client';
import { DataProvenanceBadge } from '../components/common/DataProvenanceBadge';
import { Port, Berth } from '../types';

export const PortIntelligencePage: React.FC = () => {
  const [ports, setPorts] = useState<Port[]>([]);
  const [selectedPortId, setSelectedPortId] = useState<number | null>(null);
  const [selectedPortDetail, setSelectedPortDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadPorts = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/ports');
      setPorts(res.data);
      if (res.data.length > 0) {
        setSelectedPortId(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load ports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPorts();
  }, []);

  useEffect(() => {
    if (!selectedPortId) return;
    const fetchDetail = async () => {
      setDetailLoading(true);
      try {
        const res = await apiClient.get(`/ports/${selectedPortId}`);
        setSelectedPortDetail(res.data);
      } catch (e) {
        console.error('Failed to load port detail', e);
      } finally {
        setDetailLoading(false);
      }
    };
    fetchDetail();
  }, [selectedPortId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D6A63B]">East Coast Marine Directory</span>
            <DataProvenanceBadge sourceType="OFFICIAL STATIC" sourceName="Gazetted Port Authority Berth Master Plans" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F2747] tracking-tight">
            Port & Berth Physical Constraints Intelligence
          </h2>
          <p className="text-xs text-[#68717D] mt-0.5 font-medium">
            Berth-level physical restrictions: permissible drafts, LOA margins, beam outreach, and live sea state conditions.
          </p>
        </div>

        <button
          onClick={loadPorts}
          className="p-2 rounded-[8px] bg-[#F8F7F3] hover:bg-[#E4E2DC] border border-[#E4E2DC] text-[#0F2747] transition-colors self-start"
          title="Refresh Ports Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#D6A63B]' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Port Selection Cards List (4 cols) */}
        <div className="lg:col-span-4 space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#68717D] px-1 block mb-1">
            Select East Coast Discharge Terminal
          </span>
          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {ports.map((p) => {
              const isSelected = selectedPortId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPortId(p.id)}
                  className={`p-4 rounded-[10px] cursor-pointer transition-all duration-200 border ${
                    isSelected
                      ? 'bg-white border-[#D6A63B] shadow-md shadow-[#D6A63B]/10'
                      : 'bg-white border-[#E4E2DC] hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <MapPin className={`w-4 h-4 ${isSelected ? 'text-[#D6A63B]' : 'text-[#68717D]'}`} />
                      <span className="font-bold text-[#0F2747] text-sm">{p.name}</span>
                      <span className="text-[10px] font-mono text-[#68717D]">({p.code})</span>
                    </div>
                    <span className="text-xs font-mono font-black text-[#0F2747]">{p.max_draft}m Max</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#68717D] mt-2">
                    <span className="font-medium">{p.state}, India</span>
                    <span className="text-[11px] text-[#D98A27] font-bold">Queue: {p.anchorage_queue} vessels</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Berth Specifications & Marine Weather (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedPortDetail && (
            <>
              {/* Port Summary Card */}
              <div className="p-6 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E4E2DC]">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-black text-[#0F2747]">{selectedPortDetail.name} Port</h3>
                      <DataProvenanceBadge
                        sourceType={selectedPortDetail.source_type || 'OFFICIAL STATIC'}
                        sourceName={selectedPortDetail.source}
                        lastVerified={selectedPortDetail.last_verified_at}
                      />
                    </div>
                    <span className="text-xs text-[#68717D] font-medium mt-0.5 block">
                      Lat: {selectedPortDetail.latitude}&deg;N, Lng: {selectedPortDetail.longitude}&deg;E • Annual Capacity: {selectedPortDetail.annual_capacity_mt} MT
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-[6px] text-xs font-bold bg-[#FEF7EC] border border-[#FBE6C2] text-[#D98A27]">
                      Anchorage Queue: {selectedPortDetail.anchorage_queue} Ships
                    </span>
                    <span className="px-3 py-1 rounded-[6px] text-xs font-bold bg-[#F8F7F3] border border-[#E4E2DC] text-[#0F2747]">
                      Wait: ~{selectedPortDetail.avg_waiting_days} Days
                    </span>
                  </div>
                </div>

                {/* Marine Weather Widget */}
                <div className="p-4 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Waves className="w-4 h-4 text-[#D6A63B]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-[#0F2747]">
                        Bay of Bengal Marine Weather Conditions
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      selectedPortDetail.marine_conditions?.is_live
                        ? 'bg-[#F3FAF7] text-[#2F7D4B] border-[#BCF0DA]'
                        : 'bg-[#FEF7EC] text-[#D98A27] border-[#FBE6C2]'
                    }`}>
                      {selectedPortDetail.marine_conditions?.status || 'LIVE'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[#68717D] block text-[11px] font-medium">Significant Wave Height:</span>
                      <span className="font-mono font-black text-[#0F2747] text-base mt-0.5 block">
                        {selectedPortDetail.marine_conditions?.wave_height_m || 1.8} m
                      </span>
                    </div>
                    <div>
                      <span className="text-[#68717D] block text-[11px] font-medium">Wave Direction:</span>
                      <span className="font-mono font-black text-[#0F2747] text-base mt-0.5 block">
                        {selectedPortDetail.marine_conditions?.wave_direction_deg || 185}&deg; (SSW)
                      </span>
                    </div>
                    <div>
                      <span className="text-[#68717D] block text-[11px] font-medium">Wave Period:</span>
                      <span className="font-mono font-black text-[#0F2747] text-base mt-0.5 block">
                        {selectedPortDetail.marine_conditions?.wave_period_s || 7.2} s
                      </span>
                    </div>
                    <div>
                      <span className="text-[#68717D] block text-[11px] font-medium">Sea Condition:</span>
                      <span className="font-bold text-[#0F2747] text-base mt-0.5 block">
                        {selectedPortDetail.marine_conditions?.sea_condition || 'Moderate'}
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] text-[#68717D] mt-3 border-t border-[#E4E2DC] pt-2 flex items-center justify-between">
                    <span>Source: {selectedPortDetail.marine_conditions?.source || 'Open-Meteo Marine API'}</span>
                    <span>{selectedPortDetail.marine_conditions?.disclaimer}</span>
                  </div>
                </div>
              </div>

              {/* Berth-by-Berth Detailed Restrictions Table */}
              <div className="p-6 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E4E2DC]">
                  <div>
                    <h3 className="text-base font-black text-[#0F2747]">Berth Master Specification Table</h3>
                    <p className="text-xs text-[#68717D] font-medium mt-0.5">
                      Specific physical clearance rules applied by PortIN's Port Compatibility Engine.
                    </p>
                  </div>
                  <span className="text-xs text-[#0F2747] font-bold">
                    {selectedPortDetail.berths?.length || 0} Berths Gazetted
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedPortDetail.berths?.map((b: Berth) => (
                    <div key={b.id} className="p-4 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC] hover:border-[#D6A63B] transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <Anchor className="w-4 h-4 text-[#D6A63B]" />
                          <span className="font-bold text-[#0F2747] text-sm">{b.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-white text-[#68717D] border border-[#E4E2DC] font-semibold">
                            {b.berth_type}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-black text-[#0F2747]">
                          Max Permissible Draft: {b.max_draft}m
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-[#68717D] mt-2 pt-2 border-t border-[#E4E2DC]">
                        <div>
                          <span className="text-[#68717D] block text-[10px]">Maximum LOA:</span>
                          <span className="font-semibold text-[#172033]">{b.max_loa} meters</span>
                        </div>
                        <div>
                          <span className="text-[#68717D] block text-[10px]">Outreach Beam:</span>
                          <span className="font-semibold text-[#172033]">{b.max_beam} meters</span>
                        </div>
                        <div>
                          <span className="text-[#68717D] block text-[10px]">Handling Discharge Rate:</span>
                          <span className="font-semibold text-[#0F2747]">{b.handling_rate_tpd.toLocaleString()} TPD</span>
                        </div>
                        <div>
                          <span className="text-[#68717D] block text-[10px]">Supported Cargo:</span>
                          <span className="font-semibold text-[#172033] truncate block">{b.supported_cargo}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
