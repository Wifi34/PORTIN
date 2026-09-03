import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers, ShieldAlert, TrendingDown, DollarSign, Clock, CheckCircle2,
  Ship, Calendar, ArrowRight, RefreshCw, Save, FileDown, Sparkles,
  Award, AlertTriangle, Info
} from 'lucide-react';
import { apiClient } from '../api/client';
import { DataProvenanceBadge } from '../components/common/DataProvenanceBadge';
import { DecisionTwinResponse, DecisionTwinPlan } from '../types';

export const DecisionTwinPage: React.FC = () => {
  const navigate = useNavigate();

  // Twin inputs
  const [cargoType, setCargoType] = useState('Coking Coal');
  const [cargoMt, setCargoMt] = useState(70000);
  const [originCountry, setOriginCountry] = useState('Australia');
  const [originPort, setOriginPort] = useState('Gladstone');
  const [destinationPort, setDestinationPort] = useState('Paradip');
  const [desiredDate, setDesiredDate] = useState('2026-09-25');
  const [numVoyages, setNumVoyages] = useState(3);

  const [twinData, setTwinData] = useState<DecisionTwinResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedPlanCode, setSelectedPlanCode] = useState<'PLAN A' | 'PLAN B' | 'PLAN C'>('PLAN A');

  const runTwin = async () => {
    setLoading(true);
    setSaveSuccess(false);
    try {
      const res = await apiClient.post('/decision-twin/run', {
        cargo_type: cargoType,
        cargo_mt: Number(cargoMt),
        origin_country: originCountry,
        origin_port: originPort,
        destination_port: destinationPort,
        desired_shipment_date: desiredDate,
        vessel_class: 'AUTO',
        contract_duration_months: 3,
        num_voyages: Number(numVoyages),
        planning_horizon_days: 90,
      });
      setTwinData(res.data);
    } catch (err) {
      console.error('Decision Twin run failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTwin();
  }, []);

  const handleSaveDecision = async (plan: DecisionTwinPlan) => {
    if (!twinData) return;
    setSaving(true);
    try {
      await apiClient.post('/decisions', {
        title: `[${plan.plan_code}] ${cargoMt.toLocaleString()} MT ${cargoType}: ${originPort} -> ${destinationPort}`,
        cargo_type: cargoType,
        cargo_mt: Number(cargoMt),
        origin_country: originCountry,
        origin_port: originPort,
        destination_port: destinationPort,
        shipment_date: desiredDate,
        contract_type: plan.contract_strategy,
        num_voyages: plan.voyages_count,
        planning_horizon_days: 90,
        market_signal: twinData.market_signal,
        recommended_vessel: plan.vessel_class,
        optimal_window: plan.booking_window,
        risk_score: plan.risk_score,
        estimated_total_cost_usd: plan.estimated_logistics_cost_usd,
        results_json: {
          twin_run_id: twinData.run_id,
          selected_plan: plan,
          all_plans: {
            plan_a: twinData.plan_a,
            plan_b: twinData.plan_b,
            plan_c: twinData.plan_c,
          },
        },
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to save decision twin plan', e);
    } finally {
      setSaving(false);
    }
  };

  const getActivePlan = (): DecisionTwinPlan | null => {
    if (!twinData) return null;
    if (selectedPlanCode === 'PLAN A') return twinData.plan_a;
    if (selectedPlanCode === 'PLAN B') return twinData.plan_b;
    return twinData.plan_c;
  };

  const activePlan = getActivePlan();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#081426] via-[#0A2540] to-[#081426] border border-cyan-500/30 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-cyan-500/20 text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">SIH 2026 Killer Feature</span>
            <DataProvenanceBadge sourceType="SIMULATED DEMO" sourceName="Stochastic Twin Simulation Engine" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            PortIN Decision Twin: Digital World Simulation
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Performs 36 multi-parameter perturbations (vessel classes, weather, congestion queues, laycans) to synthesize Plan A, B, and C.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runTwin}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-400 to-light-cyan hover:from-cyan-300 hover:to-cyan-200 text-black font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Simulating Worlds...' : 'Re-Run Decision Twin'}</span>
          </button>
        </div>
      </div>

      {/* Input Parameters Bar */}
      <div className="p-4 rounded-xl bg-[#081426] border border-slate-800 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div>
          <label className="block text-slate-400 font-semibold mb-1">Cargo Type</label>
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
          <label className="block text-slate-400 font-semibold mb-1">Parcel Size (MT)</label>
          <input
            type="number"
            step="5000"
            value={cargoMt}
            onChange={(e) => setCargoMt(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-semibold mb-1">Origin Node</label>
          <select
            value={originPort}
            onChange={(e) => setOriginPort(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
          >
            <option value="Gladstone">Gladstone (Australia)</option>
            <option value="Hay Point">Hay Point (Australia)</option>
            <option value="Balikpapan">Balikpapan (Indonesia)</option>
            <option value="Maputo">Maputo (Mozambique)</option>
            <option value="Ust-Luga">Ust-Luga (Russia)</option>
            <option value="Hampton Roads">Hampton Roads (USA)</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-400 font-semibold mb-1">Destination Port</label>
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

        <div>
          <label className="block text-slate-400 font-semibold mb-1">Laycan Window</label>
          <input
            type="date"
            value={desiredDate}
            onChange={(e) => setDesiredDate(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-semibold mb-1">Voyage Count</label>
          <select
            value={numVoyages}
            onChange={(e) => setNumVoyages(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
          >
            <option value="1">1 (Single Spot)</option>
            <option value="3">3 (Short-Term COA)</option>
            <option value="6">6 (Medium-Term COA)</option>
          </select>
        </div>
      </div>

      {twinData && (
        <>
          {/* Key Strategic Insight Alert */}
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 flex items-start gap-3">
            <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-200">
              <span className="font-bold text-cyan-300 mr-1.5">Decision Twin Synthesis:</span>
              {twinData.key_insight}
            </div>
          </div>

          {/* Three Competing Plans Comparison Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* PLAN A */}
            <div
              onClick={() => setSelectedPlanCode('PLAN A')}
              className={`p-5 rounded-2xl cursor-pointer transition-all duration-200 relative ${
                selectedPlanCode === 'PLAN A'
                  ? 'bg-[#081426] border-2 border-cyan-400 shadow-xl shadow-cyan-500/10'
                  : 'bg-[#081426]/70 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-cyan-300 uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30">
                  {twinData.plan_a.plan_code} • {twinData.plan_a.plan_label}
                </span>
                <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60">
                  RECOMMENDED
                </span>
              </div>

              <div className="text-3xl font-black text-white tracking-tight my-2">
                ${twinData.plan_a.expected_freight_rate.toFixed(2)}
                <span className="text-xs font-normal text-slate-400 ml-1">/ MT</span>
              </div>
              <div className="text-xs font-bold text-slate-200 mb-4">{twinData.plan_a.contract_strategy}</div>

              <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800/80 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Vessel:</span>
                  <span className="font-semibold text-white">{twinData.plan_a.vessel_class}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Booking Window:</span>
                  <span className="font-semibold text-cyan-400">{twinData.plan_a.booking_window}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Est. Idle Days:</span>
                  <span className="font-semibold text-white">{twinData.plan_a.expected_idle_days} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Risk Rating:</span>
                  <span className="font-bold text-emerald-400">{twinData.plan_a.risk_level} ({twinData.plan_a.risk_score}/100)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Logistics Cost:</span>
                  <span className="font-mono font-bold text-white">${twinData.plan_a.estimated_logistics_cost_usd.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-4 leading-relaxed line-clamp-3">
                {twinData.plan_a.rationale}
              </p>
            </div>

            {/* PLAN B */}
            <div
              onClick={() => setSelectedPlanCode('PLAN B')}
              className={`p-5 rounded-2xl cursor-pointer transition-all duration-200 relative ${
                selectedPlanCode === 'PLAN B'
                  ? 'bg-[#081426] border-2 border-emerald-400 shadow-xl shadow-emerald-500/10'
                  : 'bg-[#081426]/70 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-emerald-300 uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30">
                  {twinData.plan_b.plan_code} • {twinData.plan_b.plan_label}
                </span>
                <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60">
                  MINIMAL RISK
                </span>
              </div>

              <div className="text-3xl font-black text-white tracking-tight my-2">
                ${twinData.plan_b.expected_freight_rate.toFixed(2)}
                <span className="text-xs font-normal text-slate-400 ml-1">/ MT</span>
              </div>
              <div className="text-xs font-bold text-slate-200 mb-4">{twinData.plan_b.contract_strategy}</div>

              <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800/80 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Vessel:</span>
                  <span className="font-semibold text-white">{twinData.plan_b.vessel_class}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Booking Window:</span>
                  <span className="font-semibold text-emerald-400">{twinData.plan_b.booking_window}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Est. Idle Days:</span>
                  <span className="font-semibold text-white">{twinData.plan_b.expected_idle_days} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Risk Rating:</span>
                  <span className="font-bold text-emerald-400">{twinData.plan_b.risk_level} ({twinData.plan_b.risk_score}/100)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Logistics Cost:</span>
                  <span className="font-mono font-bold text-white">${twinData.plan_b.estimated_logistics_cost_usd.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-4 leading-relaxed line-clamp-3">
                {twinData.plan_b.rationale}
              </p>
            </div>

            {/* PLAN C */}
            <div
              onClick={() => setSelectedPlanCode('PLAN C')}
              className={`p-5 rounded-2xl cursor-pointer transition-all duration-200 relative ${
                selectedPlanCode === 'PLAN C'
                  ? 'bg-[#081426] border-2 border-amber-400 shadow-xl shadow-amber-500/10'
                  : 'bg-[#081426]/70 border border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/30">
                  {twinData.plan_c.plan_code} • {twinData.plan_c.plan_label}
                </span>
                <span className="text-[10px] font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-950/60">
                  LOWEST UNIT COST
                </span>
              </div>

              <div className="text-3xl font-black text-white tracking-tight my-2">
                ${twinData.plan_c.expected_freight_rate.toFixed(2)}
                <span className="text-xs font-normal text-slate-400 ml-1">/ MT</span>
              </div>
              <div className="text-xs font-bold text-slate-200 mb-4">{twinData.plan_c.contract_strategy}</div>

              <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800/80 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Vessel:</span>
                  <span className="font-semibold text-white">{twinData.plan_c.vessel_class}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Booking Window:</span>
                  <span className="font-semibold text-amber-400">{twinData.plan_c.booking_window}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Est. Idle Days:</span>
                  <span className="font-semibold text-white">{twinData.plan_c.expected_idle_days} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Risk Rating:</span>
                  <span className="font-bold text-amber-400">{twinData.plan_c.risk_level} ({twinData.plan_c.risk_score}/100)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Logistics Cost:</span>
                  <span className="font-mono font-bold text-white">${twinData.plan_c.estimated_logistics_cost_usd.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 mt-4 leading-relaxed line-clamp-3">
                {twinData.plan_c.rationale}
              </p>
            </div>
          </div>

          {/* Active Selected Plan Detailed Deep-Dive */}
          {activePlan && (
            <div className="p-6 rounded-2xl bg-[#081426] border border-cyan-500/30 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-black text-cyan-400 uppercase tracking-widest">
                    Selected Execution Strategy
                  </span>
                  <h3 className="text-xl font-bold text-white mt-0.5">
                    {activePlan.plan_code}: {activePlan.plan_label} — {activePlan.vessel_class} ({activePlan.contract_strategy})
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSaveDecision(activePlan)}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-cyan-400" />
                    <span>{saveSuccess ? 'Decision Saved!' : saving ? 'Saving...' : 'Save Decision'}</span>
                  </button>

                  <button
                    onClick={() => navigate('/reports')}
                    className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Generate PDF Report</span>
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Operational Feasibility & Port Constraints
                  </h4>
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Target Berth:</span>
                      <span className="font-semibold text-white">{activePlan.compatible_berth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Berth Compatibility:</span>
                      <span className="font-bold text-emerald-400">{activePlan.port_compatibility}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Freight Variance Range:</span>
                      <span className="font-mono text-cyan-400">{activePlan.freight_range}</span>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mt-4 mb-2">
                    Why Was This Plan Selected?
                  </h4>
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    {activePlan.rationale}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Trade-Offs & Risk Considerations
                  </h4>
                  <ul className="space-y-2">
                    {activePlan.tradeoffs.map((t, idx) => (
                      <li key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-slate-400 flex items-center justify-between">
                    <span>Stochastic Simulation Run ID:</span>
                    <span className="font-mono text-cyan-400 font-bold">{twinData.run_id}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
