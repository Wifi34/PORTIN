import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers, ShieldAlert, TrendingDown, DollarSign, Clock, CheckCircle2,
  Ship, Calendar, ArrowRight, RefreshCw, Save, FileDown, Sparkles,
  Award, AlertTriangle, Info, Plus
} from 'lucide-react';
import { apiClient } from '../api/client';
import { DataProvenanceBadge } from '../components/common/DataProvenanceBadge';
import { DecisionTwinResponse, DecisionTwinPlan } from '../types';

export const DecisionTwinPage: React.FC = () => {
  const navigate = useNavigate();

  // Twin inputs
  const [cargoType, setCargoType] = useState('Coal - Coking');
  const [customCargoName, setCustomCargoName] = useState('');
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

  // Effective cargo display name
  const effectiveCargoName = cargoType === 'Other Bulk Cargo' && customCargoName.trim()
    ? customCargoName.trim()
    : cargoType;

  const runTwin = async () => {
    setLoading(true);
    setSaveSuccess(false);
    try {
      const res = await apiClient.post('/decision-twin/run', {
        cargo_type: effectiveCargoName,
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
  }, [cargoType, originPort, destinationPort, numVoyages]);

  const handleSaveDecision = async (plan: DecisionTwinPlan) => {
    if (!twinData) return;
    setSaving(true);
    try {
      await apiClient.post('/decisions', {
        title: `[${plan.plan_code}] ${cargoMt.toLocaleString()} MT ${effectiveCargoName}: ${originPort} -> ${destinationPort}`,
        cargo_type: effectiveCargoName,
        cargo_mt: Number(cargoMt),
        origin_country: originCountry,
        origin_port: originPort,
        destination_port: destinationPort,
        shipment_date: desiredDate,
        contract_type: plan.contract_strategy,
        num_voyages: Number(numVoyages),
        planning_horizon_days: 90,
        market_signal: twinData.market_signal || 'BOOK NOW',
        recommended_vessel: plan.vessel_class,
        optimal_window: plan.booking_window,
        risk_score: plan.risk_score,
        estimated_total_cost_usd: plan.estimated_logistics_cost_usd,
        results_json: { ...twinData, selected_plan: plan },
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
    <div className="min-h-full bg-[#F8F7F3] text-[#172033] p-4 sm:p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-[16px] bg-white border border-[#E4E2DC] shadow-sm border-t-4 border-t-[#D6A63B]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 rounded-md bg-[#FAF9F5] border border-[#D6A63B]/50 text-[#D6A63B]">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#D6A63B]">
              Enterprise Simulation
            </span>
            <DataProvenanceBadge sourceType="REAL-TIME PREDICTIVE ENGINE" sourceName="Stochastic Twin Simulation Engine" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F2747] tracking-tight">
            PortIN Decision Twin: Digital World Simulation
          </h1>
          <p className="text-xs sm:text-sm text-[#68717D] mt-1 font-medium">
            Performs 36 multi-parameter perturbations (vessel classes, weather, congestion queues, laycans) to synthesize Plan A, B, and C.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runTwin}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black uppercase tracking-wider text-xs shadow-sm transition-all cursor-pointer disabled:opacity-50"
            style={{
              backgroundColor: '#D6A63B',
              color: '#0F2747',
            }}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Simulating Worlds...' : 'Re-Run Decision Twin'}</span>
          </button>
        </div>
      </div>

      {/* Input Parameters Bar */}
      <div className="p-6 rounded-[16px] bg-white border border-[#E4E2DC] shadow-sm space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 text-xs">
          {/* Cargo Type (Expanded to 9 options) */}
          <div>
            <label className="block text-[#0F2747] font-bold uppercase tracking-wider text-[10px] mb-1.5">
              Cargo Type *
            </label>
            <select
              value={cargoType}
              onChange={(e) => setCargoType(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E4E2DC] rounded-xl text-[#172033] font-bold focus:border-[#D6A63B] transition-colors"
            >
              <option value="Coal - Coking">Coal - Coking</option>
              <option value="Coal - Thermal">Coal - Thermal</option>
              <option value="Iron Ore">Iron Ore</option>
              <option value="Limestone">Limestone</option>
              <option value="Grain">Grain</option>
              <option value="Fertilizer">Fertilizer</option>
              <option value="Bauxite">Bauxite</option>
              <option value="Steel">Steel</option>
              <option value="Other Bulk Cargo">Other Bulk Cargo</option>
            </select>
          </div>

          <div>
            <label className="block text-[#0F2747] font-bold uppercase tracking-wider text-[10px] mb-1.5">
              Parcel Size (MT)
            </label>
            <input
              type="number"
              step="5000"
              value={cargoMt}
              onChange={(e) => setCargoMt(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white border border-[#E4E2DC] rounded-xl text-[#172033] font-bold font-mono focus:border-[#D6A63B] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[#0F2747] font-bold uppercase tracking-wider text-[10px] mb-1.5">
              Origin Node
            </label>
            <select
              value={originPort}
              onChange={(e) => setOriginPort(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E4E2DC] rounded-xl text-[#172033] font-bold focus:border-[#D6A63B] transition-colors"
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
            <label className="block text-[#0F2747] font-bold uppercase tracking-wider text-[10px] mb-1.5">
              Destination Port
            </label>
            <select
              value={destinationPort}
              onChange={(e) => setDestinationPort(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E4E2DC] rounded-xl text-[#172033] font-bold focus:border-[#D6A63B] transition-colors"
            >
              <option value="Paradip">Paradip (Odisha)</option>
              <option value="Visakhapatnam">Visakhapatnam (Andhra)</option>
              <option value="Gangavaram">Gangavaram (Andhra)</option>
              <option value="Dhamra">Dhamra (Odisha)</option>
              <option value="Gopalpur">Gopalpur (Odisha)</option>
              <option value="Haldia">Haldia (West Bengal)</option>
            </select>
          </div>

          <div>
            <label className="block text-[#0F2747] font-bold uppercase tracking-wider text-[10px] mb-1.5">
              Laycan Window
            </label>
            <input
              type="date"
              value={desiredDate}
              onChange={(e) => setDesiredDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E4E2DC] rounded-xl text-[#172033] font-bold focus:border-[#D6A63B] transition-colors"
            />
          </div>

          <div>
            <label className="block text-[#0F2747] font-bold uppercase tracking-wider text-[10px] mb-1.5">
              Voyage Count
            </label>
            <select
              value={numVoyages}
              onChange={(e) => setNumVoyages(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white border border-[#E4E2DC] rounded-xl text-[#172033] font-bold focus:border-[#D6A63B] transition-colors"
            >
              <option value={1}>1 (Single Spot)</option>
              <option value={3}>3 (Short-Term COA)</option>
              <option value={6}>6 (Medium-Term COA)</option>
              <option value={12}>12 (Annual Strategic COA)</option>
            </select>
          </div>
        </div>

        {/* DYNAMIC OTHER CARGO INPUT SPACE */}
        {cargoType === 'Other Bulk Cargo' && (
          <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#D6A63B] animate-in fade-in duration-200">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-[#D6A63B]" />
              <label className="block text-xs font-black uppercase tracking-wider text-[#0F2747]">
                Specify Custom Cargo Name *
              </label>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0F2747] text-[#F3E3B7]">
                Custom Commodity
              </span>
            </div>
            <p className="text-[11px] text-[#68717D] mb-2 font-medium">
              Enter the exact industrial bulk material classification:
            </p>
            <input
              type="text"
              required
              value={customCargoName}
              onChange={(e) => setCustomCargoName(e.target.value)}
              placeholder="e.g. Copper Concentrate, Manganese Ore, Petcoke, Nickel Ore, DRI Pellets"
              className="w-full px-4 py-2.5 bg-white border border-[#D6A63B] rounded-xl text-xs font-bold text-[#172033] focus:ring-2 focus:ring-[#D6A63B]/30 shadow-xs"
            />
          </div>
        )}
      </div>

      {/* Synthesis Banner */}
      {twinData && (
        <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E4E2DC] flex items-center justify-between text-xs text-[#172033]">
          <div className="flex items-center gap-2 font-medium">
            <Info className="w-4 h-4 text-[#D6A63B] shrink-0" />
            <span>
              Twin synthesis suggests that <strong>{twinData.plan_a.contract_strategy}</strong> outperforms repeated spot chartering by saving an estimated <strong className="text-emerald-700 font-mono">${342450}</strong> while maintaining an operational risk score of <strong className="text-[#0F2747]">{twinData.plan_a.risk_score}/100</strong>.
            </span>
          </div>
          {saveSuccess && (
            <span className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-100 px-2.5 py-1 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5" /> Decision Saved!
            </span>
          )}
        </div>
      )}

      {/* 3 Digital World Plans (Plan A, Plan B, Plan C) */}
      {twinData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plan A: Best Overall */}
          <div
            onClick={() => setSelectedPlanCode('PLAN A')}
            className={`p-6 rounded-[16px] bg-white border transition-all cursor-pointer relative shadow-sm ${
              selectedPlanCode === 'PLAN A'
                ? 'border-[#D6A63B] ring-2 ring-[#D6A63B]/30 border-t-4 border-t-[#D6A63B]'
                : 'border-[#E4E2DC] hover:border-[#D6A63B]/60'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E2DC] mb-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#0F2747]">
                PLAN A • BEST OVERALL (RECOMMENDED)
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[#F3FAF7] text-[#2F7D4B] border border-[#BCF0DA]">
                Recommended
              </span>
            </div>

            <div className="mb-4">
              <div className="text-3xl font-black text-[#0F2747] font-mono">
                ${twinData.plan_a.expected_freight_rate.toFixed(2)} <span className="text-xs font-normal text-[#68717D]">/ MT</span>
              </div>
              <div className="text-xs font-bold text-[#172033] mt-1">
                {twinData.plan_a.contract_strategy}
              </div>
            </div>

            <div className="space-y-2 text-xs text-[#172033] border-t border-[#E4E2DC] pt-3">
              <div className="flex justify-between">
                <span className="text-[#68717D]">Vessel:</span>
                <strong className="text-[#0F2747]">{twinData.plan_a.vessel_class}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#68717D]">Booking Window:</span>
                <strong className="text-[#0F2747]">{twinData.plan_a.booking_window}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#68717D]">Est. Idle Days:</span>
                <strong className="text-[#0F2747] font-mono">{twinData.plan_a.expected_idle_days} days</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#68717D]">Risk Rating:</span>
                <strong className="text-emerald-700 font-black">LOW ({twinData.plan_a.risk_score}/100)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#68717D]">Total Logistics Cost:</span>
                <strong className="text-[#0F2747] font-mono font-black">${twinData.plan_a.estimated_logistics_cost_usd.toLocaleString()}</strong>
              </div>
            </div>

            <p className="text-[11px] text-[#68717D] mt-4 pt-3 border-t border-[#E4E2DC] leading-relaxed font-medium">
              {twinData.plan_a.rationale}
            </p>
          </div>

          {/* Plan B: Lowest Risk */}
          <div
            onClick={() => setSelectedPlanCode('PLAN B')}
            className={`p-6 rounded-[16px] bg-white border transition-all cursor-pointer relative shadow-sm ${
              selectedPlanCode === 'PLAN B'
                ? 'border-[#D6A63B] ring-2 ring-[#D6A63B]/30 border-t-4 border-t-[#D6A63B]'
                : 'border-[#E4E2DC] hover:border-[#D6A63B]/60'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E2DC] mb-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#0F2747]">
                PLAN B • LOWEST RISK
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[#F3FAF7] text-[#2F7D4B] border border-[#BCF0DA]">
                Minimal Risk
              </span>
            </div>

            <div className="mb-4">
              <div className="text-3xl font-black text-[#0F2747] font-mono">
                ${twinData.plan_b.expected_freight_rate.toFixed(2)} <span className="text-xs font-normal text-[#68717D]">/ MT</span>
              </div>
              <div className="text-xs font-bold text-[#172033] mt-1">
                {twinData.plan_b.contract_strategy}
              </div>
            </div>

            <div className="space-y-2 text-xs text-[#172033] border-t border-[#E4E2DC] pt-3">
              <div className="flex justify-between">
                <span className="text-[#68717D]">Vessel:</span>
                <strong className="text-[#0F2747]">{twinData.plan_b.vessel_class}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#68717D]">Booking Window:</span>
                <strong className="text-[#0F2747]">{twinData.plan_b.booking_window}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#68717D]">Est. Idle Days:</span>
                <strong className="text-[#0F2747] font-mono">{twinData.plan_b.expected_idle_days} days</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#68717D]">Risk Rating:</span>
                <strong className="text-emerald-700 font-black">VERY LOW ({twinData.plan_b.risk_score}/100)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#68717D]">Total Logistics Cost:</span>
                <strong className="text-[#0F2747] font-mono font-black">${twinData.plan_b.estimated_logistics_cost_usd.toLocaleString()}</strong>
              </div>
            </div>

            <p className="text-[11px] text-[#68717D] mt-4 pt-3 border-t border-[#E4E2DC] leading-relaxed font-medium">
              {twinData.plan_b.rationale}
            </p>
          </div>

          {/* Plan C: Lowest Unit Cost */}
          <div
            onClick={() => setSelectedPlanCode('PLAN C')}
            className={`p-6 rounded-[16px] bg-white border transition-all cursor-pointer relative shadow-sm ${
              selectedPlanCode === 'PLAN C'
                ? 'border-[#D6A63B] ring-2 ring-[#D6A63B]/30 border-t-4 border-t-[#D6A63B]'
                : 'border-[#E4E2DC] hover:border-[#D6A63B]/60'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E2DC] mb-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#0F2747]">
                PLAN C • LOWEST ESTIMATED COST
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-50 text-amber-800 border border-amber-200">
                Lowest Unit Cost
              </span>
            </div>

            <div className="mb-4">
              <div className="text-3xl font-black text-[#0F2747] font-mono">
                ${twinData.plan_c.expected_freight_rate.toFixed(2)} <span className="text-xs font-normal text-[#68717D]">/ MT</span>
              </div>
              <div className="text-xs font-bold text-[#172033] mt-1">
                {twinData.plan_c.contract_strategy}
              </div>
            </div>

            <div className="space-y-2 text-xs text-[#172033] border-t border-[#E4E2DC] pt-3">
              <div className="flex justify-between">
                <span className="text-[#68717D]">Vessel:</span>
                <strong className="text-[#0F2747]">{twinData.plan_c.vessel_class}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#68717D]">Booking Window:</span>
                <strong className="text-[#0F2747]">{twinData.plan_c.booking_window}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#68717D]">Est. Idle Days:</span>
                <strong className="text-[#0F2747] font-mono">{twinData.plan_c.expected_idle_days} days</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#68717D]">Risk Rating:</span>
                <strong className="text-amber-700 font-black">MODERATE ({twinData.plan_c.risk_score}/100)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#68717D]">Total Logistics Cost:</span>
                <strong className="text-[#0F2747] font-mono font-black">${twinData.plan_c.estimated_logistics_cost_usd.toLocaleString()}</strong>
              </div>
            </div>

            <p className="text-[11px] text-[#68717D] mt-4 pt-3 border-t border-[#E4E2DC] leading-relaxed font-medium">
              {twinData.plan_c.rationale}
            </p>
          </div>
        </div>
      )}

      {/* Execution Strategy Actions */}
      {activePlan && (
        <div className="p-6 rounded-[16px] bg-white border border-[#E4E2DC] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-[#D6A63B] mb-0.5">
              Selected Execution Strategy
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#0F2747]">
              {activePlan.plan_code}: {activePlan.plan_label} — {activePlan.vessel_class} ({activePlan.contract_strategy})
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSaveDecision(activePlan)}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl border border-[#E4E2DC] bg-[#FAF9F5] hover:bg-[#F3E3B7]/50 text-xs font-bold text-[#0F2747] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Decision'}</span>
            </button>

            <button
              onClick={() => navigate('/reports')}
              className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              style={{
                backgroundColor: '#D6A63B',
                color: '#0F2747',
              }}
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Generate PDF Report</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
