import React from 'react';
import {
  PieChart, BarChart3, TrendingUp, DollarSign, Ship,
  Clock, ShieldAlert, CheckCircle2, ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, PieChart as RechartsPie, Pie, Cell, Legend
} from 'recharts';
import { DataProvenanceBadge } from '../components/common/DataProvenanceBadge';

export const AnalyticsPage: React.FC = () => {
  // Cost Decomposition Data ($/MT)
  const costData = [
    { component: 'Ocean Freight Rate', cost: 14.15 },
    { component: 'Port Tariff & Dues', cost: 1.85 },
    { component: 'Bunker Fuel Surcharge', cost: 2.10 },
    { component: 'Anchorage Demurrage', cost: 0.95 },
    { component: 'Unloading & Handling', cost: 1.40 },
  ];

  // Congestion Waiting Times Across Ports (Days)
  const portCongestionData = [
    { port: 'Paradip', waitingDays: 2.8, queue: 6 },
    { port: 'Visakhapatnam', waitingDays: 1.5, queue: 3 },
    { port: 'Gangavaram', waitingDays: 1.2, queue: 2 },
    { port: 'Gopalpur', waitingDays: 0.8, queue: 1 },
    { port: 'Dhamra', waitingDays: 1.4, queue: 3 },
    { port: 'Sagar/Sandheads', waitingDays: 2.0, queue: 2 },
    { port: 'Haldia', waitingDays: 4.5, queue: 8 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E4E2DC]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#D6A63B]">
              Deep Maritime Analytics
            </span>
            <DataProvenanceBadge sourceType="OFFICIAL STATIC + SIMULATED DEMO" sourceName="Chartering Aggregations" />
          </div>
          <h1 className="text-2xl font-black text-[#0F2747] tracking-tight">
            Logistics Cost Decomposition & Congestion Benchmarks
          </h1>
          <p className="text-xs text-[#68717D] mt-1">
            Landed unit freight breakdown, official port waiting times, and predictive error metrics for SAIL supply lines.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Decomposition Bar Chart */}
        <div className="p-6 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-xs font-black text-[#0F2747] uppercase tracking-wider">
                Landed Logistics Cost Decomposition ($/MT)
              </h3>
              <p className="text-xs text-[#68717D] mt-0.5">Per-ton cost breakdown on Australia &rarr; Paradip corridor.</p>
            </div>
            <span className="text-xs font-mono font-black text-[#0F2747] bg-[#F8F7F3] border border-[#E4E2DC] px-2.5 py-1 rounded-[6px]">
              $20.45 Total
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E2DC" horizontal={false} />
                <XAxis type="number" stroke="#68717D" fontSize={11} unit=" $" />
                <YAxis dataKey="component" type="category" stroke="#68717D" fontSize={11} width={130} tick={{ fill: '#172033' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E4E2DC', color: '#172033', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 12px rgba(15, 39, 71, 0.08)' }}
                  formatter={(val: any) => [`$${Number(val).toFixed(2)}/MT`, 'Unit Cost']}
                />
                <Bar dataKey="cost" fill="#0F2747" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Port Waiting & Congestion Queue Comparison */}
        <div className="p-6 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-xs font-black text-[#0F2747] uppercase tracking-wider">
                East Coast Port Anchorage Waiting Times
              </h3>
              <p className="text-xs text-[#68717D] mt-0.5">Average delay days at anchorage prior to berthing.</p>
            </div>
            <span className="text-xs font-semibold text-[#68717D] bg-[#F8F7F3] border border-[#E4E2DC] px-2.5 py-1 rounded-[6px]">
              Official Gazetted Data
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={portCongestionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E2DC" />
                <XAxis dataKey="port" stroke="#68717D" fontSize={10} tick={{ fill: '#172033' }} />
                <YAxis stroke="#68717D" fontSize={11} unit=" d" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E4E2DC', color: '#172033', borderRadius: '8px', fontSize: '11px', boxShadow: '0 4px 12px rgba(15, 39, 71, 0.08)' }}
                  formatter={(val: any) => [`${Number(val)} Days`, 'Avg Waiting Time']}
                />
                <Bar dataKey="waitingDays" fill="#D6A63B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Model Performance & Validation Indicators */}
      <div className="p-6 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)]">
        <h3 className="text-xs font-black text-[#0F2747] uppercase tracking-wider mb-4">
          ML Model Statistical Validation Diagnostics
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
            <span className="text-[#68717D] block text-[11px] font-semibold">Mean Absolute Error (MAE):</span>
            <span className="text-xl font-black text-[#0F2747] font-mono mt-1.5 block">1.18 USD/MT</span>
            <span className="text-[11px] text-[#2F7D4B] font-bold">Low validation error</span>
          </div>

          <div className="p-4 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
            <span className="text-[#68717D] block text-[11px] font-semibold">Root Mean Squared Error:</span>
            <span className="text-xl font-black text-[#0F2747] font-mono mt-1.5 block">1.62 USD/MT</span>
            <span className="text-[11px] text-[#68717D]">RMSE on holdout split</span>
          </div>

          <div className="p-4 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
            <span className="text-[#68717D] block text-[11px] font-semibold">Percentage Error (MAPE):</span>
            <span className="text-xl font-black text-[#0F2747] font-mono mt-1.5 block">6.84%</span>
            <span className="text-[11px] text-[#2F7D4B] font-bold">Within industry tolerance</span>
          </div>

          <div className="p-4 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
            <span className="text-[#68717D] block text-[11px] font-semibold">Training Set Size:</span>
            <span className="text-xl font-black text-[#0F2747] font-mono mt-1.5 block">4,800 Rows</span>
            <span className="text-[11px] text-[#68717D]">Chronological Split</span>
          </div>
        </div>
      </div>
    </div>
  );
};
