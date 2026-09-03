import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp, Ship, FileText, CheckCircle2, ShieldAlert,
  Clock, ArrowRight, RefreshCw, Compass, AlertCircle,
  Layers, MapPin, Sparkles, AlertTriangle, ShieldCheck
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine
} from 'recharts';
import { apiClient } from '../api/client';
import { KPICard } from '../components/common/KPICard';
import { DataProvenanceBadge } from '../components/common/DataProvenanceBadge';
import { ForecastResponse, AlertItem } from '../types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'7D' | '30D' | '90D'>('90D');

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

  // Filter chart points according to 7D | 30D | 90D
  const getFilteredChartData = () => {
    if (!forecast?.forecast_curve) return [];
    const limit = timeFilter === '7D' ? 7 : timeFilter === '30D' ? 30 : 90;
    return forecast.forecast_curve.slice(0, limit);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Operational Scope Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D6A63B]">
              SAIL Bulk Logistics Cockpit
            </span>
            <DataProvenanceBadge sourceType="OFFICIAL STATIC + SIMULATED DEMO" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F2747] tracking-tight">
            Overseas Raw Materials Chartering & Freight Intelligence
          </h2>
          <p className="text-xs text-[#68717D] mt-0.5 font-medium">
            Active Trade Lane: Gladstone (Australia) &rarr; Paradip CQ-1 (East Coast India) • 70,000 MT Coking Coal
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadData()}
            className="p-2 rounded-[8px] bg-[#F8F7F3] hover:bg-[#E4E2DC] text-[#172033] border border-[#E4E2DC] transition-colors"
            title="Refresh Intelligence Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#D6A63B]' : ''}`} />
          </button>

          <button
            onClick={() => navigate('/decision-twin')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-[8px] text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            style={{
              backgroundColor: '#D6A63B',
              color: '#0F2747',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#C7962F')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#D6A63B')}
          >
            <Layers className="w-4 h-4" />
            <span>Launch Decision Twin</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* HORIZONTAL ROW OF COMPACT KPI CARDS (6 Required Core Metrics) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Current Freight Rate */}
        <KPICard
          title="Current Freight Rate"
          value={forecast ? `$${forecast.current_reference_rate.toFixed(2)}/MT` : '$14.80/MT'}
          subtext="Australia &rarr; Paradip"
          icon={<TrendingUp className="w-4 h-4" />}
          sourceType="SIMULATED DEMO"
          sourceName="HistGradientBoosting Engine"
        />

        {/* 2. Predicted Freight Rate */}
        <KPICard
          title="Predicted Freight Rate"
          value={forecast ? `$${forecast.day_30_prediction.toFixed(2)}/MT` : '$15.45/MT'}
          trend={forecast?.trend === 'INCREASING' ? 'up' : 'down'}
          trendText={forecast ? `${forecast.trend_pct > 0 ? '+' : ''}${forecast.trend_pct}%` : '+4.4%'}
          icon={<TrendingUp className="w-4 h-4" />}
          sourceType="SIMULATED DEMO"
          badgeText="30D FORWARD"
          badgeVariant="warning"
        />

        {/* 3. Recommended Vessel */}
        <KPICard
          title="Recommended Vessel"
          value="Panamax"
          subtext="76,000 DWT (93% Load)"
          icon={<Ship className="w-4 h-4" />}
          sourceType="OFFICIAL STATIC"
          sourceName="Berth Clearance Model"
          badgeText="OPTIMAL"
          badgeVariant="success"
        />

        {/* 4. Market Signal */}
        <KPICard
          title="Market Signal"
          value={forecast?.market_signal || 'BOOK NOW'}
          subtext="7–14 Day Entry Window"
          icon={<AlertCircle className="w-4 h-4" />}
          sourceType="SIMULATED DEMO"
          badgeText="ACTIONABLE"
          badgeVariant="success"
        />

        {/* 5. Overall Risk Score */}
        <KPICard
          title="Overall Risk Score"
          value="24.5 / 100"
          subtext="Low Chartering Risk"
          icon={<ShieldAlert className="w-4 h-4" />}
          sourceType="SIMULATED DEMO"
          badgeText="LOW RISK"
          badgeVariant="success"
        />

        {/* 6. Estimated Voyage Duration */}
        <KPICard
          title="Est. Voyage Duration"
          value="14.5 Days"
          subtext="5,200 NM at 13.5 kts"
          icon={<Compass className="w-4 h-4" />}
          sourceType="OFFICIAL STATIC"
          sourceName="Nautical Distance Table"
        />
      </div>

      {/* ========================================================================= */}
      {/* MAIN FREIGHT FORECAST & MARKET INTELLIGENCE ROW */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Freight Forecast Main Visual Element (Left 8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E2DC]">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-[#0F2747]">
                  Freight Rate Forecast & Confidence Band
                </h3>
                <DataProvenanceBadge sourceType="SIMULATED DEMO" sourceName="HistGradientBoosting Quantile Forecaster" />
              </div>
              <p className="text-xs text-[#68717D] mt-0.5 font-medium">
                Probabilistic trajectory with 90% confidence uncertainty interval (p10–p90 quantiles).
              </p>
            </div>

            {/* 7D | 30D | 90D Compact Filter: Selected filter uses Navy */}
            <div className="inline-flex rounded-lg border border-[#E4E2DC] p-0.5 bg-[#F8F7F3]">
              {(['7D', '30D', '90D'] as const).map((filter) => {
                const isSelected = timeFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setTimeFilter(filter)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0F2747] text-white shadow-xs'
                        : 'text-[#68717D] hover:text-[#0F2747]'
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clean White Chart Background with Navy lines and light blue-grey confidence band */}
          <div className="h-72 w-full pt-2">
            {forecast ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={getFilteredChartData()}
                  margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D0D9E5" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#E4EBF2" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E4E2DC" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#68717D"
                    fontSize={10}
                    tickFormatter={(val) => val.slice(5)}
                  />
                  <YAxis
                    stroke="#68717D"
                    fontSize={10}
                    domain={['dataMin - 0.8', 'dataMax + 0.8']}
                    tickFormatter={(v) => `$${v}`}
                  />
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
                      name === 'predicted_rate'
                        ? 'Expected Forecast'
                        : name === 'upper_bound'
                        ? 'Upper 90% Bound'
                        : 'Lower 10% Bound',
                    ]}
                  />
                  {/* Confidence Band: Very light blue-grey */}
                  <Area
                    type="monotone"
                    dataKey="upper_bound"
                    stroke="none"
                    fill="url(#confidenceBand)"
                    fillOpacity={1}
                  />
                  <Area
                    type="monotone"
                    dataKey="lower_bound"
                    stroke="none"
                    fill="#FFFFFF"
                    fillOpacity={1}
                  />
                  {/* Historical baseline & Forecast navy dashed line */}
                  <Area
                    type="monotone"
                    dataKey="predicted_rate"
                    stroke="#0F2747"
                    strokeWidth={2.5}
                    strokeDasharray="4 4"
                    fill="none"
                    dot={{ r: 2.5, fill: '#D6A63B', stroke: '#0F2747', strokeWidth: 1.5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#68717D]">
                Loading freight forecast models...
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-[#68717D] pt-2 border-t border-[#E4E2DC]">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-semibold text-[#0F2747]">
                <span className="w-3 h-0.5 bg-[#0F2747] border-dashed border-t"></span> Expected Rate (Navy Dashed)
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-[#68717D]">
                <span className="w-3 h-2 bg-[#D0D9E5] rounded-xs"></span> Light Blue-Grey Confidence Band
              </span>
            </div>
            <Link to="/forecast" className="font-bold text-[#0F2747] hover:text-[#D6A63B] flex items-center gap-1">
              <span>Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Market Intelligence Widget (Right 4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E2DC]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#68717D]">
                Market Intelligence
              </span>
              {/* Professional Signal Badge: BOOK NOW */}
              <span className="px-2.5 py-1 rounded-[6px] text-xs font-black uppercase tracking-wider bg-[#F3FAF7] text-[#2F7D4B] border border-[#BCF0DA]">
                {forecast?.market_signal || 'BOOK NOW'}
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="p-3.5 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
                <span className="text-[10px] uppercase font-bold text-[#68717D] block">
                  Best Booking Window
                </span>
                <span className="text-sm font-black text-[#0F2747] mt-0.5 block">
                  {forecast?.optimal_booking_window || 'Next 7–14 Days'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
                  <span className="text-[10px] uppercase font-bold text-[#68717D] block">Rate Trend</span>
                  <span className="font-black text-[#0F2747] mt-0.5 block">
                    {forecast?.trend === 'INCREASING' ? '▲ Upward (+4.4%)' : '▼ Moderating'}
                  </span>
                </div>
                <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
                  <span className="text-[10px] uppercase font-bold text-[#68717D] block">Volatility</span>
                  <span className="font-black text-[#0F2747] mt-0.5 block">Moderate (±6.8%)</span>
                </div>
              </div>

              <div className="p-3.5 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
                <span className="text-[10px] uppercase font-bold text-[#68717D] block mb-1">
                  Key Market Driver
                </span>
                <p className="text-xs text-[#172033] font-medium leading-relaxed">
                  Pre-monsoon restocking by Indian integrated steel plants and firming VLSFO bunker benchmarks at Singapore/Fujairah.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E4E2DC]">
            <Link
              to="/market"
              className="w-full py-2.5 rounded-[8px] text-xs font-bold text-center text-[#0F2747] bg-[#F8F7F3] hover:bg-[#E4E2DC] border border-[#E4E2DC] block transition-colors"
            >
              View Global Commodity Indicators &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VESSEL OPTIMIZER COMPARISON TABLE & RISK MONITOR ROW */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Vessel Optimizer Comparison Table (Left 8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] space-y-4">
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

      {/* ========================================================================= */}
      {/* PORT INTELLIGENCE & ROUTE OVERVIEW ROW */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Port Intelligence Technical Specs (Left 6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E2DC]">
            <div>
              <h3 className="text-base font-black text-[#0F2747]">
                Port Technical Specifications
              </h3>
              <p className="text-xs text-[#68717D] font-medium mt-0.5">
                Official Port Trust gazetted constraints • Paradip Port (Berth CQ-1)
              </p>
            </div>
            <Link to="/port-intelligence" className="text-xs font-bold text-[#0F2747] hover:text-[#D6A63B] flex items-center gap-1">
              <span>All 7 Ports</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
              <span className="text-[10px] uppercase font-bold text-[#68717D] block">Max Draft</span>
              <span className="text-base font-black text-[#0F2747] mt-0.5 block">14.50 m</span>
              <span className="text-[10px] text-[#2F7D4B] font-semibold">+0.5m Panamax Clr</span>
            </div>

            <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
              <span className="text-[10px] uppercase font-bold text-[#68717D] block">LOA Limit</span>
              <span className="text-base font-black text-[#0F2747] mt-0.5 block">230.0 m</span>
              <span className="text-[10px] text-[#2F7D4B] font-semibold">Panamax LOA 225m</span>
            </div>

            <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
              <span className="text-[10px] uppercase font-bold text-[#68717D] block">Beam Limit</span>
              <span className="text-base font-black text-[#0F2747] mt-0.5 block">32.6 m</span>
              <span className="text-[10px] text-[#68717D]">Max permissible</span>
            </div>

            <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
              <span className="text-[10px] uppercase font-bold text-[#68717D] block">Annual Capacity</span>
              <span className="text-base font-black text-[#0F2747] mt-0.5 block">140 MT</span>
              <span className="text-[10px] text-[#68717D]">Major Port Trust</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs pt-1">
            <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
              <span className="text-[10px] uppercase font-bold text-[#68717D] block">Anchorage Queue</span>
              <span className="text-sm font-black text-[#D98A27] mt-0.5 block">4 Vessels Waiting</span>
            </div>
            <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
              <span className="text-[10px] uppercase font-bold text-[#68717D] block">Turnaround Time</span>
              <span className="text-sm font-black text-[#0F2747] mt-0.5 block">2.8 Days</span>
            </div>
            <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
              <span className="text-[10px] uppercase font-bold text-[#68717D] block">Supported Vessels</span>
              <span className="text-sm font-black text-[#0F2747] mt-0.5 block">Handy &bull; Supra &bull; Pana</span>
            </div>
          </div>
        </div>

        {/* Route Overview & Nautical Specs (Right 6 cols) */}
        <div className="lg:col-span-6 p-6 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E2DC]">
            <div>
              <h3 className="text-base font-black text-[#0F2747]">
                Route Overview: Gladstone &rarr; Paradip
              </h3>
              <p className="text-xs text-[#68717D] font-medium mt-0.5">
                Trans-Oceanic Bulk Corridor • Coral Sea &rarr; Torres Strait &rarr; Bay of Bengal
              </p>
            </div>
            <Link to="/route-analysis" className="text-xs font-bold text-[#0F2747] hover:text-[#D6A63B] flex items-center gap-1">
              <span>Interactive Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Route Schematic Visual Banner */}
          <div className="p-4 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0F2747]"></span>
              <div>
                <span className="font-bold text-[#0F2747] block">Gladstone Port (AU)</span>
                <span className="text-[10px] text-[#68717D]">Departure Terminal</span>
              </div>
            </div>

            <div className="flex-1 mx-4 border-t-2 border-dashed border-[#D6A63B] relative text-center">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-2 bg-[#F8F7F3] text-[10px] font-bold text-[#0F2747]">
                5,200 NM Corridor
              </span>
            </div>

            <div className="flex items-center gap-2 text-right">
              <div>
                <span className="font-bold text-[#0F2747] block">Paradip Port (IN)</span>
                <span className="text-[10px] text-[#68717D]">Discharge Berth CQ-1</span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-[#D6A63B]"></span>
            </div>
          </div>

          {/* Below the map show: Distance, Voyage Duration, Fuel Consumption, Route Risk */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
              <span className="text-[10px] uppercase font-bold text-[#68717D] block">Distance</span>
              <span className="text-sm font-black text-[#0F2747] mt-0.5 block">5,200 NM</span>
            </div>
            <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
              <span className="text-[10px] uppercase font-bold text-[#68717D] block">Voyage Duration</span>
              <span className="text-sm font-black text-[#0F2747] mt-0.5 block">14.5 Days</span>
            </div>
            <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
              <span className="text-[10px] uppercase font-bold text-[#68717D] block">Fuel Consumption</span>
              <span className="text-sm font-black text-[#0F2747] mt-0.5 block">362.5 MT VLSFO</span>
            </div>
            <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
              <span className="text-[10px] uppercase font-bold text-[#68717D] block">Route Risk</span>
              <span className="text-sm font-black text-[#2F7D4B] mt-0.5 block">Low (Score 20)</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ALERTS: Horizontal Recent Alerts & Updates Area */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#E4E2DC]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F2747] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#D98A27]" />
            <span>Recent Alerts & Operational Updates</span>
          </h3>
          <span className="text-xs text-[#68717D] font-medium">{alerts.length} Monitored Feeds</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Alert 1: Market */}
          <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC] text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#FEF7EC] text-[#D98A27]">
                Market
              </span>
              <span className="text-[10px] text-[#68717D]">Today</span>
            </div>
            <div className="font-bold text-[#0F2747] pt-1">Pre-Monsoon Restocking Tightness</div>
            <p className="text-[11px] text-[#68717D] leading-snug">
              Pacific Panamax rates firming +4.4% as Australian loading terminals report congestion.
            </p>
          </div>

          {/* Alert 2: Port */}
          <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC] text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#F0F4F9] text-[#0F2747]">
                Port
              </span>
              <span className="text-[10px] text-[#68717D]">Active</span>
            </div>
            <div className="font-bold text-[#0F2747] pt-1">Paradip CQ-1 Maintenance Laycan</div>
            <p className="text-[11px] text-[#68717D] leading-snug">
              Berth mechanized conveyer fully restored. Average queue delay steady at 1.8 days.
            </p>
          </div>

          {/* Alert 3: Commodity */}
          <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC] text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#F3FAF7] text-[#2F7D4B]">
                Commodity
              </span>
              <span className="text-[10px] text-[#68717D]">Live</span>
            </div>
            <div className="font-bold text-[#0F2747] pt-1">Metallurgical Coking Coal Benchmark</div>
            <p className="text-[11px] text-[#68717D] leading-snug">
              Alpha Vantage live Brent benchmark $91.08 reflects steady landed energy input costs.
            </p>
          </div>

          {/* Alert 4: Vessel */}
          <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC] text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#F3FAF7] text-[#2F7D4B]">
                Vessel
              </span>
              <span className="text-[10px] text-[#68717D]">Recommended</span>
            </div>
            <div className="font-bold text-[#0F2747] pt-1">3-Voyage COA Commitment Recommended</div>
            <p className="text-[11px] text-[#68717D] leading-snug">
              Secures $380,000 in volume savings compared to repeated spot fixtures.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* AI DECISION ADVISOR: Professional Decision Brief (Not ChatGPT) */}
      {/* ========================================================================= */}
      <div className="p-6 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E4E2DC]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D6A63B]" />
            <div>
              <h3 className="text-base font-black text-[#0F2747]">
                PortIN Decision Advisor Brief
              </h3>
              <p className="text-xs text-[#68717D] font-medium">
                Ask about freight, vessels, ports, routes or market conditions.
              </p>
            </div>
          </div>
          <Link
            to="/ai-advisor"
            className="text-xs font-bold text-[#0F2747] hover:text-[#D6A63B] flex items-center gap-1"
          >
            <span>Interactive Decision Room</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Structured Decision Brief */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Brief Section 1: Recommendation */}
          <div className="p-4 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#68717D]">
              Recommendation
            </span>
            <div className="text-base font-black text-[#0F2747]">
              Panamax (76k DWT)
            </div>
            <p className="text-[11px] text-[#2F7D4B] font-semibold">
              3-Voyage COA ($14.15/MT)
            </p>
          </div>

          {/* Brief Section 2: Supporting Evidence */}
          <div className="p-4 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC] space-y-1 md:col-span-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#68717D]">
              Supporting Evidence
            </span>
            <p className="text-xs text-[#172033] leading-relaxed font-medium">
              Achieves 93.3% load factor with 14.0m laden draft, clearing Paradip CQ-1 permissible 14.5m limit. Saves $380,000 vs. spot.
            </p>
          </div>

          {/* Brief Section 3: Market & Risk Factors */}
          <div className="p-4 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#68717D]">
              Market Factors
            </span>
            <p className="text-xs text-[#172033] leading-relaxed font-medium">
              Spot rates expected +4.4% in 30 days. Fix laycan within next 7–14 days.
            </p>
          </div>

          {/* Brief Section 4: Confidence */}
          <div className="p-4 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC] space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#68717D]">
              Confidence
            </span>
            <div className="text-base font-black text-[#2F7D4B]">
              94.2%
            </div>
            <p className="text-[11px] text-[#68717D]">
              Verified Ground Truth
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
