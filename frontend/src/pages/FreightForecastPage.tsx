import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TrendingUp, Ship, Calendar, MapPin, CheckCircle2,
  ArrowRight, Download, Sliders, Info, Clock, Check,
  Anchor, Activity, ChevronDown, ChevronUp, Database
} from 'lucide-react';
import {
  ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ReferenceArea, ReferenceLine
} from 'recharts';

interface TrendPoint {
  date: string;
  p50: number;
  p10: number;
  p90: number;
}

const DEFAULT_TREND_DATA: TrendPoint[] = [
  { date: 'Sep 01', p50: 12.20, p10: 11.60, p90: 13.20 },
  { date: 'Sep 08', p50: 12.25, p10: 11.65, p90: 13.30 },
  { date: 'Sep 15', p50: 12.30, p10: 11.62, p90: 13.35 },
  { date: 'Sep 22', p50: 12.20, p10: 11.55, p90: 13.30 },
  { date: 'Oct 01', p50: 11.85, p10: 11.40, p90: 13.00 },
  { date: 'Oct 08', p50: 11.63, p10: 11.10, p90: 12.80 },
  { date: 'Oct 16', p50: 11.48, p10: 10.80, p90: 12.75 },
  { date: 'Oct 24', p50: 11.50, p10: 10.60, p90: 12.85 },
  { date: 'Oct 31', p50: 11.55, p10: 10.40, p90: 13.00 },
  { date: 'Nov 07', p50: 11.60, p10: 10.10, p90: 13.15 },
  { date: 'Nov 15', p50: 11.62, p10: 9.80,  p90: 13.25 },
  { date: 'Nov 23', p50: 11.50, p10: 9.50,  p90: 13.35 },
  { date: 'Nov 30', p50: 10.94, p10: 8.80,  p90: 13.40 },
];

export const FreightForecastPage: React.FC = () => {
  const navigate = useNavigate();

  // 1. CARGO SPECIFICATION
  const [cargoType, setCargoType] = useState('Coal - Thermal');
  const [cargoVolume, setCargoVolume] = useState<number>(120000);

  // 2. MARITIME TRADE ROUTE & PORTS
  const [originPort, setOriginPort] = useState('Australia (Hay Point / Dalrymple Bay)');
  const [destPort, setDestPort] = useState('Paradip Port (Odisha)');

  // 3. CHARTER PERIOD & LAYCAN SCHEDULE
  const [durationScope, setDurationScope] = useState<'short' | 'medium'>('short');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-11-30');

  // Recommendation accordion
  const [whyExpanded, setWhyExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleLoadPreset = () => {
    setCargoType('Coal - Thermal');
    setCargoVolume(120000);
    setOriginPort('Australia (Hay Point / Dalrymple Bay)');
    setDestPort('Paradip Port (Odisha)');
    setDurationScope('short');
    setStartDate('2026-09-01');
    setEndDate('2026-11-30');
  };

  const handleGenerateForecast = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 600);
  };

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
    <div className="p-4 sm:p-6 space-y-5 bg-[#F8F7F3] min-h-screen text-[#172033]">
      
      {/* ========================================================================= */}
      {/* TOP TITLE HEADER & DATA PROVENANCE CAPSULE */}
      {/* ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          {/* Breadcrumb */}
          <div className="text-[11px] font-semibold text-[#68717D] flex items-center gap-1.5 mb-1">
            <span>PortIN</span>
            <span className="text-slate-400">&gt;</span>
            <span>Forecast</span>
            <span className="text-slate-400">&gt;</span>
            <span className="text-[#0F2747] font-bold">Freight Forecast &amp; Charter Decision Simulator</span>
          </div>

          <h1 className="text-2xl sm:text-[28px] font-black text-[#0F2747] tracking-tight leading-tight">
            Freight Forecast &amp; Charter Decision Simulator
          </h1>
          <p className="text-xs sm:text-[13px] text-[#64748B] mt-1 font-medium">
            Forecast freight rates, validate port constraints and identify the optimal vessel, charter window and contracting strategy.
          </p>
        </div>

        {/* Right Data Source Capsule Card */}
        <div className="flex items-center bg-white rounded-xl border border-[#E2E8F0] shadow-xs divide-x divide-slate-200 self-start lg:self-auto shrink-0">
          {/* Segment 1: Data Source */}
          <div className="flex items-center gap-2.5 px-3.5 py-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <Database className="w-3.5 h-3.5 text-[#2563EB]" />
            </div>
            <div>
              <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 leading-none">
                Data Source
              </div>
              <div className="text-xs font-bold text-[#2563EB] leading-tight mt-0.5">
                Historical + Forecast Data
              </div>
              <div className="text-[8.5px] text-slate-400 leading-none mt-0.5">
                (Alpha Vantage, Baltic Exchange, Port Data)
              </div>
            </div>
          </div>

          {/* Segment 2: Last Updated */}
          <div className="px-3.5 py-2">
            <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 leading-none">
              Last Updated
            </div>
            <div className="text-xs font-bold text-[#0F2747] leading-tight mt-1">
              07 Sep 2026, 15:20
            </div>
          </div>

          {/* Segment 3: Forecast Horizon */}
          <div className="px-3.5 py-2">
            <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 leading-none">
              Forecast Horizon
            </div>
            <div className="text-xs font-black text-[#0F2747] leading-tight mt-1">
              90 Days
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. TOP CARD: CREATE FREIGHT FORECAST */}
      {/* ========================================================================= */}
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

          <button
            type="button"
            onClick={handleLoadPreset}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[#0F2747] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Load Australia → Paradip Preset</span>
          </button>
        </div>

        {/* 3 Columns: 01 Cargo Spec, 02 Maritime Route, 03 Charter Period */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* COLUMN 1 (4 cols): CARGO SPECIFICATION */}
          <div className="lg:col-span-4 p-4 rounded-xl bg-[#FAF9F5] border border-[#E4E2DC] space-y-3.5">
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
                Cargo Type <span className="text-red-500">*</span>
              </label>
              <select
                value={cargoType}
                onChange={(e) => setCargoType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs font-bold text-[#0F2747] focus:outline-none focus:border-[#1E65B8]"
              >
                <option value="Coal - Thermal">Coal - Thermal</option>
                <option value="Coal - Coking">Coal - Coking</option>
                <option value="Iron Ore">Iron Ore</option>
                <option value="Grain">Grain</option>
                <option value="Fertilizer">Fertilizer</option>
                <option value="Bauxite">Bauxite</option>
                <option value="Steel">Steel</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[#475569] mb-1">
                Cargo Volume (Metric Tons) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1000"
                  value={cargoVolume}
                  onChange={(e) => setCargoVolume(Number(e.target.value) || 0)}
                  className="w-full pl-3 pr-12 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs font-mono font-bold text-[#0F2747] focus:outline-none focus:border-[#1E65B8]"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  MT
                </span>
              </div>
            </div>
          </div>

          {/* COLUMN 2 (4 cols): MARITIME TRADE ROUTE & PORTS */}
          <div className="lg:col-span-4 p-4 rounded-xl bg-[#FAF9F5] border border-[#E4E2DC] space-y-3.5">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black font-mono bg-[#0F2747] text-white">
                01
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
                Origin Port (Loading Hub) <span className="text-red-500">*</span>
              </label>
              <select
                value={originPort}
                onChange={(e) => setOriginPort(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs font-bold text-[#0F2747] focus:outline-none focus:border-[#1E65B8]"
              >
                <option value="Australia (Hay Point / Dalrymple Bay)">Australia (Hay Point / Dalrymple Bay)</option>
                <option value="Australia (Gladstone / Abbot Point)">Australia (Gladstone / Abbot Point)</option>
                <option value="Indonesia (Taboneo Anchorage)">Indonesia (Taboneo Anchorage)</option>
                <option value="Mozambique (Maputo Coal Terminal)">Mozambique (Maputo Coal Terminal)</option>
                <option value="United States (New Orleans)">United States (New Orleans)</option>
              </select>
              <div className="text-[9.5px] text-slate-500 mt-1 font-mono">
                Max Draft: <strong className="text-[#0F2747]">20m</strong> | Max LOA: <strong className="text-[#0F2747]">330m</strong>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[#475569] mb-1">
                Destination Port (East Coast India) <span className="text-red-500">*</span>
              </label>
              <select
                value={destPort}
                onChange={(e) => setDestPort(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-[#CBD5E1] text-xs font-bold text-[#0F2747] focus:outline-none focus:border-[#1E65B8]"
              >
                <option value="Paradip Port (Odisha)">Paradip Port (Odisha)</option>
                <option value="Visakhapatnam Port (Andhra Pradesh)">Visakhapatnam Port (Andhra Pradesh)</option>
                <option value="Gangavaram Port (Andhra Pradesh)">Gangavaram Port (Andhra Pradesh)</option>
                <option value="Dhamra Port (Odisha)">Dhamra Port (Odisha)</option>
                <option value="Chennai Port (Tamil Nadu)">Chennai Port (Tamil Nadu)</option>
                <option value="Kamarajar Port (Ennore)">Kamarajar Port (Ennore)</option>
              </select>
              <div className="text-[9.5px] text-slate-500 mt-1 font-mono">
                Max Draft: <strong className="text-[#0F2747]">14.5m</strong> | Max LOA: <strong className="text-[#0F2747]">260m</strong> | Max Beam: <strong className="text-[#0F2747]">40m</strong>
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

              {/* Duration Scope Pills */}
              <div className="mb-3">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#475569] mb-1">
                  Duration Scope
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDurationScope('short')}
                    className={`p-1.5 sm:p-2 rounded-lg text-left border transition-all cursor-pointer flex items-start gap-1.5 ${
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
                      <div className="text-[10.5px] font-black text-[#0F2747] leading-tight whitespace-nowrap">
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
                    className={`p-1.5 sm:p-2 rounded-lg text-left border transition-all cursor-pointer flex items-start gap-1.5 ${
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
                      <div className="text-[10.5px] font-black text-[#0F2747] leading-tight whitespace-nowrap">
                        Medium-Term (180 Days)
                      </div>
                      <div className="text-[9px] text-[#64748B] font-medium truncate">
                        Contract of affreightment (COA)
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Start Date and End Date */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-[#475569] mb-1">
                    Start Date (Laycan Window Open) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-[11px] font-bold text-[#0F2747] focus:outline-none focus:border-[#1E65B8]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-[#475569] mb-1">
                    End Date (Discharge Window Deadline) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-[11px] font-bold text-[#0F2747] focus:outline-none focus:border-[#1E65B8]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* GENERATE FORECAST CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGenerateForecast}
                disabled={isGenerating}
                className="w-full py-2.5 rounded-lg bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-black tracking-wider uppercase transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <span>{isGenerating ? 'Computing Forecast...' : 'GENERATE FORECAST'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. BOTTOM CARD: FORECAST RESULTS */}
      {/* ========================================================================= */}
      <div className="p-5 sm:p-6 rounded-[16px] bg-white border border-[#E2E8F0] shadow-xs space-y-5">
        
        {/* Header of Forecast Results */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-[#0F2747]">
                FORECAST RESULTS
              </h2>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5 font-medium">
              90-day probabilistic freight forecast with quantile range and optimal chartering window.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
              <Activity className="w-3.5 h-3.5 text-[#1D4ED8]" />
              <span>SIGNAL: MONITOR</span>
            </span>
          </div>
        </div>

        {/* 2 Columns: Left (8 cols chart & rates) + Right (4 cols PortIN Recommendation) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* LEFT 8 COLUMNS: RATES & 90-DAY TREND */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Top 3 Rate Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E4E2DC]">
                <div className="text-[10px] uppercase font-bold text-slate-500">Current Reference Rate</div>
                <div className="text-2xl font-mono font-black text-[#0F2747] mt-1">
                  $11.99 <span className="text-xs font-semibold text-slate-500">/ MT</span>
                </div>
                <div className="text-[10.5px] text-slate-500 mt-0.5 font-medium">Baltic benchmark</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E4E2DC]">
                <div className="text-[10px] uppercase font-bold text-slate-500">T + 30 Days Expected</div>
                <div className="text-2xl font-mono font-black text-[#0F2747] mt-1">
                  $11.63 <span className="text-xs font-semibold text-slate-500">/ MT</span>
                </div>
                <div className="text-[10.5px] text-slate-500 mt-0.5 font-medium">P50 median quantile</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E4E2DC]">
                <div className="text-[10px] uppercase font-bold text-slate-500">T + 90 Days Expected</div>
                <div className="text-2xl font-mono font-black text-[#0F2747] mt-1">
                  $10.94 <span className="text-xs font-semibold text-slate-500">/ MT</span>
                </div>
                <div className="text-[10.5px] text-slate-500 mt-0.5 font-medium">Term horizon projection</div>
              </div>
            </div>

            {/* 90-Day Freight Trend Container */}
            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] space-y-2">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                <span className="text-xs font-bold text-[#0F2747]">
                  90-Day Freight Trend with Quantile Envelope ($/MT)
                </span>
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0F2747]" />
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

              {/* Chart Viewport */}
              <div className="h-64 sm:h-72 w-full relative pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={DEFAULT_TREND_DATA}
                    margin={{ top: 25, right: 15, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="p50TrendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0F2747" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#0F2747" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>

                    {/* Window 1: Suggest Wait / Monitor (Blue) */}
                    <ReferenceArea
                      x1="Sep 15"
                      x2="Oct 01"
                      fill="#EFF6FF"
                      fillOpacity={0.7}
                      label={renderWaitMonitorLabel}
                    />

                    {/* Window 2: Optimal Fixing Window (Green) */}
                    <ReferenceArea
                      x1="Oct 01"
                      x2="Oct 24"
                      fill="#ECFDF5"
                      fillOpacity={0.7}
                      label={renderOptimalWindowLabel}
                    />

                    {/* Window 3: Higher Risk / Expensive Window (Red) */}
                    <ReferenceArea
                      x1="Oct 31"
                      x2="Nov 23"
                      fill="#FEF2F2"
                      fillOpacity={0.7}
                      label={renderExpensiveWindowLabel}
                    />

                    {/* Today Marker Line */}
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
                      domain={[8, 16]}
                      ticks={[8, 10, 12, 14, 16]}
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

                    {/* Curves */}
                    <Area
                      type="monotone"
                      dataKey="p50"
                      stroke="none"
                      fill="url(#p50TrendGradient)"
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
                      stroke="#0F2747"
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
              </div>

              {/* MAPE / MAE Metrics */}
              <div className="text-[11px] text-slate-500 font-medium pt-1">
                Historical MAPE: <strong className="text-[#0F2747]">1.94%</strong> • Model MAE: <strong className="text-emerald-700 font-mono font-bold">$0.37 / MT</strong>
              </div>
            </div>
          </div>

          {/* RIGHT 4 COLUMNS: PortIN RECOMMENDATION CARD */}
          <div className="lg:col-span-4 rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden flex flex-col justify-between bg-white">
            <div>
              {/* Card Header (Navy #0F2747) */}
              <div className="px-4 py-3 bg-[#0F2747] text-white flex items-center gap-2">
                <Anchor className="w-4 h-4 text-[#D6A63B]" />
                <span className="text-xs sm:text-sm font-bold tracking-tight">
                  PortIN Recommendation
                </span>
              </div>

              {/* Status Decision Box (Mint/Green) */}
              <div className="p-4">
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

                {/* Key-Value Details Table */}
                <div className="divide-y divide-slate-100 text-xs mt-3">
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Optimal Charter Window</span>
                    <span className="font-bold text-[#0F2747]">Next 14–21 Days</span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Recommended Vessel</span>
                    <span className="font-bold text-[#0F2747]">Panamax</span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Contract Strategy</span>
                    <span className="font-bold text-[#0F2747]">3-Voyage COA</span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Expected Rate Range</span>
                    <span className="font-bold font-mono text-[#0F2747]">$10.8 – $11.4 / MT</span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Market Risk</span>
                    <span className="font-bold text-[#D97706] flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Moderate</span>
                    </span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Port Compatibility</span>
                    <span className="font-bold text-[#16A34A] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Compatible</span>
                    </span>
                  </div>
                  <div className="py-2 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Forecast Confidence</span>
                    <span className="font-bold font-mono text-[#0F2747]">82%</span>
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
                      <p>
                        Current Baltic forward freight rates (FFA) and bunker fuel forecasts indicate a seasonal surplus in Panamax vessel capacity arriving across the Indian Ocean in early October.
                      </p>
                      <p>
                        Fixing fixtures now would incur higher spot premiums, whereas deferring laycan booking by 14–21 days captures an estimated savings of <strong>$0.55 – $0.90 / MT</strong> on thermal coal imports.
                      </p>
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
                <span>View in Decision Twin</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </Link>

              <Link
                to="/charter-operations"
                className="px-2.5 py-2 rounded-lg bg-[#D97706] hover:bg-[#B45309] text-white text-[11px] font-black tracking-wide transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer text-center whitespace-nowrap"
              >
                <span>Proceed to Charter Plan</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreightForecastPage;
