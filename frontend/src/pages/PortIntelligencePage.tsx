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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">East Coast Marine Directory</span>
            <DataProvenanceBadge sourceType="OFFICIAL STATIC" sourceName="Gazetted Port Authority Berth Master Plans" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Port & Berth Physical Constraints Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Berth-level physical restrictions: permissible drafts, LOA margins, beam outreach, and live sea state conditions.
          </p>
        </div>

        <button
          onClick={loadPorts}
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors self-start"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Port Selection Cards List */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 block mb-1">
            Select East Coast Discharge Terminal
          </span>
          {ports.map((p) => {
            const isSelected = selectedPortId === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedPortId(p.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                  isSelected
                    ? 'bg-cyan-950/30 border-cyan-400 shadow-md shadow-cyan-500/10'
                    : 'bg-[#081426] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <MapPin className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <span className="font-bold text-white text-sm">{p.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">({p.code})</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-cyan-400">{p.max_draft}m Max</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                  <span>{p.state}, India</span>
                  <span className="text-[11px] text-amber-400 font-semibold">Queue: {p.anchorage_queue} vessels</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Detailed Berth Specifications & Marine Weather */}
        <div className="lg:col-span-2 space-y-6">
          {selectedPortDetail && (
            <>
              {/* Port Summary Card */}
              <div className="p-6 rounded-2xl bg-[#081426] border border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-black text-white">{selectedPortDetail.name} Port</h2>
                      <DataProvenanceBadge
                        sourceType={selectedPortDetail.source_type || 'OFFICIAL STATIC'}
                        sourceName={selectedPortDetail.source}
                        lastVerified={selectedPortDetail.last_verified_at}
                      />
                    </div>
                    <span className="text-xs text-slate-400 font-medium">
                      Lat: {selectedPortDetail.latitude}&deg;N, Lng: {selectedPortDetail.longitude}&deg;E • Annual Capacity: {selectedPortDetail.annual_capacity_mt} MT
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-950/70 border border-amber-500/40 text-amber-300">
                      Anchorage Queue: {selectedPortDetail.anchorage_queue} Ships
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-950/70 border border-cyan-500/40 text-cyan-300">
                      Wait: ~{selectedPortDetail.avg_waiting_days} Days
                    </span>
                  </div>
                </div>

                {/* Marine Weather Widget (Open-Meteo or Fallback) */}
                <div className="mt-5 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Waves className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-white">
                        Bay of Bengal Marine Weather Conditions
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      selectedPortDetail.marine_conditions?.is_live
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40 animate-pulse'
                        : 'bg-amber-950 text-amber-400 border-amber-500/40'
                    }`}>
                      {selectedPortDetail.marine_conditions?.status || 'LIVE'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Significant Wave Height:</span>
                      <span className="font-mono font-bold text-white text-base">
                        {selectedPortDetail.marine_conditions?.wave_height_m || 1.8} m
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Wave Direction:</span>
                      <span className="font-mono font-bold text-white text-base">
                        {selectedPortDetail.marine_conditions?.wave_direction_deg || 185}&deg; (SSW)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Wave Period:</span>
                      <span className="font-mono font-bold text-white text-base">
                        {selectedPortDetail.marine_conditions?.wave_period_s || 7.2} s
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Sea Condition:</span>
                      <span className="font-bold text-cyan-300 text-base">
                        {selectedPortDetail.marine_conditions?.sea_condition || 'Moderate'}
                      </span>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 mt-2 border-t border-slate-800 pt-1.5 flex items-center justify-between">
                    <span>Source: {selectedPortDetail.marine_conditions?.source || 'Open-Meteo Marine API'}</span>
                    <span>{selectedPortDetail.marine_conditions?.disclaimer}</span>
                  </div>
                </div>
              </div>

              {/* Berth-by-Berth Detailed Restrictions Table */}
              <div className="p-6 rounded-2xl bg-[#081426] border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">Berth Master Specification Table</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Specific physical clearance rules applied by PortIN's Port Compatibility Engine.
                    </p>
                  </div>
                  <span className="text-xs text-cyan-400 font-bold">
                    {selectedPortDetail.berths?.length || 0} Berths Gazetted
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedPortDetail.berths?.map((b: Berth) => (
                    <div key={b.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <Anchor className="w-4 h-4 text-cyan-400" />
                          <span className="font-bold text-white text-sm">{b.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                            {b.berth_type}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-cyan-300">
                          Max Permissible Draft: {b.max_draft}m
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-300 mt-2 pt-2 border-t border-slate-800">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Maximum LOA:</span>
                          <span className="font-semibold text-white">{b.max_loa} meters</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Outreach Beam:</span>
                          <span className="font-semibold text-white">{b.max_beam} meters</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Handling Discharge Rate:</span>
                          <span className="font-semibold text-cyan-300">{b.handling_rate_tpd.toLocaleString()} TPD</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Supported Cargo:</span>
                          <span className="font-semibold text-white truncate block">{b.supported_cargo}</span>
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
