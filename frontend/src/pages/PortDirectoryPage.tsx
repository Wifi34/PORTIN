import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Search, Plus, Filter, Anchor, Ship, AlertCircle,
  ExternalLink, ChevronRight, X, Info, CheckCircle2
} from 'lucide-react';

interface PortSpecification {
  id: string;
  name: string;
  unlocode: string;
  country: string;
  basin: string;
  operationalProfile: 'Discharge Port' | 'Load Hub';
  maxDraft: number;
  maxLoa: number;
  maxBeam: number;
  ratePerDay: number;
  rateUnit: string;
  berthCount: number;
  restrictionsNote: string;
  supportedVessels: string[];
}

export const PortDirectoryPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'india' | 'global'>('all');
  const [selectedPort, setSelectedPort] = useState<PortSpecification | null>(null);

  const ports: PortSpecification[] = [
    {
      id: 'paradip',
      name: 'Paradip Port',
      unlocode: 'INPRT',
      country: 'India',
      basin: 'Odisha, East Coast',
      operationalProfile: 'Discharge Port',
      maxDraft: 14.5,
      maxLoa: 260,
      maxBeam: 40,
      ratePerDay: 45000,
      rateUnit: 'MT/Day',
      berthCount: 16,
      restrictionsNote: 'Major multi-cargo deepwater port. Capesize requires offshore transshipment or lighterage due to 14.5m draft cap.',
      supportedVessels: ['Supramax', 'Panamax', 'Post-Panamax (Partial)'],
    },
    {
      id: 'vizag',
      name: 'Visakhapatnam Port',
      unlocode: 'INVTZ',
      country: 'India',
      basin: 'Andhra Pradesh, East Coast',
      operationalProfile: 'Discharge Port',
      maxDraft: 18.1,
      maxLoa: 280,
      maxBeam: 45,
      ratePerDay: 55000,
      rateUnit: 'MT/Day',
      berthCount: 24,
      restrictionsNote: 'Outer harbor accommodates deep-draft Capesize vessels up to 200,000 DWT. Inner harbor limited to 11.5m draft Panamax.',
      supportedVessels: ['Handysize', 'Supramax', 'Panamax', 'Capesize (Outer)'],
    },
    {
      id: 'gangavaram',
      name: 'Gangavaram Port',
      unlocode: 'INGVP',
      country: 'India',
      basin: 'Andhra Pradesh, East Coast',
      operationalProfile: 'Discharge Port',
      maxDraft: 18.5,
      maxLoa: 300,
      maxBeam: 50,
      ratePerDay: 60000,
      rateUnit: 'MT/Day',
      berthCount: 9,
      restrictionsNote: 'All-weather, deepwater multi-purpose port capable of handling fully laden Capesize vessels with zero lighterage.',
      supportedVessels: ['Supramax', 'Panamax', 'Capesize (Direct)'],
    },
    {
      id: 'gopalpur',
      name: 'Gopalpur Port',
      unlocode: 'INGPR',
      country: 'India',
      basin: 'Odisha, East Coast',
      operationalProfile: 'Discharge Port',
      maxDraft: 13.0,
      maxLoa: 225,
      maxBeam: 32,
      ratePerDay: 30000,
      rateUnit: 'MT/Day',
      berthCount: 4,
      restrictionsNote: 'Privately managed all-weather port. Optimal for Handysize and Supramax parcels with rapid rail dispatch to Odisha steel plants.',
      supportedVessels: ['Handysize', 'Supramax'],
    },
    {
      id: 'dhamra',
      name: 'Dhamra Port',
      unlocode: 'INDHR',
      country: 'India',
      basin: 'Odisha, East Coast',
      operationalProfile: 'Discharge Port',
      maxDraft: 18.0,
      maxLoa: 300,
      maxBeam: 48,
      ratePerDay: 65000,
      rateUnit: 'MT/Day',
      berthCount: 8,
      restrictionsNote: 'Deepwater port along Bay of Bengal. Accommodates 180,000 DWT Capesize vessels with automated rapid wagon loading systems.',
      supportedVessels: ['Panamax', 'Post-Panamax', 'Capesize'],
    },
    {
      id: 'sagar',
      name: 'Sagar-Sandheads Anchorage',
      unlocode: 'INSAG',
      country: 'India',
      basin: 'West Bengal, Hooghly Estuary',
      operationalProfile: 'Discharge Port',
      maxDraft: 11.5,
      maxLoa: 210,
      maxBeam: 32.5,
      ratePerDay: 25000,
      rateUnit: 'MT/Day',
      berthCount: 2,
      restrictionsNote: 'Offshore transshipment and lighterage anchorage for cargo destined for riverine upstream ports like Kolkata and Haldia.',
      supportedVessels: ['Handysize', 'Supramax (Lightering)'],
    },
    {
      id: 'haldia',
      name: 'Haldia Dock Complex',
      unlocode: 'INHAL',
      country: 'India',
      basin: 'West Bengal, Riverine Port',
      operationalProfile: 'Discharge Port',
      maxDraft: 8.5,
      maxLoa: 190,
      maxBeam: 31,
      ratePerDay: 22000,
      rateUnit: 'MT/Day',
      berthCount: 14,
      restrictionsNote: 'Strict riverine draft governed by Hooghly River tidal bar. Lock gate entry limits LOA to 190m. Deep vessels strictly forbidden.',
      supportedVessels: ['Handysize', 'Mini-Bulk'],
    },
    {
      id: 'haypoint',
      name: 'Australia (Hay Point / Dalrymple Bay)',
      unlocode: 'AUHPT',
      country: 'Australia',
      basin: 'Queensland, Coral Sea',
      operationalProfile: 'Load Hub',
      maxDraft: 20.0,
      maxLoa: 330,
      maxBeam: 55,
      ratePerDay: 120000,
      rateUnit: 'MT/Day',
      berthCount: 7,
      restrictionsNote: 'Premier global metallurgical coking coal export terminal. World-class dual quadrant shiploaders serving VLOC and Capesize bulkers.',
      supportedVessels: ['Panamax', 'Capesize', 'VLOC'],
    },
    {
      id: 'neworleans',
      name: 'United States (New Orleans / Mississippi)',
      unlocode: 'USMSX',
      country: 'United States',
      basin: 'Gulf of Mexico / Mississippi River',
      operationalProfile: 'Load Hub',
      maxDraft: 15.2,
      maxLoa: 275,
      maxBeam: 45,
      ratePerDay: 75000,
      rateUnit: 'MT/Day',
      berthCount: 12,
      restrictionsNote: 'Lower Mississippi deep-draft coal & grain transfer terminals. Subject to seasonal Mississippi River sediment variations.',
      supportedVessels: ['Supramax', 'Panamax', 'Baby-Capesize'],
    },
    {
      id: 'maputo',
      name: 'Mozambique (Maputo / Matola Coal Terminal)',
      unlocode: 'MZMPT',
      country: 'Mozambique',
      basin: 'Southern Africa, Indian Ocean',
      operationalProfile: 'Load Hub',
      maxDraft: 14.5,
      maxLoa: 260,
      maxBeam: 42,
      ratePerDay: 40000,
      rateUnit: 'MT/Day',
      berthCount: 4,
      restrictionsNote: 'High-grade thermal & anthracite coal export terminal connected via rail corridors to South African & Mozambican collieries.',
      supportedVessels: ['Handymax', 'Supramax', 'Panamax'],
    },
    {
      id: 'novorossiysk',
      name: 'Russia (Novorossiysk / Black Sea)',
      unlocode: 'RUNVS',
      country: 'Russia',
      basin: 'Black Sea',
      operationalProfile: 'Load Hub',
      maxDraft: 14.0,
      maxLoa: 250,
      maxBeam: 44,
      ratePerDay: 50000,
      rateUnit: 'MT/Day',
      berthCount: 6,
      restrictionsNote: 'Deepwater Black Sea terminal for PCI and coking coal parcels. Subject to Bosporus Strait convoy scheduling and transit permissions.',
      supportedVessels: ['Supramax', 'Panamax'],
    },
    {
      id: 'taboneo',
      name: 'Indonesia (Taboneo Anchorage / South Kalimantan)',
      unlocode: 'IDTBN',
      country: 'Indonesia',
      basin: 'Java Sea / Kalimantan',
      operationalProfile: 'Load Hub',
      maxDraft: 18.0,
      maxLoa: 300,
      maxBeam: 48,
      ratePerDay: 60000,
      rateUnit: 'MT/Day',
      berthCount: 10,
      restrictionsNote: 'Open-sea sheltered anchorage utilizing floating crane transshipment rigs and self-unloader barges for high-rate thermal coal loading.',
      supportedVessels: ['Supramax', 'Panamax', 'Capesize'],
    },
  ];

  const filteredPorts = ports.filter((p) => {
    if (filterTab === 'india' && p.country !== 'India') return false;
    if (filterTab === 'global' && p.operationalProfile !== 'Load Hub') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.unlocode.toLowerCase().includes(q) ||
        p.basin.toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-full bg-[#F8F7F3] text-[#172033] p-4 sm:p-6 space-y-6">
      {/* EXECUTIVE HEADER CARD */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[16px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] border-t-[3px] border-t-[#D6A63B]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#D6A63B]">
              Naval Directory & Berth Master Data
            </span>
            <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wide bg-[#F8F7F3] text-[#0F2747] border border-[#E4E2DC]">
              OFFICIAL GAZETTED
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F2747] tracking-tight">
            Port Specifications & Berth Limits Directory
          </h1>
          <p className="text-xs sm:text-sm text-[#68717D] mt-1 font-medium">
            Authentic physical limits: permissible drafts, LOA, beam outreach thresholds, and verified daily discharge norms.
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

      {/* MAIN CONTAINER */}
      <div className="rounded-[16px] bg-white border border-[#E4E2DC] p-6 sm:p-8 shadow-sm border-t-4 border-t-[#D6A63B]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#E4E2DC]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D6A63B]" />
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-[#0F2747]">
                Indian & Global Bulk Port Specifications
              </h2>
            </div>
            <p className="text-xs text-[#68717D] mt-1 font-medium">
              Berthing constraints, draft limits, LOA thresholds, and guaranteed discharge rates.
            </p>
          </div>

          {/* Search & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[#68717D] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ports or coastal regions..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-[#E4E2DC] text-xs text-[#172033] placeholder:text-[#68717D] focus:outline-none focus:border-[#D6A63B]"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-[#FAF9F5] p-1 rounded-xl border border-[#E4E2DC]">
              <button
                type="button"
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterTab === 'all'
                    ? 'bg-[#0F2747] text-[#F3E3B7]'
                    : 'text-[#68717D] hover:text-[#0F2747]'
                }`}
              >
                All ({ports.length})
              </button>

              <button
                type="button"
                onClick={() => setFilterTab('india')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterTab === 'india'
                    ? 'bg-[#0F2747] text-[#F3E3B7]'
                    : 'text-[#68717D] hover:text-[#0F2747]'
                }`}
              >
                India East Coast
              </button>

              <button
                type="button"
                onClick={() => setFilterTab('global')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterTab === 'global'
                    ? 'bg-[#0F2747] text-[#F3E3B7]'
                    : 'text-[#68717D] hover:text-[#0F2747]'
                }`}
              >
                Global Load Hubs
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-xl border border-[#E4E2DC] mt-5">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0F2747] text-[#F3E3B7] uppercase text-[10px] font-black tracking-wider">
                <th className="py-3 px-3.5">Port & UN/LOCODE</th>
                <th className="py-3 px-3">Country / Basin</th>
                <th className="py-3 px-3 text-center">Operational Profile</th>
                <th className="py-3 px-3 text-center">Max Draft (m)</th>
                <th className="py-3 px-3 text-center">Max LOA (m)</th>
                <th className="py-3 px-3 text-center">Max Beam (m)</th>
                <th className="py-3 px-3 text-center">Discharge Rate</th>
                <th className="py-3 px-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E2DC]">
              {filteredPorts.map((port, idx) => (
                <tr
                  key={port.id}
                  className={`transition-colors ${idx % 2 === 1 ? 'bg-[#FAF9F5]' : 'bg-white'} hover:bg-[#F3E3B7]/20`}
                >
                  <td className="py-3.5 px-3.5">
                    <div className="font-bold text-[#0F2747] text-xs">{port.name}</div>
                    <div className="text-[10px] font-mono font-bold text-[#68717D] tracking-wider">
                      {port.unlocode}
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-[#172033]">{port.country}</div>
                    <div className="text-[10px] text-[#68717D]">{port.basin}</div>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        port.operationalProfile === 'Discharge Port'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : 'bg-slate-100 text-slate-800 border border-slate-300'
                      }`}
                    >
                      {port.operationalProfile}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center font-mono font-bold text-[#0F2747]">
                    {port.maxDraft.toFixed(1)}m
                  </td>

                  <td className="py-3.5 px-3 text-center font-mono text-[#172033]">
                    {port.maxLoa}m
                  </td>

                  <td className="py-3.5 px-3 text-center font-mono text-[#172033]">
                    {port.maxBeam}m
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <div className="font-mono font-bold text-[#0F2747]">
                      {port.ratePerDay.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-[#68717D] font-mono">
                      {port.rateUnit}
                    </div>
                  </td>

                  <td className="py-3.5 px-3.5 text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedPort(port)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-[#0F2747] bg-[#F3E3B7] hover:bg-[#E8D49E] border border-[#D6A63B]/60 transition-colors cursor-pointer"
                    >
                      View Specs
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL (WARM WHITE WITH GOLD ACCENTS) */}
      {selectedPort && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl rounded-[16px] bg-white border border-[#E4E2DC] shadow-2xl p-6 text-[#172033] relative border-t-4 border-t-[#D6A63B]">
            <div className="flex items-start justify-between pb-4 border-b border-[#E4E2DC]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-[#0F2747]">
                    {selectedPort.name}
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#FAF9F5] border border-[#D6A63B]/60 text-[#0F2747]">
                    {selectedPort.unlocode}
                  </span>
                </div>
                <div className="text-xs text-[#68717D] mt-0.5">
                  {selectedPort.country} • {selectedPort.basin}
                </div>
              </div>

              <button
                onClick={() => setSelectedPort(null)}
                className="p-1 rounded-md text-[#68717D] hover:text-[#0F2747] hover:bg-[#FAF9F5] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 my-4">
              <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#E4E2DC] text-center">
                <div className="text-[9px] uppercase font-bold text-[#68717D]">Max Draft</div>
                <div className="text-base font-black font-mono text-[#0F2747] mt-0.5">
                  {selectedPort.maxDraft}m
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#E4E2DC] text-center">
                <div className="text-[9px] uppercase font-bold text-[#68717D]">Max LOA</div>
                <div className="text-base font-black font-mono text-[#0F2747] mt-0.5">
                  {selectedPort.maxLoa}m
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#E4E2DC] text-center">
                <div className="text-[9px] uppercase font-bold text-[#68717D]">Max Beam</div>
                <div className="text-base font-black font-mono text-[#0F2747] mt-0.5">
                  {selectedPort.maxBeam}m
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#E4E2DC] text-center">
                <div className="text-[9px] uppercase font-bold text-[#68717D]">Daily Rate</div>
                <div className="text-sm font-black font-mono text-emerald-700 mt-0.5">
                  {Math.round(selectedPort.ratePerDay / 1000)}k <span className="text-[9px] font-normal">MT/d</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7F3E8] border border-[#D6A63B]/40 space-y-1.5 text-xs mb-4">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#D98A27]">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Berthing & Physical Constraints</span>
              </div>
              <p className="text-[#5C4813] leading-relaxed text-xs font-medium">
                {selectedPort.restrictionsNote}
              </p>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="text-[10px] uppercase font-bold text-[#68717D]">
                Compatible Vessel Classes
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedPort.supportedVessels.map((v) => (
                  <span
                    key={v}
                    className="px-2.5 py-1 rounded-lg bg-[#FAF9F5] border border-[#E4E2DC] text-[#0F2747] text-[11px] font-semibold flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{v}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-3 border-t border-[#E4E2DC]">
              <Link
                to={`/forecast?port=${selectedPort.id}`}
                onClick={() => setSelectedPort(null)}
                className="px-4 py-2 rounded-xl text-[#0F2747] text-xs font-black uppercase tracking-wider shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                style={{
                  backgroundColor: '#D6A63B',
                }}
              >
                <span>Run Forecast for this Port</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
