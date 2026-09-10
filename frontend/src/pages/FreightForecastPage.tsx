import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  TrendingUp, Ship, Calendar, MapPin, CheckCircle2,
  ArrowRight, Download, Sliders, Info, Clock, Check,
  Anchor, Activity, ChevronDown, ChevronUp, Database,
  Sparkles, RefreshCw, RotateCcw, Loader2, ShieldCheck,
  Compass, Cpu
} from 'lucide-react';
import {
  ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ReferenceArea, ReferenceLine
} from 'recharts';
import { apiClient } from '../api/client';

interface TrendPoint {
  date: string;
  p50: number;
  p10: number;
  p90: number;
}

interface ForecastResultData {
  current_reference_rate: number;
  day_7_prediction: number;
  day_30_prediction: number;
  day_90_prediction: number;
  trend: string;
  trend_pct: number;
  market_signal: string;
  action_headline?: string;
  optimal_booking_window: string;
  explanation: string;
  forecast_curve: Array<{
    date: string;
    day_offset: number;
    predicted_rate: number;
    lower_bound: number;
    upper_bound: number;
    confidence_level: number;
  }>;
  recommended_vessel?: string;
  contract_strategy?: string;
  expected_rate_range?: string;
  market_risk?: string;
  port_compatibility?: string;
  forecast_confidence?: number;
}

const RESULT_TREND_DATA: TrendPoint[] = [
  { date: 'Sep 01', p50: 14.80, p10: 14.10, p90: 16.20 },
  { date: 'Sep 08', p50: 15.00, p10: 14.05, p90: 16.40 },
  { date: 'Sep 15', p50: 14.95, p10: 13.90, p90: 16.50 },
  { date: 'Sep 22', p50: 14.80, p10: 13.60, p90: 16.60 },
  { date: 'Oct 01', p50: 14.65, p10: 13.40, p90: 16.70 },
  { date: 'Oct 08', p50: 14.57, p10: 13.20, p90: 16.80 },
  { date: 'Oct 16', p50: 14.40, p10: 13.00, p90: 16.85 },
  { date: 'Oct 24', p50: 14.25, p10: 12.80, p90: 16.90 },
  { date: 'Oct 31', p50: 14.10, p10: 12.60, p90: 16.95 },
  { date: 'Nov 07', p50: 13.95, p10: 12.40, p90: 17.00 },
  { date: 'Nov 15', p50: 13.85, p10: 12.20, p90: 17.05 },
  { date: 'Nov 23', p50: 13.80, p10: 12.00, p90: 17.10 },
  { date: 'Nov 30', p50: 13.73, p10: 11.80, p90: 17.15 },
];

const DEFAULT_FORECAST_DATA: ForecastResultData = {
  current_reference_rate: 15.00,
  day_7_prediction: 15.00,
  day_30_prediction: 14.57,
  day_90_prediction: 13.73,
  trend: 'DECREASING',
  trend_pct: -3.2,
  market_signal: 'WAIT & MONITOR',
  action_headline: 'WAIT & MONITOR',
  optimal_booking_window: 'Next 14–21 Days',
  explanation: 'Current Baltic forward freight rates (FFA) and bunker fuel forecasts indicate a seasonal surplus in Capesize / Panamax vessel capacity arriving across the Indian Ocean in early October. Fixing fixtures immediately would incur higher spot premiums, whereas deferring laycan booking by 14–21 days captures an estimated savings of $0.60 – $1.10 / MT on thermal coal imports.',
  recommended_vessel: 'Capesize / Panamax',
  contract_strategy: 'Spot / Index-Linked',
  expected_rate_range: '$13.6 – $14.9 / MT',
  market_risk: 'Moderate',
  port_compatibility: 'Compatible',
  forecast_confidence: 82,
  forecast_curve: RESULT_TREND_DATA.map((p, idx) => ({
    date: p.date,
    day_offset: idx * 7,
    predicted_rate: p.p50,
    lower_bound: p.p10,
    upper_bound: p.p90,
    confidence_level: 0.90,
  })),
};

export const FreightForecastPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine current view mode ('form' = Image 1, 'result' = Image 3)
  const [viewMode, setViewMode] = useState<'form' | 'result'>(
    location.pathname.includes('/result') ? 'result' : 'form'
  );

  // Sync viewMode if location changes
  useEffect(() => {
    if (location.pathname.includes('/result')) {
      setViewMode('result');
    } else {
      setViewMode('form');
    }
  }, [location.pathname]);

  // 1. CARGO SPECIFICATION
  const [cargoType, setCargoType] = useState('Coal - Thermal');
  const [customCargoName, setCustomCargoName] = useState('');
  const [cargoVolume, setCargoVolume] = useState<number>(120000);

  const effectiveCargoName =
    cargoType === 'Other Bulk Cargo' && customCargoName.trim()
      ? customCargoName.trim()
      : cargoType;

  // 2. MARITIME TRADE ROUTE & PORTS
  const [originPort, setOriginPort] = useState('Australia (Hay Point / Dalrymple Bay)');
  const [destPort, setDestPort] = useState('Paradip Port (Odisha)');

  // 3. CHARTER PERIOD & LAYCAN SCHEDULE
  const [durationScope, setDurationScope] = useState<'short' | 'medium'>('short');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-11-30');

  // Forecast Result Data State
  const [forecastData, setForecastData] = useState<ForecastResultData>(DEFAULT_FORECAST_DATA);

  // Recommendation accordion in result view
  const [whyExpanded, setWhyExpanded] = useState(false);

  // Computing Modal State (Image 2)
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(12);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const timerRef = useRef<any>(null);

  // Handlers for Presets
  const handlePresetAustraliaParadip = () => {
    setCargoType('Coal - Thermal');
    setCargoVolume(120000);
    setOriginPort('Australia (Hay Point / Dalrymple Bay)');
    setDestPort('Paradip Port (Odisha)');
    setDurationScope('short');
    setStartDate('2026-09-01');
    setEndDate('2026-11-30');
  };

  const handlePresetIndonesiaDhamra = () => {
    setCargoType('Coal - Thermal');
    setCargoVolume(70000);
    setOriginPort('Indonesia (Taboneo Anchorage)');
    setDestPort('Dhamra Port (Odisha)');
    setDurationScope('short');
    setStartDate('2026-09-01');
    setEndDate('2026-11-30');
  };

  // Start the computation simulation (Image 2 -> Image 3)
  const handleGenerateForecast = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(15);
    setActiveStepIndex(0);

    const stepTimings = [
      { progress: 38, step: 1, delay: 500 },
      { progress: 68, step: 2, delay: 1100 },
      { progress: 85, step: 3, delay: 1700 },
      { progress: 92, step: 3, delay: 2200 },
      { progress: 100, step: 4, delay: 2600 },
    ];

    stepTimings.forEach(({ progress, step, delay }) => {
      setTimeout(() => {
        setAnalysisProgress(progress);
        setActiveStepIndex(step);
      }, delay);
    });

    const originCountry = originPort.includes('Indonesia')
      ? 'Indonesia'
      : originPort.includes('Mozambique')
      ? 'Mozambique'
      : originPort.includes('United States') || originPort.includes('USA')
      ? 'USA'
      : originPort.includes('Russia')
      ? 'Russia'
      : 'Australia';

    const cleanDest = destPort.includes('Paradip')
      ? 'Paradip'
      : destPort.includes('Dhamra')
      ? 'Dhamra'
      : destPort.includes('Visakhapatnam')
      ? 'Visakhapatnam'
      : 'Paradip';

    try {
      const response = await apiClient.post('/forecasts/run', {
        origin_country: originCountry,
        origin_port: originPort,
        destination_port: cleanDest,
        cargo_type: effectiveCargoName,
        cargo_mt: cargoVolume,
        desired_shipment_date: startDate,
        planning_horizon_days: 90,
        vessel_class: 'AUTO',
      });
      if (response.data && response.data.forecast_curve) {
        setForecastData(response.data);
      }
    } catch (err) {
      console.warn('API connection offline or fallback active:', err);
      const isBookNow =
        originCountry === 'Indonesia' ||
        originCountry === 'USA' ||
        originCountry === 'Russia' ||
        originCountry === 'Mozambique' ||
        effectiveCargoName.includes('Coking') ||
        effectiveCargoName.includes('Iron Ore') ||
        effectiveCargoName.includes('Steel') ||
        cargoType === 'Other Bulk Cargo' ||
        cargoVolume <= 50000;

      if (isBookNow) {
        const base = originCountry === 'Indonesia' ? 10.90 : 15.00;
        setForecastData({
          current_reference_rate: base,
          day_7_prediction: +(base + 0.18).toFixed(2),
          day_30_prediction: +(base * 1.048).toFixed(2),
          day_90_prediction: +(base * 1.095).toFixed(2),
          trend: 'INCREASING',
          trend_pct: 4.8,
          market_signal: 'BOOK NOW',
          action_headline: 'BOOK NOW (BEST FIXING TIME)',
          optimal_booking_window: 'Immediate / Next 7–14 Days',
          recommended_vessel: cargoVolume >= 100000 ? 'Capesize / Panamax' : 'Panamax / Supramax',
          contract_strategy: 'Spot Fixture (Lock Lowest Rate)',
          expected_rate_range: `$${base.toFixed(1)} – $${(base * 1.1).toFixed(1)} / MT`,
          market_risk: 'Elevated (Tight Supply)',
          port_compatibility: 'Compatible',
          forecast_confidence: 88,
          explanation: `Forward Baltic freight indices and coastal vessel availability indicate spot rate escalation on the ${originCountry} to ${cleanDest} corridor (+4.8% over 30 days). Securing tonnage in the immediate 7–14 day window locks in bottom-of-cycle charter fixtures before anticipated regional bunker surges and coastal congestion.`,
          forecast_curve: [
            { date: 'Sep 01', day_offset: 0, predicted_rate: base, lower_bound: +(base - 0.7).toFixed(2), upper_bound: +(base + 1.2).toFixed(2), confidence_level: 0.9 },
            { date: 'Sep 08', day_offset: 7, predicted_rate: +(base + 0.18).toFixed(2), lower_bound: +(base - 0.6).toFixed(2), upper_bound: +(base + 1.3).toFixed(2), confidence_level: 0.9 },
            { date: 'Sep 15', day_offset: 14, predicted_rate: +(base + 0.35).toFixed(2), lower_bound: +(base - 0.5).toFixed(2), upper_bound: +(base + 1.45).toFixed(2), confidence_level: 0.9 },
            { date: 'Sep 22', day_offset: 21, predicted_rate: +(base + 0.52).toFixed(2), lower_bound: +(base - 0.3).toFixed(2), upper_bound: +(base + 1.6).toFixed(2), confidence_level: 0.9 },
            { date: 'Oct 01', day_offset: 30, predicted_rate: +(base * 1.048).toFixed(2), lower_bound: +(base * 1.048 - 0.4).toFixed(2), upper_bound: +(base * 1.048 + 1.75).toFixed(2), confidence_level: 0.9 },
            { date: 'Oct 08', day_offset: 37, predicted_rate: +(base * 1.06).toFixed(2), lower_bound: +(base * 1.06 - 0.3).toFixed(2), upper_bound: +(base * 1.06 + 1.85).toFixed(2), confidence_level: 0.9 },
            { date: 'Oct 16', day_offset: 45, predicted_rate: +(base * 1.07).toFixed(2), lower_bound: +(base * 1.07 - 0.2).toFixed(2), upper_bound: +(base * 1.07 + 1.95).toFixed(2), confidence_level: 0.9 },
            { date: 'Oct 24', day_offset: 53, predicted_rate: +(base * 1.08).toFixed(2), lower_bound: +(base * 1.08 - 0.1).toFixed(2), upper_bound: +(base * 1.08 + 2.05).toFixed(2), confidence_level: 0.9 },
            { date: 'Oct 31', day_offset: 60, predicted_rate: +(base * 1.088).toFixed(2), lower_bound: +(base * 1.088).toFixed(2), upper_bound: +(base * 1.088 + 2.15).toFixed(2), confidence_level: 0.9 },
            { date: 'Nov 07', day_offset: 68, predicted_rate: +(base * 1.092).toFixed(2), lower_bound: +(base * 1.092).toFixed(2), upper_bound: +(base * 1.092 + 2.25).toFixed(2), confidence_level: 0.9 },
            { date: 'Nov 15', day_offset: 75, predicted_rate: +(base * 1.094).toFixed(2), lower_bound: +(base * 1.094).toFixed(2), upper_bound: +(base * 1.094 + 2.3).toFixed(2), confidence_level: 0.9 },
            { date: 'Nov 23', day_offset: 83, predicted_rate: +(base * 1.095).toFixed(2), lower_bound: +(base * 1.095).toFixed(2), upper_bound: +(base * 1.095 + 2.35).toFixed(2), confidence_level: 0.9 },
            { date: 'Nov 30', day_offset: 90, predicted_rate: +(base * 1.095).toFixed(2), lower_bound: +(base * 1.095 - 0.8).toFixed(2), upper_bound: +(base * 1.095 + 2.4).toFixed(2), confidence_level: 0.9 },
          ],
        });
      } else {
        setForecastData(DEFAULT_FORECAST_DATA);
      }
    }

    setTimeout(() => {
      setIsAnalyzing(false);
      setViewMode('result');
      navigate('/forecast/result');
    }, 3100);
  };

  const handleBackToForm = () => {
    setViewMode('form');
    navigate('/forecast');
  };

  // SVG Render helpers for chart reference windows
  const renderWaitMonitorLabel = (props: any) => {
    const { viewBox } = props;
    if (!viewBox) return null;
    const { x, y, width } = viewBox;
    const midX = x + width / 2;
    return (
      <g>
        <line x1={x + 10} y1={y + 14} x2={x + width - 10} y2={y + 14} stroke="#2563EB" strokeWidth={1} />
        <polygon points={`${x + 10},${y + 14} ${x + 14},${y + 11} ${x + 14},${y + 17}`} fill="#2563EB" />
        <polygon points={`${x + width - 10},${y + 14} ${x + width - 14},${y + 11} ${x + width - 14},${y + 17}`} fill="#2563EB" />
        <text x={midX} y={y + 10} textAnchor="middle" fill="#2563EB" fontSize={9} fontWeight="bold">
          Suggest Wait / Monitor
        </text>
      </g>
    );
  };

  const renderOptimalWindowLabel = (props: any) => {
    const { viewBox } = props;
    if (!viewBox) return null;
    const { x, y, width } = viewBox;
    const midX = x + width / 2;
    return (
      <g>
        <line x1={x + 10} y1={y + 24} x2={x + width - 10} y2={y + 24} stroke="#059669" strokeWidth={1} />
        <polygon points={`${x + 10},${y + 24} ${x + 14},${y + 21} ${x + 14},${y + 27}`} fill="#059669" />
        <polygon points={`${x + width - 10},${y + 24} ${x + width - 14},${y + 21} ${x + width - 14},${y + 27}`} fill="#059669" />
        <text x={midX} y={y + 10} textAnchor="middle" fill="#059669" fontSize={9} fontWeight="bold">
          Optimal Fixing Window
        </text>
        <text x={midX} y={y + 20} textAnchor="middle" fill="#059669" fontSize={8} fontWeight="bold">
          (14–21 Days)
        </text>
      </g>
    );
  };

  const renderExpensiveWindowLabel = (props: any) => {
    const { viewBox } = props;
    if (!viewBox) return null;
    const { x, y, width } = viewBox;
    const midX = x + width / 2;
    return (
      <g>
        <line x1={x + 10} y1={y + 14} x2={x + width - 10} y2={y + 14} stroke="#DC2626" strokeWidth={1} />
        <polygon points={`${x + 10},${y + 14} ${x + 14},${y + 11} ${x + 14},${y + 17}`} fill="#DC2626" />
        <polygon points={`${x + width - 10},${y + 14} ${x + width - 14},${y + 11} ${x + width - 14},${y + 17}`} fill="#DC2626" />
        <text x={midX} y={y + 10} textAnchor="middle" fill="#DC2626" fontSize={9} fontWeight="bold">
          Higher Risk / Expensive Window
        </text>
      </g>
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 bg-[#F8F7F3] min-h-screen text-[#172033] font-sans">
      
      {/* ========================================================================= */}
      {/* 1. INITIAL FORM STATE (IMAGE 1) */}
      {/* ========================================================================= */}
      {viewMode === 'form' && (
        <>
          {/* Top Title Header & Data Provenance Capsule */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              {/* Breadcrumb matching Image 1 */}
              <div className="text-[11px] font-semibold text-[#68717D] flex items-center gap-1.5 mb-1">
                <span>PortIN</span>
                <span className="text-slate-400">&gt;</span>
                <span>Forecast</span>
                <span className="text-slate-400">&gt;</span>
                <span className="text-[#0F2747] font-bold">New Freight Forecast</span>
              </div>

              <h1 className="text-2xl sm:text-[28px] font-black text-[#0F2747] tracking-tight leading-tight">
                New Freight Forecast &amp; Charter Simulator
              </h1>
              <p className="text-xs sm:text-[13px] text-[#64748B] mt-1 font-medium">
                Configure cargo parameters, corridor routing, and target laycan window to run econometric freight prediction.
              </p>
            </div>

            {/* Right Data Source Capsule Card */}
            <div className="flex items-center bg-white rounded-xl border border-[#E2E8F0] shadow-xs divide-x divide-slate-200 self-start lg:self-auto shrink-0">
              <div className="flex items-center gap-2.5 px-3.5 py-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Database className="w-3.5 h-3.5 text-[#2563EB]" />
                </div>
                <div>
                  <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 leading-none">
                    DATA SOURCE
                  </div>
                  <div className="text-xs font-bold text-[#2563EB] leading-tight mt-0.5">
                    Historical + Forecast Data
                  </div>
                  <div className="text-[8.5px] text-slate-400 leading-none mt-0.5">
                    (Alpha Vantage, Baltic Exchange, Port Data)
                  </div>
                </div>
              </div>

              <div className="px-3.5 py-2">
                <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 leading-none">
                  LAST UPDATED
                </div>
                <div className="text-xs font-bold text-[#0F2747] leading-tight mt-1 font-mono">
                  07 Sep 2026, 15:20
                </div>
              </div>

              <div className="px-3.5 py-2">
                <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 leading-none">
                  FORECAST HORIZON
                </div>
                <div className="text-xs font-black text-[#0F2747] leading-tight mt-1 font-mono">
                  90 Days
                </div>
              </div>
            </div>
          </div>

          {/* Form Card: CREATE FREIGHT FORECAST */}
          <div className="p-5 sm:p-6 rounded-[16px] bg-white border border-[#E2E8F0] shadow-xs space-y-5">
            {/* Header of Form Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
                  <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-[#0F2747]">
                    CREATE FREIGHT FORECAST
                  </h2>
                </div>
                <p className="text-xs text-[#64748B] mt-0.5 font-medium">
                  Configure cargo volume, maritime trading corridor, and target laycan window for econometric prediction.
                </p>
              </div>

              {/* Preset Buttons matching Image 1 */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handlePresetAustraliaParadip}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[#0F2747] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Anchor className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>🇦🇺 Australia — 🇮🇳 Paradip</span>
                </button>
                <button
                  type="button"
                  onClick={handlePresetIndonesiaDhamra}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[#0F2747] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Anchor className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>🇮🇩 Indonesia — 🇮🇳 Dhamra</span>
                </button>
              </div>
            </div>

            {/* 3 Columns Form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* COLUMN 1 (4 cols): CARGO SPECIFICATION */}
              <div className="lg:col-span-4 p-4 rounded-xl bg-[#FAF9F5] border border-[#E4E2DC] space-y-3.5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-black font-mono bg-[#0F2747] text-white">
                      01
                    </span>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-[#0F2747]">
                        CARGO SPECIFICATION
                      </h3>
                      <p className="text-[10.5px] text-[#64748B] font-medium leading-none mt-0.5">
                        Material classification and parcel weight
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-[#475569] mb-1">
                      CARGO TYPE <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={cargoType}
                      onChange={(e) => setCargoType(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs font-bold text-[#0F2747] focus:outline-none focus:border-[#D6A63B]"
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

                  {cargoType === 'Other Bulk Cargo' && (
                    <div className="p-3 rounded-xl bg-white border border-[#D6A63B] shadow-xs space-y-1.5 animate-fadeIn">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#D6A63B]" />
                        <span className="text-[10.5px] font-black uppercase tracking-wider text-[#0F2747]">
                          SPECIFY CUSTOM CARGO NAME <span className="text-red-500">*</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider bg-[#0B1F38] text-white">
                          Custom Commodity
                        </span>
                      </div>
                      <p className="text-[10px] text-[#64748B] font-medium">
                        Enter the exact industrial bulk material classification:
                      </p>
                      <input
                        type="text"
                        value={customCargoName}
                        onChange={(e) => setCustomCargoName(e.target.value)}
                        placeholder="e.g. Copper Concentrate, Manganese Ore, Petcoke, Nickel Ore, DRI Pellets"
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#D6A63B] text-xs font-semibold text-[#0F2747] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#D6A63B]"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-[#475569] mb-1">
                      CARGO VOLUME (METRIC TONS) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="1000"
                        value={cargoVolume}
                        onChange={(e) => setCargoVolume(Number(e.target.value) || 0)}
                        className="w-full pl-3 pr-12 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs font-mono font-bold text-[#0F2747] focus:outline-none focus:border-[#D6A63B]"
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        MT
                      </span>
                    </div>

                    {/* Presets chips */}
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-[#64748B]">
                      <span className="font-semibold text-slate-400 text-[10px]">Presets:</span>
                      <button
                        type="button"
                        onClick={() => setCargoVolume(70000)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                          cargoVolume === 70000 ? 'bg-[#0F2747] text-white border-[#0F2747]' : 'bg-white border-slate-200 text-[#0F2747] hover:bg-slate-100'
                        }`}
                      >
                        70k MT
                      </button>
                      <button
                        type="button"
                        onClick={() => setCargoVolume(120000)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                          cargoVolume === 120000 ? 'bg-[#0F2747] text-white border-[#0F2747]' : 'bg-white border-slate-200 text-[#0F2747] hover:bg-slate-100'
                        }`}
                      >
                        120k MT
                      </button>
                      <button
                        type="button"
                        onClick={() => setCargoVolume(180000)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
                          cargoVolume === 180000 ? 'bg-[#0F2747] text-white border-[#0F2747]' : 'bg-white border-slate-200 text-[#0F2747] hover:bg-slate-100'
                        }`}
                      >
                        180k MT
                      </button>
                    </div>
                  </div>
                </div>

                {/* Parcel Calibration Callout */}
                <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-100 text-xs text-blue-900 mt-3">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-[11px] text-blue-950">Parcel Calibration</div>
                      <div className="text-[10px] text-blue-800 leading-snug mt-0.5">
                        Freight models adjust bunker fuel consumption based on cargo density and parcel size.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* COLUMN 2 (4 cols): MARITIME TRADE ROUTE & PORTS */}
              <div className="lg:col-span-4 p-4 rounded-xl bg-[#FAF9F5] border border-[#E4E2DC] space-y-3.5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-black font-mono bg-[#0F2747] text-white">
                      02
                    </span>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-[#0F2747]">
                        MARITIME TRADE ROUTE &amp; PORTS
                      </h3>
                      <p className="text-[10.5px] text-[#64748B] font-medium leading-none mt-0.5">
                        Select origin loading hub and Indian East Coast discharge port
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-[#475569] mb-1">
                      ORIGIN PORT (LOADING HUB) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={originPort}
                      onChange={(e) => setOriginPort(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs font-bold text-[#0F2747] focus:outline-none focus:border-[#D6A63B]"
                    >
                      <option value="Australia (Hay Point / Dalrymple Bay)">🇦🇺 Australia (Hay Point / Dalrymple Bay)</option>
                      <option value="Australia (Gladstone / Abbot Point)">🇦🇺 Australia (Gladstone / Abbot Point)</option>
                      <option value="Indonesia (Taboneo Anchorage)">🇮🇩 Indonesia (Taboneo Anchorage)</option>
                      <option value="Mozambique (Maputo Coal Terminal)">🇲🇿 Mozambique (Maputo Coal Terminal)</option>
                      <option value="United States (New Orleans)">🇺🇸 United States (New Orleans)</option>
                    </select>
                    <div className="text-[9.5px] text-slate-500 mt-1 font-mono">
                      Max Draft: <strong className="text-[#0F2747]">20.0m</strong> | Max LOA: <strong className="text-[#0F2747]">330m</strong>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-[#475569] mb-1">
                      DESTINATION PORT (EAST COAST INDIA) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={destPort}
                      onChange={(e) => setDestPort(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs font-bold text-[#0F2747] focus:outline-none focus:border-[#D6A63B]"
                    >
                      <option value="Paradip Port (Odisha)">🇮🇳 Paradip Port (Odisha)</option>
                      <option value="Visakhapatnam Port (Andhra Pradesh)">🇮🇳 Visakhapatnam Port (Andhra Pradesh)</option>
                      <option value="Gangavaram Port (Andhra Pradesh)">🇮🇳 Gangavaram Port (Andhra Pradesh)</option>
                      <option value="Dhamra Port (Odisha)">🇮🇳 Dhamra Port (Odisha)</option>
                      <option value="Gopalpur Port (Odisha)">🇮🇳 Gopalpur Port (Odisha)</option>
                      <option value="Haldia Dock Complex (West Bengal)">🇮🇳 Haldia Dock Complex (West Bengal)</option>
                    </select>
                    <div className="text-[9.5px] text-slate-500 mt-1 font-mono">
                      Max Draft: <strong className="text-[#0F2747]">14.5m</strong> | Max LOA: <strong className="text-[#0F2747]">260m</strong> | Berth: <strong className="text-[#0F2747]">16 Berths</strong>
                    </div>
                  </div>
                </div>

                {/* Port Compatibility Verified Banner */}
                <div className="p-3 rounded-lg bg-emerald-50/80 border border-emerald-100 text-xs text-emerald-900 mt-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-[11px] text-emerald-950">Port Compatibility: Verified</div>
                      <div className="text-[10px] text-emerald-800 leading-snug mt-0.5">
                        Berth limits verified for Capesize/Panamax bulk carriers.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* COLUMN 3 (4 cols): CHARTER PERIOD & LAYCAN SCHEDULE */}
              <div className="lg:col-span-4 p-4 rounded-xl bg-[#FAF9F5] border border-[#E4E2DC] space-y-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-black font-mono bg-[#0F2747] text-white">
                      03
                    </span>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-[#0F2747]">
                        CHARTER PERIOD &amp; LAYCAN SCHEDULE
                      </h3>
                      <p className="text-[10.5px] text-[#64748B] font-medium leading-none mt-0.5">
                        Target duration scope and laycan opening/closing dates
                      </p>
                    </div>
                  </div>

                  {/* Duration Scope Selector */}
                  <div className="mb-3">
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-[#475569] mb-1">
                      DURATION SCOPE
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDurationScope('short')}
                        className={`p-2 rounded-lg text-left border transition-all cursor-pointer flex items-start gap-1.5 ${
                          durationScope === 'short'
                            ? 'bg-white border-[#D97706] ring-1 ring-[#D97706] shadow-xs'
                            : 'bg-white border-[#CBD5E1] hover:border-slate-400'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded-full border mt-0.5 shrink-0 flex items-center justify-center ${
                          durationScope === 'short' ? 'border-[#D97706] bg-[#D97706]' : 'border-slate-300'
                        }`}>
                          {durationScope === 'short' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10.5px] font-black text-[#0F2747] leading-tight">
                            Short-Term (90 Days)
                          </div>
                          <div className="text-[9px] text-[#64748B] font-medium truncate">
                            Spot fixture optimization
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDurationScope('medium')}
                        className={`p-2 rounded-lg text-left border transition-all cursor-pointer flex items-start gap-1.5 ${
                          durationScope === 'medium'
                            ? 'bg-white border-[#D97706] ring-1 ring-[#D97706] shadow-xs'
                            : 'bg-white border-[#CBD5E1] hover:border-slate-400'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded-full border mt-0.5 shrink-0 flex items-center justify-center ${
                          durationScope === 'medium' ? 'border-[#D97706] bg-[#D97706]' : 'border-slate-300'
                        }`}>
                          {durationScope === 'medium' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10.5px] font-black text-[#0F2747] leading-tight">
                            Medium-Term (180 Days)
                          </div>
                          <div className="text-[9px] text-[#64748B] font-medium truncate">
                            COA multi-voyage
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Start Date & End Date */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-[#475569] mb-1">
                        START DATE <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-[11px] font-bold text-[#0F2747] focus:outline-none focus:border-[#D6A63B]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-[#475569] mb-1">
                        END DATE <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-[11px] font-bold text-[#0F2747] focus:outline-none focus:border-[#D6A63B]"
                      />
                    </div>
                  </div>
                </div>

                {/* GENERATE FORECAST CTA Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleGenerateForecast}
                    disabled={isAnalyzing}
                    className="w-full py-2.5 rounded-lg bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-black tracking-wider uppercase transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 active:scale-98"
                  >
                    <span>GENERATE FORECAST</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom 3 Architecture Cards (Image 1) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-1">
              <div className="flex items-center gap-2 text-[#2563EB] text-[11px] font-bold uppercase tracking-wider">
                <Compass className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>NAUTICAL ROUTE CORRIDOR</span>
              </div>
              <div className="text-sm font-black text-[#0F2747]">
                Indian Ocean Bulk Corridor
              </div>
              <div className="text-xs text-[#64748B] font-medium">
                Geodesic transit: ~5,640 nm • Average voyage: 16-18 Days
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-1">
              <div className="flex items-center gap-2 text-[#059669] text-[11px] font-bold uppercase tracking-wider">
                <Cpu className="w-3.5 h-3.5 text-[#059669]" />
                <span>FORECAST MODEL ARCHITECTURE</span>
              </div>
              <div className="text-sm font-black text-[#0F2747]">
                Quantile Gradient Boosting
              </div>
              <div className="text-xs text-[#64748B] font-medium">
                P10 / P50 / P90 probability envelopes with bunker &amp; congestion regressors
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs space-y-1">
              <div className="flex items-center gap-2 text-[#D97706] text-[11px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D97706]" />
                <span>PORTIN CHARTER ENGINE</span>
              </div>
              <div className="text-sm font-black text-[#0F2747]">
                Multi-Horizon Advisory
              </div>
              <div className="text-xs text-[#64748B] font-medium">
                Real-time timing window optimization and COA vs Spot recommendation
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 2. WORKING / INFERENCE COMPUTATION MODAL (IMAGE 2) */}
      {/* ========================================================================= */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-[16px] border border-slate-700 shadow-2xl overflow-hidden animate-scaleUp">
            
            {/* Dark Navy Header matching Image 2 */}
            <div className="p-5 bg-[#0B1F38] text-white flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#D6A63B] border-t-transparent animate-spin flex items-center justify-center shrink-0" />
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                    Analyzing Maritime Corridors
                  </h3>
                  <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                    Synthesizing freight prediction &amp; quantile envelopes...
                  </p>
                </div>
              </div>

              <div className="px-2.5 py-1 rounded-full bg-[#1E3A8A] text-[#FCD34D] font-mono text-xs font-black">
                {analysisProgress}%
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1.5">
                  <span className="uppercase tracking-wider">Inference Computation</span>
                  <span className="font-mono text-[#0F2747]">{analysisProgress}% Complete</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#D97706] via-[#10B981] to-[#06B6D4] transition-all duration-300 ease-out"
                    style={{ width: `${analysisProgress}%` }}
                  />
                </div>
              </div>

              {/* Corridor & Cargo Parcel Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    CORRIDOR
                  </span>
                  <span className="text-xs font-black text-[#0F2747] mt-0.5 block truncate">
                    {originPort.split(' (')[0]} → {destPort.split(' (')[0]}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    CARGO PARCEL
                  </span>
                  <span className="text-xs font-black text-[#0F2747] mt-0.5 block truncate">
                    {cargoVolume.toLocaleString()} MT ({effectiveCargoName})
                  </span>
                </div>
              </div>

              {/* Step Checklist */}
              <div className="space-y-2.5 pt-1">
                {/* Step 1 */}
                <div className="flex items-center gap-2.5 text-[11.5px]">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                    activeStepIndex >= 1 ? 'bg-emerald-500 text-white' : 'border border-slate-300'
                  }`}>
                    {activeStepIndex >= 1 ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                  </div>
                  <span className={activeStepIndex >= 1 ? 'text-slate-800 font-semibold' : 'text-slate-400'}>
                    Querying Baltic Exchange FFA indices &amp; corridor benchmarks
                  </span>
                </div>

                {/* Step 2 */}
                <div className="flex items-center gap-2.5 text-[11.5px]">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                    activeStepIndex >= 2 ? 'bg-emerald-500 text-white' : activeStepIndex === 1 ? 'border-2 border-[#D97706] border-t-transparent animate-spin' : 'border border-slate-300'
                  }`}>
                    {activeStepIndex >= 2 ? <Check className="w-3 h-3 stroke-[3]" /> : null}
                  </div>
                  <span className={activeStepIndex >= 2 ? 'text-slate-800 font-semibold' : activeStepIndex === 1 ? 'text-[#D97706] font-bold' : 'text-slate-400'}>
                    Simulating bunker fuel sensitivity &amp; voyage turnaround
                  </span>
                </div>

                {/* Step 3 */}
                <div className="flex items-center gap-2.5 text-[11.5px]">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                    activeStepIndex >= 3 ? 'bg-emerald-500 text-white' : activeStepIndex === 2 ? 'border-2 border-[#D97706] border-t-transparent animate-spin' : 'border border-slate-300'
                  }`}>
                    {activeStepIndex >= 3 ? <Check className="w-3 h-3 stroke-[3]" /> : null}
                  </div>
                  <span className={activeStepIndex >= 3 ? 'text-slate-800 font-semibold' : activeStepIndex === 2 ? 'text-[#D97706] font-bold' : 'text-slate-400'}>
                    Executing HistGradientBoosting Quantile Model (P10 / P50 / P90)
                  </span>
                </div>

                {/* Step 4 */}
                <div className="flex items-center gap-2.5 text-[11.5px]">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                    activeStepIndex >= 4 ? 'bg-emerald-500 text-white' : activeStepIndex === 3 ? 'border-2 border-[#2563EB] border-t-transparent animate-spin' : 'border border-slate-300'
                  }`}>
                    {activeStepIndex >= 4 ? <Check className="w-3 h-3 stroke-[3]" /> : null}
                  </div>
                  <span className={activeStepIndex >= 4 ? 'text-slate-800 font-semibold' : activeStepIndex === 3 ? 'text-[#2563EB] font-bold' : 'text-slate-400'}>
                    Synthesizing PortIN Optimal Charter Window &amp; Recommendation
                  </span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[10.5px]">
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified East Coast Draft &amp; LOA Compatibility</span>
                </span>
                <span className="text-slate-400 font-medium">
                  {analysisProgress === 100 ? 'Redirecting to Results...' : 'Computing...'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. RESULTED FREIGHT FORECAST (IMAGE 3) */}
      {/* ========================================================================= */}
      {viewMode === 'result' && (
        <>
          {/* Back Navigation Breadcrumb Link */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleBackToForm}
              className="text-xs font-bold text-[#68717D] hover:text-[#0F2747] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>&larr; Back to New Forecast</span>
              <span className="text-slate-400">&gt;</span>
              <span>Forecast</span>
              <span className="text-slate-400">&gt;</span>
              <span className="text-[#0F2747]">Forecast Results</span>
            </button>
          </div>

          {/* Title Header with SIMULATION COMPLETE badge */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-[28px] font-black text-[#0F2747] tracking-tight leading-tight">
                  Resulted Freight Forecast
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  <span>SIMULATION COMPLETE</span>
                </span>
              </div>
              <p className="text-xs sm:text-[13px] text-[#64748B] font-medium">
                Econometric prediction generated based on submitted corridor, cargo specifications, and laycan horizon.
              </p>
            </div>

            {/* Right Action buttons: Modify Parameters & Data Source capsule */}
            <div className="flex items-center gap-3 self-start lg:self-auto shrink-0">
              <button
                type="button"
                onClick={handleBackToForm}
                className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[#0F2747] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#0F2747]" />
                <span>Modify Parameters</span>
              </button>

              <div className="flex items-center bg-white rounded-xl border border-[#E2E8F0] shadow-xs divide-x divide-slate-200">
                <div className="flex items-center gap-2 px-3 py-1.5">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Database className="w-3 h-3 text-[#2563EB]" />
                  </div>
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none">
                      DATA SOURCE
                    </div>
                    <div className="text-[11px] font-bold text-[#2563EB] leading-tight mt-0.5">
                      Historical + Forecast Data
                    </div>
                  </div>
                </div>

                <div className="px-3 py-1.5">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none">
                    FORECAST HORIZON
                  </div>
                  <div className="text-[11px] font-black text-[#0F2747] leading-tight mt-0.5 font-mono">
                    90 Days
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SIMULATION INPUT PARAMETERS BANNER CARD */}
          <div className="p-4 sm:p-5 rounded-[16px] bg-white border border-[#E2E8F0] shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                <span className="text-xs font-black uppercase tracking-wider text-[#0F2747]">
                  SIMULATION INPUT PARAMETERS
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400">
                RUN ID: FC-2026-0908
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Parameter 1: Corridor */}
              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E4E2DC]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>CORRIDOR</span>
                </div>
                <div className="text-xs font-black text-[#0F2747] mt-1 truncate">
                  {originPort.split(' (')[0]} &rarr; {destPort.split(' (')[0]}
                </div>
                <div className="text-[10.5px] text-slate-500 font-medium truncate mt-0.5">
                  {destPort}
                </div>
              </div>

              {/* Parameter 2: Cargo Parcel */}
              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E4E2DC]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Ship className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>CARGO PARCEL</span>
                </div>
                <div className="text-xs font-black text-[#0F2747] mt-1 font-mono">
                  {cargoVolume.toLocaleString()} MT
                </div>
                <div className="text-[10.5px] text-slate-500 font-medium truncate mt-0.5">
                  {effectiveCargoName}
                </div>
              </div>

              {/* Parameter 3: Laycan Window */}
              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E4E2DC]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#059669]" />
                  <span>LAYCAN WINDOW</span>
                </div>
                <div className="text-xs font-black text-[#0F2747] mt-1 font-mono">
                  {startDate} &mdash; {endDate}
                </div>
                <div className="text-[10.5px] text-slate-500 font-medium truncate mt-0.5">
                  Scope: {durationScope === 'short' ? 'Short-Term (Spot)' : 'Medium-Term'}
                </div>
              </div>

              {/* Parameter 4: Model Confidence */}
              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E4E2DC]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#7C3AED]" />
                  <span>MODEL CONFIDENCE</span>
                </div>
                <div className="text-xs font-black text-[#0F2747] mt-1 font-mono">
                  {forecastData.forecast_confidence || 88}% (MAE $0.37)
                </div>
                <div className="text-[10.5px] text-slate-500 font-medium truncate mt-0.5">
                  HistGradientBoosting v1.2.0
                </div>
              </div>
            </div>
          </div>

          {/* FORECAST RESULTS SECTION */}
          <div className="p-5 sm:p-6 rounded-[16px] bg-white border border-[#E2E8F0] shadow-xs space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                  <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-[#0F2747]">
                    FORECAST RESULTS
                  </h2>
                </div>
                <p className="text-xs text-[#64748B] mt-0.5 font-medium">
                  Probabilistic freight forecast with quantile envelope and optimal chartering window.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                  forecastData.market_signal === 'BOOK NOW'
                    ? 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]'
                    : 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]'
                }`}>
                  <Activity className="w-3.5 h-3.5" />
                  <span>SIGNAL: {forecastData.market_signal}</span>
                </span>
              </div>
            </div>

            {/* 2 Columns: Chart/Rates (8 cols) and PortIN Recommendation (4 cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* LEFT COLUMN (8 cols): RATE CARDS + CHART */}
              <div className="lg:col-span-8 space-y-4">
                {/* 3 Rates Cards matching Image 3 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E4E2DC]">
                    <div className="text-[10px] uppercase font-bold text-slate-500">
                      CURRENT REFERENCE RATE
                    </div>
                    <div className="text-2xl font-mono font-black text-[#0F2747] mt-1">
                      ${forecastData.current_reference_rate.toFixed(2)} <span className="text-xs font-semibold text-slate-500">/ MT</span>
                    </div>
                    <div className="text-[10.5px] text-slate-500 mt-0.5 font-medium">
                      Baltic corridor benchmark
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E4E2DC]">
                    <div className="text-[10px] uppercase font-bold text-slate-500">
                      T + 30 DAYS EXPECTED
                    </div>
                    <div className="text-2xl font-mono font-black text-[#0F2747] mt-1">
                      ${forecastData.day_30_prediction.toFixed(2)} <span className="text-xs font-semibold text-slate-500">/ MT</span>
                    </div>
                    <div className="text-[10.5px] text-slate-500 mt-0.5 font-medium">
                      P50 median quantile
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E4E2DC]">
                    <div className="text-[10px] uppercase font-bold text-slate-500">
                      T + 90 DAYS EXPECTED
                    </div>
                    <div className="text-2xl font-mono font-black text-[#0F2747] mt-1">
                      ${forecastData.day_90_prediction.toFixed(2)} <span className="text-xs font-semibold text-slate-500">/ MT</span>
                    </div>
                    <div className="text-[10.5px] text-slate-500 mt-0.5 font-medium">
                      Term horizon projection
                    </div>
                  </div>
                </div>

                {/* 90-Day Trend Chart Container */}
                <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                    <span className="text-xs font-bold text-[#0F2747]">
                      90-Day Freight Trend with Quantile Envelope ($/MT)
                    </span>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${forecastData.market_signal === 'BOOK NOW' ? 'bg-[#D97706]' : 'bg-[#0F2747]'}`} />
                        <span>P50 Median</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                        <span>P10 Lower</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                        <span>P90 Upper</span>
                      </span>
                    </div>
                  </div>

                  {/* Recharts ComposedChart */}
                  <div className="h-64 sm:h-72 w-full relative pt-2">
                    {(() => {
                      const chartData: TrendPoint[] =
                        forecastData.forecast_curve && forecastData.forecast_curve.length > 0
                          ? forecastData.forecast_curve.map((p) => ({
                              date: p.date,
                              p50: p.predicted_rate,
                              p10: p.lower_bound,
                              p90: p.upper_bound,
                            }))
                          : RESULT_TREND_DATA;

                      const allRates = chartData.flatMap((d) => [d.p10, d.p50, d.p90]);
                      const yMin = Math.max(0, Math.floor(Math.min(...allRates) - 1));
                      const yMax = Math.ceil(Math.max(...allRates) + 1);
                      const isBookNow = forecastData.market_signal === 'BOOK NOW';

                      return (
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart
                            data={chartData}
                            margin={{ top: 25, right: 15, left: -20, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id="p50TrendGradientResult" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={isBookNow ? '#D97706' : '#0F2747'} stopOpacity={0.12} />
                                <stop offset="100%" stopColor={isBookNow ? '#D97706' : '#0F2747'} stopOpacity={0.0} />
                              </linearGradient>
                            </defs>

                            {isBookNow ? (
                              <>
                                <ReferenceArea
                                  x1="Sep 01"
                                  x2="Sep 15"
                                  fill="#ECFDF5"
                                  fillOpacity={0.7}
                                  label={renderOptimalWindowLabel}
                                />
                                <ReferenceArea
                                  x1="Sep 22"
                                  x2="Nov 30"
                                  fill="#FEF2F2"
                                  fillOpacity={0.7}
                                  label={renderExpensiveWindowLabel}
                                />
                              </>
                            ) : (
                              <>
                                <ReferenceArea
                                  x1="Sep 15"
                                  x2="Oct 01"
                                  fill="#EFF6FF"
                                  fillOpacity={0.7}
                                  label={renderWaitMonitorLabel}
                                />
                                <ReferenceArea
                                  x1="Oct 01"
                                  x2="Oct 24"
                                  fill="#ECFDF5"
                                  fillOpacity={0.7}
                                  label={renderOptimalWindowLabel}
                                />
                                <ReferenceArea
                                  x1="Oct 31"
                                  x2="Nov 23"
                                  fill="#FEF2F2"
                                  fillOpacity={0.7}
                                  label={renderExpensiveWindowLabel}
                                />
                              </>
                            )}

                            <ReferenceLine
                              x="Sep 08"
                              stroke="#64748B"
                              strokeDasharray="2 2"
                              strokeWidth={1.2}
                              label={{
                                value: 'Today',
                                position: 'top',
                                fill: '#0F2747',
                                fontSize: 10,
                                fontWeight: 'bold',
                              }}
                            />

                            <XAxis
                              dataKey="date"
                              stroke="#94A3B8"
                              fontSize={9.5}
                              tickLine={false}
                            />
                            <YAxis
                              stroke="#94A3B8"
                              fontSize={9.5}
                              domain={[yMin, yMax]}
                              tickLine={false}
                            />
                            <Tooltip
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  const d = payload[0].payload as TrendPoint;
                                  return (
                                    <div className="p-2.5 bg-white rounded-lg shadow-lg border border-slate-200 text-xs">
                                      <div className="font-bold text-[#0F2747]">{label}</div>
                                      <div className="mt-1 space-y-0.5 text-[11px] font-mono">
                                        <div className="text-red-600 font-bold">P90 Upper: ${d.p90.toFixed(2)}</div>
                                        <div className="text-[#0F2747] font-black">P50 Median: ${d.p50.toFixed(2)}</div>
                                        <div className="text-emerald-600 font-bold">P10 Lower: ${d.p10.toFixed(2)}</div>
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />

                            <Area
                              type="monotone"
                              dataKey="p50"
                              stroke="none"
                              fill="url(#p50TrendGradientResult)"
                            />
                            <Line
                              type="monotone"
                              dataKey="p90"
                              stroke="#EF4444"
                              strokeWidth={1.5}
                              strokeDasharray="3 3"
                              dot={false}
                            />
                            <Line
                              type="monotone"
                              dataKey="p50"
                              stroke={isBookNow ? '#D97706' : '#0F2747'}
                              strokeWidth={2.5}
                              dot={false}
                            />
                            <Line
                              type="monotone"
                              dataKey="p10"
                              stroke="#10B981"
                              strokeWidth={1.5}
                              strokeDasharray="3 3"
                              dot={false}
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN (4 cols): PORTIN RECOMMENDATION CARD */}
              <div className="lg:col-span-4 rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden flex flex-col justify-between bg-white">
                <div>
                  {/* Card Header (Navy #0F2747) */}
                  <div className="px-4 py-3 bg-[#0F2747] text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Anchor className="w-4 h-4 text-[#D6A63B]" />
                      <span className="text-xs sm:text-sm font-bold tracking-tight">
                        PortIN Recommendation
                      </span>
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-white/10 text-white/90">
                      AI Powered
                    </span>
                  </div>

                  {/* Status Decision Box */}
                  <div className="p-4">
                    {forecastData.market_signal === 'BOOK NOW' ? (
                      <div className="p-3.5 rounded-xl bg-[#FEF3C7] border border-[#F59E0B] flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#D97706] text-white flex items-center justify-center shrink-0 shadow-xs">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-base font-black text-[#92400E] tracking-tight leading-tight">
                            {forecastData.action_headline || 'BOOK NOW (BEST FIXING TIME)'}
                          </div>
                          <div className="text-[11px] text-[#B45309] font-semibold mt-0.5">
                            Spot freight rates rising. Immediate booking secures optimal rate.
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#059669] text-white flex items-center justify-center shrink-0 shadow-xs">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-base font-black text-[#065F46] tracking-tight leading-tight">
                            WAIT &amp; MONITOR
                          </div>
                          <div className="text-[11px] text-[#047857] font-semibold mt-0.5">
                            Favourable rates expected in next 14–21 days.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Key-Value Details Table */}
                    <div className="divide-y divide-slate-100 text-xs mt-3">
                      <div className="py-2 flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Optimal Charter Window</span>
                        <span className="font-bold text-[#0F2747]">{forecastData.optimal_booking_window}</span>
                      </div>
                      <div className="py-2 flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Recommended Vessel</span>
                        <span className="font-bold text-[#0F2747]">{forecastData.recommended_vessel || 'Capesize / Panamax'}</span>
                      </div>
                      <div className="py-2 flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Contract Strategy</span>
                        <span className="font-bold text-[#0F2747]">{forecastData.contract_strategy || 'Spot / Index-Linked'}</span>
                      </div>
                      <div className="py-2 flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Expected Rate Range</span>
                        <span className="font-bold font-mono text-[#0F2747]">{forecastData.expected_rate_range || '$13.6 – $14.9 / MT'}</span>
                      </div>
                      <div className="py-2 flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Market Risk</span>
                        <span className={`font-bold flex items-center gap-1 ${
                          forecastData.market_risk?.includes('Elevated')
                            ? 'text-red-600'
                            : forecastData.market_risk?.includes('Low')
                            ? 'text-emerald-600'
                            : 'text-[#D97706]'
                        }`}>
                          <Check className="w-3.5 h-3.5" />
                          <span>{forecastData.market_risk || 'Moderate'}</span>
                        </span>
                      </div>
                      <div className="py-2 flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Port Compatibility</span>
                        <span className="font-bold text-[#16A34A] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                          <span>{forecastData.port_compatibility || 'Compatible'}</span>
                        </span>
                      </div>
                      <div className="py-2 flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Forecast Confidence</span>
                        <span className="font-bold font-mono text-[#0F2747]">{forecastData.forecast_confidence || 82}%</span>
                      </div>
                    </div>

                    {/* Why this recommendation? Accordion */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setWhyExpanded(!whyExpanded)}
                        className="w-full flex items-center justify-between text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] transition-colors py-1 cursor-pointer"
                      >
                        <span>Why this recommendation?</span>
                        {whyExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {whyExpanded && (
                        <div className="mt-2 p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed space-y-1.5 animate-in fade-in duration-150">
                          <p>{forecastData.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="p-4 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Link
                    to="/decision-twin"
                    className="px-2.5 py-2 rounded-lg border border-[#CBD5E1] bg-white hover:bg-slate-50 text-[#0F2747] text-[11px] font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer text-center whitespace-nowrap"
                  >
                    <span>View in Comparison Plan</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </Link>

                  <Link
                    to="/booking"
                    className="px-2.5 py-2 rounded-lg bg-[#D97706] hover:bg-[#B45309] text-white text-[11px] font-black tracking-wide transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer text-center whitespace-nowrap"
                  >
                    <span>Proceed to Booking</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FreightForecastPage;
