import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Ship, Calendar, MapPin, Layers, CheckCircle2,
  AlertCircle, ArrowRight, Save, ShieldCheck, BarChart3, HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">ML Freight Rate Forecaster</span>
            <DataProvenanceBadge sourceType="SIMULATED DEMO" sourceName="HistGradientBoosting Quantile Model" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Predictive Freight Curve & Market Entry Timing
          </h1>
        </div>

        {forecast && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveDecision}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4 text-cyan-400" />
              <span>{saveSuccess ? 'Analysis Saved!' : saving ? 'Saving...' : 'Save Analysis'}</span>
            </button>
            <button
              onClick={() => navigate('/decision-twin')}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Send to Decision Twin</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Chartering Analysis Parameters */}
        <div className="bg-[#081426] border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
            <Ship className="w-4 h-4 text-cyan-400" />
            <span>Procurement Parameters</span>
          </h2>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Commodity Cargo Type</label>
              <select
                value={cargoType}
                onChange={(e) => setCargoType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-cyan-400"
              >
                <option value="Coking Coal">Coking Coal (Metallurgical)</option>
                <option value="Thermal Coal">Thermal Coal (Steam Power)</option>
                <option value="Iron Ore">Iron Ore (Lumps / Fines)</option>
                <option value="Limestone">Limestone (Flux)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Cargo Parcel (MT)</label>
                <input
                  type="number"
                  value={cargoMt}
                  onChange={(e) => setCargoMt(Number(e.target.value))}
                  step="5000"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Number of Voyages</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={numVoyages}
                  onChange={(e) => setNumVoyages(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Origin Country</label>
                <select
                  value={originCountry}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-cyan-400"
                >
                  <option value="Australia">Australia</option>
                  <option value="Indonesia">Indonesia</option>
                  <option value="Mozambique">Mozambique</option>
                  <option value="Russia">Russia</option>
                  <option value="USA">USA</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Origin Loading Port</label>
                <select
                  value={originPort}
                  onChange={(e) => setOriginPort(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-cyan-400"
                >
                  {(originPortOptions[originCountry] || []).map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">East Coast Destination Port</label>
              <select
                value={destinationPort}
                onChange={(e) => setDestinationPort(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-cyan-400"
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
                <label className="block text-slate-300 font-semibold mb-1">Shipment Laycan Date</label>
                <input
                  type="date"
                  value={desiredDate}
                  onChange={(e) => setDesiredDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Vessel Category</label>
                <select
                  value={vesselClass}
                  onChange={(e) => setVesselClass(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-cyan-400"
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
                <label className="block text-slate-300 font-semibold mb-1">Contract Horizon</label>
                <select
                  value={contractMonths}
                  onChange={(e) => setContractMonths(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-cyan-400"
                >
                  <option value="3">3 Months (Short-Term)</option>
                  <option value="6">6 Months (Medium-Term)</option>
                  <option value="12">12 Months (Annual COA)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Forecast Horizon</label>
                <select
                  value={horizonDays}
                  onChange={(e) => setHorizonDays(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-cyan-400"
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
              className="w-full py-3 bg-gradient-to-r from-cyan-400 to-light-cyan hover:from-cyan-300 hover:to-cyan-200 text-black font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? 'Executing ML Inference...' : 'Generate Predictive Forecast'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Area: Forecast Results, Multi-Horizon Milestones & Charts */}
        <div className="lg:col-span-2 space-y-5">
          {forecast && (
            <>
              {/* Top Prediction Milestones Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-[#081426] border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Current Reference</span>
                  <div className="text-xl font-black text-white mt-1">${forecast.current_reference_rate.toFixed(2)}</div>
                  <span className="text-[10px] text-slate-400">USD / Metric Ton</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#081426] border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">7-Day Forward</span>
                  <div className="text-xl font-black text-cyan-300 mt-1">${forecast.day_7_prediction.toFixed(2)}</div>
                  <span className="text-[10px] text-slate-400">USD / Metric Ton</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#081426] border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">30-Day Forward</span>
                  <div className="text-xl font-black text-amber-300 mt-1">${forecast.day_30_prediction.toFixed(2)}</div>
                  <span className="text-[10px] text-rose-400 font-semibold">
                    {forecast.trend_pct > 0 ? `+${forecast.trend_pct}%` : `${forecast.trend_pct}%`}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#081426] border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">90-Day Forward</span>
                  <div className="text-xl font-black text-white mt-1">${forecast.day_90_prediction.toFixed(2)}</div>
                  <span className="text-[10px] text-slate-400">USD / Metric Ton</span>
                </div>
              </div>

              {/* Main 90-Day Forecast Visual with Shaded Quantiles */}
              <div className="p-5 rounded-2xl bg-[#081426] border border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-base font-bold text-white">90-Day Forecast Curve with Quantile Confidence Intervals</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Target: USD/MT freight for {cargoType} on {originPort} &rarr; {destinationPort}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] px-2 py-0.5 rounded font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                      MAE: {forecast.model_metadata.mae} $/MT
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded font-bold bg-slate-900 text-slate-300 border border-slate-700">
                      MAPE: {forecast.model_metadata.mape}%
                    </span>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecast.forecast_curve} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="forecastBand" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00B8D9" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#00B8D9" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="date" stroke="#64748B" fontSize={10} tickFormatter={(v) => v.slice(5)} />
                      <YAxis stroke="#64748B" fontSize={10} domain={['dataMin - 1', 'dataMax + 1']} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#081426', borderColor: '#00B8D9', borderRadius: '8px', fontSize: '11px' }}
                        formatter={(val: any, name: any) => [`$${Number(val).toFixed(2)}/MT`, name === 'predicted_rate' ? 'Predicted Rate' : name === 'upper_bound' ? '90% Upper Bound' : '10% Lower Bound']}
                      />
                      <Area type="monotone" dataKey="upper_bound" stroke="none" fill="url(#forecastBand)" fillOpacity={1} />
                      <Area type="monotone" dataKey="lower_bound" stroke="none" fill="#081426" fillOpacity={1} />
                      <Area type="monotone" dataKey="predicted_rate" stroke="#00B8D9" strokeWidth={2.5} fill="none" dot={{ r: 3, fill: '#62E5F2' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Explainable Decision Rationale & Feature Importance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#081426] border border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Explainable Market Recommendation</span>
                  </h4>
                  <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    {forecast.explanation}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Market Signal:</span>
                    <span className="font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30">
                      {forecast.market_signal}
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#081426] border border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4" />
                    <span>Key Driver Feature Weights</span>
                  </h4>
                  <div className="space-y-2">
                    {forecast.feature_importance.map((f, i) => (
                      <div key={i} className="text-xs">
                        <div className="flex justify-between text-slate-300 mb-0.5 text-[11px]">
                          <span>{f.feature}</span>
                          <span className="font-mono text-cyan-400 font-bold">{(f.importance * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${f.importance * 100}%` }}></div>
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
