import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History, Eye, Copy, Trash2, ArrowRight, RefreshCw,
  Ship, MapPin, Calendar, CheckCircle2, ShieldAlert
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Audit Trail & Record Storage</span>
            <DataProvenanceBadge sourceType="USER IMPORTED & SAVED" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Chartering Decision History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete historical registry of saved procurement decisions, vessel selections, and contract evaluations.
          </p>
        </div>

        <button
          onClick={loadDecisions}
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      {/* Decisions List Table */}
      <div className="bg-[#081426] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
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
            <tbody className="divide-y divide-slate-800/80">
              {decisions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-500">
                    No decisions recorded yet. Run an analysis from the Forecast or Decision Twin page and click Save.
                  </td>
                </tr>
              ) : (
                decisions.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-xs">{d.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        #{d.id} • {new Date(d.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {d.cargo_mt.toLocaleString()} MT {d.cargo_type}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">
                      {d.origin_port} &rarr; {d.destination_port}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {d.recommended_vessel}
                    </td>
                    <td className="py-3.5 px-4 text-cyan-300">
                      {d.contract_type}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                        {d.market_signal}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      ${d.estimated_total_cost_usd.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setActiveModalDecision(d)}
                          title="Open Details"
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(d)}
                          title="Duplicate"
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          title="Delete"
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-rose-400"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-2xl bg-[#081426] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-400">Archived Analysis Snapshot</span>
                <h3 className="text-lg font-bold text-white">{activeModalDecision.title}</h3>
              </div>
              <button
                onClick={() => setActiveModalDecision(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs text-slate-300">
              <div>
                <span className="text-slate-500 block">Trade Lane:</span>
                <span className="font-semibold text-white">{activeModalDecision.origin_country} ({activeModalDecision.origin_port}) &rarr; {activeModalDecision.destination_port}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Parcel Specification:</span>
                <span className="font-semibold text-white">{activeModalDecision.cargo_mt.toLocaleString()} MT {activeModalDecision.cargo_type}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Recommended Vessel:</span>
                <span className="font-semibold text-white">{activeModalDecision.recommended_vessel}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Contract Strategy:</span>
                <span className="font-semibold text-cyan-300">{activeModalDecision.contract_type}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Optimal Window:</span>
                <span className="font-semibold text-emerald-400">{activeModalDecision.optimal_window}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Operational Risk:</span>
                <span className="font-semibold text-emerald-400">{activeModalDecision.risk_score} / 100</span>
              </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-400">
              Created on: {new Date(activeModalDecision.created_at).toLocaleString()}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModalDecision(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl"
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
