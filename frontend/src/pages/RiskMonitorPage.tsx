import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, ShieldCheck, AlertTriangle, ArrowRight,
  TrendingUp, RefreshCw, Layers, CheckCircle2
} from 'lucide-react';
import { apiClient } from '../api/client';
import { DataProvenanceBadge } from '../components/common/DataProvenanceBadge';

export const RiskMonitorPage: React.FC = () => {
  const [riskData, setRiskData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadRisk = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post('/risk/analyze', {
        freight_volatility_pct: 4.5,
        congestion_score: 42.0,
        draft_margin_m: 0.30,
        weather_wave_height_m: 1.8,
        contract_type: 'Short-Term Multi-Voyage (3 Voyages)',
        is_port_fully_compatible: true,
      });
      setRiskData(res.data);
    } catch (e) {
      console.error('Failed to load risk analysis', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRisk();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Chartering Risk Engine</span>
            <DataProvenanceBadge sourceType="SIMULATED DEMO" sourceName="Multi-Factor Risk Model" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Operational & Market Risk Scoring Cockpit
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quantitative multi-factor risk scoring evaluating congestion, draft margins, volatility, and weather.
          </p>
        </div>

        <button
          onClick={loadRisk}
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      {riskData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Risk Gauge Card */}
          <div className="p-6 rounded-2xl bg-[#081426] border border-slate-800 flex flex-col items-center text-center justify-center">
            <div className="p-3 rounded-full bg-cyan-500/10 text-cyan-400 mb-3">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Composite Risk Score</span>
            <div className={`text-6xl font-black font-mono my-3 ${
              riskData.risk_category === 'LOW' ? 'text-emerald-400' :
              riskData.risk_category === 'MEDIUM' ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {riskData.risk_score}
              <span className="text-xl text-slate-500 font-normal"> / 100</span>
            </div>

            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${
              riskData.risk_category === 'LOW' ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' :
              riskData.risk_category === 'MEDIUM' ? 'bg-amber-950 text-amber-300 border-amber-500/40' : 'bg-rose-950 text-rose-300 border-rose-500/40'
            }`}>
              {riskData.risk_category} OPERATIONAL RISK
            </span>

            <p className="text-xs text-slate-400 mt-4 max-w-xs leading-relaxed">
              {riskData.summary}
            </p>
          </div>

          {/* Contributing Risk Drivers Breakdown */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-[#081426] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Contributing Risk Factors & Weight Decomposition
              </h3>
              <span className="text-xs text-slate-400">100% Normalized Weighting</span>
            </div>

            <div className="space-y-3.5">
              {riskData.all_factors?.map((f: any, idx: number) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span className="font-semibold">{f.factor}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-slate-500">Weight: {f.weight_pct}%</span>
                      <span className="font-mono font-bold text-cyan-300">{f.score} / 100</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full ${
                        f.score > 60 ? 'bg-rose-500' : f.score > 30 ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${f.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Risk mitigation: Transitioning from single spot charters to a 3-voyage COA reduces overall contract exposure risk by 66%, insulating SAIL from spot market rate spikes.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
