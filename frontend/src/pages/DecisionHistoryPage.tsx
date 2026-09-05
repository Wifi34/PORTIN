import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History, Eye, Copy, Trash2, ArrowRight, RefreshCw,
  Ship, MapPin, Calendar, CheckCircle2, ShieldAlert, X
} from 'lucide-react';
import { apiClient } from '../api/client';
import { DataProvenanceBadge } from '../components/common/DataProvenanceBadge';
import { DecisionHistoryRecord } from '../types';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E4E2DC]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#D6A63B]">
              Audit Trail & Record Storage
            </span>
            <DataProvenanceBadge sourceType="USER IMPORTED & SAVED" />
          </div>
          <h1 className="text-2xl font-black text-[#0F2747] tracking-tight">
            Chartering Decision History
          </h1>
          <p className="text-xs text-[#68717D] mt-1">
            Complete historical registry of saved procurement decisions, vessel selections, and contract evaluations.
          </p>
        </div>

        <button
          onClick={loadDecisions}
          className="p-2.5 rounded-[8px] bg-white hover:bg-[#F8F7F3] border border-[#E4E2DC] text-[#0F2747] shadow-sm transition-colors self-start sm:self-center"
          title="Refresh Decision Log"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#D6A63B]' : ''}`} />
        </button>
      </div>

      {/* Decisions List Table */}
      <div className="bg-white border border-[#E4E2DC] rounded-[10px] overflow-hidden shadow-[0_1px_3px_rgba(15,39,71,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F7F3] text-[#0F2747] uppercase tracking-wider text-[11px] font-black border-b border-[#E4E2DC]">
              <tr>
                <th className="py-3 px-4">Decision ID / Title</th>
                <th className="py-3 px-4">Cargo Parcel</th>
                <th className="py-3 px-4">Trade Lane</th>
                <th className="py-3 px-4">Vessel</th>
                <th className="py-3 px-4">Contract Strategy</th>
                <th className="py-3 px-4">Signal</th>
                <th className="py-3 px-4">Est. Cost</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E2DC]">
              {decisions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-[#68717D]">
                    No decisions recorded yet. Run an analysis from the Forecast or Decision Twin page and click Save.
                  </td>
                </tr>
              ) : (
                decisions.map((d) => (
                  <tr key={d.id} className="hover:bg-[#F8F7F3]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#0F2747] text-xs">{d.title}</div>
                      <div className="text-[10px] text-[#68717D] font-mono mt-0.5">
                        #{d.id} • {new Date(d.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#172033] font-medium">
                      {d.cargo_mt.toLocaleString()} MT {d.cargo_type}
                    </td>
                    <td className="py-3.5 px-4 text-[#172033] font-medium">
                      {d.origin_port} &rarr; {d.destination_port}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#0F2747]">
                      {d.recommended_vessel}
                    </td>
                    <td className="py-3.5 px-4 text-[#172033] font-semibold">
                      {d.contract_type}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-black uppercase bg-[#F3FAF7] text-[#2F7D4B] border border-[#BCF0DA]">
                        {d.market_signal}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-[#0F2747]">
                      ${d.estimated_total_cost_usd.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setActiveModalDecision(d)}
                          title="Open Details"
                          className="p-1.5 rounded-[6px] bg-[#F8F7F3] hover:bg-[#E4E2DC] border border-[#E4E2DC] text-[#0F2747] transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(d)}
                          title="Duplicate"
                          className="p-1.5 rounded-[6px] bg-[#F8F7F3] hover:bg-[#E4E2DC] border border-[#E4E2DC] text-[#0F2747] transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          title="Delete"
                          className="p-1.5 rounded-[6px] bg-[#FDF2F2] hover:bg-[#FDE8E8] border border-[#F8B4B4] text-[#C64A3B] transition-colors"
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

      {/* Detail Modal View */}
      {activeModalDecision && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-6">
          <div className="w-full max-w-2xl bg-white border border-[#E4E2DC] rounded-[10px] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E2DC]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#D6A63B]">Archived Analysis Snapshot</span>
                <h3 className="text-lg font-black text-[#0F2747] mt-0.5">{activeModalDecision.title}</h3>
              </div>
              <button
                onClick={() => setActiveModalDecision(null)}
                className="text-[#68717D] hover:text-[#0F2747] p-1 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-[#172033]">
              <div>
                <span className="text-[#68717D] block text-[11px]">Trade Lane:</span>
                <span className="font-bold text-[#0F2747]">{activeModalDecision.origin_country} ({activeModalDecision.origin_port}) &rarr; {activeModalDecision.destination_port}</span>
              </div>
              <div>
                <span className="text-[#68717D] block text-[11px]">Parcel Specification:</span>
                <span className="font-bold text-[#0F2747]">{activeModalDecision.cargo_mt.toLocaleString()} MT {activeModalDecision.cargo_type}</span>
              </div>
              <div>
                <span className="text-[#68717D] block text-[11px]">Recommended Vessel:</span>
                <span className="font-bold text-[#0F2747]">{activeModalDecision.recommended_vessel}</span>
              </div>
              <div>
                <span className="text-[#68717D] block text-[11px]">Contract Strategy:</span>
                <span className="font-bold text-[#0F2747]">{activeModalDecision.contract_type}</span>
              </div>
              <div>
                <span className="text-[#68717D] block text-[11px]">Optimal Window:</span>
                <span className="font-bold text-[#2F7D4B]">{activeModalDecision.optimal_window}</span>
              </div>
              <div>
                <span className="text-[#68717D] block text-[11px]">Operational Risk:</span>
                <span className="font-bold text-[#2F7D4B]">{activeModalDecision.risk_score} / 100</span>
              </div>
            </div>

            <div className="p-3 bg-[#F8F7F3] rounded-[8px] border border-[#E4E2DC] text-xs text-[#68717D]">
              Created on: {new Date(activeModalDecision.created_at).toLocaleString()}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModalDecision(null)}
                className="px-5 py-2.5 bg-[#0F2747] hover:bg-[#16365f] text-white text-xs font-bold rounded-[8px] transition-colors cursor-pointer"
              >
                Close Snapshot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
