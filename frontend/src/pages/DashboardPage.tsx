import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp, Ship, FileText, CheckCircle2, ShieldAlert,
  Clock, ArrowRight, RefreshCw, Compass, AlertCircle,
  Layers, MapPin, Sparkles, AlertTriangle, ShieldCheck,
  Bell, LogOut, Calculator, ArrowLeftRight
} from 'lucide-react';
import {
  ResponsiveContainer, Area, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, ReferenceArea, ComposedChart
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { KPICard } from '../components/common/KPICard';
import { DataProvenanceBadge } from '../components/common/DataProvenanceBadge';
import { ForecastResponse, AlertItem } from '../types';

interface RouteData {
  id: 'au-paradip' | 'id-vizag' | 'us-dhamra';
  shortLabel: string;
  title: string;
  originPort: string;
  originSub: string;
  distanceNM: string;
  transitDays: string;
  dischargePort: string;
  dischargeSub: string;
  cargoVolume: string;
  recommendedClass: string;
  currentSpot: number;
  lowestForecast: number;
  average90D: number;
  trajectory: string;
  recommendedRate: number;
  savingsPct: string;
  recommendedWindowRange: string;
  recommendedWindowLabel: string;
  recommendedWindowStart: string;
  recommendedWindowEnd: string;
  chartData: {
    date: string;
    forecastRate: number;
    currentSpot: number;
    lowerBound: number;
    upperBound: number;
  }[];
}

const ROUTE_DATA: Record<string, RouteData> = {
  'au-paradip': {
    id: 'au-paradip',
    shortLabel: 'AU → Paradip',
    title: 'Australia (Hay Point) → Paradip Port',
    originPort: 'Australia',
    originSub: 'Queensland, Australia',
    distanceNM: '4,850 NM',
    transitDays: 'Transit ~14d',
    dischargePort: 'Paradip Port',
    dischargeSub: 'Odisha, East Coast',
    cargoVolume: 'Coal - Thermal • 21k MT',
    recommendedClass: 'Supramax',
    currentSpot: 19.72,
    lowestForecast: 18.40,
    average90D: 21.35,
    trajectory: 'Seasonal trough (October)',
    recommendedRate: 18.64,
    savingsPct: 'Save 5.5%',
    recommendedWindowRange: 'Oct 12–26 Window',
    recommendedWindowLabel: 'RECOMMENDED WINDOW - OCT 12–26 ($18.40/MT)',
    recommendedWindowStart: 'Oct 01',
    recommendedWindowEnd: 'Oct 15',
    chartData: [
      { date: 'Aug 05', forecastRate: 19.80, currentSpot: 19.72, lowerBound: 18.30, upperBound: 21.30 },
      { date: 'Aug 19', forecastRate: 19.50, currentSpot: 19.72, lowerBound: 18.00, upperBound: 21.00 },
      { date: 'Sep 02', forecastRate: 19.20, currentSpot: 19.72, lowerBound: 17.70, upperBound: 20.80 },
      { date: 'Sep 16', forecastRate: 18.90, currentSpot: 19.72, lowerBound: 17.40, upperBound: 20.60 },
      { date: 'Oct 01', forecastRate: 18.55, currentSpot: 19.72, lowerBound: 17.20, upperBound: 20.50 },
      { date: 'Oct 15', forecastRate: 18.40, currentSpot: 19.72, lowerBound: 17.10, upperBound: 20.50 },
      { date: 'Nov 01', forecastRate: 19.38, currentSpot: 19.35, lowerBound: 17.48, upperBound: 20.88 },
      { date: 'Nov 15', forecastRate: 19.90, currentSpot: 19.72, lowerBound: 17.90, upperBound: 21.90 },
      { date: 'Dec 01', forecastRate: 20.80, currentSpot: 19.72, lowerBound: 18.60, upperBound: 23.20 },
      { date: 'Dec 15', forecastRate: 21.50, currentSpot: 19.72, lowerBound: 19.20, upperBound: 24.50 },
    ],
  },
  'id-vizag': {
    id: 'id-vizag',
    shortLabel: 'ID → Vizag',
    title: 'Indonesia (Kalimantan) → Visakhapatnam Port',
    originPort: 'Indonesia',
    originSub: 'South Kalimantan',
    distanceNM: '2,420 NM',
    transitDays: 'Transit ~7d',
    dischargePort: 'Visakhapatnam Port',
    dischargeSub: 'Andhra Pradesh, East Coast',
    cargoVolume: 'Thermal Coal • 55k MT',
    recommendedClass: 'Panamax',
    currentSpot: 12.45,
    lowestForecast: 11.20,
    average90D: 13.80,
    trajectory: 'Monsoon recovery (November)',
    recommendedRate: 11.20,
    savingsPct: 'Save 10.0%',
    recommendedWindowRange: 'Nov 04–18 Window',
    recommendedWindowLabel: 'RECOMMENDED WINDOW - NOV 04–18 ($11.20/MT)',
    recommendedWindowStart: 'Oct 15',
    recommendedWindowEnd: 'Nov 01',
    chartData: [
      { date: 'Aug 05', forecastRate: 13.60, currentSpot: 12.45, lowerBound: 12.20, upperBound: 14.80 },
      { date: 'Aug 19', forecastRate: 13.20, currentSpot: 12.45, lowerBound: 11.90, upperBound: 14.40 },
      { date: 'Sep 02', forecastRate: 12.80, currentSpot: 12.45, lowerBound: 11.50, upperBound: 14.10 },
      { date: 'Sep 16', forecastRate: 12.45, currentSpot: 12.45, lowerBound: 11.20, upperBound: 13.80 },
      { date: 'Oct 01', forecastRate: 12.00, currentSpot: 12.45, lowerBound: 10.90, upperBound: 13.40 },
      { date: 'Oct 15', forecastRate: 11.60, currentSpot: 12.45, lowerBound: 10.50, upperBound: 13.00 },
      { date: 'Nov 01', forecastRate: 11.20, currentSpot: 12.45, lowerBound: 10.20, upperBound: 12.60 },
      { date: 'Nov 15', forecastRate: 11.80, currentSpot: 12.45, lowerBound: 10.60, upperBound: 13.20 },
      { date: 'Dec 01', forecastRate: 12.90, currentSpot: 12.45, lowerBound: 11.50, upperBound: 14.50 },
      { date: 'Dec 15', forecastRate: 13.50, currentSpot: 12.45, lowerBound: 12.00, upperBound: 15.20 },
    ],
  },
  'us-dhamra': {
    id: 'us-dhamra',
    shortLabel: 'US → Dhamra',
    title: 'US (Hampton Roads) → Dhamra Port',
    originPort: 'United States',
    originSub: 'Virginia / Baltimore',
    distanceNM: '9,850 NM',
    transitDays: 'Transit ~32d',
    dischargePort: 'Dhamra Port',
    dischargeSub: 'Odisha, East Coast',
    cargoVolume: 'Met Coking Coal • 75k MT',
    recommendedClass: 'Capesize',
    currentSpot: 38.90,
    lowestForecast: 35.60,
    average90D: 41.20,
    trajectory: 'Post-hurricane dip (October)',
    recommendedRate: 35.60,
    savingsPct: 'Save 8.5%',
    recommendedWindowRange: 'Oct 20–Nov 05 Window',
    recommendedWindowLabel: 'RECOMMENDED WINDOW - OCT 20–NOV 05 ($35.60/MT)',
    recommendedWindowStart: 'Oct 01',
    recommendedWindowEnd: 'Oct 15',
    chartData: [
      { date: 'Aug 05', forecastRate: 41.20, currentSpot: 38.90, lowerBound: 37.00, upperBound: 45.00 },
      { date: 'Aug 19', forecastRate: 40.50, currentSpot: 38.90, lowerBound: 36.20, upperBound: 44.50 },
      { date: 'Sep 02', forecastRate: 39.80, currentSpot: 38.90, lowerBound: 35.50, upperBound: 43.80 },
      { date: 'Sep 16', forecastRate: 38.90, currentSpot: 38.90, lowerBound: 34.80, upperBound: 43.00 },
      { date: 'Oct 01', forecastRate: 37.20, currentSpot: 38.90, lowerBound: 33.50, upperBound: 41.50 },
      { date: 'Oct 15', forecastRate: 36.10, currentSpot: 38.90, lowerBound: 32.40, upperBound: 40.20 },
      { date: 'Nov 01', forecastRate: 35.60, currentSpot: 38.90, lowerBound: 32.00, upperBound: 39.80 },
      { date: 'Nov 15', forecastRate: 37.50, currentSpot: 38.90, lowerBound: 33.80, upperBound: 42.00 },
      { date: 'Dec 01', forecastRate: 40.10, currentSpot: 38.90, lowerBound: 36.00, upperBound: 45.50 },
      { date: 'Dec 15', forecastRate: 42.00, currentSpot: 38.90, lowerBound: 37.50, upperBound: 47.20 },
    ],
  },
};

const CURRENCY_RATES: Record<string, { rate: number; symbol: string; label: string }> = {
  USD: { rate: 1.0, symbol: '$', label: 'USD - US Dollar' },
  INR: { rate: 94.5471, symbol: '₹', label: 'INR - Indian Rupee' },
  EUR: { rate: 0.92, symbol: '€', label: 'EUR - Euro' },
  AUD: { rate: 1.54, symbol: 'A$', label: 'AUD - Australian Dollar' },
  SGD: { rate: 1.34, symbol: 'S$', label: 'SGD - Singapore Dollar' },
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Active corridor selection
  const [selectedRouteKey, setSelectedRouteKey] = useState<'au-paradip' | 'id-vizag' | 'us-dhamra'>('au-paradip');
  const activeRoute = ROUTE_DATA[selectedRouteKey];

  // Spot freight converter state
  const [convertAmount, setConvertAmount] = useState<number>(18.64);
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('INR');

  const convertedResult =
    ((convertAmount || 0) / (CURRENCY_RATES[fromCurrency]?.rate || 1)) *
    (CURRENCY_RATES[toCurrency]?.rate || 94.5471);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post('/forecasts/run', {
        cargo_type: 'Coking Coal',
        cargo_mt: 70000,
        origin_country: 'Australia',
        origin_port: 'Gladstone',
        destination_port: 'Paradip',
        desired_shipment_date: '2026-09-20',
        vessel_class: 'Panamax',
        contract_duration_months: 3,
        num_voyages: 3,
        planning_horizon_days: 90,
      });
      setForecast(res.data);

      const alertRes = await apiClient.get('/alerts');
      setAlerts(alertRes.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Custom chart hover tooltip matching institutional theme
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="p-3 bg-white rounded-[8px] shadow-[0_4px_12px_rgba(15,39,71,0.08)] border border-[#E4E2DC] text-xs min-w-[190px]">
          <div className="font-bold text-[#0F2747] pb-1.5 mb-1.5 border-b border-[#E4E2DC] flex items-center gap-1.5">
            <span>📅</span>
            <span>{label}, 2026</span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-[#68717D] font-medium">Forecast Rate:</span>
              <span className="font-black text-[#0F2747]">${item.forecastRate?.toFixed(2)} / MT</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#68717D] font-medium">95% Range:</span>
              <span className="font-semibold text-[#172033]">${item.lowerBound?.toFixed(2)} – ${item.upperBound?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#68717D] font-medium">Current Spot:</span>
              <span className="font-semibold text-[#172033]">${item.currentSpot?.toFixed(2)} / MT</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* MAIN 2-COLUMN HERO STRUCTURE MATCHING REFERENCE IMAGE */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN (8 cols): FREIGHT MARKET OVERVIEW */}
        <div className="lg:col-span-8 p-6 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] space-y-4">
          
          {/* Card Header & Route Selector Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E2DC]">
            <div>
              <h2 className="text-sm sm:text-base font-black text-[#0F2747] tracking-wider uppercase">
                Freight Market Overview
              </h2>
              <p className="text-xs text-[#68717D] mt-0.5 font-medium">
                {activeRoute.title}
              </p>
            </div>

            {/* 3 Corridor Selector Tabs */}
            <div className="flex items-center gap-1.5">
              {(['au-paradip', 'id-vizag', 'us-dhamra'] as const).map((key) => {
                const r = ROUTE_DATA[key];
                const isActive = selectedRouteKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedRouteKey(key);
                      setConvertAmount(r.recommendedRate);
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-[8px] transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-[#0F2747] text-[#F3E3B7] border-[#0F2747] shadow-xs'
                        : 'bg-[#F8F7F3] text-[#68717D] border-[#E4E2DC] hover:bg-[#F0EEE6]'
                    }`}
                  >
                    {r.shortLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4 Metric Summary Cards in a row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
              <span className="text-[10px] font-bold text-[#68717D] uppercase tracking-wider block">
                Current Spot
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black text-[#0F2747] font-mono">
                  ${activeRoute.currentSpot.toFixed(2)}
                </span>
                <span className="text-[11px] text-[#68717D] font-medium">/ MT</span>
              </div>
            </div>

            <div className="p-3.5 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
              <span className="text-[10px] font-bold text-[#68717D] uppercase tracking-wider block">
                Lowest Forecast
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black text-[#2F7D4B] font-mono">
                  ${activeRoute.lowestForecast.toFixed(2)}
                </span>
                <span className="text-[11px] text-[#68717D] font-medium">/ MT</span>
              </div>
            </div>

            <div className="p-3.5 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
              <span className="text-[10px] font-bold text-[#68717D] uppercase tracking-wider block">
                90-Day Average
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black text-[#0F2747] font-mono">
                  ${activeRoute.average90D.toFixed(2)}
                </span>
                <span className="text-[11px] text-[#68717D] font-medium">/ MT</span>
              </div>
            </div>

            <div className="p-3.5 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
              <span className="text-[10px] font-bold text-[#68717D] uppercase tracking-wider block">
                Market Trajectory
              </span>
              <div className="mt-1 text-xs sm:text-sm font-black text-[#0F2747] leading-snug">
                {activeRoute.trajectory}
              </div>
            </div>
          </div>

          {/* Legend Top-Right of Chart */}
          <div className="flex items-center justify-end gap-5 text-xs text-[#68717D] pt-1">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-4 h-0.5 border-t border-dashed border-[#94A3B8]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]" />
              Current Spot Baseline
            </span>
            <span className="flex items-center gap-1.5 font-bold text-[#0F2747]">
              <span className="w-4 h-0.5 bg-[#0F2747]" />
              <span className="w-2 h-2 rounded-full bg-[#0F2747]" />
              Forecast Rate ($/MT)
            </span>
          </div>

          {/* Interactive Chart with Shaded Recommended Window */}
          <div className="h-72 sm:h-80 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={activeRoute.chartData}
                margin={{ top: 25, right: 15, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="corridorConfidence" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D6A63B" stopOpacity={0.16} />
                    <stop offset="95%" stopColor="#E4E2DC" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E2DC" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#68717D"
                  fontSize={10}
                  tickLine={false}
                />
                <YAxis
                  stroke="#68717D"
                  fontSize={10}
                  domain={[
                    selectedRouteKey === 'id-vizag' ? 9 : selectedRouteKey === 'us-dhamra' ? 30 : 16,
                    selectedRouteKey === 'id-vizag' ? 16 : selectedRouteKey === 'us-dhamra' ? 50 : 27,
                  ]}
                  tickFormatter={(v) => `$${v}`}
                  tickLine={false}
                />
                <Tooltip content={<CustomChartTooltip />} />

                {/* Recommended Window Highlight Column */}
                <ReferenceArea
                  x1={activeRoute.recommendedWindowStart}
                  x2={activeRoute.recommendedWindowEnd}
                  fill="#D6A63B"
                  fillOpacity={0.08}
                  stroke="#D6A63B"
                  strokeDasharray="3 3"
                />
                <ReferenceLine
                  x={activeRoute.recommendedWindowEnd}
                  stroke="#D6A63B"
                  strokeDasharray="3 3"
                  label={{
                    value: activeRoute.recommendedWindowLabel,
                    position: 'top',
                    fill: '#0F2747',
                    fontSize: 9,
                    fontWeight: 'bold',
                  }}
                />

                {/* Confidence Band: Gray-blue envelope */}
                <Area
                  type="monotone"
                  dataKey="upperBound"
                  stroke="none"
                  fill="url(#corridorConfidence)"
                  fillOpacity={1}
                />
                <Area
                  type="monotone"
                  dataKey="lowerBound"
                  stroke="none"
                  fill="#FFFFFF"
                  fillOpacity={1}
                />

                {/* Current Spot Baseline: Gray dashed line */}
                <Line
                  type="monotone"
                  dataKey="currentSpot"
                  stroke="#94A3B8"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  dot={{ r: 2, fill: '#94A3B8' }}
                  name="Current Spot Baseline"
                />

                {/* Forecast Rate: Maritime Navy line with dots */}
                <Line
                  type="monotone"
                  dataKey="forecastRate"
                  stroke="#0F2747"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#0F2747', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                  activeDot={{ r: 5, fill: '#D6A63B' }}
                  name="Forecast Rate ($/MT)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Footer Links & Uncertainty Note */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-[#68717D] pt-2 border-t border-[#E4E2DC]">
            <span className="flex items-center gap-1.5 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0F2747]" />
              Econometric dry bulk forward curve with SARIMA 95% uncertainty interval
            </span>
            <div className="flex items-center gap-4 text-[11px] font-bold">
              <Link to="/market" className="text-[#0F2747] hover:text-[#D6A63B] transition-colors">
                Open Trading Desk
              </Link>
              <Link to="/forecast" className="text-[#0F2747] hover:text-[#D6A63B] transition-colors flex items-center gap-1">
                <span>Create Custom Cargo Forecast</span>
                <ArrowRight className="w-3 h-3 text-[#D6A63B]" />
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (4 cols): MONITORED CORRIDOR + SPOT FREIGHT CONVERTER */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card 1: MONITORED CORRIDOR */}
          <div className="p-5 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E4E2DC]">
              <div>
                <h3 className="text-xs font-black text-[#0F2747] uppercase tracking-wider">
                  Monitored Corridor
                </h3>
                <span className="text-[11px] text-[#68717D]">
                  High-volume dry bulk route
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F3FAF7] text-[#2F7D4B] border border-[#BCF0DA]">
                Favorable Entry
              </span>
            </div>

            {/* Origin & Discharge Route Box */}
            <div className="p-3.5 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-bold text-[#68717D] uppercase tracking-wider block">
                    Origin Port
                  </span>
                  <span className="text-sm font-black text-[#0F2747] block">
                    {activeRoute.originPort}
                  </span>
                  <span className="text-[10px] text-[#68717D]">
                    {activeRoute.originSub}
                  </span>
                </div>

                <div className="text-center px-2">
                  <span className="text-[10px] font-mono text-[#68717D] font-bold block">
                    {activeRoute.distanceNM} &rarr;
                  </span>
                  <span className="text-[9px] text-[#68717D] font-medium">
                    {activeRoute.transitDays}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[9px] font-bold text-[#68717D] uppercase tracking-wider block">
                    Discharge Port
                  </span>
                  <span className="text-sm font-black text-[#0F2747] block">
                    {activeRoute.dischargePort}
                  </span>
                  <span className="text-[10px] text-[#68717D]">
                    {activeRoute.dischargeSub}
                  </span>
                </div>
              </div>
            </div>

            {/* Cargo & Vessel Class Metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
                <span className="text-[9px] font-bold text-[#68717D] uppercase tracking-wider block">
                  Cargo & Volume
                </span>
                <span className="font-black text-[#0F2747] mt-0.5 block">
                  {activeRoute.cargoVolume}
                </span>
              </div>
              <div className="p-2.5 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
                <span className="text-[9px] font-bold text-[#68717D] uppercase tracking-wider block">
                  Recommended Class
                </span>
                <span className="font-black text-[#0F2747] mt-0.5 block">
                  {activeRoute.recommendedClass}
                </span>
              </div>
            </div>

            {/* Spot vs Recommended Window Box */}
            <div className="p-3.5 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC] flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-[#68717D] uppercase tracking-wider block">
                  Spot vs Recommended Window
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5 font-mono">
                  <span className="line-through text-[#68717D] text-xs">${activeRoute.currentSpot.toFixed(2)}</span>
                  <span className="text-[#2F7D4B] font-black text-base">${activeRoute.recommendedRate.toFixed(2)}</span>
                  <span className="text-[10px] text-[#68717D] font-sans">/ MT</span>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-0.5 rounded-[4px] text-[10px] font-black bg-[#0F2747] text-[#F3E3B7]">
                  {activeRoute.savingsPct}
                </span>
                <span className="text-[9px] text-[#68717D] block font-medium mt-0.5">
                  {activeRoute.recommendedWindowRange}
                </span>
              </div>
            </div>

            {/* Open Decision Matrix Button */}
            <button
              onClick={() => navigate('/decision-twin')}
              className="w-full py-2.5 rounded-[8px] text-xs font-black text-white flex items-center justify-center gap-1.5 shadow-sm transition-all hover:opacity-95 cursor-pointer bg-[#0F2747] hover:bg-[#102A4C]"
            >
              <span>Open Decision Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: SPOT FREIGHT CONVERTER */}
          <div className="p-5 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E4E2DC]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#0F2747] text-[#F3E3B7]">
                  <Calculator className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-black text-[#0F2747] uppercase tracking-wider">
                  Spot Freight Converter
                </h3>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-bold text-[#2F7D4B]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Rates
              </span>
            </div>

            {/* Freight Amount Value Input */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-[#68717D] uppercase tracking-wider block">
                Freight Amount / Value
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#68717D]">
                  {CURRENCY_RATES[fromCurrency]?.symbol || '$'}
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={convertAmount}
                  onChange={(e) => setConvertAmount(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-1.5 rounded-[8px] border border-[#E4E2DC] bg-[#F8F7F3] font-bold text-sm text-[#0F2747] focus:outline-none focus:border-[#0F2747]"
                />
              </div>
            </div>

            {/* From / To Currency Dropdowns with Swap Button */}
            <div className="flex items-center gap-2">
              <div className="flex-1 space-y-1">
                <label className="text-[9px] font-bold text-[#68717D] uppercase tracking-wider block">
                  From
                </label>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-[8px] border border-[#E4E2DC] text-[11px] font-bold text-[#0F2747] bg-[#F8F7F3] focus:outline-none focus:border-[#0F2747]"
                >
                  {Object.entries(CURRENCY_RATES).map(([code, cur]) => (
                    <option key={code} value={code}>{cur.label}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => {
                  const temp = fromCurrency;
                  setFromCurrency(toCurrency);
                  setToCurrency(temp);
                }}
                className="p-1.5 mt-3.5 rounded-[8px] border border-[#E4E2DC] bg-[#F8F7F3] hover:bg-[#F0EEE6] transition-colors cursor-pointer text-[#0F2747]"
                title="Swap Currencies"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </button>

              <div className="flex-1 space-y-1">
                <label className="text-[9px] font-bold text-[#68717D] uppercase tracking-wider block">
                  To
                </label>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-[8px] border border-[#E4E2DC] text-[11px] font-bold text-[#0F2747] bg-[#F8F7F3] focus:outline-none focus:border-[#0F2747]"
                >
                  {Object.entries(CURRENCY_RATES).map(([code, cur]) => (
                    <option key={code} value={code}>{cur.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Converted Value Result Box */}
            <div className="p-3.5 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-[#68717D] uppercase tracking-wider">
                  Converted Value:
                </span>
                <span className="text-[9px] text-[#68717D] font-medium">
                  {toCurrency} / MT equivalent
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#2F7D4B] font-mono mt-1">
                {CURRENCY_RATES[toCurrency]?.symbol}
                {convertedResult.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="text-xs font-sans text-[#68717D] ml-1.5 font-bold">{toCurrency}</span>
              </div>
            </div>

            {/* Exchange Rate Note */}
            <div className="text-[10px] text-[#68717D] font-medium flex items-center justify-between pt-0.5">
              <span>Rate: 1 USD = 94.5471 INR</span>
              <span>${convertAmount.toFixed(2)} USD = ₹{convertedResult.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. LOWER DASHBOARD (ALL EXISTING MULTI-FACTOR METRICS PRESERVED) */}
      {/* ========================================================================= */}

      {/* ========================================================================= */}
      {/* VESSEL OPTIMIZER COMPARISON TABLE & RISK MONITOR ROW */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Vessel Optimizer Comparison Table (Left 8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-[16px] bg-white border border-[#E4E2DC] shadow-sm border-t-[3px] border-t-[#D6A63B] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E2DC]">
            <div>
              <h3 className="text-base font-black text-[#0F2747]">
                Vessel Class Optimization Matrix
              </h3>
              <p className="text-xs text-[#68717D] font-medium mt-0.5">
                Evaluated for a 70,000 MT coking coal parcel discharging at Paradip (Berth CQ-1).
              </p>
            </div>
            <Link to="/vessel-optimizer" className="text-xs font-bold text-[#0F2747] hover:text-[#D6A63B] flex items-center gap-1">
              <span>Optimizer Tool</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Professional Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] font-bold uppercase tracking-wider text-[#68717D] bg-[#F8F7F3] border-b border-[#E4E2DC]">
                <tr>
                  <th className="py-2.5 px-3">Vessel Type</th>
                  <th className="py-2.5 px-3">Capacity</th>
                  <th className="py-2.5 px-3">Freight Rate</th>
                  <th className="py-2.5 px-3">Estimated Cost</th>
                  <th className="py-2.5 px-3">Compatibility</th>
                  <th className="py-2.5 px-3">Turnaround</th>
                  <th className="py-2.5 px-3 text-right">Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E2DC]">
                {/* Handysize */}
                <tr className="hover:bg-[#F8F7F3]">
                  <td className="py-2.5 px-3 font-bold text-[#0F2747]">Handysize</td>
                  <td className="py-2.5 px-3 text-[#68717D]">35,000 DWT</td>
                  <td className="py-2.5 px-3 font-mono">$19.80/MT</td>
                  <td className="py-2.5 px-3 font-mono">$1.38M (2 parcels)</td>
                  <td className="py-2.5 px-3 text-[#2F7D4B] font-semibold">100% Draft Fit</td>
                  <td className="py-2.5 px-3 text-[#68717D]">2.1 Days</td>
                  <td className="py-2.5 px-3 text-right text-slate-400">Sub-optimal</td>
                </tr>

                {/* Supramax */}
                <tr className="hover:bg-[#F8F7F3]">
                  <td className="py-2.5 px-3 font-bold text-[#0F2747]">Supramax</td>
                  <td className="py-2.5 px-3 text-[#68717D]">58,000 DWT</td>
                  <td className="py-2.5 px-3 font-mono">$16.50/MT</td>
                  <td className="py-2.5 px-3 font-mono">$1.15M</td>
                  <td className="py-2.5 px-3 text-[#2F7D4B] font-semibold">100% Draft Fit</td>
                  <td className="py-2.5 px-3 text-[#68717D]">2.5 Days</td>
                  <td className="py-2.5 px-3 text-right text-[#D98A27] font-semibold">Backup Plan B</td>
                </tr>

                {/* Panamax — Highlighted Subtly with Pale Green / Gold */}
                <tr
                  className="font-semibold"
                  style={{
                    backgroundColor: '#F3FAF7',
                  }}
                >
                  <td className="py-2.5 px-3 font-black text-[#0F2747] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2F7D4B]"></span>
                    Panamax
                  </td>
                  <td className="py-2.5 px-3 text-[#172033]">76,000 DWT</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-[#0F2747]">$14.15/MT</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-[#0F2747]">$0.99M</td>
                  <td className="py-2.5 px-3 text-[#2F7D4B] font-bold">14.0m Draft (CQ-1 Clr)</td>
                  <td className="py-2.5 px-3 text-[#172033]">2.8 Days</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="inline-block px-2 py-0.5 rounded-[4px] text-[10px] font-black uppercase tracking-wider bg-[#D6A63B] text-[#0F2747]">
                      BEST CHOICE
                    </span>
                  </td>
                </tr>

                {/* Capesize */}
                <tr className="hover:bg-[#F8F7F3]">
                  <td className="py-2.5 px-3 font-bold text-[#0F2747]">Capesize</td>
                  <td className="py-2.5 px-3 text-[#68717D]">180,000 DWT</td>
                  <td className="py-2.5 px-3 font-mono">$11.80/MT</td>
                  <td className="py-2.5 px-3 font-mono">$0.82M</td>
                  <td className="py-2.5 px-3 text-[#C64A3B] font-semibold">Draft Exceeded (18m)</td>
                  <td className="py-2.5 px-3 text-[#68717D]">4.2 Days</td>
                  <td className="py-2.5 px-3 text-right text-[#C64A3B] font-semibold">Lightering Needed</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Risk Monitor: Restrained Circular Indicator & Contributors (Right 4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E2DC]">
            <h3 className="text-base font-black text-[#0F2747]">Risk Monitor</h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#F3FAF7] text-[#2F7D4B] border border-[#BCF0DA]">
              LOW RISK (24.5/100)
            </span>
          </div>

          {/* Restrained Circular Risk Indicator */}
          <div className="flex items-center justify-center py-2">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#E4E2DC]"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  strokeWidth="3.5"
                  strokeDasharray="24.5, 100"
                  strokeLinecap="round"
                  stroke="#2F7D4B"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-[#0F2747]">24.5</span>
                <span className="text-[9px] uppercase font-bold text-[#68717D]">Risk Index</span>
              </div>
            </div>
          </div>

          {/* Individual Contributors */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#68717D]">Freight Volatility</span>
              <span className="font-bold text-[#D98A27]">32 / 100</span>
            </div>
            <div className="w-full h-1.5 bg-[#F8F7F3] rounded-full overflow-hidden">
              <div className="h-full bg-[#D98A27] rounded-full" style={{ width: '32%' }} />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[#68717D]">Port Congestion (Paradip)</span>
              <span className="font-bold text-[#D98A27]">28 / 100</span>
            </div>
            <div className="w-full h-1.5 bg-[#F8F7F3] rounded-full overflow-hidden">
              <div className="h-full bg-[#D98A27] rounded-full" style={{ width: '28%' }} />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[#68717D]">Vessel Availability</span>
              <span className="font-bold text-[#2F7D4B]">18 / 100</span>
            </div>
            <div className="w-full h-1.5 bg-[#F8F7F3] rounded-full overflow-hidden">
              <div className="h-full bg-[#2F7D4B] rounded-full" style={{ width: '18%' }} />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[#68717D]">Route Weather Risk</span>
              <span className="font-bold text-[#2F7D4B]">20 / 100</span>
            </div>
            <div className="w-full h-1.5 bg-[#F8F7F3] rounded-full overflow-hidden">
              <div className="h-full bg-[#2F7D4B] rounded-full" style={{ width: '20%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;
