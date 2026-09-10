import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History, Eye, Copy, Trash2, ArrowRight, RefreshCw,
  Ship, MapPin, Calendar, CheckCircle2, ShieldAlert, X, Sparkles
} from 'lucide-react';
import { apiClient } from '../api/client';
import { DataProvenanceBadge } from '../components/common/DataProvenanceBadge';
import { DecisionHistoryRecord } from '../types';
import { getCountryFlag, getPortFlag } from '../utils/countryFlags';

export const DecisionHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [decisions, setDecisions] = useState<DecisionHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModalDecision, setActiveModalDecision] = useState<DecisionHistoryRecord | null>(null);

  const loadDecisions = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/decisions');
      setDecisions(res.data);
    } catch (e) {
      console.error('Failed to load decisions', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDecisions();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm(`Are you sure you want to delete decision #${id}?`)) return;
    try {
      await apiClient.delete(`/decisions/${id}`);
      setDecisions((prev) => prev.filter((d) => d.id !== id));
      if (activeModalDecision?.id === id) setActiveModalDecision(null);
    } catch (e) {
      console.error('Failed to delete decision', e);
    }
  };

  const handleDuplicate = async (dec: DecisionHistoryRecord) => {
    try {
      const res = await apiClient.post('/decisions', {
        title: `${dec.title} (Duplicate)`,
        cargo_type: dec.cargo_type,
        cargo_mt: dec.cargo_mt,
        origin_country: dec.origin_country,
        origin_port: dec.origin_port,
        destination_port: dec.destination_port,
        shipment_date: dec.shipment_date,
        contract_type: dec.contract_type,
        num_voyages: dec.num_voyages,
        planning_horizon_days: dec.planning_horizon_days,
        market_signal: dec.market_signal,
        recommended_vessel: dec.recommended_vessel,
        optimal_window: dec.optimal_window,
        risk_score: dec.risk_score,
        estimated_total_cost_usd: dec.estimated_total_cost_usd,
        results_json: dec.results_json,
      });
      setDecisions((prev) => [res.data, ...prev]);
    } catch (e) {
      console.error('Failed to duplicate decision', e);
    }
  };

  return (
    <div className="min-h-full bg-[#F8F7F3] text-[#172033] p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[16px] bg-white border border-[#E4E2DC] shadow-sm border-t-4 border-t-[#D6A63B]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#D6A63B]">
              Audit Trail & Record Storage
            </span>
            <DataProvenanceBadge sourceType="USER IMPORTED & SAVED" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F2747] tracking-tight">
            Chartering Decision History
          </h1>
          <p className="text-xs sm:text-sm text-[#68717D] mt-1 font-medium">
            Complete historical registry of saved procurement decisions, vessel selections, and contract evaluations.
          </p>
        </div>

        <button
          onClick={loadDecisions}
          className="px-4 py-2 rounded-xl bg-[#FAF9F5] hover:bg-[#F3E3B7]/50 border border-[#E4E2DC] text-[#0F2747] text-xs font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-center"
          title="Refresh Decision Log"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#D6A63B]' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Decisions List Table (With Executive Navy Header & High Contrast) */}
      <div className="bg-white border border-[#E4E2DC] rounded-[16px] overflow-hidden shadow-sm border-t-4 border-t-[#D6A63B]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0F2747] text-[#F3E3B7] uppercase tracking-wider text-[10px] font-black">
              <tr>
                <th className="py-3 px-4">Decision ID / Title</th>
                <th className="py-3 px-4">Cargo Parcel</th>
                <th className="py-3 px-4">Trade Lane</th>
                <th className="py-3 px-4">Vessel</th>
                <th className="py-3 px-4">Contract Strategy</th>
                <th className="py-3 px-4">Signal</th>
                <th className="py-3 px-4">Est. Cost</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E2DC]">
              {decisions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[#68717D] font-medium">
                    No decisions recorded yet. Run an analysis from the Forecast or Decision Twin page and click Save.
                  </td>
                </tr>
              ) : (
                decisions.map((d, idx) => (
                  <tr
                    key={d.id}
                    className={`transition-colors ${idx % 2 === 1 ? 'bg-[#FAF9F5]' : 'bg-white'} hover:bg-[#F3E3B7]/20`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#0F2747] text-xs">{d.title}</div>
                      <div className="text-[10px] text-[#68717D] font-mono mt-0.5">
                        #{d.id} • {new Date(d.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#172033] font-bold">
                      {d.cargo_mt.toLocaleString()} MT <span className="text-[#0F2747]">{d.cargo_type}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#172033] font-semibold">
                      <span className="flex items-center gap-1">
                        <span>{getPortFlag(d.origin_port, d.origin_country)} {d.origin_port}</span>
                        <span>&rarr;</span>
                        <span>🇮🇳 {d.destination_port}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-[#0F2747]">
                      {d.recommended_vessel}
                    </td>
                    <td className="py-3.5 px-4 text-[#172033] font-medium">
                      {d.contract_type}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        d.market_signal === 'BOOK NOW'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        {d.market_signal}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-[#0F2747]">
                      ${d.estimated_total_cost_usd.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setActiveModalDecision(d)}
                          className="p-1.5 rounded-lg text-[#0F2747] hover:bg-[#FAF9F5] border border-[#E4E2DC] transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(d)}
                          className="p-1.5 rounded-lg text-[#0F2747] hover:bg-[#FAF9F5] border border-[#E4E2DC] transition-colors cursor-pointer"
                          title="Duplicate Scenario"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                          title="Delete Decision"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Detail Modal */}
      {activeModalDecision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-[16px] bg-white border border-[#E4E2DC] shadow-2xl p-6 text-[#172033] relative border-t-4 border-t-[#D6A63B]">
            <div className="flex items-start justify-between pb-4 border-b border-[#E4E2DC]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-[#0F2747]">
                    Decision #{activeModalDecision.id}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                    {activeModalDecision.market_signal}
                  </span>
                </div>
                <div className="text-xs text-[#68717D] mt-0.5 font-medium">
                  {activeModalDecision.title}
                </div>
              </div>

              <button
                onClick={() => setActiveModalDecision(null)}
                className="p-1 rounded-md text-[#68717D] hover:text-[#0F2747] hover:bg-[#FAF9F5] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E4E2DC]">
                <div className="text-[10px] uppercase font-bold text-[#68717D]">Cargo Parcel</div>
                <div className="text-sm font-black text-[#0F2747] mt-0.5">
                  {activeModalDecision.cargo_mt.toLocaleString()} MT
                </div>
                <div className="text-[10px] text-[#68717D] truncate">{activeModalDecision.cargo_type}</div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E4E2DC]">
                <div className="text-[10px] uppercase font-bold text-[#68717D]">Vessel Class</div>
                <div className="text-sm font-black text-[#0F2747] mt-0.5">
                  {activeModalDecision.recommended_vessel}
                </div>
                <div className="text-[10px] text-[#68717D]">Recommended</div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E4E2DC]">
                <div className="text-[10px] uppercase font-bold text-[#68717D]">Risk Score</div>
                <div className="text-sm font-black text-emerald-700 mt-0.5">
                  {activeModalDecision.risk_score} / 100
                </div>
                <div className="text-[10px] text-[#68717D]">Low Risk</div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E4E2DC]">
                <div className="text-[10px] uppercase font-bold text-[#68717D]">Estimated Cost</div>
                <div className="text-sm font-black font-mono text-[#0F2747] mt-0.5">
                  ${activeModalDecision.estimated_total_cost_usd.toLocaleString()}
                </div>
                <div className="text-[10px] text-[#68717D]">USD Total</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E4E2DC] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#68717D] font-bold">Trade Corridor:</span>
                <strong className="text-[#0F2747]">
                  {getPortFlag(activeModalDecision.origin_port, activeModalDecision.origin_country)} {activeModalDecision.origin_port} ({activeModalDecision.origin_country}) &rarr; 🇮🇳 {activeModalDecision.destination_port} (India)
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#68717D] font-bold">Contract Strategy:</span>
                <strong className="text-[#0F2747]">{activeModalDecision.contract_type} ({activeModalDecision.num_voyages} Voyages)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#68717D] font-bold">Target Laycan Window:</span>
                <strong className="text-[#0F2747]">{activeModalDecision.optimal_window}</strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-3 border-t border-[#E4E2DC]">
              <button
                type="button"
                onClick={() => setActiveModalDecision(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#68717D] hover:bg-[#FAF9F5] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
