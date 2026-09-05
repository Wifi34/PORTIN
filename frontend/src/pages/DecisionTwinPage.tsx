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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded bg-[#F8F7F3] border border-[#E4E2DC] text-[#D6A63B]">
              <Sparkles className="w-4 h-4 text-[#D6A63B]" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#D6A63B]">
              Enterprise Simulation
            </span>
            <DataProvenanceBadge sourceType="SIMULATED DEMO" sourceName="Stochastic Twin Simulation Engine" />
          </div>
          <h1 className="text-2xl font-black text-[#0F2747] tracking-tight">
            PortIN Decision Twin: Digital World Simulation
          </h1>
          <p className="text-xs text-[#68717D] mt-1">
            Performs 36 multi-parameter perturbations (vessel classes, weather, congestion queues, laycans) to synthesize Plan A, B, and C.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runTwin}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#D6A63B] hover:bg-[#c49530] text-[#0F2747] font-black uppercase tracking-wider text-xs rounded-[8px] shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Simulating Worlds...' : 'Re-Run Decision Twin'}</span>
          </button>
        </div>
      </div>

      {/* Input Parameters Bar */}
      <div className="p-5 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div>
          <label className="block text-[#0F2747] font-bold mb-1.5">Cargo Type</label>
          <select
            value={cargoType}
            onChange={(e) => setCargoType(e.target.value)}
            className="w-full px-2.5 py-2 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-[#172033] font-medium focus:bg-white focus:border-[#D6A63B] transition-colors"
          >
            <option value="Coking Coal">Coking Coal</option>
            <option value="Thermal Coal">Thermal Coal</option>
            <option value="Iron Ore">Iron Ore</option>
            <option value="Limestone">Limestone</option>
          </select>
        </div>

        <div>
          <label className="block text-[#0F2747] font-bold mb-1.5">Parcel Size (MT)</label>
          <input
            type="number"
            step="5000"
            value={cargoMt}
            onChange={(e) => setCargoMt(Number(e.target.value))}
            className="w-full px-2.5 py-2 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-[#172033] font-medium focus:bg-white focus:border-[#D6A63B] transition-colors"
          />
        </div>

        <div>
          <label className="block text-[#0F2747] font-bold mb-1.5">Origin Node</label>
          <select
            value={originPort}
            onChange={(e) => setOriginPort(e.target.value)}
            className="w-full px-2.5 py-2 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-[#172033] font-medium focus:bg-white focus:border-[#D6A63B] transition-colors"
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
          <label className="block text-[#0F2747] font-bold mb-1.5">Destination Port</label>
          <select
            value={destinationPort}
            onChange={(e) => setDestinationPort(e.target.value)}
            className="w-full px-2.5 py-2 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-[#172033] font-medium focus:bg-white focus:border-[#D6A63B] transition-colors"
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
          <label className="block text-[#0F2747] font-bold mb-1.5">Laycan Window</label>
          <input
            type="date"
            value={desiredDate}
            onChange={(e) => setDesiredDate(e.target.value)}
            className="w-full px-2.5 py-2 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-[#172033] font-medium focus:bg-white focus:border-[#D6A63B] transition-colors"
          />
        </div>

        <div>
          <label className="block text-[#0F2747] font-bold mb-1.5">Voyage Count</label>
          <select
            value={numVoyages}
            onChange={(e) => setNumVoyages(Number(e.target.value))}
            className="w-full px-2.5 py-2 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-[#172033] font-medium focus:bg-white focus:border-[#D6A63B] transition-colors"
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
          <div className="p-4 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC] flex items-start gap-3">
            <Info className="w-5 h-5 text-[#D6A63B] shrink-0 mt-0.5" />
            <div className="text-xs text-[#172033] leading-relaxed">
              <strong className="text-[#0F2747] mr-1.5">Decision Twin Synthesis:</strong>
              {twinData.key_insight}
            </div>
          </div>

          {/* Three Competing Plans Comparison Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* PLAN A */}
            <div
              onClick={() => setSelectedPlanCode('PLAN A')}
              className={`p-6 rounded-[10px] cursor-pointer transition-all duration-200 relative bg-white ${
                selectedPlanCode === 'PLAN A'
                  ? 'border-2 border-[#D6A63B] shadow-md'
                  : 'border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] hover:border-[#D6A63B]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black text-[#0F2747] uppercase tracking-wider px-2.5 py-1 rounded-[4px] bg-[#F8F7F3] border border-[#E4E2DC]">
                  {twinData.plan_a.plan_code} • {twinData.plan_a.plan_label}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#2F7D4B] px-2.5 py-1 rounded-[4px] bg-[#F3FAF7] border border-[#BCF0DA]">
                  RECOMMENDED
                </span>
              </div>

              <div className="text-3xl font-black text-[#0F2747] tracking-tight my-2">
                ${twinData.plan_a.expected_freight_rate.toFixed(2)}
                <span className="text-xs font-normal text-[#68717D] ml-1">/ MT</span>
              </div>
              <div className="text-xs font-bold text-[#0F2747] mb-4">{twinData.plan_a.contract_strategy}</div>

              <div className="space-y-2 text-xs text-[#172033] border-t border-[#E4E2DC] pt-3">
                <div className="flex justify-between">
                  <span className="text-[#68717D]">Vessel:</span>
                  <span className="font-bold text-[#0F2747]">{twinData.plan_a.vessel_class}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#68717D]">Booking Window:</span>
                  <span className="font-bold text-[#2F7D4B]">{twinData.plan_a.booking_window}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#68717D]">Est. Idle Days:</span>
                  <span className="font-bold text-[#0F2747]">{twinData.plan_a.expected_idle_days} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#68717D]">Risk Rating:</span>
                  <span className="font-bold text-[#2F7D4B]">{twinData.plan_a.risk_level} ({twinData.plan_a.risk_score}/100)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#68717D]">Total Logistics Cost:</span>
                  <span className="font-mono font-black text-[#0F2747]">${twinData.plan_a.estimated_logistics_cost_usd.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-xs text-[#68717D] mt-4 leading-relaxed line-clamp-3">
                {twinData.plan_a.rationale}
              </p>
            </div>

            {/* PLAN B */}
            <div
              onClick={() => setSelectedPlanCode('PLAN B')}
              className={`p-6 rounded-[10px] cursor-pointer transition-all duration-200 relative bg-white ${
                selectedPlanCode === 'PLAN B'
                  ? 'border-2 border-[#2F7D4B] shadow-md'
                  : 'border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] hover:border-[#2F7D4B]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black text-[#0F2747] uppercase tracking-wider px-2.5 py-1 rounded-[4px] bg-[#F8F7F3] border border-[#E4E2DC]">
                  {twinData.plan_b.plan_code} • {twinData.plan_b.plan_label}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#2F7D4B] px-2.5 py-1 rounded-[4px] bg-[#F3FAF7] border border-[#BCF0DA]">
                  MINIMAL RISK
                </span>
              </div>

              <div className="text-3xl font-black text-[#0F2747] tracking-tight my-2">
                ${twinData.plan_b.expected_freight_rate.toFixed(2)}
                <span className="text-xs font-normal text-[#68717D] ml-1">/ MT</span>
              </div>
              <div className="text-xs font-bold text-[#0F2747] mb-4">{twinData.plan_b.contract_strategy}</div>

              <div className="space-y-2 text-xs text-[#172033] border-t border-[#E4E2DC] pt-3">
                <div className="flex justify-between">
                  <span className="text-[#68717D]">Vessel:</span>
                  <span className="font-bold text-[#0F2747]">{twinData.plan_b.vessel_class}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#68717D]">Booking Window:</span>
                  <span className="font-bold text-[#2F7D4B]">{twinData.plan_b.booking_window}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#68717D]">Est. Idle Days:</span>
                  <span className="font-bold text-[#0F2747]">{twinData.plan_b.expected_idle_days} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#68717D]">Risk Rating:</span>
                  <span className="font-bold text-[#2F7D4B]">{twinData.plan_b.risk_level} ({twinData.plan_b.risk_score}/100)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#68717D]">Total Logistics Cost:</span>
                  <span className="font-mono font-black text-[#0F2747]">${twinData.plan_b.estimated_logistics_cost_usd.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-xs text-[#68717D] mt-4 leading-relaxed line-clamp-3">
                {twinData.plan_b.rationale}
              </p>
            </div>

            {/* PLAN C */}
            <div
              onClick={() => setSelectedPlanCode('PLAN C')}
              className={`p-6 rounded-[10px] cursor-pointer transition-all duration-200 relative bg-white ${
                selectedPlanCode === 'PLAN C'
                  ? 'border-2 border-[#D98A27] shadow-md'
                  : 'border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] hover:border-[#D98A27]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black text-[#0F2747] uppercase tracking-wider px-2.5 py-1 rounded-[4px] bg-[#F8F7F3] border border-[#E4E2DC]">
                  {twinData.plan_c.plan_code} • {twinData.plan_c.plan_label}
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#D98A27] px-2.5 py-1 rounded-[4px] bg-[#FEF7EC] border border-[#FBE6C2]">
                  LOWEST UNIT COST
                </span>
              </div>

              <div className="text-3xl font-black text-[#0F2747] tracking-tight my-2">
                ${twinData.plan_c.expected_freight_rate.toFixed(2)}
                <span className="text-xs font-normal text-[#68717D] ml-1">/ MT</span>
              </div>
              <div className="text-xs font-bold text-[#0F2747] mb-4">{twinData.plan_c.contract_strategy}</div>

              <div className="space-y-2 text-xs text-[#172033] border-t border-[#E4E2DC] pt-3">
                <div className="flex justify-between">
                  <span className="text-[#68717D]">Vessel:</span>
                  <span className="font-bold text-[#0F2747]">{twinData.plan_c.vessel_class}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#68717D]">Booking Window:</span>
                  <span className="font-bold text-[#D98A27]">{twinData.plan_c.booking_window}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#68717D]">Est. Idle Days:</span>
                  <span className="font-bold text-[#0F2747]">{twinData.plan_c.expected_idle_days} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#68717D]">Risk Rating:</span>
                  <span className="font-bold text-[#D98A27]">{twinData.plan_c.risk_level} ({twinData.plan_c.risk_score}/100)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#68717D]">Total Logistics Cost:</span>
                  <span className="font-mono font-black text-[#0F2747]">${twinData.plan_c.estimated_logistics_cost_usd.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-xs text-[#68717D] mt-4 leading-relaxed line-clamp-3">
                {twinData.plan_c.rationale}
              </p>
            </div>
          </div>

          {/* Active Selected Plan Detailed Deep-Dive */}
          {activePlan && (
            <div className="p-6 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E4E2DC]">
                <div>
                  <span className="text-[11px] font-black text-[#D6A63B] uppercase tracking-widest">
                    Selected Execution Strategy
                  </span>
                  <h3 className="text-xl font-black text-[#0F2747] mt-0.5">
                    {activePlan.plan_code}: {activePlan.plan_label} — {activePlan.vessel_class} ({activePlan.contract_strategy})
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSaveDecision(activePlan)}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#F8F7F3] text-[#0F2747] text-xs font-bold rounded-[8px] border border-[#E4E2DC] shadow-sm transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-[#D6A63B]" />
                    <span>{saveSuccess ? 'Decision Saved!' : saving ? 'Saving...' : 'Save Decision'}</span>
                  </button>

                  <button
                    onClick={() => navigate('/reports')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#D6A63B] hover:bg-[#c49530] text-[#0F2747] text-xs font-black uppercase tracking-wider rounded-[8px] shadow-sm transition-all cursor-pointer"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Generate PDF Report</span>
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#0F2747] mb-2.5">
                    Operational Feasibility & Port Constraints
                  </h4>
                  <div className="p-4 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC] space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#68717D]">Target Berth:</span>
                      <span className="font-bold text-[#0F2747]">{activePlan.compatible_berth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#68717D]">Berth Compatibility:</span>
                      <span className="font-bold text-[#2F7D4B]">{activePlan.port_compatibility}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#68717D]">Freight Variance Range:</span>
                      <span className="font-mono font-bold text-[#0F2747]">{activePlan.freight_range}</span>
                    </div>
                  </div>

                  <h4 className="text-xs font-black uppercase tracking-wider text-[#0F2747] mt-5 mb-2.5">
                    Why Was This Plan Selected?
                  </h4>
                  <div className="p-4 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC] text-xs text-[#172033] leading-relaxed">
                    {activePlan.rationale}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#0F2747] mb-2.5">
                    Trade-Offs & Risk Considerations
                  </h4>
                  <ul className="space-y-2">
                    {activePlan.tradeoffs.map((t, idx) => (
                      <li key={idx} className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC] text-xs text-[#172033] flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#2F7D4B] shrink-0 mt-0.5" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 p-3.5 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC] text-xs text-[#68717D] flex items-center justify-between">
                    <span>Stochastic Simulation Run ID:</span>
                    <span className="font-mono text-[#0F2747] font-bold">{twinData.run_id}</span>
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
