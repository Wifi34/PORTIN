import React, { useState, useEffect } from 'react';
import {
  Sliders, RefreshCw, Save, Copy, CheckCircle2, ShieldAlert,
  Clock, DollarSign, ArrowRight, AlertTriangle
} from 'lucide-react';
import { apiClient } from '../api/client';
import { DataProvenanceBadge } from '../components/common/DataProvenanceBadge';

export const ScenarioLabPage: React.FC = () => {
  // Scenario inputs
  const [cargoMt, setCargoMt] = useState(70000);
  const [freightDelta, setFreightDelta] = useState(0); // -30 to +30%
  const [bunkerDelta, setBunkerDelta] = useState(0); // -30 to +30%
  const [congestionDelta, setCongestionDelta] = useState(0); // -5 to +10 days
  const [weatherFactor, setWeatherFactor] = useState(1.0); // 0.5 to 2.0
  const [draftRestriction, setDraftRestriction] = useState(0.0); // 0 to -3.0m
  const [vessel, setVessel] = useState('Panamax');
  const [contractType, setContractType] = useState('Short-Term Multi-Voyage (3 Voyages)');

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [scenarioName, setScenarioName] = useState('Pre-Monsoon Delay & Bunker Spike');

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post('/scenarios/run', {
        base_cargo_mt: Number(cargoMt),
        freight_delta_pct: Number(freightDelta),
        bunker_delta_pct: Number(bunkerDelta),
        congestion_delta_days: Number(congestionDelta),
        weather_risk_factor: Number(weatherFactor),
        draft_restriction_m: Number(draftRestriction),
        selected_vessel: vessel,
        contract_type: contractType,
      });
      setResult(res.data);
    } catch (e) {
      console.error('Simulation failed', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [freightDelta, bunkerDelta, congestionDelta, weatherFactor, draftRestriction, vessel, contractType]);

  const handleReset = () => {
    setFreightDelta(0);
    setBunkerDelta(0);
    setCongestionDelta(0);
    setWeatherFactor(1.0);
    setDraftRestriction(0.0);
    setVessel('Panamax');
    setContractType('Short-Term Multi-Voyage (3 Voyages)');
  };

  const handleSave = async () => {
    try {
      await apiClient.post('/scenarios/save', {
        name: scenarioName,
        description: `Freight ${freightDelta}%, Bunker ${bunkerDelta}%, Delay ${congestionDelta}d`,
        parameters: {
          cargoMt, freightDelta, bunkerDelta, congestionDelta, weatherFactor, draftRestriction, vessel, contractType
        },
        results: result
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e) {
      console.error('Failed to save scenario', e);
    }
  };

  const handleDuplicate = () => {
    setScenarioName(`${scenarioName} (Copy)`);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D6A63B]">
              Interactive What-If Simulation
            </span>
            <DataProvenanceBadge sourceType="SIMULATED DEMO" sourceName="Real-Time Sensitivity Engine" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F2747] tracking-tight">
            Scenario Lab & Sensitivity Engine
          </h2>
          <p className="text-xs text-[#68717D] mt-0.5 font-medium">
            Adjust market shocks, bunker fluctuations, weather delays, and tidal draft restrictions to evaluate operational impact.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="px-3.5 py-2 rounded-[8px] bg-[#F8F7F3] hover:bg-[#E4E2DC] border border-[#E4E2DC] text-xs font-bold text-[#0F2747] transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleDuplicate}
            className="px-3.5 py-2 rounded-[8px] bg-[#F8F7F3] hover:bg-[#E4E2DC] border border-[#E4E2DC] text-xs font-bold text-[#0F2747] transition-colors flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5 text-[#D6A63B]" />
            <span>Duplicate</span>
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-[8px] text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            style={{
              backgroundColor: '#D6A63B',
              color: '#0F2747',
            }}
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saveSuccess ? 'Saved!' : 'Save Scenario'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Sliders Controls (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#E4E2DC] rounded-[10px] p-5 shadow-[0_1px_3px_rgba(15,39,71,0.04)] space-y-4">
          <div className="pb-3 border-b border-[#E4E2DC] flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F2747]">Stress Testing Levers</span>
            <Sliders className="w-4 h-4 text-[#D6A63B]" />
          </div>

          <div className="space-y-4 text-xs">
            {/* Freight Rate Shift */}
            <div>
              <div className="flex justify-between text-[#172033] font-bold mb-1">
                <span>Spot Freight Rate Shift:</span>
                <span className={`font-mono font-black ${freightDelta > 0 ? 'text-[#C64A3B]' : freightDelta < 0 ? 'text-[#2F7D4B]' : 'text-[#0F2747]'}`}>
                  {freightDelta > 0 ? `+${freightDelta}%` : `${freightDelta}%`}
                </span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                step="5"
                value={freightDelta}
                onChange={(e) => setFreightDelta(Number(e.target.value))}
                className="w-full accent-[#D6A63B]"
              />
            </div>

            {/* Bunker Price Shift */}
            <div>
              <div className="flex justify-between text-[#172033] font-bold mb-1">
                <span>VLSFO Bunker Fuel Price Shift:</span>
                <span className={`font-mono font-black ${bunkerDelta > 0 ? 'text-[#C64A3B]' : bunkerDelta < 0 ? 'text-[#2F7D4B]' : 'text-[#0F2747]'}`}>
                  {bunkerDelta > 0 ? `+${bunkerDelta}%` : `${bunkerDelta}%`}
                </span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                step="5"
                value={bunkerDelta}
                onChange={(e) => setBunkerDelta(Number(e.target.value))}
                className="w-full accent-[#D6A63B]"
              />
            </div>

            {/* Port Anchorage Delay */}
            <div>
              <div className="flex justify-between text-[#172033] font-bold mb-1">
                <span>Anchorage Congestion Delay:</span>
                <span className="font-mono font-black text-[#D98A27]">
                  {congestionDelta > 0 ? `+${congestionDelta} Days` : `${congestionDelta} Days`}
                </span>
              </div>
              <input
                type="range"
                min="-2"
                max="10"
                step="1"
                value={congestionDelta}
                onChange={(e) => setCongestionDelta(Number(e.target.value))}
                className="w-full accent-[#D6A63B]"
              />
            </div>

            {/* Weather Risk Factor */}
            <div>
              <div className="flex justify-between text-[#172033] font-bold mb-1">
                <span>Bay of Bengal Wave/Weather Factor:</span>
                <span className="font-mono font-black text-[#0F2747]">{weatherFactor}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.25"
                value={weatherFactor}
                onChange={(e) => setWeatherFactor(Number(e.target.value))}
                className="w-full accent-[#D6A63B]"
              />
            </div>

            {/* Tidal / Draft Restriction */}
            <div>
              <div className="flex justify-between text-[#172033] font-bold mb-1">
                <span>Berth Permissible Draft Reduction:</span>
                <span className="font-mono font-black text-[#C64A3B]">{draftRestriction} m</span>
              </div>
              <input
                type="range"
                min="-3.0"
                max="0.0"
                step="0.5"
                value={draftRestriction}
                onChange={(e) => setDraftRestriction(Number(e.target.value))}
                className="w-full accent-[#D6A63B]"
              />
            </div>

            {/* Vessel Category Dropdown */}
            <div>
              <label className="block text-[#172033] font-bold mb-1">Tested Vessel Category</label>
              <select
                value={vessel}
                onChange={(e) => setVessel(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-[#172033] font-medium focus:bg-white focus:border-[#D6A63B] transition-colors"
              >
                <option value="Panamax">Panamax (Typical Draft 14.2m)</option>
                <option value="Supramax">Supramax (Typical Draft 12.8m)</option>
                <option value="Capesize">Capesize (Typical Draft 18.2m)</option>
                <option value="Handysize">Handysize (Typical Draft 10.2m)</option>
              </select>
            </div>

            {/* Contract Type Dropdown */}
            <div>
              <label className="block text-[#172033] font-bold mb-1">Contract Strategy</label>
              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-[#172033] font-medium focus:bg-white focus:border-[#D6A63B] transition-colors"
              >
                <option value="Single Spot Charter">Single Spot Charter (High Volatility)</option>
                <option value="Short-Term Multi-Voyage (3 Voyages)">Short-Term Multi-Voyage (3 Voyages)</option>
                <option value="Medium-Term Multi-Voyage (6 Voyages)">Medium-Term Multi-Voyage (6 Voyages)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right: Real-Time Dynamic Impact Analytics (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {result && (
            <>
              {/* Verdict Banner */}
              <div className="p-4 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)]">
                <span className="text-[10px] font-black uppercase text-[#D6A63B] tracking-wider block">Dynamic Scenario Verdict</span>
                <div className="text-base font-black text-[#0F2747] mt-1">{result.scenario_verdict}</div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)]">
                  <span className="text-[10px] font-bold text-[#68717D] uppercase block">Adjusted Freight</span>
                  <div className="text-xl font-black text-[#0F2747] font-mono mt-1">
                    ${result.adjusted_unit_freight.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-[#68717D] block mt-0.5">USD / MT</span>
                </div>

                <div className="p-4 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)]">
                  <span className="text-[10px] font-bold text-[#68717D] uppercase block">Demurrage Loss</span>
                  <div className="text-xl font-black text-[#C64A3B] font-mono mt-1">
                    ${result.demurrage_cost_usd.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-[#68717D] block mt-0.5">{result.estimated_idle_days} Idle Days</span>
                </div>

                <div className="p-4 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)]">
                  <span className="text-[10px] font-bold text-[#68717D] uppercase block">Total Cost</span>
                  <div className="text-xl font-black text-[#0F2747] font-mono mt-1">
                    ${result.total_logistics_cost_usd.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-[#68717D] block mt-0.5">Freight + Demurrage</span>
                </div>

                <div className="p-4 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)]">
                  <span className="text-[10px] font-bold text-[#68717D] uppercase block">Operational Risk</span>
                  <div className={`text-xl font-black font-mono mt-1 ${result.risk_evaluation.risk_color === 'red' ? 'text-[#C64A3B]' : result.risk_evaluation.risk_color === 'amber' ? 'text-[#D98A27]' : 'text-[#2F7D4B]'}`}>
                    {result.risk_evaluation.risk_score} / 100
                  </div>
                  <span className="text-[10px] text-[#68717D] block mt-0.5">{result.risk_evaluation.risk_category}</span>
                </div>
              </div>

              {/* Compatibility & Draft Clearance */}
              <div className="p-6 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E4E2DC]">
                  <h3 className="text-xs font-bold text-[#0F2747] uppercase tracking-wider">
                    Physical Draft & Berth Clearance Under Restriction
                  </h3>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-[6px] border ${
                    result.is_port_compatible
                      ? 'bg-[#F3FAF7] text-[#2F7D4B] border-[#BCF0DA]'
                      : 'bg-[#FDF2F2] text-[#C64A3B] border-[#F8B4B4]'
                  }`}>
                    {result.is_port_compatible ? 'FEASIBLE' : 'INFEASIBLE (Draft Violation)'}
                  </span>
                </div>

                <div className="p-3.5 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC] text-xs text-[#172033] font-medium leading-relaxed">
                  Under the simulated draft adjustment ({draftRestriction}m), effective permissible draft is {14.5 + draftRestriction}m.
                  The tested {vessel} requires {vessel === 'Panamax' ? '14.2m' : vessel === 'Capesize' ? '18.2m' : '12.8m'}.
                  Resulting draft margin: <span className="font-mono font-black text-[#0F2747]">{result.draft_margin_m} meters</span>.
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
