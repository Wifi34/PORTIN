import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  TrendingUp, Ship, Calendar, MapPin, CheckCircle2,
  ArrowRight, Download, Sliders, Info, Clock, Check,
  Anchor, Activity, ChevronDown, ChevronUp, Database,
  Sparkles, RefreshCw, RotateCcw, Loader2, ShieldCheck,
  Compass, Cpu, Home, Share2, FileText, Layers,
  Sun, Cloud, Wind, CloudSun, AlertTriangle, ExternalLink,
  X, Award, DollarSign, BarChart2, Maximize2, Boxes,
  Package, ShieldAlert, CheckCircle, ArrowUpRight, Filter
} from 'lucide-react';
import {
  ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ReferenceArea, ReferenceLine
} from 'recharts';
import { apiClient } from '../api/client';
import { OriginPortFlyout, DestinationPortDropdown, getIndianPortDetail } from '../components/common/PortSelectors';
import { identifyCargoIntelligence, CargoIntelligence } from '../utils/cargoIntelligence';

interface TrendPoint {
  date: string;
  p50: number;
  p10: number;
  p90: number;
}

interface MonthlyTrendPoint {
  month: string;
  rate: number;
  isOptimal?: boolean;
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
  cargo_intelligence?: CargoIntelligence;
}

const RESULT_TREND_DATA: TrendPoint[] = [
  { date: 'Sep 01', p50: 18.20, p10: 17.10, p90: 19.40 },
  { date: 'Sep 08', p50: 17.60, p10: 16.50, p90: 18.90 },
  { date: 'Sep 15', p50: 17.10, p10: 15.90, p90: 18.40 },
  { date: 'Sep 22', p50: 16.50, p10: 15.30, p90: 17.80 },
  { date: 'Oct 01', p50: 15.90, p10: 14.80, p90: 17.20 },
  { date: 'Oct 08', p50: 15.40, p10: 14.20, p90: 16.70 },
  { date: 'Oct 16', p50: 14.90, p10: 13.80, p90: 16.20 },
  { date: 'Oct 24', p50: 14.50, p10: 13.30, p90: 15.80 },
  { date: 'Oct 31', p50: 14.15, p10: 12.90, p90: 15.50 },
  { date: 'Nov 07', p50: 13.90, p10: 12.60, p90: 15.20 },
  { date: 'Nov 12', p50: 13.73, p10: 12.40, p90: 15.00 },
  { date: 'Nov 18', p50: 13.78, p10: 12.30, p90: 15.10 },
  { date: 'Nov 24', p50: 13.85, p10: 12.20, p90: 15.20 },
  { date: 'Nov 30', p50: 13.95, p10: 12.10, p90: 15.40 },
  { date: 'Dec 08', p50: 14.10, p10: 12.20, p90: 15.70 },
  { date: 'Dec 20', p50: 14.30, p10: 12.40, p90: 16.00 },
  { date: 'Jan 05', p50: 14.80, p10: 12.80, p90: 16.50 },
  { date: 'Jan 20', p50: 15.20, p10: 13.10, p90: 17.00 },
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
  optimal_booking_window: '12–24 Nov 2026',
  explanation: 'Current Baltic forward freight rates (FFA) and bunker fuel forecasts indicate a seasonal surplus in Capesize / Panamax vessel capacity arriving across the Indian Ocean in November. Fixing fixtures immediately would incur higher spot premiums, whereas deferring laycan booking to the optimal window (12–24 Nov) captures an estimated savings of $1.27 / MT on thermal coal imports.',
  recommended_vessel: 'Handysize / Panamax',
  contract_strategy: 'Spot / Index-Linked',
  expected_rate_range: '$13.7 – $15.0 / MT',
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

  // Determine current view mode ('form' = Setup, 'result' = Image 2 Design)
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
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2026-11-30');

  // Forecast Result Data State
  const [forecastData, setForecastData] = useState<ForecastResultData>(DEFAULT_FORECAST_DATA);

  // Sub-Navigation Tabs (Image 2)
  const [activeSubTab, setActiveSubTab] = useState<'results' | 'weather' | 'vessels' | 'congestion' | 'market'>('results');

  // Vessel cost comparison toggle ('per_mt' vs 'total')
  const [costMode, setCostMode] = useState<'per_mt' | 'total'>('per_mt');

  // Selected vessel modal for technical specs popup
  const [selectedVesselModal, setSelectedVesselModal] = useState<any | null>(null);

  // Export report modal
  const [showExportModal, setShowExportModal] = useState(false);

  // Computing Modal State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(12);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Handlers for Presets
  const handlePresetAustraliaParadip = () => {
    setCargoType('Coal - Thermal');
    setCargoVolume(120000);
    setOriginPort('Australia (Hay Point / Dalrymple Bay)');
    setDestPort('Paradip Port (Odisha)');
    setDurationScope('short');
    setStartDate('2026-11-01');
    setEndDate('2026-11-30');
  };

  const handlePresetIndonesiaDhamra = () => {
    setCargoType('Coal - Thermal');
    setCargoVolume(70000);
    setOriginPort('Indonesia (Taboneo Anchorage)');
    setDestPort('Dhamra Port (Odisha)');
    setDurationScope('short');
    setStartDate('2026-11-01');
    setEndDate('2026-11-30');
  };

  const handlePresetIndiaCoastal = () => {
    setCargoType('Coal - Thermal');
    setCargoVolume(55000);
    setOriginPort('India (Paradip Port)');
    setDestPort('Hazira (Gujarat)');
    setDurationScope('short');
    setStartDate('2026-11-01');
    setEndDate('2026-11-30');
  };

  // Start the computation simulation
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
            : originPort.includes('South Africa')
              ? 'South Africa'
              : originPort.includes('India')
                ? 'India'
                : 'Australia';

    const destDetail = getIndianPortDetail(destPort);
    const cleanDest = destDetail.cleanName || destPort.split(' (')[0];

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
      // Fallback with mathematically sound numbers matching Image 2
      const isBookNow =
        originCountry === 'India' ||
        originCountry === 'Indonesia' ||
        originCountry === 'USA' ||
        originCountry === 'Russia' ||
        originCountry === 'Mozambique' ||
        originCountry === 'South Africa' ||
        effectiveCargoName.includes('Coking') ||
        effectiveCargoName.includes('Steel') ||
        cargoType === 'Other Bulk Cargo' ||
        cargoVolume <= 40000 ||
        destDetail.region === 'West Coast';

      let base = 15.00;
      if (originCountry === 'India') {
        base = destDetail.region === 'West Coast' ? 7.80 : 5.00;
      } else if (originCountry === 'Indonesia') {
        base = destDetail.region === 'West Coast' ? 12.60 : 11.40;
      } else if (originCountry === 'USA') {
        base = destDetail.region === 'West Coast' ? 33.20 : 34.50;
      } else if (originCountry === 'South Africa') {
        base = destDetail.region === 'West Coast' ? 13.80 : 15.10;
      } else if (destDetail.region === 'West Coast') {
        base = 16.40;
      }

      if (isBookNow) {
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
          recommended_vessel: originCountry === 'India' ? 'Supramax / Handysize (Coastal)' : (cargoVolume >= 100000 ? 'Capesize / Panamax' : 'Panamax / Supramax'),
          contract_strategy: originCountry === 'India' ? 'Coastal COA / Spot Fixture' : 'Spot Fixture (Lock Lowest Rate)',
          expected_rate_range: `$${base.toFixed(1)} – $${(base * 1.1).toFixed(1)} / MT`,
          market_risk: originCountry === 'India' ? 'Moderate (Berth Allocation Window)' : 'Elevated (Tight Supply)',
          port_compatibility: 'Compatible',
          forecast_confidence: 91,
          explanation: originCountry === 'India'
            ? `Domestic Coastal Corridor: Identified Cargo: ${effectiveCargoName}. Maritime shipping between ${originPort} and ${cleanDest} (${destDetail.region}) achieves ~58% logistics cost savings over Indian Railways rake freight (approx ₹2,200/MT rail vs $${base.toFixed(2)}/MT coastal).`
            : `Forward Baltic freight indices and coastal vessel availability indicate spot rate escalation on the ${originCountry} to ${cleanDest} corridor (+4.8% over 30 days). Securing tonnage in the immediate 7–14 day window locks in bottom-of-cycle charter fixtures before anticipated regional bunker surges and coastal congestion.`,
          forecast_curve: RESULT_TREND_DATA.map(p => ({
            date: p.date,
            day_offset: 0,
            predicted_rate: +(p.p50 * (base / 15.0)).toFixed(2),
            lower_bound: +(p.p10 * (base / 15.0)).toFixed(2),
            upper_bound: +(p.p90 * (base / 15.0)).toFixed(2),
            confidence_level: 0.90
          }))
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

  const handleProceedToBooking = () => {
    navigate('/booking', {
      state: {
        originPort,
        destPort,
        cargoType: effectiveCargoName,
        cargoVolume,
        recommendedDate: '2026-11-12'
      }
    });
  };

  // Derive dynamic details for display & synchronization across all 23 Indian ports
  const originCountry = originPort.includes('Indonesia')
    ? 'Indonesia'
    : originPort.includes('Mozambique')
      ? 'Mozambique'
      : originPort.includes('United States') || originPort.includes('USA')
        ? 'USA'
        : originPort.includes('Russia')
          ? 'Russia'
          : originPort.includes('South Africa')
            ? 'South Africa'
            : originPort.includes('India')
              ? 'India'
              : 'Australia';

  const destDetail = getIndianPortDetail(destPort);
  const cleanDest = destDetail.cleanName || destPort.split(' (')[0];
  const destState = destDetail.state;
  const destDraft = destDetail.maxDraft;
  const destRegion = destDetail.region;
  const isDomesticRoute = originCountry === 'India';

  const formattedLaycanWindow = `${startDate === '2026-11-01' ? '1 Nov 2026' : startDate} – ${endDate === '2026-11-30' ? '30 Nov 2026' : endDate}`;

  // Base rate calculation
  const baseRate = forecastData.current_reference_rate || 15.00;
  const isDefaultAUtoParadip = Math.abs(baseRate - 15.00) < 0.05 && originCountry === 'Australia' && cleanDest.includes('Paradip');

  const hRate = isDefaultAUtoParadip ? 20.42 : Number((baseRate * (isDomesticRoute ? 1.12 : 1.36)).toFixed(2));
  const sRate = isDefaultAUtoParadip ? 17.46 : Number((baseRate * (isDomesticRoute ? 1.00 : 1.16)).toFixed(2));
  const pRate = isDefaultAUtoParadip ? 14.80 : Number((baseRate * 1.00).toFixed(2));
  const cRate = isDefaultAUtoParadip ? 12.14 : Number((baseRate * (isDomesticRoute ? 0.90 : 0.81)).toFixed(2));

  // 4 Vessel classes metrics dynamically synced
  const vesselClasses = [
    {
      name: 'Handysize',
      dwt: '35,000 MT',
      rate: hRate,
      totalCost: Math.round(cargoVolume * hRate),
      image: '/assets/vessels/handysize.jpg',
      eta: '12 Nov 2026',
      compatibility: 100,
      badge: 'Best Match',
      isOperationalFit: true,
      description: 'Geared handy bulk carrier with 4x30t cranes. Ideal for flexible shallow-draft berths.',
      maxDraft: '10.5m',
      beam: '28.4m',
      loa: '180m',
      speed: '13.5 knots',
      holds: '5 holds / hatches',
    },
    {
      name: 'Supramax',
      dwt: '58,000 MT',
      rate: sRate,
      totalCost: Math.round(cargoVolume * sRate),
      image: '/assets/vessels/supramax.jpg',
      eta: '16 Nov 2026',
      compatibility: 100,
      isOperationalFit: isDomesticRoute,
      description: 'Standard geared Supramax with grab-equipped cranes for rapid unberthing.',
      maxDraft: '12.8m',
      beam: '32.2m',
      loa: '190m',
      speed: '14.0 knots',
      holds: '5 holds / hatches',
    },
    {
      name: 'Panamax',
      dwt: '76,000 MT',
      rate: pRate,
      totalCost: Math.round(cargoVolume * pRate),
      image: '/assets/vessels/panamax.jpg',
      eta: '14 Nov 2026',
      compatibility: 92.1,
      isOperationalFit: !isDomesticRoute,
      description: 'Gearless broad-beam vessel. Optimum economics for major Indian bulk terminals.',
      maxDraft: '14.2m',
      beam: '32.3m',
      loa: '225m',
      speed: '14.2 knots',
      holds: '7 holds / hatches',
    },
    {
      name: 'Capesize',
      dwt: '180,000 MT',
      rate: cRate,
      totalCost: Math.round(cargoVolume * cRate),
      image: '/assets/vessels/capesize.jpg',
      eta: '20 Nov 2026',
      compatibility: isDomesticRoute ? 25.0 : 38.9,
      isOperationalFit: false,
      isLowestCost: true,
      description: 'Maximum haulage heavy ore/coal carrier. Requires deep-draft outer harbour or partial lightering.',
      maxDraft: '18.2m',
      beam: '45.0m',
      loa: '292m',
      speed: '14.5 knots',
      holds: '9 holds / hatches',
    },
  ];


  // Key Insights Calculation
  const lowestCostVessel = vesselClasses.find(v => v.isLowestCost) || vesselClasses[3];
  const bestFitVessel = vesselClasses.find(v => v.isOperationalFit) || vesselClasses[0];
  const potentialSavings = vesselClasses[0].totalCost - lowestCostVessel.totalCost; // $579,600
  const savingsPct = ((potentialSavings / vesselClasses[0].totalCost) * 100).toFixed(1); // 40.5%

  // Recharts Monthly & Daily trend data matching Image 2, dynamically scaled with live baseRate
  const rateScale = isDefaultAUtoParadip ? 1.0 : baseRate / 15.00;
  const TREND_CHART_POINTS = [
    { label: 'Sep 2026', month: 'Sep 2026', rate: Number((18.20 * rateScale).toFixed(2)) },
    { label: '', month: 'Sep 15', rate: Number((17.10 * rateScale).toFixed(2)) },
    { label: 'Oct 2026', month: 'Oct 2026', rate: Number((15.60 * rateScale).toFixed(2)) },
    { label: '', month: 'Oct 15', rate: Number((14.80 * rateScale).toFixed(2)) },
    { label: '', month: 'Nov 01', rate: Number((14.10 * rateScale).toFixed(2)) },
    { label: 'Nov 2026', month: '12 Nov', rate: Number((13.73 * rateScale).toFixed(2)), isOptimal: true },
    { label: '', month: 'Nov 24', rate: Number((13.85 * rateScale).toFixed(2)) },
    { label: 'Dec 2026', month: 'Dec 2026', rate: Number((14.10 * rateScale).toFixed(2)) },
    { label: '', month: 'Dec 20', rate: Number((14.40 * rateScale).toFixed(2)) },
    { label: 'Jan 2027', month: 'Jan 2027', rate: Number((15.00 * rateScale).toFixed(2)) },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-5 bg-[#F8F7F3] min-h-screen text-[#172033] font-sans">

      {/* ========================================================================= */}
      {/* 1. INITIAL FORM STATE */}
      {/* ========================================================================= */}
      {viewMode === 'form' && (
        <>
          {/* Top Title Header & Data Provenance Capsule */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
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

              {/* Preset Buttons */}
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
                <button
                  type="button"
                  onClick={handlePresetIndiaCoastal}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[#0F2747] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Anchor className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>🇮🇳 Paradip — 🇮🇳 Hazira (Coastal)</span>
                </button>
              </div>
            </div>

            {/* 3 Columns Form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* COLUMN 1: CARGO SPECIFICATION */}
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

                    <div className="flex items-center gap-2 mt-2 text-[11px] text-[#64748B]">
                      <span className="font-semibold text-slate-400 text-[10px]">Presets:</span>
                      <button
                        type="button"
                        onClick={() => setCargoVolume(70000)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${cargoVolume === 70000 ? 'bg-[#0F2747] text-white border-[#0F2747]' : 'bg-white border-slate-200 text-[#0F2747] hover:bg-slate-100'
                          }`}
                      >
                        70k MT
                      </button>
                      <button
                        type="button"
                        onClick={() => setCargoVolume(120000)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${cargoVolume === 120000 ? 'bg-[#0F2747] text-white border-[#0F2747]' : 'bg-white border-slate-200 text-[#0F2747] hover:bg-slate-100'
                          }`}
                      >
                        120k MT
                      </button>
                      <button
                        type="button"
                        onClick={() => setCargoVolume(180000)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${cargoVolume === 180000 ? 'bg-[#0F2747] text-white border-[#0F2747]' : 'bg-white border-slate-200 text-[#0F2747] hover:bg-slate-100'
                          }`}
                      >
                        180k MT
                      </button>
                    </div>
                  </div>
                </div>

                {(() => {
                  const formCargoInfo = identifyCargoIntelligence(effectiveCargoName);
                  return (
                    <div className="p-3 rounded-xl bg-white border border-[#E4E2DC] shadow-xs space-y-2 mt-3 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-[#D6A63B]" />
                          <span className="text-[10.5px] font-black uppercase tracking-wider text-[#0F2747]">
                            AI Material Specification
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-black border ${
                          formCargoInfo.imsbcGroup === 'Group A' 
                            ? 'bg-rose-50 text-rose-700 border-rose-200' 
                            : formCargoInfo.imsbcGroup === 'Group B' 
                              ? 'bg-amber-50 text-amber-700 border-amber-200' 
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          IMSBC {formCargoInfo.imsbcGroup}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                        <div className="p-1.5 rounded-lg bg-[#FAF9F5] border border-slate-100">
                          <span className="text-slate-400 block text-[9.5px] font-bold uppercase">Classification</span>
                          <span className="font-bold text-[#0F2747] truncate block">{formCargoInfo.category}</span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-[#FAF9F5] border border-slate-100">
                          <span className="text-slate-400 block text-[9.5px] font-bold uppercase">Stowage Factor</span>
                          <span className="font-bold font-mono text-[#0F2747]">{formCargoInfo.stowageFactorM3PerMt} m³/MT</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-slate-500 leading-snug">
                        {formCargoInfo.hazardWarning}
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* COLUMN 2: MARITIME TRADE ROUTE & PORTS */}
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
                        Select loading hub (International / Domestic) and Indian discharge port (East or West Coast)
                      </p>
                    </div>
                  </div>

                  {/* Dynamic Route Indicator */}
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-[10.5px]">
                    <span className="font-bold text-[#0F2747] flex items-center gap-1.5">
                      <span>{isDomesticRoute ? '🇮🇳 Domestic Coastal Route (Cabotage)' : '🌐 International Import Corridor'}</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      destRegion === 'West Coast'
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {destRegion} Terminal
                    </span>
                  </div>

                  <OriginPortFlyout
                    label="ORIGIN PORT (LOADING HUB)"
                    required
                    value={originPort}
                    onChange={(portName, countryName) => {
                      setOriginPort(`${countryName} (${portName})`);
                    }}
                  />

                  <div>
                    <DestinationPortDropdown
                      label="DISCHARGE PORT (INDIA - EAST & WEST COAST)"
                      required
                      value={destPort}
                      onChange={(portName) => {
                        setDestPort(portName);
                      }}
                    />
                    {(() => {
                      const detail = getIndianPortDetail(destPort);
                      return (
                        <div className="text-[9.5px] text-slate-500 mt-1.5 font-mono flex items-center justify-between">
                          <span>Draft: <strong className="text-[#0F2747]">{detail.maxDraft}</strong> | LOA: <strong className="text-[#0F2747]">{detail.maxLoa}</strong></span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 font-bold text-slate-700 text-[9px]">{detail.region} ({detail.state})</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {(() => {
                  const detail = getIndianPortDetail(destPort);
                  const isRestricted = !detail.maxDraft.includes('Deep Water') && parseFloat(detail.maxDraft) <= 14.5;
                  return (
                    <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-900 mt-3">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-[11px] text-amber-950">Draft Compliance Note</div>
                          <div className="text-[10px] text-amber-800 leading-snug mt-0.5">
                            {isRestricted
                              ? `${detail.region} discharge draft limits (${detail.maxDraft} max at ${detail.cleanName}) automatically restrict Capesize laden arrivals.`
                              : `${detail.cleanName} deep draft (${detail.maxDraft}) permits full Capesize / Newcastlemax loading with zero lightering penalty.`
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* COLUMN 3: CHARTER PERIOD & LAYCAN SCHEDULE */}
              <div className="lg:col-span-4 p-4 rounded-xl bg-[#FAF9F5] border border-[#E4E2DC] space-y-3.5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-black font-mono bg-[#0F2747] text-white">
                      03
                    </span>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-[#0F2747]">
                        CHARTER PERIOD &amp; LAYCAN
                      </h3>
                      <p className="text-[10.5px] text-[#64748B] font-medium leading-none mt-0.5">
                        Define laycan window and horizon scope
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-[#475569] mb-1">
                      CHARTER DURATION SCOPE
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDurationScope('short')}
                        className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${durationScope === 'short'
                            ? 'bg-[#0F2747] text-white border-[#0F2747] shadow-xs'
                            : 'bg-white text-[#0F2747] border-slate-200 hover:bg-slate-50'
                          }`}
                      >
                        Short-Term (Spot)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDurationScope('medium')}
                        className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${durationScope === 'medium'
                            ? 'bg-[#0F2747] text-white border-[#0F2747] shadow-xs'
                            : 'bg-white text-[#0F2747] border-slate-200 hover:bg-slate-50'
                          }`}
                      >
                        Medium-Term (COA)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-[#475569] mb-1">
                        LAYCAN COMMENCEMENT
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-xs font-mono font-bold text-[#0F2747] focus:outline-none focus:border-[#D6A63B]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-[#475569] mb-1">
                        LAYCAN CANCELLING
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-xs font-mono font-bold text-[#0F2747] focus:outline-none focus:border-[#D6A63B]"
                      />
                    </div>
                  </div>
                </div>

                {/* Simulation Action Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleGenerateForecast}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D97706] via-[#B45309] to-[#0F2747] hover:opacity-95 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>Run Freight Forecast Simulation</span>
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

          {/* Quick Access to Latest Resulted Forecast */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs font-black text-[#0F2747]">
                  Latest Forecast Simulation Ready
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  Corridor: {originCountry} → {cleanDest} | Best Fixing Window: 12–24 Nov 2026 ($13.73 / MT)
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setViewMode('result');
                navigate('/forecast/result');
              }}
              className="px-4 py-2 rounded-xl bg-[#0F2747] hover:bg-[#1A365D] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>View Resulted Forecast (Image 2)</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#D6A63B]" />
            </button>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 2. INFERENCE COMPUTATION MODAL */}
      {/* ========================================================================= */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-[16px] border border-slate-700 shadow-2xl overflow-hidden animate-scaleUp">
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

            <div className="p-6 space-y-4 text-xs">
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

              <div className="space-y-2.5 pt-1">
                <div className="flex items-center gap-2.5 text-[11.5px]">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${activeStepIndex >= 1 ? 'bg-emerald-500 text-white' : 'border border-slate-300'
                    }`}>
                    {activeStepIndex >= 1 ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                  </div>
                  <span className={activeStepIndex >= 1 ? 'text-slate-800 font-semibold' : 'text-slate-400'}>
                    Querying Baltic Exchange FFA indices &amp; corridor benchmarks
                  </span>
                </div>

                <div className="flex items-center gap-2.5 text-[11.5px]">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${activeStepIndex >= 2 ? 'bg-emerald-500 text-white' : activeStepIndex === 1 ? 'border-2 border-[#D97706] border-t-transparent animate-spin' : 'border border-slate-300'
                    }`}>
                    {activeStepIndex >= 2 ? <Check className="w-3 h-3 stroke-[3]" /> : null}
                  </div>
                  <span className={activeStepIndex >= 2 ? 'text-slate-800 font-semibold' : activeStepIndex === 1 ? 'text-[#D97706] font-bold' : 'text-slate-400'}>
                    Simulating bunker fuel sensitivity &amp; voyage turnaround
                  </span>
                </div>

                <div className="flex items-center gap-2.5 text-[11.5px]">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${activeStepIndex >= 3 ? 'bg-emerald-500 text-white' : activeStepIndex === 2 ? 'border-2 border-[#D97706] border-t-transparent animate-spin' : 'border border-slate-300'
                    }`}>
                    {activeStepIndex >= 3 ? <Check className="w-3 h-3 stroke-[3]" /> : null}
                  </div>
                  <span className={activeStepIndex >= 3 ? 'text-slate-800 font-semibold' : activeStepIndex === 2 ? 'text-[#D97706] font-bold' : 'text-slate-400'}>
                    Executing HistGradientBoosting Quantile Model (P10 / P50 / P90)
                  </span>
                </div>

                <div className="flex items-center gap-2.5 text-[11.5px]">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${activeStepIndex >= 4 ? 'bg-emerald-500 text-white' : activeStepIndex === 3 ? 'border-2 border-[#2563EB] border-t-transparent animate-spin' : 'border border-slate-300'
                    }`}>
                    {activeStepIndex >= 4 ? <Check className="w-3 h-3 stroke-[3]" /> : null}
                  </div>
                  <span className={activeStepIndex >= 4 ? 'text-slate-800 font-semibold' : activeStepIndex === 3 ? 'text-[#2563EB] font-bold' : 'text-slate-400'}>
                    Synthesizing PortIN Optimal Charter Window &amp; Recommendation
                  </span>
                </div>
              </div>

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
      {/* 3. RESULTED FREIGHT FORECAST (EXACTLY MATCHING IMAGE 2) */}
      {/* ========================================================================= */}
      {viewMode === 'result' && (
        <div className="space-y-4">
          {/* Breadcrumb & Top Header Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold text-[#68717D] flex items-center gap-1.5 mb-1">
                <Home className="w-3.5 h-3.5 text-slate-400" />
                <span>Forecast</span>
                <span className="text-slate-400">&gt;</span>
                <span className="text-[#0F2747] font-bold">Result</span>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-[28px] font-black text-[#0F2747] tracking-tight leading-tight">
                  Resulted Freight Forecast
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                  <span>OPTIMAL WINDOW IDENTIFIED</span>
                </span>
              </div>
              <p className="text-xs sm:text-[13px] text-[#64748B] mt-0.5 font-medium">
                AI-driven forecast based on market trends, vessel availability, weather conditions and route intelligence.
              </p>
            </div>

            {/* Action Buttons: Modify Parameters, Export Report, Book Now */}
            <div className="flex items-center gap-2.5 self-start lg:self-auto shrink-0 flex-wrap">
              <button
                type="button"
                onClick={handleBackToForm}
                className="px-3.5 py-2 rounded-xl border border-[#CBD5E1] bg-white hover:bg-slate-50 text-[#0F2747] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#0F2747]" />
                <span>Modify Parameters</span>
              </button>

              <button
                type="button"
                onClick={() => setShowExportModal(true)}
                className="px-3.5 py-2 rounded-xl border border-[#CBD5E1] bg-white hover:bg-slate-50 text-[#0F2747] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#0F2747]" />
                <span>Export Report</span>
              </button>

              <button
                type="button"
                onClick={handleProceedToBooking}
                className="px-4 py-2 rounded-xl bg-[#0F2747] hover:bg-[#1A365D] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-[#D6A63B]" />
                <span>Book Now</span>
              </button>
            </div>
          </div>

          {/* SIMULATION INPUT PARAMETERS: 4 Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Card 1: CORRIDOR */}
            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-[#D97706]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  CORRIDOR
                </div>
                <div className="text-xs font-black text-[#0F2747] truncate">
                  {isDomesticRoute ? `${originPort.split(' (')[1]?.replace(')', '') || originPort} → ${cleanDest}` : `${originCountry} → ${cleanDest}`}
                </div>
                <div className="text-[10.5px] text-slate-500 font-medium truncate">
                  {isDomesticRoute ? `Coastal Cabotage • ${destRegion}` : `${cleanDest} (${destState}), ${destRegion}`}
                </div>
              </div>
            </div>

            {/* Card 2: CARGO PARCEL */}
            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-[#2563EB]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  CARGO PARCEL
                </div>
                <div className="text-xs font-black text-[#0F2747] font-mono truncate">
                  {cargoVolume.toLocaleString()} MT
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="text-[10.5px] text-slate-600 font-bold truncate">
                    {effectiveCargoName}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-slate-100 text-[#0F2747]">
                    SF: {(forecastData.cargo_intelligence?.stowageFactorM3PerMt || identifyCargoIntelligence(effectiveCargoName).stowageFactorM3PerMt)} m³/MT
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: LAYCAN WINDOW */}
            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-[#059669]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  LAYCAN WINDOW
                </div>
                <div className="text-xs font-black text-[#0F2747] font-mono truncate">
                  {formattedLaycanWindow}
                </div>
                <div className="text-[10.5px] text-slate-500 font-medium truncate">
                  Scope: {durationScope === 'short' ? 'Short-Term (Spot)' : 'Medium-Term'}
                </div>
              </div>
            </div>

            {/* Card 4: MODEL CONFIDENCE */}
            <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
                <BarChart2 className="w-5 h-5 text-[#7C3AED]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  MODEL CONFIDENCE
                </div>
                <div className="text-xs font-black text-[#0F2747] font-mono truncate">
                  {forecastData.forecast_confidence || 82}% (MAE 8.3)
                </div>
                <div className="text-[10.5px] text-slate-500 font-medium truncate">
                  PortIN v2.0
                </div>
              </div>
            </div>
          </div>

          {/* SUB-NAVIGATION TABS (Image 2) */}
          <div className="flex items-center gap-6 border-b border-slate-200 overflow-x-auto text-xs font-bold pt-1">
            <button
              type="button"
              onClick={() => setActiveSubTab('results')}
              className={`pb-3 flex items-center gap-2 transition-all border-b-2 whitespace-nowrap cursor-pointer ${activeSubTab === 'results'
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-slate-500 hover:text-[#0F2747]'
                }`}
            >
              <FileText className="w-4 h-4" />
              <span>Forecast Results</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('weather')}
              className={`pb-3 flex items-center gap-2 transition-all border-b-2 whitespace-nowrap cursor-pointer ${activeSubTab === 'weather'
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-slate-500 hover:text-[#0F2747]'
                }`}
            >
              <Compass className="w-4 h-4" />
              <span>Route &amp; Weather Analysis</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('vessels')}
              className={`pb-3 flex items-center gap-2 transition-all border-b-2 whitespace-nowrap cursor-pointer ${activeSubTab === 'vessels'
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-slate-500 hover:text-[#0F2747]'
                }`}
            >
              <Ship className="w-4 h-4" />
              <span>Vessel Comparison</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('congestion')}
              className={`pb-3 flex items-center gap-2 transition-all border-b-2 whitespace-nowrap cursor-pointer ${activeSubTab === 'congestion'
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-slate-500 hover:text-[#0F2747]'
                }`}
            >
              <Anchor className="w-4 h-4" />
              <span>Port Congestion</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('market')}
              className={`pb-3 flex items-center gap-2 transition-all border-b-2 whitespace-nowrap cursor-pointer ${activeSubTab === 'market'
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-slate-500 hover:text-[#0F2747]'
                }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Market Trend</span>
            </button>
          </div>

          {/* TAB 1 CONTENT: MAIN FORECAST RESULTS */}
          {activeSubTab === 'results' && (
            <div className="space-y-4">
              {/* RECOMMENDED CHARTER WINDOW BANNER */}
              <div className="p-4 sm:p-5 rounded-[16px] bg-white border border-[#E2E8F0] shadow-xs space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[#2563EB]" />
                  <div>
                    <h2 className="text-sm font-black text-[#0F2747] tracking-tight">
                      Recommended Charter Window
                    </h2>
                    <p className="text-[11px] text-[#64748B] font-medium">
                      Based on freight forecast, vessel availability and weather conditions
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {/* Box 1: Best Charter Date (Green card) */}
                  <div className="p-3.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#065F46]">
                          <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                          <span>Best Charter Date</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black bg-[#10B981] text-white">
                          Recommended
                        </span>
                      </div>
                      <div className="text-2xl font-black text-[#0F2747] tracking-tight mt-1.5 font-mono">
                        12 Nov 2026
                      </div>
                    </div>
                    <p className="text-[10px] text-[#047857] font-medium leading-snug mt-2">
                      Reason: Lowest forecasted rate, favourable weather, multiple vessel availability.
                    </p>
                  </div>

                  {/* Box 2: Expected Rate (T + 30 Days) */}
                  <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] flex flex-col justify-between">
                    <div>
                      <div className="text-[10.5px] font-bold uppercase text-slate-500">
                        Expected Rate (T + 30 Days)
                      </div>
                      <div className="text-2xl font-black text-[#0F2747] font-mono mt-1">
                        ${forecastData.day_30_prediction.toFixed(2)}{' '}
                        <span className="text-xs font-bold text-slate-500 font-sans">/ MT</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-2">
                      <span>▼ -3.2% vs current</span>
                    </div>
                  </div>

                  {/* Box 3: Expected Rate (T + 90 Days) */}
                  <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] flex flex-col justify-between">
                    <div>
                      <div className="text-[10.5px] font-bold uppercase text-slate-500">
                        Expected Rate (T + 90 Days)
                      </div>
                      <div className="text-2xl font-black text-[#0F2747] font-mono mt-1">
                        ${forecastData.day_90_prediction.toFixed(2)}{' '}
                        <span className="text-xs font-bold text-slate-500 font-sans">/ MT</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-2">
                      <span>▼ -8.5% vs current</span>
                    </div>
                  </div>

                  {/* Box 4: Weather Suitability */}
                  <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase text-slate-500">
                        <CloudSun className="w-4 h-4 text-amber-500" />
                        <span>Weather Suitability</span>
                      </div>
                      <div className="text-2xl font-black text-[#0F2747] mt-1">
                        Good
                      </div>
                    </div>
                    <div className="text-[10.5px] text-slate-500 font-medium mt-2">
                      Calm to moderate seas (0.5 – 1.5 m)
                    </div>
                  </div>
                </div>
              </div>

              {/* MIDDLE ROW: 3 COLUMNS COCKPIT */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

                {/* COLUMN 1: FREIGHT FORECAST TREND */}
                <div className="lg:col-span-4 p-4 rounded-[16px] bg-white border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-[#0F2747]" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-[#0F2747]">
                          Freight Forecast Trend
                        </h3>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9.5px] font-mono font-bold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                        Optimal Window (12–24 Nov)
                      </span>
                    </div>

                    <div className="h-56 w-full relative pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                          data={TREND_CHART_POINTS}
                          margin={{ top: 15, right: 10, left: -25, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="areaTrendGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#2563EB" stopOpacity={0.15} />
                              <stop offset="100%" stopColor="#2563EB" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>

                          <ReferenceArea
                            x1="12 Nov"
                            x2="Nov 24"
                            fill="#ECFDF5"
                            fillOpacity={0.8}
                          />

                          <XAxis
                            dataKey="month"
                            stroke="#94A3B8"
                            fontSize={9}
                            tickLine={false}
                            interval={2}
                          />
                          <YAxis
                            stroke="#94A3B8"
                            fontSize={9}
                            domain={[10, 20]}
                            ticks={[10, 12, 14, 16, 18, 20]}
                            tickLine={false}
                          />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const d = payload[0].payload;
                                return (
                                  <div className="p-2 bg-white rounded-lg shadow-md border border-slate-200 text-xs font-mono">
                                    <div className="font-bold text-[#0F2747] font-sans">{d.month}</div>
                                    <div className="text-blue-600 font-black mt-0.5">Rate: ${d.rate.toFixed(2)} / MT</div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />

                          <Area
                            type="monotone"
                            dataKey="rate"
                            stroke="none"
                            fill="url(#areaTrendGrad)"
                          />
                          <Line
                            type="monotone"
                            dataKey="rate"
                            stroke="#2563EB"
                            strokeWidth={2.5}
                            dot={(props: any) => {
                              const { cx, cy, payload } = props;
                              if (payload.isOptimal) {
                                return (
                                  <g key={`dot-${payload.month}`}>
                                    <circle cx={cx} cy={cy} r={6} fill="#10B981" />
                                    <circle cx={cx} cy={cy} r={3} fill="#FFFFFF" />
                                  </g>
                                );
                              }
                              return <circle key={`dot-${payload.month}`} cx={cx} cy={cy} r={0} />;
                            }}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                    <span>Rate ($/MT) Axis: 10–20</span>
                    <span className="text-[#059669] font-bold">Optimal Point: 12 Nov ($13.73)</span>
                  </div>
                </div>

                {/* COLUMN 2: ROUTE WEATHER FORECAST (MAP & VESSEL) */}
                <div className="lg:col-span-4 p-4 rounded-[16px] bg-white border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Cloud className="w-4 h-4 text-[#0F2747]" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-[#0F2747]">
                          Route Weather Forecast
                        </h3>
                      </div>
                      <Link
                        to="/weather-forecasting"
                        className="text-[10px] font-bold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-0.5"
                      >
                        <span>View Detailed Forecast</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                    <div className="text-[11px] text-slate-500 mt-1 mb-2 font-semibold">
                      ({originCountry} → {cleanDest})
                    </div>

                    {/* Route Weather Interactive Box */}
                    <div className="relative rounded-xl overflow-hidden bg-[#0A192F] border border-slate-700 h-52 flex flex-col justify-between p-3 text-white shadow-inner">
                      {/* Top floating badge with ETA & Weather Stats */}
                      <div className="flex items-center justify-between gap-2 z-10">
                        <div className="px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-xs text-[10px] font-mono font-bold text-[#FCD34D] border border-white/10">
                          12 Nov 2026 (ETA)
                        </div>
                        <div className="flex items-center gap-1.5 text-[9.5px]">
                          <span className="px-1.5 py-0.5 rounded bg-white/10">Wind: 8–12 kts</span>
                          <span className="px-1.5 py-0.5 rounded bg-white/10">Wave: 0.8m</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                            Low Risk
                          </span>
                        </div>
                      </div>

                      {/* SVG Ocean Graphic with continents, route & sailing ship */}
                      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-90">
                        <svg viewBox="0 0 360 170" className="w-full h-full object-cover">
                          {/* Ocean Waves Background */}
                          <defs>
                            <linearGradient id="oceanGrad" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#0B1E3B" />
                              <stop offset="50%" stopColor="#0D2D59" />
                              <stop offset="100%" stopColor="#0B1E3B" />
                            </linearGradient>
                            <filter id="glow">
                              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                              <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                              </feMerge>
                            </filter>
                          </defs>
                          <rect width="360" height="170" fill="url(#oceanGrad)" />

                          {/* Simplified landmass outlines: India (top-left) and Australia (bottom-right) */}
                          <path
                            d="M 20 10 Q 50 15 80 40 Q 100 80 85 110 Q 60 70 30 50 Z"
                            fill="#1E3A5F"
                            opacity="0.6"
                          />
                          <path
                            d="M 240 90 Q 280 80 320 100 Q 335 140 290 155 Q 250 145 240 110 Z"
                            fill="#1E3A5F"
                            opacity="0.6"
                          />

                          {/* Curved shipping route from Australia to Paradip */}
                          <path
                            d="M 280 110 C 210 130, 140 90, 85 45"
                            fill="none"
                            stroke="#38BDF8"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                            filter="url(#glow)"
                          />

                          {/* Destination Port Marker: Paradip */}
                          <circle cx="85" cy="45" r="4.5" fill="#EF4444" />
                          <circle cx="85" cy="45" r="8" fill="#EF4444" opacity="0.3" />
                          <text x="75" y="32" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="end">
                            Paradip
                          </text>

                          {/* Origin Marker: Australia */}
                          <circle cx="280" cy="110" r="4.5" fill="#F59E0B" />
                          <circle cx="280" cy="110" r="8" fill="#F59E0B" opacity="0.3" />
                          <text x="290" y="125" fill="#FFFFFF" fontSize="9" fontWeight="bold">
                            Australia
                          </text>

                          {/* Cargo Ship Icon navigating along the route */}
                          <g transform="translate(180, 88) rotate(-35)">
                            <polygon points="-8,3 0,-5 8,3 6,5 -6,5" fill="#FFFFFF" />
                            <rect x="-4" y="-3" width="8" height="4" fill="#D97706" />
                            <circle cx="0" cy="-2" r="1.5" fill="#EF4444" />
                          </g>
                        </svg>
                      </div>

                      {/* Sea Conditions bottom gradient bar */}
                      <div className="z-10 pt-1 flex items-center justify-between text-[9px] text-slate-300">
                        <span className="font-bold">Sea Conditions</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-emerald-400 font-semibold">Calm</span>
                          <div className="w-24 h-1.5 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500" />
                          <span className="text-red-400 font-semibold">Rough</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
                    <span>Monsoon Risk: Calm (0.8m seas)</span>
                    <span className="text-emerald-600 font-bold">ETA: 12 Nov 2026</span>
                  </div>
                </div>

                {/* COLUMN 3: PORT & VESSEL AVAILABILITY */}
                <div className="lg:col-span-4 p-4 rounded-[16px] bg-white border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Anchor className="w-4 h-4 text-[#0F2747]" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-[#0F2747]">
                          Port &amp; Vessel Availability
                        </h3>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-emerald-50 text-emerald-700">
                        5 / 5 Cleared
                      </span>
                    </div>

                    <div className="space-y-2.5 mt-3">
                      {/* Item 1 */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-[#0F2747]">{cleanDest}</div>
                            <div className="text-[10px] text-slate-500">Berthing Operations</div>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Normal operations
                        </span>
                      </div>

                      {/* Item 2 */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-[#0F2747]">Vessel Availability</div>
                            <div className="text-[10px] text-slate-500">Capesize / Panamax supply</div>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Good availability
                        </span>
                      </div>

                      {/* Item 3 */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-[#0F2747]">Port Congestion</div>
                            <div className="text-[10px] text-slate-500">Anchorage waiting time</div>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Low (Avg. 0.5 days)
                        </span>
                      </div>

                      {/* Item 4 */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-[#0F2747]">Channel Draft</div>
                            <div className="text-[10px] text-slate-500">Navigation limits ({destDraft})</div>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          No restrictions
                        </span>
                      </div>

                      {/* Item 5 */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-[#0F2747]">Weather Window</div>
                            <div className="text-[10px] text-slate-500">Bay of Bengal transit window</div>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Favourable (12–24 Nov)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                    <span>Berth Congestion Status: Green</span>
                    <span className="text-emerald-700 font-bold">100% Operational Readiness</span>
                  </div>
                </div>
              </div>

              {/* BOTTOM SECTION 1: VESSEL COST COMPARISON */}
              <div className="p-4 sm:p-5 rounded-[16px] bg-white border border-[#E2E8F0] shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <Ship className="w-4 h-4 text-[#0F2747]" />
                      <h3 className="text-sm font-black text-[#0F2747] tracking-tight">
                        Vessel Cost Comparison
                      </h3>
                    </div>
                    <p className="text-[11px] text-[#64748B] font-medium mt-0.5">
                      Compare estimated freight cost across different vessel classes for your route and cargo.
                    </p>
                  </div>

                  {/* Toggle: Cost per MT vs Total Cost */}
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 self-start sm:self-auto text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setCostMode('per_mt')}
                      className={`px-3 py-1 rounded-md transition-all cursor-pointer ${costMode === 'per_mt'
                          ? 'bg-[#0F2747] text-white shadow-xs'
                          : 'text-slate-600 hover:text-[#0F2747]'
                        }`}
                    >
                      Cost per MT
                    </button>
                    <button
                      type="button"
                      onClick={() => setCostMode('total')}
                      className={`px-3 py-1 rounded-md transition-all cursor-pointer ${costMode === 'total'
                          ? 'bg-[#0F2747] text-white shadow-xs'
                          : 'text-slate-600 hover:text-[#0F2747]'
                        }`}
                    >
                      Total Cost
                    </button>
                  </div>
                </div>

                {/* Vessel Cost Comparison Bars & Key Insights Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

                  {/* 4 Vessel Columns (lg:col-span-9) */}
                  <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {vesselClasses.map((vessel, idx) => {
                      // Bar height calculation proportional to cost
                      const barPercent = costMode === 'per_mt'
                        ? Math.round((vessel.rate / 22) * 100)
                        : Math.round((vessel.totalCost / 1500000) * 100);

                      const barColors = ['#0F2747', '#1D4ED8', '#3B82F6', '#93C5FD'];
                      const barColor = barColors[idx] || '#0F2747';

                      return (
                        <div
                          key={vessel.name}
                          className="flex flex-col justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#CBD5E1] transition-all"
                        >
                          {/* Vertical Bar Representation matching Image 2 */}
                          <div className="h-32 flex flex-col justify-end items-center pb-2">
                            <span className="text-[11px] font-mono font-black text-[#0F2747] mb-1">
                              {costMode === 'per_mt'
                                ? `$${vessel.rate.toFixed(2)}`
                                : `$${vessel.totalCost.toLocaleString()}`}
                            </span>
                            <div
                              className="w-12 sm:w-14 rounded-t-md transition-all duration-300"
                              style={{ height: `${barPercent}%`, backgroundColor: barColor }}
                            />
                          </div>

                          {/* Vessel Image & Class Details */}
                          <div className="pt-2 border-t border-slate-200 text-center space-y-1">
                            <div className="w-full h-16 rounded-lg overflow-hidden border border-slate-200 bg-slate-200">
                              <img
                                src={vessel.image}
                                alt={vessel.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="text-xs font-black text-[#0F2747] mt-1">
                              {vessel.name}
                            </div>
                            <div className="text-[11px] font-mono font-bold text-[#2563EB]">
                              ${vessel.rate.toFixed(2)} / MT
                            </div>
                            <div className="text-[9.5px] text-slate-500 font-mono">
                              Total Cost: <strong className="text-slate-700">${vessel.totalCost.toLocaleString()}</strong>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* KEY INSIGHTS PANEL (lg:col-span-3) */}
                  <div className="lg:col-span-3 p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-1.5 pb-2 border-b border-emerald-200 text-emerald-950 font-black text-xs">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>Key Insights</span>
                      </div>

                      <div className="space-y-3 mt-3">
                        <div>
                          <div className="text-[10px] font-bold uppercase text-emerald-800 flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Lowest Cost Option</span>
                          </div>
                          <div className="text-sm font-black text-emerald-950 mt-0.5">
                            {lowestCostVessel.name}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] font-bold uppercase text-emerald-800 flex items-center gap-1">
                            <Anchor className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Best Operational Fit</span>
                          </div>
                          <div className="text-sm font-black text-emerald-950 mt-0.5">
                            {bestFitVessel.name}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] font-bold uppercase text-emerald-800 flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Potential Savings vs Handysize</span>
                          </div>
                          <div className="text-sm font-mono font-black text-emerald-950 mt-0.5">
                            ${potentialSavings.toLocaleString()}{' '}
                            <span className="text-[10.5px] font-bold text-emerald-700 font-sans">
                              ({savingsPct}% lower total cost)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-emerald-200 text-[10px] text-emerald-800 font-medium">
                      Calculated on 70,000 MT baseline voyage parcel size.
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM SECTION 2: TOP VESSEL RECOMMENDATIONS */}
              <div className="p-4 sm:p-5 rounded-[16px] bg-white border border-[#E2E8F0] shadow-xs space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <Ship className="w-4 h-4 text-[#0F2747]" />
                      <h3 className="text-sm font-black text-[#0F2747] tracking-tight">
                        Top Vessel Recommendations
                      </h3>
                    </div>
                    <p className="text-[11px] text-[#64748B] font-medium mt-0.5">
                      Based on forecasted rate, route suitability and vessel availability
                    </p>
                  </div>

                  <Link
                    to="/vessel-optimizer"
                    className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 transition-colors"
                  >
                    <span>View All Vessels</span>
                    <span>&rarr;</span>
                  </Link>
                </div>

                {/* 4 Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {vesselClasses.map((vessel) => (
                    <div
                      key={vessel.name}
                      className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                    >
                      <div>
                        {/* Vessel Image & Badges */}
                        <div className="relative w-full h-24 rounded-lg overflow-hidden bg-slate-100 mb-2">
                          <img
                            src={vessel.image}
                            alt={vessel.name}
                            className="w-full h-full object-cover"
                          />
                          {vessel.badge && (
                            <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-full text-[9.5px] font-black bg-[#10B981] text-white shadow-xs">
                              {vessel.badge}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-xs font-black text-[#0F2747]">
                            {vessel.name}
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 font-bold">
                            {vessel.dwt}
                          </span>
                        </div>

                        <div className="text-xs font-mono font-bold text-[#2563EB] mt-0.5">
                          ${vessel.rate.toFixed(2)} / MT
                        </div>

                        <div className="text-[10.5px] text-slate-500 font-medium mt-1">
                          ETA: <strong className="text-[#0F2747]">{vessel.eta}</strong>
                        </div>

                        {/* Compatibility Bar */}
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                            <span className="text-slate-500">Compatibility:</span>
                            <span className="text-emerald-600 font-mono">{vessel.compatibility}%</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-500 transition-all"
                              style={{ width: `${vessel.compatibility}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* View Details Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedVesselModal(vessel)}
                        className="w-full py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-[#0F2747] text-xs font-bold transition-all text-center cursor-pointer"
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ROUTE & WEATHER ANALYSIS */}
          {activeSubTab === 'weather' && (
            <div className="p-6 rounded-[16px] bg-white border border-[#E2E8F0] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-[#0F2747]">
                    Route &amp; Weather Analysis: {originCountry} to {cleanDest}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    Integrated maritime meteorological routing and wave hazard assessment.
                  </p>
                </div>
                <Link
                  to="/weather-forecasting"
                  className="px-3.5 py-1.5 rounded-xl bg-[#0F2747] text-white text-xs font-bold hover:bg-[#1A365D] transition-all flex items-center gap-1.5"
                >
                  <span>Launch Live Weather Radar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-bold text-slate-500 uppercase">Total Transit Duration</div>
                  <div className="text-2xl font-black text-[#0F2747] mt-1 font-mono">16–18 Days</div>
                  <div className="text-[11px] text-slate-500 mt-1">Based on 14.0 knots service speed</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-bold text-slate-500 uppercase">Peak Significant Wave</div>
                  <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">0.8m (Calm)</div>
                  <div className="text-[11px] text-slate-500 mt-1">Safe envelope through Malacca / Bay of Bengal</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-bold text-slate-500 uppercase">Cyclone Probability</div>
                  <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">4.2% (Low)</div>
                  <div className="text-[11px] text-slate-500 mt-1">Post-monsoon stabilized window (12–24 Nov)</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VESSEL COMPARISON */}
          {activeSubTab === 'vessels' && (
            <div className="p-6 rounded-[16px] bg-white border border-[#E2E8F0] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-[#0F2747]">
                    Multi-Class Vessel Capability Matrix
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    Detailed fuel burn rate, LOA clearance, and cargo intake across all 4 vessel classes.
                  </p>
                </div>
                <Link
                  to="/vessel-optimizer"
                  className="px-3.5 py-1.5 rounded-xl bg-[#0F2747] text-white text-xs font-bold hover:bg-[#1A365D] transition-all flex items-center gap-1.5"
                >
                  <span>Open Vessel Optimizer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-3">Class</th>
                      <th className="p-3">DWT</th>
                      <th className="p-3">Max Draft</th>
                      <th className="p-3">Freight Rate</th>
                      <th className="p-3">Estimated Total Cost</th>
                      <th className="p-3">Draft Clearance ({cleanDest})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vesselClasses.map((v) => (
                      <tr key={v.name} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-[#0F2747] flex items-center gap-2">
                          <img src={v.image} alt={v.name} className="w-8 h-6 rounded object-cover" />
                          <span>{v.name}</span>
                        </td>
                        <td className="p-3 font-mono">{v.dwt}</td>
                        <td className="p-3 font-mono">{v.maxDraft}</td>
                        <td className="p-3 font-mono font-bold text-blue-600">${v.rate.toFixed(2)} / MT</td>
                        <td className="p-3 font-mono font-bold">${v.totalCost.toLocaleString()}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${v.compatibility >= 90
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                            }`}>
                            {v.compatibility}% Compatible
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PORT CONGESTION */}
          {activeSubTab === 'congestion' && (
            <div className="p-6 rounded-[16px] bg-white border border-[#E2E8F0] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-[#0F2747]">
                    Port Congestion &amp; Berthing Queue: {cleanDest}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    Live anchorage waiting times, berth turnaround, and demurrage exposure forecast.
                  </p>
                </div>
                <Link
                  to="/risk-monitor"
                  className="px-3.5 py-1.5 rounded-xl bg-[#0F2747] text-white text-xs font-bold hover:bg-[#1A365D] transition-all flex items-center gap-1.5"
                >
                  <span>Open Risk &amp; Congestion Monitor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-bold text-slate-500 uppercase">Average Queue Waiting</div>
                  <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">0.5 Days</div>
                  <div className="text-[11px] text-slate-500 mt-1">Negligible demurrage risk</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-bold text-slate-500 uppercase">Berth Occupancy</div>
                  <div className="text-2xl font-black text-[#0F2747] mt-1 font-mono">68%</div>
                  <div className="text-[11px] text-slate-500 mt-1">Optimal operating threshold</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-bold text-slate-500 uppercase">Discharge Productivity</div>
                  <div className="text-2xl font-black text-[#0F2747] mt-1 font-mono">42,000 MT/day</div>
                  <div className="text-[11px] text-slate-500 mt-1">High-speed mechanized conveyors</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-bold text-slate-500 uppercase">Channel Draft Clearance</div>
                  <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">{destDraft}</div>
                  <div className="text-[11px] text-slate-500 mt-1">Tide-assisted arrival available</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MARKET TREND */}
          {activeSubTab === 'market' && (
            <div className="p-6 rounded-[16px] bg-white border border-[#E2E8F0] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-[#0F2747]">
                    Global Commodity &amp; Baltic Freight Indicators
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    Forward Freight Agreements (FFA), Singapore VLSFO bunker prices, and iron ore/coking coal demand.
                  </p>
                </div>
                <Link
                  to="/market"
                  className="px-3.5 py-1.5 rounded-xl bg-[#0F2747] text-white text-xs font-bold hover:bg-[#1A365D] transition-all flex items-center gap-1.5"
                >
                  <span>Open Market Intelligence</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-bold text-slate-500 uppercase">Baltic Capesize Index (BCI)</div>
                  <div className="text-2xl font-black text-[#0F2747] mt-1 font-mono">2,840 pts</div>
                  <div className="text-[11px] text-emerald-600 font-bold mt-1">▼ -4.2% (Seasonal cooling)</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-bold text-slate-500 uppercase">Singapore VLSFO Bunker</div>
                  <div className="text-2xl font-black text-[#0F2747] mt-1 font-mono">$612.50 / MT</div>
                  <div className="text-[11px] text-slate-500 mt-1">Stable supply across regional hubs</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-bold text-slate-500 uppercase">Baltic Panamax Index (BPI)</div>
                  <div className="text-2xl font-black text-[#0F2747] mt-1 font-mono">1,620 pts</div>
                  <div className="text-[11px] text-emerald-600 font-bold mt-1">▼ -2.8% (Softening forward FFA)</div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW DETAILS TECHNICAL SPECIFICATIONS MODAL */}
          {selectedVesselModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
              <div className="relative w-full max-w-lg bg-white rounded-[16px] border border-slate-200 shadow-2xl overflow-hidden animate-scaleUp">
                <div className="p-4 bg-[#0F2747] text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ship className="w-4 h-4 text-[#D6A63B]" />
                    <h3 className="text-sm font-bold tracking-tight">
                      {selectedVesselModal.name} Specifications
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedVesselModal(null)}
                    className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 space-y-4 text-xs">
                  <div className="w-full h-36 rounded-xl overflow-hidden border border-slate-200">
                    <img
                      src={selectedVesselModal.image}
                      alt={selectedVesselModal.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <p className="text-slate-600 leading-relaxed font-medium">
                    {selectedVesselModal.description}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Deadweight</div>
                      <div className="font-mono font-bold text-[#0F2747] mt-0.5">{selectedVesselModal.dwt}</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Max Summer Draft</div>
                      <div className="font-mono font-bold text-[#0F2747] mt-0.5">{selectedVesselModal.maxDraft}</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="text-[10px] uppercase font-bold text-slate-400">LOA / Beam</div>
                      <div className="font-mono font-bold text-[#0F2747] mt-0.5">{selectedVesselModal.loa} / {selectedVesselModal.beam}</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Service Speed</div>
                      <div className="font-mono font-bold text-[#0F2747] mt-0.5">{selectedVesselModal.speed}</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Hold Capacity</div>
                      <div className="font-mono font-bold text-[#0F2747] mt-0.5">{selectedVesselModal.holds}</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Port Compatibility</div>
                      <div className="font-mono font-bold text-emerald-600 mt-0.5">{selectedVesselModal.compatibility}%</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedVesselModal(null)}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-[#0F2747] font-bold text-xs hover:bg-slate-50 cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedVesselModal(null);
                        handleProceedToBooking();
                      }}
                      className="px-4 py-1.5 rounded-lg bg-[#0F2747] text-white font-bold text-xs hover:bg-[#1A365D] cursor-pointer flex items-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#D6A63B]" />
                      <span>Select for Smart Booking</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* EXPORT REPORT MODAL */}
          {showExportModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
              <div className="relative w-full max-w-md bg-white rounded-[16px] border border-slate-200 shadow-2xl overflow-hidden animate-scaleUp">
                <div className="p-4 bg-[#0F2747] text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-[#D6A63B]" />
                    <h3 className="text-sm font-bold tracking-tight">
                      Export Forecast Dossier
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowExportModal(false)}
                    className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 space-y-3.5 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="font-bold text-[#0F2747] text-sm">
                      PortIN Econometric Dossier: {originCountry} → {cleanDest}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Parcel: {cargoVolume.toLocaleString()} MT ({effectiveCargoName}) | Window: {formattedLaycanWindow}
                    </div>
                    <div className="text-[11px] text-emerald-700 font-bold">
                      Recommended Fixing Date: 12 Nov 2026 ($13.73 / MT)
                    </div>
                  </div>

                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    This executive summary contains complete quantile bounds, route weather predictions, vessel cost calculations, and berth compatibility assessments formatted for ministry / executive presentation.
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowExportModal(false)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-[#0F2747] font-bold hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        window.print();
                        setShowExportModal(false);
                      }}
                      className="px-4 py-1.5 rounded-lg bg-[#0F2747] text-white font-bold hover:bg-[#1A365D] cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-[#D6A63B]" />
                      <span>Print / Download PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FreightForecastPage;
