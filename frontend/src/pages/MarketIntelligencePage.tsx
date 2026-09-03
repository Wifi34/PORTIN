import React, { useState } from 'react';
import {
  BarChart3, TrendingUp, AlertCircle, RefreshCw, ShieldCheck,
  DollarSign, Compass, Info, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, CartesianGrid, Legend
} from 'recharts';
import { DataProvenanceBadge } from '../components/common/DataProvenanceBadge';

export const MarketIntelligencePage: React.FC = () => {
  // Trade lane freight benchmarks
  const lanes = [
    { route: 'Australia -> Paradip (Panamax)', rate: 14.80, change: '+4.2%', signal: 'BOOK NOW', status: 'Rising' },
    { route: 'Indonesia -> Dhamra (Supramax)', rate: 13.80, change: '-1.1%', signal: 'WAIT', status: 'Softening' },
    { route: 'Mozambique -> Gangavaram (Panamax)', rate: 16.20, change: '+2.5%', signal: 'MONITOR', status: 'Steady' },
    { route: 'Russia -> Paradip (Panamax)', rate: 29.80, change: '+0.5%', signal: 'MONITOR', status: 'Stable' },
    { route: 'USA -> Paradip (Panamax)', rate: 34.50, change: '-0.8%', signal: 'WAIT', status: 'Easing' },
  ];

  // 12-Month Historical Freight Indices (USD/MT)
  const historicalIndices = [
    { month: 'Oct 25', Australia: 13.5, Indonesia: 10.2, Bunker: 580 },
    { month: 'Nov 25', Australia: 13.8, Indonesia: 10.5, Bunker: 590 },
    { month: 'Dec 25', Australia: 14.2, Indonesia: 10.8, Bunker: 610 },
    { month: 'Jan 26', Australia: 14.0, Indonesia: 10.4, Bunker: 605 },
    { month: 'Feb 26', Australia: 14.3, Indonesia: 10.7, Bunker: 615 },
    { month: 'Mar 26', Australia: 14.5, Indonesia: 10.9, Bunker: 625 },
    { month: 'Apr 26', Australia: 14.8, Indonesia: 11.2, Bunker: 635 },
    { month: 'May 26', Australia: 15.2, Indonesia: 11.5, Bunker: 645 },
    { month: 'Jun 26', Australia: 15.8, Indonesia: 11.9, Bunker: 660 },
    { month: 'Jul 26', Australia: 16.1, Indonesia: 12.1, Bunker: 670 },
    { month: 'Aug 26', Australia: 15.4, Indonesia: 11.5, Bunker: 650 },
    { month: 'Sep 26', Australia: 14.8, Indonesia: 10.9, Bunker: 640 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Freight Market Intelligence</span>
            <DataProvenanceBadge sourceType="SIMULATED DEMO" sourceName="Fixed Seed 42 Historical Benchmark Dataset" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Trade Lane Dynamics & Baltic Index Proxies
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Historical freight trends, VLSFO bunker benchmarks, and Baltic Dry index indicators for major Indian bulk corridors.
          </p>
        </div>
      </div>

      {/* Trade Lane Table */}
      <div className="bg-[#081426] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Major East Coast India Bulk Trade Lanes
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Trade Corridor</th>
                <th className="py-3 px-4">Current Benchmark</th>
                <th className="py-3 px-4">30-Day Movement</th>
                <th className="py-3 px-4">Market Signal</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {lanes.map((l, i) => (
                <tr key={i} className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-4 font-bold text-white">{l.route}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">${l.rate.toFixed(2)}/MT</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-200">
                    <span className={l.change.startsWith('+') ? 'text-rose-400' : 'text-emerald-400'}>
                      {l.change}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                      l.signal === 'BOOK NOW' ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' :
                      l.signal === 'WAIT' ? 'bg-amber-950 text-amber-300 border-amber-500/40' : 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                    }`}>
                      {l.signal}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{l.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Trend Chart */}
      <div className="p-6 rounded-2xl bg-[#081426] border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              12-Month Multi-Corridor Freight Trajectory
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Comparative freight movement across key metallurgical corridors.</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">USD / Metric Ton</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalIndices} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="month" stroke="#64748B" fontSize={10} />
              <YAxis stroke="#64748B" fontSize={10} domain={['dataMin - 1', 'dataMax + 1']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#081426', borderColor: '#00B8D9', borderRadius: '8px', fontSize: '11px' }}
                formatter={(v: any) => [`$${v}/MT`]}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line type="monotone" dataKey="Australia" stroke="#00B8D9" strokeWidth={2.5} dot={{ r: 3 }} name="Australia -> Paradip" />
              <Line type="monotone" dataKey="Indonesia" stroke="#62E5F2" strokeWidth={2} dot={{ r: 3 }} name="Indonesia -> Dhamra" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
