import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Ship, Plus, FileText, CheckCircle2, AlertTriangle, Clock,
  ArrowUpRight, ArrowDownRight, DollarSign, Anchor, TrendingUp,
  X, Check, ShieldCheck, ChevronRight, Download, Filter, Search
} from 'lucide-react';

interface CharterFixture {
  id: string;
  vesselName: string;
  route: string;
  vesselClass: string;
  dwt: string;
  cargoType: string;
  tonnage: number;
  parcelNote: string;
  contractRate: number;
  currentSpot: number;
  savingsDollars: number;
  savingsPercent: number;
  status: 'In Transit - Bay of Bengal' | 'At Loading Port' | 'Approaching Anchorage' | 'Discharging' | 'Completed';
  statusProgress: number;
  eta: string;
  demurrageRisk: 'LOW RISK' | 'MEDIUM RISK' | 'HIGH RISK';
}

export const CharterOperationsPage: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [showModal, setShowModal] = useState(false);
  const [executionType, setExecutionType] = useState<'optimal' | 'spot'>('optimal');
  const [cargoVolume, setCargoVolume] = useState<number>(60000);
  const [strikeRate, setStrikeRate] = useState<number>(18.40);
  const [vesselClass, setVesselClass] = useState('Supramax');
  const [ticketOrigin, setTicketOrigin] = useState('Hay Point');
  const [ticketDestination, setTicketDestination] = useState('Paradip Port');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [fixtures, setFixtures] = useState<CharterFixture[]>([
    {
      id: 'fix-1',
      vesselName: 'MV Odisha Pioneer',
      route: 'Hay Point → Paradip Port',
      vesselClass: 'Supramax',
      dwt: '64,000 DWT',
      cargoType: 'Coal - Thermal',
      tonnage: 60000,
      parcelNote: '60k MT Parcel #1',
      contractRate: 18.40,
      currentSpot: 19.72,
      savingsDollars: 79200,
      savingsPercent: 6.7,
      status: 'In Transit - Bay of Bengal',
      statusProgress: 65,
      eta: 'Oct 15, 2026',
      demurrageRisk: 'LOW RISK',
    },
    {
      id: 'fix-2',
      vesselName: 'MV Dhamra Express',
      route: 'Hay Point → Dhamra Port',
      vesselClass: 'Capesize',
      dwt: '180,000 DWT',
      cargoType: 'Coal - Thermal',
      tonnage: 180000,
      parcelNote: '180k MT Full Cargo',
      contractRate: 14.35,
      currentSpot: 15.60,
      savingsDollars: 225000,
      savingsPercent: 8.7,
      status: 'At Loading Port',
      statusProgress: 20,
      eta: 'Oct 21, 2026',
      demurrageRisk: 'LOW RISK',
    },
    {
      id: 'fix-3',
      vesselName: 'MV Bengal Trader',
      route: 'Taboneo → Haldia Dock',
      vesselClass: 'Handysize',
      dwt: '38,000 DWT',
      cargoType: 'Coal - Thermal',
      tonnage: 38000,
      parcelNote: '38k MT',
      contractRate: 12.10,
      currentSpot: 12.85,
      savingsDollars: 28500,
      savingsPercent: 6.2,
      status: 'Approaching Anchorage',
      statusProgress: 88,
      eta: 'Sep 02, 2026',
      demurrageRisk: 'MEDIUM RISK',
    },
  ]);

  const historyFixtures: CharterFixture[] = [
    {
      id: 'hist-1',
      vesselName: 'MV Visakha Pride',
      route: 'Maputo → Vizag Port',
      vesselClass: 'Panamax',
      dwt: '75,000 DWT',
      cargoType: 'Coal - Coking',
      tonnage: 72000,
      parcelNote: '72k MT Final Voyage',
      contractRate: 16.50,
      currentSpot: 17.80,
      savingsDollars: 93600,
      savingsPercent: 7.3,
      status: 'Completed',
      statusProgress: 100,
      eta: 'Aug 14, 2026',
      demurrageRisk: 'LOW RISK',
    },
    {
      id: 'hist-2',
      vesselName: 'MV Gopalpur Star',
      route: 'Gladstone → Gopalpur Port',
      vesselClass: 'Supramax',
      dwt: '58,000 DWT',
      cargoType: 'Iron Ore',
      tonnage: 55000,
      parcelNote: '55k MT Berth #2',
      contractRate: 15.80,
      currentSpot: 16.40,
      savingsDollars: 33000,
      savingsPercent: 3.7,
      status: 'Completed',
      statusProgress: 100,
      eta: 'Jul 28, 2026',
      demurrageRisk: 'LOW RISK',
    },
    {
      id: 'hist-3',
      vesselName: 'MV Gangavaram Titan',
      route: 'Hay Point → Gangavaram Port',
      vesselClass: 'Capesize',
      dwt: '175,000 DWT',
      cargoType: 'Coal - Coking',
      tonnage: 160000,
      parcelNote: '160k MT Direct Berth',
      contractRate: 13.90,
      currentSpot: 15.20,
      savingsDollars: 208000,
      savingsPercent: 8.6,
      status: 'Completed',
      statusProgress: 100,
      eta: 'Jul 04, 2026',
      demurrageRisk: 'LOW RISK',
    },
    {
      id: 'hist-4',
      vesselName: 'MV Kalingan Wave',
      route: 'Taboneo → Paradip Port',
      vesselClass: 'Panamax',
      dwt: '74,000 DWT',
      cargoType: 'Coal - Thermal',
      tonnage: 70000,
      parcelNote: '70k MT CQ-1 Discharge',
      contractRate: 11.85,
      currentSpot: 12.60,
      savingsDollars: 52500,
      savingsPercent: 6.0,
      status: 'Completed',
      statusProgress: 100,
      eta: 'Jun 19, 2026',
      demurrageRisk: 'LOW RISK',
    },
  ];

  const baseOceanFreight = Math.round(cargoVolume * strikeRate);
  const baf = Math.round(cargoVolume * 0.45);
  const demurrageAllowance = Math.round(cargoVolume * 0.30);
  const totalConsideration = baseOceanFreight + baf + demurrageAllowance;

  const handleExecuteFixture = () => {
    const newFix: CharterFixture = {
      id: `fix-${Date.now()}`,
      vesselName: `MV ${ticketDestination.replace(' Port', '')} Voyager`,
      route: `${ticketOrigin} → ${ticketDestination}`,
      vesselClass: vesselClass,
      dwt: vesselClass === 'Capesize' ? '180,000 DWT' : vesselClass === 'Panamax' ? '75,000 DWT' : '64,000 DWT',
      cargoType: 'Coal - Thermal',
      tonnage: cargoVolume,
      parcelNote: `${Math.round(cargoVolume / 1000)}k MT New Fixture`,
      contractRate: strikeRate,
      currentSpot: Number((strikeRate * 1.072).toFixed(2)),
      savingsDollars: Math.round(cargoVolume * (strikeRate * 0.072)),
      savingsPercent: 7.2,
      status: 'At Loading Port',
      statusProgress: 15,
      eta: 'Nov 12, 2026',
      demurrageRisk: 'LOW RISK',
    };

    setFixtures([newFix, ...fixtures]);
    setShowModal(false);
    setToastMessage(`Charter Fixture Executed! Locked rate: $${strikeRate}/MT for ${cargoVolume.toLocaleString()} MT.`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <div className="min-h-full bg-[#F8F7F3] text-[#172033] p-4 sm:p-6 space-y-6">
      {/* EXECUTIVE HEADER CARD */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[16px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] border-t-[3px] border-t-[#D6A63B]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#D6A63B]">
              Chartering Execution & Fleet Tracking
            </span>
            <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wide bg-[#F3FAF7] text-[#2F7D4B] border border-[#BCF0DA]">
              LIVE VOYAGES TRACKING
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F2747] tracking-tight">
            My Freight Portfolio & Active Shipments
          </h1>
          <p className="text-xs sm:text-sm text-[#68717D] mt-1 font-medium">
            Track locked fixtures, mark-to-market voyage valuations, demurrage risk buffers, and total realized savings across active corridors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/forecast"
            className="px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider text-[#0F2747] bg-[#F3E3B7] hover:bg-[#E8D49E] border border-[#D6A63B]/60 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#0F2747]" />
            <span>New Forecast</span>
          </Link>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-black">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MAIN CONTAINER */}
      <div className="rounded-[16px] bg-white border border-[#E4E2DC] p-6 sm:p-8 shadow-sm border-t-4 border-t-[#D6A63B]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E4E2DC]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D6A63B]" />
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-[#0F2747]">
                Fleet Charter Operations & Voyage Holdings
              </h2>
            </div>
            <p className="text-xs text-[#68717D] mt-1 font-medium">
              Active voyage fixtures, cargo throughput, and mark-to-market cost savings across Indian East Coast corridors.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl text-[#0F2747] text-xs font-black uppercase tracking-wider shadow-sm transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
            style={{
              backgroundColor: '#D6A63B',
            }}
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Book Charter</span>
          </button>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 my-5">
          <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E4E2DC]">
            <div className="text-[10px] uppercase font-bold tracking-widest text-[#68717D] mb-1">
              Active Charters
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#0F2747]">
              {fixtures.length} Vessels Active
            </div>
            <div className="text-[11px] text-[#68717D] mt-1 font-medium">
              Operating East Coast India
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E4E2DC]">
            <div className="text-[10px] uppercase font-bold tracking-widest text-[#68717D] mb-1">
              Tonnage Under Contract
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#0F2747]">
              {fixtures.reduce((acc, f) => acc + f.tonnage, 0).toLocaleString()} MT
            </div>
            <div className="text-[11px] text-[#68717D] mt-1 font-medium">
              Coking coal & thermal parcel
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E4E2DC]">
            <div className="text-[10px] uppercase font-bold tracking-widest text-[#68717D] mb-1">
              Weighted Average Rate
            </div>
            <div className="text-xl sm:text-2xl font-black text-[#0F2747]">
              $14.92 <span className="text-xs font-normal text-[#68717D]">/ MT</span>
            </div>
            <div className="text-[11px] text-[#68717D] mt-1 font-medium">
              Fixed charter baseline
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E4E2DC]">
            <div className="text-[10px] uppercase font-bold tracking-widest text-[#68717D] mb-1">
              Realized Through Savings
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700">
              +${fixtures.reduce((acc, f) => acc + f.savingsDollars, 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1">
              vs. prevailing spot rates
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E4E2DC] pb-3 mb-4">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'active'
                ? 'bg-[#0F2747] text-[#F3E3B7] shadow-xs'
                : 'text-[#68717D] hover:text-[#0F2747] hover:bg-[#FAF9F5]'
            }`}
          >
            <Ship className="w-3.5 h-3.5" />
            <span>Active Charter Operations ({fixtures.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-[#0F2747] text-[#F3E3B7] shadow-xs'
                : 'text-[#68717D] hover:text-[#0F2747] hover:bg-[#FAF9F5]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Charter Order History ({historyFixtures.length})</span>
          </button>
        </div>

        {/* Table with Navy Header and Ivory Alternating Rows */}
        <div className="overflow-x-auto rounded-xl border border-[#E4E2DC]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0F2747] text-[#F3E3B7] uppercase text-[10px] font-black tracking-wider">
                <th className="py-3 px-3.5">Vessel & Corridor</th>
                <th className="py-3 px-3">Cargo / Tonnage</th>
                <th className="py-3 px-3">Contract Rate</th>
                <th className="py-3 px-3">Current Spot</th>
                <th className="py-3 px-3">Savings Opportunity</th>
                <th className="py-3 px-3">Voyage Status</th>
                <th className="py-3 px-3">ETA</th>
                <th className="py-3 px-3 text-center">Demurrage Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E2DC]">
              {(activeTab === 'active' ? fixtures : historyFixtures).map((fix, idx) => (
                <tr
                  key={fix.id}
                  className={`transition-colors ${idx % 2 === 1 ? 'bg-[#FAF9F5]' : 'bg-white'} hover:bg-[#F3E3B7]/20`}
                >
                  <td className="py-3.5 px-3.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-[#FAF9F5] border border-[#E4E2DC] text-[#0F2747]">
                        <Ship className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-[#0F2747] text-xs">{fix.vesselName}</div>
                        <div className="text-[11px] text-[#68717D]">
                          {fix.route} • <span className="font-semibold">{fix.vesselClass} ({fix.dwt})</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="font-bold text-[#172033]">{fix.tonnage.toLocaleString()} MT</div>
                    <div className="text-[10px] text-[#68717D]">{fix.cargoType} ({fix.parcelNote})</div>
                  </td>

                  <td className="py-3.5 px-3 font-mono font-black text-[#0F2747]">
                    ${fix.contractRate.toFixed(2)} <span className="text-[10px] font-normal text-[#68717D]">/ MT</span>
                  </td>

                  <td className="py-3.5 px-3 font-mono font-medium text-[#68717D]">
                    ${fix.currentSpot.toFixed(2)} <span className="text-[10px] font-normal">/ MT</span>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="font-bold font-mono text-emerald-700">
                      +${fix.savingsDollars.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-medium">
                      +{fix.savingsPercent.toFixed(1)}% vs spot
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1.5 font-medium text-[#172033]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D6A63B]" />
                      <span>{fix.status}</span>
                    </div>
                    <div className="w-28 h-1 bg-[#E4E2DC] rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#D6A63B] to-amber-600 rounded-full"
                        style={{ width: `${fix.statusProgress}%` }}
                      />
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-[#172033] font-medium">
                    {fix.eta}
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        fix.demurrageRisk === 'LOW RISK'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {fix.demurrageRisk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: CHARTER FIXTURE EXECUTION TICKET (WARM WHITE / NAVY ACCENT) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-[16px] bg-white border border-[#E4E2DC] shadow-2xl p-6 text-[#172033] relative border-t-4 border-t-[#D6A63B]">
            <div className="flex items-start justify-between pb-4 border-b border-[#E4E2DC]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-[#0F2747]">
                    Charter Fixture Execution Ticket
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-[#FAF9F5] border border-[#D6A63B]/60 text-[#0F2747]">
                    AI-PDF
                  </span>
                </div>
                <div className="text-xs text-[#D98A27] font-bold mt-0.5">
                  {ticketOrigin} &rarr; {ticketDestination}
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-md text-[#68717D] hover:text-[#0F2747] hover:bg-[#FAF9F5] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4">
              <label className="block text-[10px] uppercase font-bold tracking-wider text-[#68717D] mb-2">
                Charter Execution Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setExecutionType('optimal');
                    setStrikeRate(18.40);
                  }}
                  className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                    executionType === 'optimal'
                      ? 'border-[#D6A63B] bg-[#FAF9F5] ring-2 ring-[#D6A63B]/30'
                      : 'border-[#E4E2DC] bg-white hover:border-slate-400'
                  }`}
                >
                  <div className="text-xs font-black text-[#0F2747]">Optimal Window Fix</div>
                  <div className="text-[11px] text-emerald-700 font-bold mt-0.5">
                    Target rate: $18.40/MT
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setExecutionType('spot');
                    setStrikeRate(19.72);
                  }}
                  className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                    executionType === 'spot'
                      ? 'border-[#D6A63B] bg-[#FAF9F5] ring-2 ring-[#D6A63B]/30'
                      : 'border-[#E4E2DC] bg-white hover:border-slate-400'
                  }`}
                >
                  <div className="text-xs font-black text-[#0F2747]">Spot Market Fix</div>
                  <div className="text-[11px] text-amber-700 font-bold mt-0.5">
                    Immediate fixture at $19.72/MT
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5 mt-4">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#68717D] mb-1.5">
                  Cargo Volume (MT)
                </label>
                <input
                  type="number"
                  value={cargoVolume}
                  onChange={(e) => setCargoVolume(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E4E2DC] text-xs font-mono font-bold text-[#172033] focus:outline-none focus:border-[#D6A63B]"
                />
                <div className="text-[10px] text-[#68717D] mt-1 font-medium">
                  Vessel class: <strong className="text-[#0F2747]">{vesselClass}</strong>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#68717D] mb-1.5">
                  Agreed Strike Rate ($/MT)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={strikeRate}
                  onChange={(e) => setStrikeRate(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E4E2DC] text-xs font-mono font-bold text-[#0F2747] focus:outline-none focus:border-[#D6A63B]"
                />
                <div className="text-[10px] text-[#68717D] mt-1">
                  Benchmark spot: <span className="font-mono text-[#0F2747] font-semibold">$19.72/MT</span>
                </div>
              </div>
            </div>

            <div className="mt-5 p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E4E2DC] space-y-2 text-xs">
              <div className="text-[10px] uppercase font-black tracking-wider text-[#68717D] pb-1 border-b border-[#E4E2DC]">
                Voyage Consideration Breakdown
              </div>

              <div className="flex items-center justify-between text-[#172033]">
                <span>Base Ocean Freight:</span>
                <span className="font-mono font-bold text-[#0F2747]">${baseOceanFreight.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-[#172033]">
                <span>Bunker Fuel Adjustment (BAF):</span>
                <span className="font-mono font-bold text-[#0F2747]">${baf.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-[#172033]">
                <span>Demurrage Risk Allowance:</span>
                <span className="font-mono font-bold text-[#0F2747]">${demurrageAllowance.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#E4E2DC] font-black text-sm">
                <span className="text-[#0F2747]">Total Calculated Consideration:</span>
                <span className="font-mono text-[#0F2747] font-black">${totalConsideration.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-3 border-t border-[#E4E2DC]">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#68717D] hover:bg-[#FAF9F5] transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecuteFixture}
                className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-colors cursor-pointer"
                style={{
                  backgroundColor: '#D6A63B',
                  color: '#0F2747',
                }}
              >
                Execute Fixture
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
