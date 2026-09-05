import React from 'react';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D6A63B]">
              Freight Market Intelligence
            </span>
            <DataProvenanceBadge sourceType="SIMULATED DEMO" sourceName="Fixed Seed 42 Historical Benchmark Dataset" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F2747] tracking-tight">
            Trade Lane Dynamics & Baltic Index Proxies
          </h2>
          <p className="text-xs text-[#68717D] mt-0.5 font-medium">
            Historical freight trends, VLSFO bunker benchmarks, and Baltic Dry index indicators for major Indian bulk corridors.
          </p>
        </div>
      </div>

      {/* Trade Lane Table */}
      <div className="bg-white border border-[#E4E2DC] rounded-[10px] overflow-hidden shadow-[0_1px_3px_rgba(15,39,71,0.04)]">
        <div className="p-4 border-b border-[#E4E2DC] flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#0F2747] uppercase tracking-wider">
            Major East Coast India Bulk Trade Lanes
          </h3>
          <span className="text-[11px] font-semibold text-[#68717D]">Spot & Short-Term Indices</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F7F3] text-[#68717D] uppercase text-[10px] font-bold border-b border-[#E4E2DC]">
              <tr>
                <th className="py-3 px-4">Trade Corridor</th>
                <th className="py-3 px-4">Current Benchmark</th>
                <th className="py-3 px-4">30-Day Movement</th>
                <th className="py-3 px-4">Market Signal</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E2DC]">
              {lanes.map((l, i) => (
                <tr key={i} className="hover:bg-[#F8F7F3]">
                  <td className="py-3.5 px-4 font-bold text-[#0F2747]">{l.route}</td>
                  <td className="py-3.5 px-4 font-mono font-black text-[#0F2747]">${l.rate.toFixed(2)}/MT</td>
                  <td className="py-3.5 px-4 font-bold">
                    <span className={l.change.startsWith('+') ? 'text-[#C64A3B]' : 'text-[#2F7D4B]'}>
                      {l.change}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-[6px] text-xs font-black uppercase tracking-wider border ${
                      l.signal === 'BOOK NOW' ? 'bg-[#F3FAF7] text-[#2F7D4B] border-[#BCF0DA]' :
                      l.signal === 'WAIT' ? 'bg-[#FEF7EC] text-[#D98A27] border-[#FBE6C2]' : 'bg-[#F8F7F3] text-[#0F2747] border-[#E4E2DC]'
                    }`}>
                      {l.signal}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#68717D] font-medium">{l.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Trend Chart */}
      <div className="p-6 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E4E2DC]">
          <div>
            <h3 className="text-sm font-bold text-[#0F2747] uppercase tracking-wider">
              12-Month Multi-Corridor Freight Trajectory
            </h3>
            <p className="text-xs text-[#68717D] mt-0.5 font-medium">Comparative freight movement across key metallurgical corridors.</p>
          </div>
          <span className="text-xs text-[#68717D] font-mono font-semibold">USD / Metric Ton</span>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalIndices} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E2DC" vertical={false} />
              <XAxis dataKey="month" stroke="#68717D" fontSize={10} />
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
                formatter={(val: any) => [`$${Number(val).toFixed(2)}/MT`]}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="Australia" stroke="#0F2747" strokeWidth={2.5} dot={{ r: 3, fill: '#D6A63B' }} />
              <Line type="monotone" dataKey="Indonesia" stroke="#2F7D4B" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
