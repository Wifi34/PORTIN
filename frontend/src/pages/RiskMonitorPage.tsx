import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, ShieldCheck, AlertTriangle, ArrowRight,
  TrendingUp, RefreshCw, Layers, CheckCircle2, Shield
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E4E2DC]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#D6A63B]">
              Chartering Risk Engine
            </span>
            <DataProvenanceBadge sourceType="SIMULATED DEMO" sourceName="Multi-Factor Risk Model" />
          </div>
          <h1 className="text-2xl font-black text-[#0F2747] tracking-tight">
            Operational & Market Risk Scoring Cockpit
          </h1>
          <p className="text-xs text-[#68717D] mt-1">
            Quantitative multi-factor risk scoring evaluating congestion, draft margins, volatility, and weather.
          </p>
        </div>

        <button
          onClick={loadRisk}
          className="p-2.5 rounded-[8px] bg-white hover:bg-[#F8F7F3] border border-[#E4E2DC] text-[#0F2747] transition-colors shadow-sm self-start sm:self-center"
          title="Recalculate Risk Scoring"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#D6A63B]' : ''}`} />
        </button>
      </div>

      {riskData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Risk Gauge Card */}
          <div className="p-6 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] flex flex-col items-center text-center justify-center">
            <div className="p-3.5 rounded-full bg-[#F8F7F3] border border-[#E4E2DC] text-[#0F2747] mb-3">
              <ShieldAlert className="w-8 h-8 text-[#D6A63B]" />
            </div>

            <span className="text-[11px] font-black uppercase tracking-widest text-[#68717D]">
              Composite Risk Score
            </span>
            <div className={`text-6xl font-black font-mono my-3 ${
              riskData.risk_category === 'LOW' ? 'text-[#2F7D4B]' :
              riskData.risk_category === 'MEDIUM' ? 'text-[#D98A27]' : 'text-[#C64A3B]'
            }`}>
              {riskData.risk_score}
              <span className="text-xl text-[#68717D] font-normal"> / 100</span>
            </div>

            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${
              riskData.risk_category === 'LOW' ? 'bg-[#F3FAF7] text-[#2F7D4B] border-[#BCF0DA]' :
              riskData.risk_category === 'MEDIUM' ? 'bg-[#FEF7EC] text-[#D98A27] border-[#FBE6C2]' : 'bg-[#FDF2F2] text-[#C64A3B] border-[#F8B4B4]'
            }`}>
              {riskData.risk_category} OPERATIONAL RISK
            </span>

            <p className="text-xs text-[#68717D] mt-4 max-w-xs leading-relaxed">
              {riskData.summary}
            </p>
          </div>

          {/* Contributing Risk Drivers Breakdown */}
          <div className="lg:col-span-2 p-6 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E2DC]">
              <h3 className="text-xs font-black text-[#0F2747] uppercase tracking-wider">
                Contributing Risk Factors & Weight Decomposition
              </h3>
              <span className="text-xs text-[#68717D]">100% Normalized Weighting</span>
            </div>

            <div className="space-y-4">
              {riskData.all_factors?.map((f: any, idx: number) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs text-[#172033]">
                    <span className="font-bold text-[#0F2747]">{f.factor}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-[#68717D]">Weight: {f.weight_pct}%</span>
                      <span className="font-mono font-bold text-[#0F2747]">{f.score} / 100</span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-[#F8F7F3] rounded-full overflow-hidden border border-[#E4E2DC]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        f.score > 60 ? 'bg-[#C64A3B]' : f.score > 30 ? 'bg-[#D98A27]' : 'bg-[#2F7D4B]'
                      }`}
                      style={{ width: `${f.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC] text-xs text-[#172033] flex items-start gap-2.5 leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-[#2F7D4B] shrink-0 mt-0.5" />
              <span>
                <strong className="text-[#0F2747]">Risk Mitigation Directive:</strong> Transitioning from single spot charters to a 3-voyage COA reduces overall contract exposure risk by 66%, insulating SAIL from spot market rate spikes.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
