import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Ship, Calendar, MapPin, Layers, CheckCircle2,
  AlertCircle, ArrowRight, Save, ShieldCheck, BarChart3, HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { apiClient } from '../api/client';
import { DataProvenanceBadge } from '../components/common/DataProvenanceBadge';
import { ForecastResponse } from '../types';

export const FreightForecastPage: React.FC = () => {
  const navigate = useNavigate();

  // Form State
  const [cargoType, setCargoType] = useState('Coking Coal');
  const [cargoMt, setCargoMt] = useState(70000);
  const [originCountry, setOriginCountry] = useState('Australia');
  const [originPort, setOriginPort] = useState('Gladstone');
  const [destinationPort, setDestinationPort] = useState('Paradip');
  const [desiredDate, setDesiredDate] = useState('2026-09-20');
  const [vesselClass, setVesselClass] = useState('AUTO');
  const [contractMonths, setContractMonths] = useState(3);
  const [numVoyages, setNumVoyages] = useState(3);
  const [horizonDays, setHorizonDays] = useState(90);

  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Dynamic origin ports based on origin country
  const originPortOptions: Record<string, string[]> = {
    Australia: ['Gladstone', 'Hay Point', 'Newcastle', 'Dalrymple Bay'],
    Indonesia: ['Balikpapan', 'Samarinda', 'Banjarmasin'],
    Mozambique: ['Maputo', 'Beira', 'Nacala'],
    Russia: ['Ust-Luga', 'Vostochny', 'Taman'],
    USA: ['Hampton Roads', 'Baltimore', 'New Orleans'],
  };

  const handleCountryChange = (c: string) => {
    setOriginCountry(c);
    if (originPortOptions[c] && originPortOptions[c].length > 0) {
      setOriginPort(originPortOptions[c][0]);
    }
  };

  const runAnalysis = async () => {
    setLoading(true);
    setSaveSuccess(false);
    try {
      const res = await apiClient.post('/forecasts/run', {
        cargo_type: cargoType,
        cargo_mt: Number(cargoMt),
        origin_country: originCountry,
        origin_port: originPort,
        destination_port: destinationPort,
        desired_shipment_date: desiredDate,
        vessel_class: vesselClass,
        contract_duration_months: Number(contractMonths),
        num_voyages: Number(numVoyages),
        planning_horizon_days: Number(horizonDays),
      });
      setForecast(res.data);
    } catch (err) {
      console.error('Forecast failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, []);

  const handleSaveDecision = async () => {
    if (!forecast) return;
    setSaving(true);
    try {
      await apiClient.post('/decisions', {
        title: `${cargoMt.toLocaleString()} MT ${cargoType}: ${originPort} -> ${destinationPort}`,
        cargo_type: cargoType,
        cargo_mt: Number(cargoMt),
        origin_country: originCountry,
        origin_port: originPort,
        destination_port: destinationPort,
        shipment_date: desiredDate,
        contract_type: `Short-Term Multi-Voyage (${numVoyages} Voyages)`,
        num_voyages: Number(numVoyages),
        planning_horizon_days: Number(horizonDays),
        market_signal: forecast.market_signal,
        recommended_vessel: vesselClass === 'AUTO' ? 'Panamax' : vesselClass,
        optimal_window: forecast.optimal_booking_window,
        risk_score: 24.5,
        estimated_total_cost_usd: forecast.current_reference_rate * cargoMt * numVoyages,
        results_json: forecast,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to save decision', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D6A63B]">
              ML Freight Rate Forecaster
            </span>
            <DataProvenanceBadge sourceType="SIMULATED DEMO" sourceName="HistGradientBoosting Quantile Model" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F2747] tracking-tight">
            Predictive Freight Curve & Market Entry Timing
          </h2>
          <p className="text-xs text-[#68717D] mt-0.5 font-medium">
            Calibrated for SAIL bulk raw material procurement lanes to India's East Coast ports.
          </p>
        </div>

        {forecast && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleSaveDecision}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#F8F7F3] hover:bg-[#E4E2DC] text-[#0F2747] text-xs font-bold rounded-[8px] border border-[#E4E2DC] transition-all cursor-pointer"
            >
              <Save className="w-4 h-4 text-[#D6A63B]" />
              <span>{saveSuccess ? 'Analysis Saved!' : saving ? 'Saving...' : 'Save Analysis'}</span>
            </button>
            <button
              onClick={() => navigate('/decision-twin')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-[8px] text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
              style={{
                backgroundColor: '#D6A63B',
                color: '#0F2747',
              }}
            >
              <Layers className="w-4 h-4" />
              <span>Send to Decision Twin</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Procurement Parameters (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-[#E4E2DC] rounded-[10px] p-5 shadow-[0_1px_3px_rgba(15,39,71,0.04)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E2DC]">
            <h3 className="text-xs font-bold text-[#0F2747] uppercase tracking-wider flex items-center gap-2">
              <Ship className="w-4 h-4 text-[#D6A63B]" />
              <span>Procurement Parameters</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F8F7F3] text-[#68717D] border border-[#E4E2DC]">
              CONFIG
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[#172033] font-bold mb-1">Commodity Cargo Type</label>
              <select
                value={cargoType}
                onChange={(e) => setCargoType(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-[#172033] font-medium focus:bg-white focus:border-[#D6A63B] transition-colors"
              >
                <option value="Coking Coal">Coking Coal (Metallurgical)</option>
                <option value="Thermal Coal">Thermal Coal (Steam Power)</option>
                <option value="Iron Ore">Iron Ore (Lumps / Fines)</option>
                <option value="Limestone">Limestone (Flux)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#172033] font-bold mb-1">Cargo Parcel (MT)</label>
                <input
                  type="number"
                  value={cargoMt}
                  onChange={(e) => setCargoMt(Number(e.target.value))}
                  step="5000"
                  className="w-full px-3 py-2 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-[#172033] font-medium focus:bg-white focus:border-[#D6A63B] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[#172033] font-bold mb-1">Number of Voyages</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={numVoyages}
                  onChange={(e) => setNumVoyages(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-[#172033] font-medium focus:bg-white focus:border-[#D6A63B] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#172033] font-bold mb-1">Origin Country</label>
                <select
                  value={originCountry}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-[#172033] font-medium focus:bg-white focus:border-[#D6A63B] transition-colors"
                >
                  <option value="Australia">Australia</option>
                  <option value="Indonesia">Indonesia</option>
                  <option value="Mozambique">Mozambique</option>
                  <option value="Russia">Russia</option>
                  <option value="USA">USA</option>
                </select>
              </div>

              <div>
                <label className="block text-[#172033] font-bold mb-1">Origin Port</label>
                <select
                  value={originPort}
                  onChange={(e) => setOriginPort(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-[#172033] font-medium focus:bg-white focus:border-[#D6A63B] transition-colors"
                >
                  {(originPortOptions[originCountry] || []).map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[#172033] font-bold mb-1">East Coast Destination Port</label>
              <select
                value={destinationPort}
                onChange={(e) => setDestinationPort(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-[#172033] font-medium focus:bg-white focus:border-[#D6A63B] transition-colors"
              >
                <option value="Paradip">Paradip (Odisha) • Max Draft 14.5m</option>
                <option value="Visakhapatnam">Visakhapatnam (AP) • Max Draft 18.1m</option>
                <option value="Gangavaram">Gangavaram (AP) • Max Draft 21.0m</option>
                <option value="Dhamra">Dhamra (Odisha) • Max Draft 18.0m</option>
                <option value="Gopalpur">Gopalpur (Odisha) • Max Draft 13.0m</option>
                <option value="Sagar/Sandheads">Sagar / Sandheads • Transshipment</option>
                <option value="Haldia">Haldia (WB) • Lock Draft 8.5m</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#172033] font-bold mb-1">Laycan Date</label>
                <input
                  type="date"
                  value={desiredDate}
                  onChange={(e) => setDesiredDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-[#172033] font-medium focus:bg-white focus:border-[#D6A63B] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[#172033] font-bold mb-1">Vessel Category</label>
                <select
                  value={vesselClass}
                  onChange={(e) => setVesselClass(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-[#172033] font-medium focus:bg-white focus:border-[#D6A63B] transition-colors"
                >
                  <option value="AUTO">AUTO (Optimal Selection)</option>
                  <option value="Panamax">Panamax (65k–85k DWT)</option>
                  <option value="Supramax">Supramax (50k–64k DWT)</option>
                  <option value="Capesize">Capesize (120k–200k DWT)</option>
                  <option value="Handysize">Handysize (28k–39k DWT)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#172033] font-bold mb-1">Contract Horizon</label>
                <select
                  value={contractMonths}
                  onChange={(e) => setContractMonths(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-[#172033] font-medium focus:bg-white focus:border-[#D6A63B] transition-colors"
                >
                  <option value="3">3 Months (Short-Term)</option>
                  <option value="6">6 Months (Medium-Term)</option>
                  <option value="12">12 Months (Annual COA)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#172033] font-bold mb-1">Forecast Horizon</label>
                <select
                  value={horizonDays}
                  onChange={(e) => setHorizonDays(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#F8F7F3] border border-[#E4E2DC] rounded-[8px] text-[#172033] font-medium focus:bg-white focus:border-[#D6A63B] transition-colors"
                >
                  <option value="30">30 Days</option>
                  <option value="60">60 Days</option>
                  <option value="90">90 Days</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={runAnalysis}
              disabled={loading}
              className="w-full py-3 rounded-[8px] text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 shadow-sm"
              style={{
                backgroundColor: '#D6A63B',
                color: '#0F2747',
              }}
            >
              {loading ? 'Executing ML Inference...' : 'Generate Predictive Forecast'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Area: Forecast Results, Multi-Horizon Milestones & Charts (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {forecast && (
            <>
              {/* Top Prediction Milestones Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)]">
                  <span className="text-[10px] uppercase font-bold text-[#68717D] tracking-wider block">Current Reference</span>
                  <div className="text-2xl font-black text-[#0F2747] font-mono mt-1">${forecast.current_reference_rate.toFixed(2)}</div>
                  <span className="text-[10px] text-[#68717D] mt-0.5 block">USD / Metric Ton</span>
                </div>

                <div className="p-4 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)]">
                  <span className="text-[10px] uppercase font-bold text-[#68717D] tracking-wider block">7-Day Forward</span>
                  <div className="text-2xl font-black text-[#0F2747] font-mono mt-1">${forecast.day_7_prediction.toFixed(2)}</div>
                  <span className="text-[10px] text-[#68717D] mt-0.5 block">USD / Metric Ton</span>
                </div>

                <div className="p-4 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)]">
                  <span className="text-[10px] uppercase font-bold text-[#68717D] tracking-wider block">30-Day Forward</span>
                  <div className="text-2xl font-black text-[#0F2747] font-mono mt-1">${forecast.day_30_prediction.toFixed(2)}</div>
                  <span className={`text-[10px] font-bold mt-0.5 block ${forecast.trend_pct > 0 ? 'text-[#C64A3B]' : 'text-[#2F7D4B]'}`}>
                    {forecast.trend_pct > 0 ? `+${forecast.trend_pct}%` : `${forecast.trend_pct}%`} vs current
                  </span>
                </div>

                <div className="p-4 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)]">
                  <span className="text-[10px] uppercase font-bold text-[#68717D] tracking-wider block">90-Day Forward</span>
                  <div className="text-2xl font-black text-[#0F2747] font-mono mt-1">${forecast.day_90_prediction.toFixed(2)}</div>
                  <span className="text-[10px] text-[#68717D] mt-0.5 block">USD / Metric Ton</span>
                </div>
              </div>

              {/* Main 90-Day Forecast Visual with Shaded Quantiles */}
              <div className="p-6 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E4E2DC]">
                  <div>
                    <h3 className="text-base font-black text-[#0F2747]">
                      90-Day Forecast Curve with Quantile Confidence Intervals
                    </h3>
                    <p className="text-xs text-[#68717D] font-medium mt-0.5">
                      Target: USD/MT freight for {cargoType} on {originPort} &rarr; {destinationPort}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] px-2 py-0.5 rounded font-bold bg-[#F8F7F3] text-[#0F2747] border border-[#E4E2DC]">
                      MAE: {forecast.model_metadata.mae} $/MT
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded font-bold bg-[#F8F7F3] text-[#0F2747] border border-[#E4E2DC]">
                      MAPE: {forecast.model_metadata.mape}%
                    </span>
                  </div>
                </div>

                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecast.forecast_curve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="forecastConfidenceBand" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D0D9E5" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="#E4EBF2" stopOpacity={0.2} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E4E2DC" vertical={false} />
                      <XAxis dataKey="date" stroke="#68717D" fontSize={10} tickFormatter={(v) => v.slice(5)} />
                      <YAxis stroke="#68717D" fontSize={10} domain={['dataMin - 1', 'dataMax + 1']} tickFormatter={(v) => `$${v}`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E4E2DC',
                          borderRadius: '8px',
                          fontSize: '11px',
                          color: '#172033',
                          boxShadow: '0 4px 12px rgba(15, 39, 71, 0.08)',
                        }}
                        formatter={(val: any, name: any) => [
                          `$${Number(val).toFixed(2)}/MT`,
                          name === 'predicted_rate' ? 'Predicted Rate' : name === 'upper_bound' ? '90% Upper Bound' : '10% Lower Bound'
                        ]}
                      />
                      <Area type="monotone" dataKey="upper_bound" stroke="none" fill="url(#forecastConfidenceBand)" fillOpacity={1} />
                      <Area type="monotone" dataKey="lower_bound" stroke="none" fill="#FFFFFF" fillOpacity={1} />
                      <Area
                        type="monotone"
                        dataKey="predicted_rate"
                        stroke="#0F2747"
                        strokeWidth={2.5}
                        strokeDasharray="4 4"
                        fill="none"
                        dot={{ r: 3, fill: '#D6A63B', stroke: '#0F2747', strokeWidth: 1.5 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-between text-xs text-[#68717D] pt-2 border-t border-[#E4E2DC]">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 font-semibold text-[#0F2747]">
                      <span className="w-3 h-0.5 bg-[#0F2747] border-dashed border-t"></span> Expected Rate (Navy Dashed)
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold text-[#68717D]">
                      <span className="w-3 h-2 bg-[#D0D9E5] rounded-xs"></span> 90% Confidence Interval
                    </span>
                  </div>
                </div>
              </div>

              {/* Explainable Decision Rationale & Feature Importance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E4E2DC]">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F2747] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-[#2F7D4B]" />
                      <span>Explainable Market Recommendation</span>
                    </h4>
                    <span className="font-bold text-xs px-2 py-0.5 rounded bg-[#F3FAF7] text-[#2F7D4B] border border-[#BCF0DA]">
                      {forecast.market_signal}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC] text-xs text-[#172033] font-medium leading-relaxed">
                    {forecast.explanation}
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#68717D] pt-1">
                    <span>Optimal Booking Window:</span>
                    <span className="font-black text-[#0F2747]">{forecast.optimal_booking_window}</span>
                  </div>
                </div>

                <div className="p-5 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E4E2DC]">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F2747] flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-[#D6A63B]" />
                      <span>Key Driver Feature Weights</span>
                    </h4>
                    <span className="text-[10px] text-[#68717D] font-semibold">Model Sensitivity</span>
                  </div>
                  <div className="space-y-2.5 pt-1">
                    {forecast.feature_importance.map((f, i) => (
                      <div key={i} className="text-xs">
                        <div className="flex justify-between text-[#172033] mb-1 text-[11px] font-medium">
                          <span>{f.feature}</span>
                          <span className="font-mono text-[#0F2747] font-bold">{(f.importance * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#F8F7F3] rounded-full overflow-hidden border border-[#E4E2DC]">
                          <div className="h-full bg-[#0F2747] rounded-full" style={{ width: `${f.importance * 100}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
