import React, { useState } from 'react';
import {
  Ship, TrendingUp, AlertTriangle, CheckCircle2, ChevronRight,
  Info, MapPin, Compass, Lightbulb, XCircle, Anchor
} from 'lucide-react';
import {
  ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ReferenceArea, ReferenceLine
} from 'recharts';

type PeriodType = '2d' | '7d' | '30d';

interface TrafficPoint {
  time: string;
  vessels: number;
  highlight?: 'high' | 'low' | 'normal';
}

interface HighlightItem {
  type: 'high' | 'low' | 'medium';
  title: string;
  timeRange: string;
  expectedVessels: number;
  badge: 'HIGH' | 'LOW' | 'MEDIUM';
}

interface PortCongestionItem {
  port: string;
  date: string;
  timeRange: string;
  expectedVessels: number;
  congestionLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  riskScore: number;
}

interface PeriodDataset {
  periodLabel: string;
  trafficTitle: string;
  highlightsTitle: string;
  portCongestionTitle: string;
  trafficData: TrafficPoint[];
  peakCallout: {
    start: string;
    end: string;
    label: string;
    sub: string;
  };
  troughCallout: {
    start: string;
    end: string;
    label: string;
    sub: string;
  };
  highlights: HighlightItem[];
  portCongestion: PortCongestionItem[];
  risk2Day: { date: string; score: number; level: 'HIGH' | 'MEDIUM' | 'LOW' }[];
  risk7Day: { date: string; score: number; level: 'HIGH' | 'MEDIUM' | 'LOW' }[];
  risk30DayPoints: { label: string; score: number }[];
  aiRecommendation: {
    recommendedWindow: {
      time: string;
      details: string;
    };
    avoidWindow: {
      time: string;
      details: string;
    };
    suggestedPort: {
      name: string;
      window: string;
    };
    whyText: string;
  };
}

const DATASETS: Record<PeriodType, PeriodDataset> = {
  '2d': {
    periodLabel: '2 Days',
    trafficTitle: 'Predicted Vessel Traffic (Next 2 Days)',
    highlightsTitle: 'Key Forecast Highlights (2 Days)',
    portCongestionTitle: 'Port Congestion Forecast (Next 2 Days)',
    trafficData: [
      { time: '08 Sep 00:00', vessels: 8.5 },
      { time: '08 Sep 03:00', vessels: 9.8 },
      { time: '08 Sep 06:00', vessels: 11.5 },
      { time: '08 Sep 09:00', vessels: 11.2 },
      { time: '08 Sep 12:00', vessels: 13.5 },
      { time: '08 Sep 14:00', vessels: 16.8 },
      { time: '08 Sep 16:00', vessels: 17.5, highlight: 'high' },
      { time: '08 Sep 18:00', vessels: 16.5 },
      { time: '08 Sep 21:00', vessels: 14.2 },
      { time: '09 Sep 00:00', vessels: 11.8 },
      { time: '09 Sep 03:00', vessels: 9.5 },
      { time: '09 Sep 06:00', vessels: 10.5 },
      { time: '09 Sep 09:00', vessels: 12.0 },
      { time: '09 Sep 12:00', vessels: 11.5 },
      { time: '09 Sep 15:00', vessels: 10.2 },
      { time: '09 Sep 18:00', vessels: 8.2 },
      { time: '09 Sep 21:00', vessels: 6.5 },
      { time: '10 Sep 00:00', vessels: 4.8 },
      { time: '10 Sep 03:00', vessels: 4.0, highlight: 'low' },
      { time: '10 Sep 06:00', vessels: 5.2 },
      { time: '10 Sep 09:00', vessels: 7.0 },
      { time: '10 Sep 12:00', vessels: 8.8 },
      { time: '10 Sep 15:00', vessels: 8.5 },
      { time: '10 Sep 18:00', vessels: 7.5 },
    ],
    peakCallout: {
      start: '08 Sep 12:00',
      end: '08 Sep 18:00',
      label: 'High Traffic',
      sub: '8 Sep, 14:00 – 20:00',
    },
    troughCallout: {
      start: '09 Sep 21:00',
      end: '10 Sep 09:00',
      label: 'Low Traffic',
      sub: '10 Sep, 02:00 – 08:00',
    },
    highlights: [
      {
        type: 'high',
        title: 'High Vessel Traffic',
        timeRange: '8 Sep 2026, 14:00 – 20:00',
        expectedVessels: 18,
        badge: 'HIGH',
      },
      {
        type: 'low',
        title: 'Low Vessel Traffic',
        timeRange: '10 Sep 2026, 02:00 – 08:00',
        expectedVessels: 7,
        badge: 'LOW',
      },
      {
        type: 'medium',
        title: 'Moderate Traffic',
        timeRange: '9 Sep 2026, 08:00 – 14:00',
        expectedVessels: 11,
        badge: 'MEDIUM',
      },
    ],
    portCongestion: [
      { port: 'Paradip Port', date: '8 Sep 2026', timeRange: '14:00 – 20:00', expectedVessels: 18, congestionLevel: 'HIGH', riskScore: 78 },
      { port: 'Visakhapatnam Port', date: '8 Sep 2026', timeRange: '12:00 – 18:00', expectedVessels: 13, congestionLevel: 'MEDIUM', riskScore: 56 },
      { port: 'Kolkata/Haldia Port', date: '9 Sep 2026', timeRange: '10:00 – 16:00', expectedVessels: 11, congestionLevel: 'MEDIUM', riskScore: 49 },
      { port: 'Chennai Port', date: '9 Sep 2026', timeRange: '08:00 – 14:00', expectedVessels: 9, congestionLevel: 'LOW', riskScore: 32 },
      { port: 'Kamarajar Port', date: '10 Sep 2026', timeRange: '02:00 – 08:00', expectedVessels: 7, congestionLevel: 'LOW', riskScore: 28 },
      { port: 'Dhamra Port', date: '9 Sep 2026', timeRange: '12:00 – 18:00', expectedVessels: 10, congestionLevel: 'MEDIUM', riskScore: 46 },
    ],
    risk2Day: [
      { date: '08 Sep 2026', score: 68, level: 'HIGH' },
      { date: '09 Sep 2026', score: 52, level: 'MEDIUM' },
    ],
    risk7Day: [
      { date: '08 Sep', score: 68, level: 'HIGH' },
      { date: '09 Sep', score: 52, level: 'MEDIUM' },
      { date: '10 Sep', score: 38, level: 'LOW' },
      { date: '11 Sep', score: 44, level: 'MEDIUM' },
      { date: '12 Sep', score: 59, level: 'MEDIUM' },
      { date: '13 Sep', score: 61, level: 'HIGH' },
      { date: '14 Sep', score: 48, level: 'MEDIUM' },
    ],
    risk30DayPoints: [
      { label: '6 Sep', score: 42 },
      { label: '13 Sep', score: 68 },
      { label: '14 Sep', score: 55 },
      { label: '18 Sep', score: 48 },
      { label: '22 Sep', score: 72 },
      { label: '26 Sep', score: 58 },
      { label: '30 Sep', score: 45 },
    ],
    aiRecommendation: {
      recommendedWindow: {
        time: '10 Sep 2026 | 02:00 – 08:00',
        details: 'Low congestion • 7 expected vessels • Low operational risk',
      },
      avoidWindow: {
        time: '8 Sep 2026 | 14:00 – 20:00',
        details: 'High congestion • 18 expected vessels • High operational risk',
      },
      suggestedPort: {
        name: 'Kamarajar Port',
        window: '(10 Sep 02:00 – 08:00)',
      },
      whyText: 'Based on predicted vessel traffic, port congestion, weather conditions and freight rate risk, Kamarajar Port is expected to have lower congestion on 10 Sep, while Paradip Port is likely to face high congestion on 8 Sep.',
    },
  },
  '7d': {
    periodLabel: '7 Days',
    trafficTitle: 'Predicted Vessel Traffic (Next 7 Days)',
    highlightsTitle: 'Key Forecast Highlights (7 Days)',
    portCongestionTitle: 'Port Congestion Forecast (Next 7 Days)',
    trafficData: [
      { time: '08 Sep', vessels: 18.0, highlight: 'high' },
      { time: '09 Sep', vessels: 11.5 },
      { time: '10 Sep', vessels: 6.8, highlight: 'low' },
      { time: '11 Sep', vessels: 12.0 },
      { time: '12 Sep', vessels: 15.5 },
      { time: '13 Sep', vessels: 21.5, highlight: 'high' },
      { time: '14 Sep', vessels: 14.0 },
    ],
    peakCallout: {
      start: '12 Sep',
      end: '14 Sep',
      label: 'High Traffic',
      sub: '13 Sep, 12:00 – 20:00',
    },
    troughCallout: {
      start: '09 Sep',
      end: '11 Sep',
      label: 'Low Traffic',
      sub: '10 Sep, 02:00 – 12:00',
    },
    highlights: [
      {
        type: 'high',
        title: 'Peak Traffic Surge',
        timeRange: '13 Sep 2026, 12:00 – 20:00',
        expectedVessels: 22,
        badge: 'HIGH',
      },
      {
        type: 'low',
        title: 'Favorable Entry Window',
        timeRange: '10 Sep 2026, 02:00 – 12:00',
        expectedVessels: 7,
        badge: 'LOW',
      },
      {
        type: 'medium',
        title: 'Moderate Traffic Flow',
        timeRange: '11 Sep 2026, 06:00 – 16:00',
        expectedVessels: 12,
        badge: 'MEDIUM',
      },
    ],
    portCongestion: [
      { port: 'Paradip Port', date: '13 Sep 2026', timeRange: '12:00 – 20:00', expectedVessels: 22, congestionLevel: 'HIGH', riskScore: 84 },
      { port: 'Visakhapatnam Port', date: '11 Sep 2026', timeRange: '08:00 – 16:00', expectedVessels: 14, congestionLevel: 'MEDIUM', riskScore: 58 },
      { port: 'Kolkata/Haldia Port', date: '12 Sep 2026', timeRange: '10:00 – 18:00', expectedVessels: 15, congestionLevel: 'HIGH', riskScore: 62 },
      { port: 'Chennai Port', date: '10 Sep 2026', timeRange: '04:00 – 12:00', expectedVessels: 8, congestionLevel: 'LOW', riskScore: 30 },
      { port: 'Kamarajar Port', date: '10 Sep 2026', timeRange: '02:00 – 10:00', expectedVessels: 6, congestionLevel: 'LOW', riskScore: 24 },
      { port: 'Dhamra Port', date: '13 Sep 2026', timeRange: '14:00 – 22:00', expectedVessels: 12, congestionLevel: 'MEDIUM', riskScore: 50 },
    ],
    risk2Day: [
      { date: '08 Sep 2026', score: 68, level: 'HIGH' },
      { date: '09 Sep 2026', score: 52, level: 'MEDIUM' },
    ],
    risk7Day: [
      { date: '08 Sep', score: 68, level: 'HIGH' },
      { date: '09 Sep', score: 52, level: 'MEDIUM' },
      { date: '10 Sep', score: 38, level: 'LOW' },
      { date: '11 Sep', score: 44, level: 'MEDIUM' },
      { date: '12 Sep', score: 59, level: 'MEDIUM' },
      { date: '13 Sep', score: 61, level: 'HIGH' },
      { date: '14 Sep', score: 48, level: 'MEDIUM' },
    ],
    risk30DayPoints: [
      { label: '6 Sep', score: 42 },
      { label: '13 Sep', score: 68 },
      { label: '14 Sep', score: 55 },
      { label: '18 Sep', score: 48 },
      { label: '22 Sep', score: 72 },
      { label: '26 Sep', score: 58 },
      { label: '30 Sep', score: 45 },
    ],
    aiRecommendation: {
      recommendedWindow: {
        time: '10 Sep – 11 Sep 2026',
        details: 'Low congestion • 6–8 expected vessels • Low operational risk',
      },
      avoidWindow: {
        time: '12 Sep – 14 Sep 2026',
        details: 'Peak monsoon arrival • 22 expected vessels • High demurrage risk',
      },
      suggestedPort: {
        name: 'Kamarajar Port',
        window: '(10–11 Sep window)',
      },
      whyText: 'Vessel queue models indicate a sharp monsoon surge arriving at Paradip on 13 Sep. Routing cargo through Kamarajar or fixing laycan prior to 11 Sep avoids up to $42,000 in demurrage.',
    },
  },
  '30d': {
    periodLabel: '30 Days',
    trafficTitle: 'Predicted Vessel Traffic (Next 30 Days)',
    highlightsTitle: 'Key Forecast Highlights (30 Days)',
    portCongestionTitle: 'Port Congestion Forecast (Next 30 Days)',
    trafficData: [
      { time: '08 Sep', vessels: 18.0 },
      { time: '13 Sep', vessels: 21.5 },
      { time: '18 Sep', vessels: 14.5 },
      { time: '23 Sep', vessels: 24.5, highlight: 'high' },
      { time: '28 Sep', vessels: 18.0 },
      { time: '03 Oct', vessels: 6.2, highlight: 'low' },
      { time: '08 Oct', vessels: 9.5 },
    ],
    peakCallout: {
      start: '18 Sep',
      end: '28 Sep',
      label: 'High Traffic',
      sub: '22–26 Sep, Cyclone Laycan',
    },
    troughCallout: {
      start: '28 Sep',
      end: '08 Oct',
      label: 'Low Traffic',
      sub: '02–06 Oct, Calm Post-Monsoon',
    },
    highlights: [
      {
        type: 'high',
        title: 'Monthly Peak Congestion',
        timeRange: '22–26 Sep 2026',
        expectedVessels: 25,
        badge: 'HIGH',
      },
      {
        type: 'low',
        title: 'Post-Monsoon Calm Window',
        timeRange: '02–06 Oct 2026',
        expectedVessels: 6,
        badge: 'LOW',
      },
      {
        type: 'medium',
        title: 'Mid-Month Stabilization',
        timeRange: '14–18 Sep 2026',
        expectedVessels: 13,
        badge: 'MEDIUM',
      },
    ],
    portCongestion: [
      { port: 'Paradip Port', date: '24 Sep 2026', timeRange: 'Peak Cyclone Laycan', expectedVessels: 25, congestionLevel: 'HIGH', riskScore: 88 },
      { port: 'Visakhapatnam Port', date: '22 Sep 2026', timeRange: '12:00 – 22:00', expectedVessels: 16, congestionLevel: 'HIGH', riskScore: 65 },
      { port: 'Kolkata/Haldia Port', date: '25 Sep 2026', timeRange: 'Tidal Constraint Days', expectedVessels: 17, congestionLevel: 'HIGH', riskScore: 72 },
      { port: 'Chennai Port', date: '04 Oct 2026', timeRange: 'All-Day Clear', expectedVessels: 8, congestionLevel: 'LOW', riskScore: 31 },
      { port: 'Kamarajar Port', date: '03 Oct 2026', timeRange: 'Priority Slot Laycan', expectedVessels: 6, congestionLevel: 'LOW', riskScore: 26 },
      { port: 'Dhamra Port', date: '20 Sep 2026', timeRange: '10:00 – 18:00', expectedVessels: 14, congestionLevel: 'MEDIUM', riskScore: 53 },
    ],
    risk2Day: [
      { date: '08 Sep 2026', score: 68, level: 'HIGH' },
      { date: '09 Sep 2026', score: 52, level: 'MEDIUM' },
    ],
    risk7Day: [
      { date: '08 Sep', score: 68, level: 'HIGH' },
      { date: '09 Sep', score: 52, level: 'MEDIUM' },
      { date: '10 Sep', score: 38, level: 'LOW' },
      { date: '11 Sep', score: 44, level: 'MEDIUM' },
      { date: '12 Sep', score: 59, level: 'MEDIUM' },
      { date: '13 Sep', score: 61, level: 'HIGH' },
      { date: '14 Sep', score: 48, level: 'MEDIUM' },
    ],
    risk30DayPoints: [
      { label: '6 Sep', score: 42 },
      { label: '13 Sep', score: 68 },
      { label: '14 Sep', score: 55 },
      { label: '18 Sep', score: 48 },
      { label: '22 Sep', score: 72 },
      { label: '26 Sep', score: 58 },
      { label: '30 Sep', score: 45 },
    ],
    aiRecommendation: {
      recommendedWindow: {
        time: '02 Oct – 06 Oct 2026',
        details: 'Seasonal post-monsoon trough • Optimal landed cost • Clean berths',
      },
      avoidWindow: {
        time: '22 Sep – 26 Sep 2026',
        details: 'Pre-cyclone congestion spike • Port turnaround exceeding 4.8 days',
      },
      suggestedPort: {
        name: 'Kamarajar Port',
        window: '(Alternative route with 0 queue days)',
      },
      whyText: 'Multi-decade econometric weather regression projects tropical storm activity peaking late September in North Bay of Bengal. October first week provides 95% certainty of clear discharge.',
    },
  },
};

export const RiskMonitorPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('2d');
  const ds = DATASETS[selectedPeriod];

  const renderPeakLabel = (props: any) => {
    const { viewBox } = props;
    if (!viewBox) return null;
    const x = viewBox.x;
    return (
      <g transform={`translate(${x}, 50)`}>
        <rect x={-65} y={-38} width={130} height={34} rx={6} fill="#DC2626" />
        <polygon points="-5,-4 5,-4 0,3" fill="#DC2626" />
        <text x={0} y={-23} textAnchor="middle" fill="#FFFFFF" fontSize={10} fontWeight="bold">
          High Traffic
        </text>
        <text x={0} y={-10} textAnchor="middle" fill="#FEE2E2" fontSize={8.5} fontWeight="600">
          {ds.peakCallout.sub}
        </text>
      </g>
    );
  };

  const renderTroughLabel = (props: any) => {
    const { viewBox } = props;
    if (!viewBox) return null;
    const x = viewBox.x;
    return (
      <g transform={`translate(${x}, 125)`}>
        <rect x={-65} y={-38} width={130} height={34} rx={6} fill="#ECFDF5" stroke="#10B981" strokeWidth={1} />
        <polygon points="-5,-4 5,-4 0,3" fill="#ECFDF5" stroke="#10B981" strokeWidth={1} />
        <text x={0} y={-23} textAnchor="middle" fill="#059669" fontSize={10} fontWeight="bold">
          Low Traffic
        </text>
        <text x={0} y={-10} textAnchor="middle" fill="#047857" fontSize={8.5} fontWeight="600">
          {ds.troughCallout.sub}
        </text>
      </g>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* ========================================================================= */}
      {/* 1. TOP TITLE HEADER & PERIOD SELECTOR */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#D97706]">
              Ship Congestion Forecast
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
              <span>Real-Time Predictive Insights</span>
              <Info className="w-3 h-3" />
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F2747] tracking-tight">
            Ship Congestion Forecast
          </h1>
          <p className="text-xs sm:text-sm text-[#68717D] mt-0.5 font-medium">
            Plan ahead. Avoid congestion. Charter at the right time. Get AI-powered vessel traffic and port congestion forecasts.
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-[#E2E8F0] shadow-xs shrink-0 self-start md:self-auto">
          {(['2d', '7d', '30d'] as const).map((period) => {
            const label = period === '2d' ? '2 DAYS' : period === '7d' ? '7 DAYS' : '30 DAYS';
            const isActive = selectedPeriod === period;
            return (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0F2747] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#0F2747] hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ROW 1: TRAFFIC CHART (8 COLS) + KEY HIGHLIGHTS (4 COLS) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT CARD (8 cols): PREDICTED VESSEL TRAFFIC CHART */}
        <div className="lg:col-span-8 p-5 sm:p-6 rounded-[16px] bg-white border border-[#E2E8F0] shadow-xs space-y-3 relative">
          
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-sm sm:text-base font-black text-[#0F2747] flex items-center gap-2">
              <Ship className="w-4 h-4 text-[#1E65B8]" />
              <span>{ds.trafficTitle}</span>
            </h2>
          </div>

          {/* Chart Viewport */}
          <div className="h-68 sm:h-72 w-full relative pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={ds.trafficData}
                margin={{ top: 35, right: 15, left: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="peakHighlight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FEE2E2" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#FECACA" stopOpacity={0.25} />
                  </linearGradient>
                  <linearGradient id="troughHighlight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#DCFCE7" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#BBF7D0" stopOpacity={0.25} />
                  </linearGradient>
                </defs>

                <ReferenceArea y1={18} y2={25} fill="#FEF2F2" fillOpacity={0.7} />
                <ReferenceArea y1={10} y2={18} fill="#FEFCE8" fillOpacity={0.4} />
                <ReferenceArea y1={0} y2={10} fill="#F0FDF4" fillOpacity={0.6} />

                <ReferenceArea
                  x1={ds.peakCallout.start}
                  x2={ds.peakCallout.end}
                  fill="url(#peakHighlight)"
                />
                <ReferenceArea
                  x1={ds.troughCallout.start}
                  x2={ds.troughCallout.end}
                  fill="url(#troughHighlight)"
                />

                <ReferenceLine
                  x={ds.peakCallout.start}
                  stroke="#EF4444"
                  strokeDasharray="2 2"
                  strokeWidth={1}
                  label={renderPeakLabel}
                />

                <ReferenceLine
                  x={ds.troughCallout.start}
                  stroke="#10B981"
                  strokeDasharray="2 2"
                  strokeWidth={1}
                  label={renderTroughLabel}
                />

                <XAxis
                  dataKey="time"
                  stroke="#94A3B8"
                  fontSize={10}
                  tickLine={false}
                  interval={selectedPeriod === '2d' ? 2 : 0}
                />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={10}
                  domain={[0, 25]}
                  ticks={[0, 5, 10, 15, 20, 25]}
                  tickLine={false}
                  label={{
                    value: 'Expected Number of Vessels',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 0,
                    style: { textAnchor: 'middle', fill: '#64748B', fontSize: 10, fontWeight: 600 },
                  }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const count = payload[0].value;
                      return (
                        <div className="p-2.5 bg-white rounded-lg shadow-lg border border-slate-200 text-xs">
                          <div className="font-bold text-[#0F2747]">{label}</div>
                          <div className="text-slate-600 mt-1 flex items-center gap-1.5 font-semibold">
                            <span>Expected Vessels:</span>
                            <span className="font-black text-[#1E65B8]">{count}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="vessels"
                  stroke="#0284C7"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#0284C7', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                  activeDot={{ r: 5, fill: '#0F2747' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs text-slate-600 pt-1 border-t border-slate-100 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
              <span>High Traffic / Congestion (&gt;18)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
              <span>Normal Traffic (10–18)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
              <span>Low Traffic (&lt;10)</span>
            </span>
          </div>
        </div>

        {/* RIGHT CARD (4 cols): KEY FORECAST HIGHLIGHTS */}
        <div className="lg:col-span-4 p-5 sm:p-6 rounded-[16px] bg-white border border-[#E2E8F0] shadow-xs space-y-3.5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm sm:text-base font-black text-[#0F2747] flex items-center gap-2 pb-1">
              <TrendingUp className="w-4 h-4 text-[#1E65B8]" />
              <span>{ds.highlightsTitle}</span>
            </h2>
          </div>

          <div className="space-y-3 flex-1 flex flex-col justify-around">
            {ds.highlights.map((h, i) => {
              const isHigh = h.badge === 'HIGH';
              const isLow = h.badge === 'LOW';
              const bgClass = isHigh
                ? 'bg-[#FEF2F2] border-[#FECACA]'
                : isLow
                ? 'bg-[#F0FDF4] border-[#BBF7D0]'
                : 'bg-[#FFFBEB] border-[#FDE68A]';
              const iconColor = isHigh ? 'text-[#DC2626] bg-[#FEE2E2]' : isLow ? 'text-[#16A34A] bg-[#DCFCE7]' : 'text-[#D97706] bg-[#FEF3C7]';
              const badgeClass = isHigh
                ? 'bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5]'
                : isLow
                ? 'bg-[#DCFCE7] text-[#16A34A] border-[#86EFAC]'
                : 'bg-[#FEF3C7] text-[#D97706] border-[#FCD34D]';

              return (
                <div
                  key={i}
                  className={`p-3.5 rounded-xl border ${bgClass} flex items-center justify-between gap-3`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${iconColor}`}>
                      <Ship className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-[#0F2747]">
                        {h.title}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                        {h.timeRange}
                      </div>
                      <div className="text-[11px] font-bold text-slate-700 mt-0.5">
                        Expected Vessels: <span className="font-black text-[#0F2747]">{h.expectedVessels}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0 ${badgeClass}`}>
                    {h.badge}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ROW 2: PORT CONGESTION TABLE + TIME-BASED RISK + UPCOMING ALERTS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* PORT CONGESTION FORECAST */}
        <div className="lg:col-span-12 xl:col-span-5 p-4 sm:p-5 rounded-[16px] bg-white border border-[#E2E8F0] shadow-xs space-y-3">
          <h3 className="text-xs sm:text-sm font-black text-[#0F2747] flex items-center gap-2 pb-1 border-b border-slate-100">
            <Anchor className="w-4 h-4 text-[#1E65B8]" />
            <span>{ds.portCongestionTitle}</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[9.5px] uppercase font-bold text-slate-500 border-b border-slate-100 bg-slate-50/60">
                  <th className="py-2 px-1.5">Port</th>
                  <th className="py-2 px-1">Date</th>
                  <th className="py-2 px-1">Time</th>
                  <th className="py-2 px-1 text-center">Expected Vessels</th>
                  <th className="py-2 px-1 text-center">Congestion Level</th>
                  <th className="py-2 px-1.5 text-right">Risk Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ds.portCongestion.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-1.5 font-bold text-[#0F2747] flex items-center gap-1.5 whitespace-nowrap">
                      <div className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                        <MapPin className="w-2.5 h-2.5 text-[#1E65B8]" />
                      </div>
                      <span className="text-[11px] flex items-center gap-1">
                        <span className="text-xs">🇮🇳</span>
                        <span>{row.port}</span>
                      </span>
                    </td>
                    <td className="py-2 px-1 text-[10px] text-slate-600 whitespace-nowrap">{row.date}</td>
                    <td className="py-2 px-1 text-[10px] text-slate-500 whitespace-nowrap">{row.timeRange}</td>
                    <td className="py-2 px-1 text-center font-black text-[11px] text-[#0F2747]">{row.expectedVessels}</td>
                    <td className="py-2 px-1 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider ${
                        row.congestionLevel === 'HIGH'
                          ? 'bg-[#FEE2E2] text-[#DC2626]'
                          : row.congestionLevel === 'MEDIUM'
                          ? 'bg-[#FEF3C7] text-[#D97706]'
                          : 'bg-[#DCFCE7] text-[#16A34A]'
                      }`}>
                        {row.congestionLevel}
                      </span>
                    </td>
                    <td className="py-2 px-1.5 text-right font-mono font-bold whitespace-nowrap text-[11px]">
                      <span className={
                        row.riskScore > 65 ? 'text-[#DC2626]' : row.riskScore > 40 ? 'text-[#D97706]' : 'text-[#16A34A]'
                      }>
                        {row.riskScore}
                      </span>
                      <span className="text-[9.5px] text-slate-400 font-normal"> / 100</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* TIME-BASED RISK SCORE FORECAST */}
        <div className="lg:col-span-12 xl:col-span-4 p-4 sm:p-5 rounded-[16px] bg-white border border-[#E2E8F0] shadow-xs space-y-3">
          <h3 className="text-xs sm:text-sm font-black text-[#0F2747] flex items-center gap-2 pb-1 border-b border-slate-100">
            <TrendingUp className="w-4 h-4 text-[#1E65B8]" />
            <span>Time-Based Risk Score Forecast</span>
          </h3>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs text-slate-600 font-medium">Current Risk Score:</span>
              <span className="text-xl font-black text-[#0F2747] font-mono">41</span>
              <span className="text-xs text-slate-500 font-medium">/ 100</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FEF3C7] text-[#D97706] border border-[#FCD34D]">
              MEDIUM
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 space-y-2.5">
              <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider block">
                2-Day Forecast
              </span>
              {ds.risk2Day.map((r, i) => (
                <div key={i} className="text-[10.5px] space-y-0.5">
                  <div className="text-slate-600 font-medium">{r.date}</div>
                  <div className="flex items-center gap-1 whitespace-nowrap">
                    <span className="font-mono font-black text-[#0F2747] text-[11px]">{r.score}</span>
                    <span className="text-[9px] text-slate-400 font-normal">/ 100</span>
                    <span className={`px-1 py-0.2 rounded text-[7.5px] font-black uppercase ml-0.5 ${
                      r.level === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {r.level}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider block">
                7-Day Forecast
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
                {ds.risk7Day.map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-[9.5px]">
                    <span className="text-slate-600 font-medium">{r.date}</span>
                    <span className="font-mono font-bold text-[#0F2747]">{r.score}</span>
                    <span className={`px-1 py-0.2 rounded text-[7px] font-black uppercase ${
                      r.level === 'HIGH' ? 'bg-red-100 text-red-700' : r.level === 'LOW' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {r.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 space-y-1 flex flex-col justify-between">
              <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider block">
                30-Day Forecast
              </span>
              
              <div className="h-20 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={ds.risk30DayPoints} margin={{ top: 5, right: 2, left: -30, bottom: 0 }}>
                    <ReferenceArea y1={60} y2={100} fill="#FEE2E2" fillOpacity={0.6} />
                    <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} fontSize={7.5} stroke="#94A3B8" tickLine={false} />
                    <XAxis dataKey="label" fontSize={6.5} stroke="#94A3B8" tickLine={false} interval="preserveStartEnd" />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#0284C7"
                      strokeWidth={1.5}
                      dot={(props: any) => {
                        const isHigh = props.payload.score > 60;
                        return (
                          <circle
                            key={props.index}
                            cx={props.cx}
                            cy={props.cy}
                            r={2.5}
                            fill={isHigh ? '#EF4444' : '#0284C7'}
                          />
                        );
                      }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="text-[7px] text-slate-500 flex items-center justify-between font-bold pt-1">
                <span>🔴 High Risk</span>
                <span>🟡 Med</span>
                <span>🟢 Low</span>
              </div>
            </div>
          </div>
        </div>

        {/* UPCOMING RISK ALERTS */}
        <div className="lg:col-span-12 xl:col-span-3 p-4 sm:p-5 rounded-[16px] bg-white border border-[#E2E8F0] shadow-xs space-y-3">
          <h3 className="text-xs sm:text-sm font-black text-[#0F2747] flex items-center gap-2 pb-1 border-b border-slate-100">
            <AlertTriangle className="w-4 h-4 text-[#D97706]" />
            <span>Upcoming Risk Alerts</span>
          </h3>

          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-between gap-2 hover:border-red-300 transition-colors cursor-pointer group">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-[#0F2747] group-hover:text-[#DC2626] transition-colors leading-tight">
                    High vessel congestion expected in 🇮🇳 Paradip Port
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold mt-1">
                    8 Sep 2026, 14:00 – 20:00
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#DC2626] transition-colors shrink-0" />
            </div>

            <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-between gap-2 hover:border-amber-300 transition-colors cursor-pointer group">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-[#0F2747] group-hover:text-[#D97706] transition-colors leading-tight">
                    Port queue expected to increase
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold mt-1">
                    9 Sep 2026
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#D97706] transition-colors shrink-0" />
            </div>

            <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-between gap-2 hover:border-emerald-300 transition-colors cursor-pointer group">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-[#0F2747] group-hover:text-[#16A34A] transition-colors leading-tight">
                    Low congestion window detected
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold mt-1">
                    10 Sep 2026, 02:00 – 08:00
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#16A34A] transition-colors shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. ROW 3: AI CHARTERING RECOMMENDATION (12 COLS) */}
      {/* ========================================================================= */}
      <div className="p-5 sm:p-6 rounded-[16px] bg-white border border-[#E2E8F0] shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
          <Compass className="w-4 h-4 text-[#1E65B8]" />
          <h3 className="text-sm sm:text-base font-black text-[#0F2747]">
            AI Chartering Recommendation
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3.5">
          <div className="xl:col-span-3 p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-[#16A34A]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Recommended Window</span>
            </div>
            <div className="text-sm font-black text-[#0F2747]">
              {ds.aiRecommendation.recommendedWindow.time}
            </div>
            <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
              {ds.aiRecommendation.recommendedWindow.details}
            </p>
          </div>

          <div className="xl:col-span-3 p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-[#DC2626]">
              <XCircle className="w-3.5 h-3.5" />
              <span>Avoid</span>
            </div>
            <div className="text-sm font-black text-[#0F2747]">
              {ds.aiRecommendation.avoidWindow.time}
            </div>
            <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
              {ds.aiRecommendation.avoidWindow.details}
            </p>
          </div>

          <div className="xl:col-span-2 p-4 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-[#0284C7]">
              <MapPin className="w-3.5 h-3.5" />
              <span>Suggested Port for Lower Congestion</span>
            </div>
            <div className="text-sm font-black text-[#0F2747] flex items-center gap-1">
              <span>🇮🇳</span>
              <span>{ds.aiRecommendation.suggestedPort.name}</span>
            </div>
            <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
              {ds.aiRecommendation.suggestedPort.window}
            </p>
          </div>

          <div className="xl:col-span-4 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-[#0F2747]">
              <Lightbulb className="w-3.5 h-3.5 text-[#E67E22]" />
              <span>Why this recommendation?</span>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {ds.aiRecommendation.whyText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskMonitorPage;
