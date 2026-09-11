import React, { useState, useEffect, useRef } from 'react';
import { MapPin, ChevronDown, ChevronRight, Anchor, Check, Search, Compass } from 'lucide-react';

export interface OriginPortItem {
  name: string;
  subLocation: string;
  typicalCargo: string;
  coast?: 'East Coast' | 'West Coast';
  maxDraft?: string;
  maxLoa?: string;
  berths?: number;
  currentQueue?: number;
}

export interface OriginCountryItem {
  code: string;
  country: string;
  flag: string;
  ports: OriginPortItem[];
}

export interface DestinationPortDetail {
  name: string;
  cleanName: string;
  state: string;
  region: 'East Coast' | 'West Coast';
  maxDraft: string;
  maxLoa: string;
  berths: number;
  currentQueue: number;
  typicalCargo?: string;
}

// -----------------------------------------------------------------------------
// INDIAN PORT DETAILS (East Coast & West Coast)
// -----------------------------------------------------------------------------
export const ALL_INDIAN_PORTS: DestinationPortDetail[] = [
  // --- East Coast Ports (12 Major Hubs) ---
  { name: 'Paradip (Odisha)', cleanName: 'Paradip Port', state: 'Odisha', region: 'East Coast', maxDraft: '14.5m', maxLoa: '260m', berths: 16, currentQueue: 8, typicalCargo: 'Thermal Coal & Coking Coal' },
  { name: 'Dhamra (Odisha)', cleanName: 'Dhamra Port', state: 'Odisha', region: 'East Coast', maxDraft: '18.0m (Deep Water)', maxLoa: '300m', berths: 5, currentQueue: 4, typicalCargo: 'Deepwater Coking Coal & Pellets' },
  { name: 'Gopalpur (Odisha)', cleanName: 'Gopalpur Port', state: 'Odisha', region: 'East Coast', maxDraft: '12.5m', maxLoa: '230m', berths: 4, currentQueue: 3, typicalCargo: 'Ilmenite Sand & Thermal Coal' },
  { name: 'Visakhapatnam (Andhra Pradesh)', cleanName: 'Visakhapatnam Port', state: 'Andhra Pradesh', region: 'East Coast', maxDraft: '16.5m', maxLoa: '280m', berths: 24, currentQueue: 6, typicalCargo: 'Met Coal & High-Grade Iron Ore' },
  { name: 'Gangavaram (Andhra Pradesh)', cleanName: 'Gangavaram Port', state: 'Andhra Pradesh', region: 'East Coast', maxDraft: '18.5m', maxLoa: '310m', berths: 8, currentQueue: 3, typicalCargo: 'Deepwater Coking Coal & Limestone' },
  { name: 'Krishnapatnam (Andhra Pradesh)', cleanName: 'Krishnapatnam Port', state: 'Andhra Pradesh', region: 'East Coast', maxDraft: '17.5m', maxLoa: '290m', berths: 10, currentQueue: 5, typicalCargo: 'Steam Coal & Fertilizer' },
  { name: 'Kakinada (Andhra Pradesh)', cleanName: 'Kakinada Deep Water', state: 'Andhra Pradesh', region: 'East Coast', maxDraft: '13.0m', maxLoa: '230m', berths: 6, currentQueue: 4, typicalCargo: 'Agri Bulk & Minerals' },
  { name: 'Haldia (West Bengal)', cleanName: 'Haldia Dock Complex', state: 'West Bengal', region: 'East Coast', maxDraft: '8.5m (Riverine)', maxLoa: '210m', berths: 12, currentQueue: 11, typicalCargo: 'Riverine Thermal Coal & Flux' },
  { name: 'Kolkata (West Bengal)', cleanName: 'Kolkata Port', state: 'West Bengal', region: 'East Coast', maxDraft: '7.5m (Riverine)', maxLoa: '180m', berths: 8, currentQueue: 6, typicalCargo: 'River Port & General Bulk' },
  { name: 'Ennore / Kamarajar (Tamil Nadu)', cleanName: 'Kamarajar Port', state: 'Tamil Nadu', region: 'East Coast', maxDraft: '15.0m', maxLoa: '260m', berths: 9, currentQueue: 4, typicalCargo: 'TANGEDCO Coal & Iron Ore' },
  { name: 'Chennai (Tamil Nadu)', cleanName: 'Chennai Port', state: 'Tamil Nadu', region: 'East Coast', maxDraft: '14.0m', maxLoa: '250m', berths: 14, currentQueue: 5, typicalCargo: 'Clean Bulk & Coastal Cargo' },
  { name: 'Tuticorin / VOC (Tamil Nadu)', cleanName: 'V.O. Chidambaranar Port', state: 'Tamil Nadu', region: 'East Coast', maxDraft: '12.8m', maxLoa: '230m', berths: 10, currentQueue: 4, typicalCargo: 'Thermal Coal & Copper Concentrates' },
  { name: 'Karaikal (Puducherry)', cleanName: 'Karaikal Port', state: 'Puducherry', region: 'East Coast', maxDraft: '13.5m', maxLoa: '230m', berths: 5, currentQueue: 2, typicalCargo: 'Coal, Fertilizer & Agri Bulk' },

  // --- West Coast Ports (11 Major Hubs) ---
  { name: 'Mundra (Gujarat)', cleanName: 'Mundra Port', state: 'Gujarat', region: 'West Coast', maxDraft: '17.5m', maxLoa: '300m', berths: 12, currentQueue: 7, typicalCargo: 'Thermal Coal & Petcoke' },
  { name: 'Kandla / Deendayal (Gujarat)', cleanName: 'Deendayal Port', state: 'Gujarat', region: 'West Coast', maxDraft: '13.0m', maxLoa: '240m', berths: 16, currentQueue: 9, typicalCargo: 'Steam Coal, Salt & Agri Bulk' },
  { name: 'Dahej (Gujarat)', cleanName: 'Dahej Port', state: 'Gujarat', region: 'West Coast', maxDraft: '14.0m', maxLoa: '250m', berths: 6, currentQueue: 3, typicalCargo: 'Coal & Industrial Chemical Bulk' },
  { name: 'Hazira (Gujarat)', cleanName: 'Hazira Port', state: 'Gujarat', region: 'West Coast', maxDraft: '13.5m', maxLoa: '240m', berths: 6, currentQueue: 4, typicalCargo: 'Steel Slabs, Coils & Coal' },
  { name: 'Pipavav (Gujarat)', cleanName: 'Pipavav Port', state: 'Gujarat', region: 'West Coast', maxDraft: '14.5m', maxLoa: '260m', berths: 5, currentQueue: 2, typicalCargo: 'Minerals, Fertilizer & Bulk' },
  { name: 'Jaigarh (Maharashtra)', cleanName: 'Jaigarh Port', state: 'Maharashtra', region: 'West Coast', maxDraft: '18.0m', maxLoa: '300m', berths: 4, currentQueue: 2, typicalCargo: 'Deepwater Thermal Coal' },
  { name: 'JNPT / Jawaharlal Nehru (Maharashtra)', cleanName: 'JNPT Port', state: 'Maharashtra', region: 'West Coast', maxDraft: '14.0m', maxLoa: '260m', berths: 10, currentQueue: 6, typicalCargo: 'Container & Liquid Bulk' },
  { name: 'Mumbai Port (Maharashtra)', cleanName: 'Mumbai Port', state: 'Maharashtra', region: 'West Coast', maxDraft: '11.5m', maxLoa: '225m', berths: 18, currentQueue: 5, typicalCargo: 'Coastal Steel & Breakbulk' },
  { name: 'Mormugao (Goa)', cleanName: 'Mormugao Port', state: 'Goa', region: 'West Coast', maxDraft: '14.5m', maxLoa: '260m', berths: 7, currentQueue: 4, typicalCargo: 'Iron Ore Exports & Coking Coal' },
  { name: 'New Mangalore (Karnataka)', cleanName: 'New Mangalore Port', state: 'Karnataka', region: 'West Coast', maxDraft: '14.0m', maxLoa: '250m', berths: 8, currentQueue: 3, typicalCargo: 'KIOCL Pellets & Coal' },
  { name: 'Cochin (Kerala)', cleanName: 'Cochin Port', state: 'Kerala', region: 'West Coast', maxDraft: '14.5m', maxLoa: '260m', berths: 8, currentQueue: 4, typicalCargo: 'Coastal Bulk & Bunkering' },
];

export const INDIAN_PORT_CATALOG = [
  {
    group: 'East Coast of India (Steel & Bulk Primary Hubs)',
    ports: ALL_INDIAN_PORTS.filter((p) => p.region === 'East Coast'),
  },
  {
    group: 'West Coast of India',
    ports: ALL_INDIAN_PORTS.filter((p) => p.region === 'West Coast'),
  },
];

// -----------------------------------------------------------------------------
// COMPLETE GLOBAL & DOMESTIC COUNTRY PORT CATALOG (INCLUDES INDIA)
// -----------------------------------------------------------------------------
export const ORIGIN_COUNTRY_CATALOG: OriginCountryItem[] = [
  // 1. Australia
  {
    code: 'AU',
    country: 'Australia',
    flag: '🇦🇺',
    ports: [
      { name: 'Hay Point / Dalrymple Bay', subLocation: 'Queensland, Australia', typicalCargo: 'Prime Hard Coking Coal' },
      { name: 'Gladstone', subLocation: 'Queensland, Australia', typicalCargo: 'Coking Coal & Alumina' },
      { name: 'Newcastle', subLocation: 'NSW, Australia', typicalCargo: 'Thermal Coal & Coking Coal' },
      { name: 'Abbot Point', subLocation: 'Queensland, Australia', typicalCargo: 'Bowen Basin Coal' },
      { name: 'Port Hedland', subLocation: 'WA, Australia', typicalCargo: 'Iron Ore Lump & Fines' },
      { name: 'Dampier', subLocation: 'WA, Australia', typicalCargo: 'Iron Ore & Salt' },
      { name: 'Port Kembla', subLocation: 'NSW, Australia', typicalCargo: 'Coking Coal & Grain' },
    ],
  },
  // 2. India (Domestic Coastal & Hubs)
  {
    code: 'IN',
    country: 'India',
    flag: '🇮🇳',
    ports: ALL_INDIAN_PORTS.map((p) => ({
      name: p.cleanName || p.name.split(' (')[0],
      subLocation: `${p.state}, India`,
      typicalCargo: p.typicalCargo || (p.region === 'East Coast' ? 'Metallurgical Coal & Pellets' : 'Thermal Bulk & Minerals'),
      coast: p.region,
      maxDraft: p.maxDraft,
      maxLoa: p.maxLoa,
      berths: p.berths,
      currentQueue: p.currentQueue,
    })),
  },
  // 3. United States
  {
    code: 'US',
    country: 'United States',
    flag: '🇺🇸',
    ports: [
      { name: 'Baltimore', subLocation: 'Maryland, USA', typicalCargo: 'Coal & Agri Bulk' },
      { name: 'Hampton Roads', subLocation: 'Virginia, USA', typicalCargo: 'Met Coal & Steam Coal' },
      { name: 'New Orleans', subLocation: 'Louisiana, USA', typicalCargo: 'Agri Bulk, Petcoke & Coal' },
      { name: 'Houston', subLocation: 'Texas, USA', typicalCargo: 'Petcoke & Minerals' },
      { name: 'Mobile', subLocation: 'Alabama, USA', typicalCargo: 'McDuffie Coal Terminal' },
      { name: 'Long Beach', subLocation: 'California, USA', typicalCargo: 'Petcoke & Steam Coal' },
    ],
  },
  // 4. Indonesia
  {
    code: 'ID',
    country: 'Indonesia',
    flag: '🇮🇩',
    ports: [
      { name: 'Taboneo Anchorage', subLocation: 'South Kalimantan, Indonesia', typicalCargo: 'Sub-Bituminous Coal' },
      { name: 'Balikpapan', subLocation: 'East Kalimantan, Indonesia', typicalCargo: 'Steam Coal & Minerals' },
      { name: 'Samarinda (Muara Berau)', subLocation: 'East Kalimantan, Indonesia', typicalCargo: 'Thermal Coal Fines' },
      { name: 'Tanjung Bara (KPC)', subLocation: 'East Kalimantan, Indonesia', typicalCargo: 'Primacoal' },
      { name: 'Bunati', subLocation: 'South Kalimantan, Indonesia', typicalCargo: 'Steam Coal' },
      { name: 'Tarahan', subLocation: 'South Sumatra, Indonesia', typicalCargo: 'High CV Coal' },
    ],
  },
  // 5. Mozambique
  {
    code: 'MZ',
    country: 'Mozambique',
    flag: '🇲🇿',
    ports: [
      { name: 'Maputo Coal Terminal', subLocation: 'Maputo Bay, Mozambique', typicalCargo: 'Thermal Coal & Ferrochrome' },
      { name: 'Beira', subLocation: 'Central Mozambique', typicalCargo: 'Moatize Coking Coal' },
      { name: 'Nacala', subLocation: 'Nampula, Mozambique', typicalCargo: 'Deepwater Coking Coal' },
    ],
  },
  // 6. South Africa
  {
    code: 'ZA',
    country: 'South Africa',
    flag: '🇿🇦',
    ports: [
      { name: 'Richards Bay (RBCT)', subLocation: 'KwaZulu-Natal, South Africa', typicalCargo: 'RBCT Steam Coal' },
      { name: 'Saldanha Bay', subLocation: 'Western Cape, South Africa', typicalCargo: 'Sishen Iron Ore' },
      { name: 'Durban', subLocation: 'KwaZulu-Natal, South Africa', typicalCargo: 'Anthracite & Agri Bulk' },
    ],
  },
  // 7. Russia
  {
    code: 'RU',
    country: 'Russia',
    flag: '🇷🇺',
    ports: [
      { name: 'Vostochny', subLocation: 'Primorsky Krai, Russia', typicalCargo: 'PCI Coal & Anthracite' },
      { name: 'Vanino', subLocation: 'Khabarovsk Krai, Russia', typicalCargo: 'Siberian Coal' },
      { name: 'Ust-Luga', subLocation: 'Baltic Sea, Russia', typicalCargo: 'Kuzbass Coal & Fertilizers' },
      { name: 'Taman', subLocation: 'Black Sea, Russia', typicalCargo: 'Steam Coal & Met Coke' },
      { name: 'Murmansk', subLocation: 'Arctic, Russia', typicalCargo: 'Ice-Free Coal & Pellets' },
      { name: 'Novorossiysk', subLocation: 'Black Sea, Russia', typicalCargo: 'Grain & Pig Iron' },
    ],
  },
  // 8. Canada
  {
    code: 'CA',
    country: 'Canada',
    flag: '🇨🇦',
    ports: [
      { name: 'Vancouver (Roberts Bank)', subLocation: 'BC, Canada', typicalCargo: 'Met Coal & Potash' },
      { name: 'Prince Rupert', subLocation: 'BC, Canada', typicalCargo: 'Ridley Coal & Grain' },
    ],
  },
  // 9. Brazil
  {
    code: 'BR',
    country: 'Brazil',
    flag: '🇧🇷',
    ports: [
      { name: 'Ponta da Madeira', subLocation: 'Maranhao, Brazil', typicalCargo: 'Carajas Iron Ore' },
      { name: 'Tubarao', subLocation: 'Espirito Santo, Brazil', typicalCargo: 'Iron Ore & Pellets' },
      { name: 'Santos', subLocation: 'Sao Paulo, Brazil', typicalCargo: 'Sugar, Soy & Bulk' },
    ],
  },
  // 10. Colombia
  {
    code: 'CO',
    country: 'Colombia',
    flag: '🇨🇴',
    ports: [
      { name: 'Puerto Bolivar', subLocation: 'La Guajira, Colombia', typicalCargo: 'Cerrejon Coal' },
      { name: 'Puerto Drummond', subLocation: 'Magdalena, Colombia', typicalCargo: 'Colombian Thermal Coal' },
    ],
  },
];

// Helper to find details of an Indian port by name string
export function getIndianPortDetail(portName: string): DestinationPortDetail {
  const clean = (portName || '').toLowerCase();
  for (const p of ALL_INDIAN_PORTS) {
    if (
      p.name.toLowerCase() === clean ||
      p.cleanName.toLowerCase() === clean ||
      clean.includes(p.cleanName.toLowerCase()) ||
      clean.includes(p.name.split(' (')[0].toLowerCase())
    ) {
      return p;
    }
  }
  return ALL_INDIAN_PORTS[0];
}

// =========================================================================
// 1. ORIGIN PORT CASCADING FLYOUT PICKER (IMAGE 4 WITH INDIA EAST/WEST)
// =========================================================================
interface OriginPortFlyoutProps {
  value: string; // e.g. "AU Australia (Hay Point / Dalrymple Bay)" or "Hay Point"
  onChange: (portName: string, countryName: string, fullDisplay: string, cargo?: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
  dropdownAlign?: 'left' | 'right';
}

export const OriginPortFlyout: React.FC<OriginPortFlyoutProps> = ({
  value,
  onChange,
  label,
  required,
  className = '',
  dropdownAlign = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCoastTab, setSelectedCoastTab] = useState<'All' | 'East Coast' | 'West Coast'>('All');

  // Initial hovered country based on current value
  const initialCountry =
    ORIGIN_COUNTRY_CATALOG.find((c) =>
      value.toLowerCase().includes(c.country.toLowerCase()) ||
      c.ports.some((p) => value.toLowerCase().includes(p.name.toLowerCase()))
    ) || ORIGIN_COUNTRY_CATALOG[0];

  const [hoveredCountry, setHoveredCountry] = useState<OriginCountryItem>(initialCountry);

  // Detect country & port from value for display
  const matchedCountry =
    ORIGIN_COUNTRY_CATALOG.find((c) =>
      value.toLowerCase().includes(c.country.toLowerCase()) ||
      c.ports.some((p) => value.toLowerCase().includes(p.name.toLowerCase()))
    ) || ORIGIN_COUNTRY_CATALOG[0];

  const matchedPort =
    matchedCountry.ports.find((p) => value.toLowerCase().includes(p.name.toLowerCase())) ||
    matchedCountry.ports[0];

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelectPort = (countryItem: OriginCountryItem, portItem: OriginPortItem) => {
    const fullDisplay = `${countryItem.code} ${countryItem.country} (${portItem.name})`;
    onChange(portItem.name, countryItem.country, fullDisplay, portItem.typicalCargo);
    setIsOpen(false);
  };

  // Filter ports for the hovered country
  let displayedPorts = hoveredCountry.ports;
  if (hoveredCountry.code === 'IN' && selectedCoastTab !== 'All') {
    displayedPorts = displayedPorts.filter((p) => p.coast === selectedCoastTab);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    displayedPorts = displayedPorts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.subLocation.toLowerCase().includes(q) ||
        p.typicalCargo.toLowerCase().includes(q)
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#475569] mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Trigger Button Matching Image 4 */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full bg-white hover:bg-slate-50 border rounded-lg pl-8 pr-7 py-2 text-xs font-bold text-[#0F2747] flex items-center justify-between text-left transition-all cursor-pointer ${
            isOpen ? 'border-[#D6A63B] ring-2 ring-[#D6A63B]/20 shadow-xs' : 'border-[#CBD5E1]'
          }`}
        >
          <span className="truncate flex items-center gap-1.5">
            <span className="font-mono font-black text-[#0F2747] text-[11px]">{matchedCountry.code}</span>
            <span className="truncate">{matchedCountry.country} ({matchedPort.name})</span>
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isOpen ? 'rotate-180 text-[#D6A63B]' : ''}`} />
        </button>
        <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* Cascading 2-Column Flyout Matching User Screenshot */}
      {isOpen && (
        <div
          className={`absolute ${
            dropdownAlign === 'right' ? 'right-0' : 'left-0'
          } top-full mt-1.5 z-50 flex shadow-2xl rounded-xl border border-[#CBD5E1] bg-white text-xs animate-in fade-in duration-150 min-w-[580px] max-w-[95vw] overflow-hidden`}
        >
          {/* Left Column: Select Origin Country */}
          <div className="w-56 border-r border-[#E2E8F0] p-2 space-y-1 bg-[#F8FAFC]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2.5 py-1 border-b border-slate-200 mb-1">
              SELECT ORIGIN COUNTRY
            </div>
            <div className="max-h-80 overflow-y-auto space-y-0.5 pr-0.5">
              {ORIGIN_COUNTRY_CATALOG.map((c) => {
                const isHovered = hoveredCountry.country === c.country;
                const isSelectedCountry = matchedCountry.country === c.country;

                return (
                  <div
                    key={c.country}
                    onMouseEnter={() => {
                      setHoveredCountry(c);
                      setSearchQuery('');
                    }}
                    onClick={() => {
                      setHoveredCountry(c);
                      setSearchQuery('');
                    }}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-all ${
                      isHovered
                        ? 'bg-[#0F2747] text-white font-bold shadow-xs'
                        : isSelectedCountry
                        ? 'bg-amber-100/70 text-[#0F2747] font-bold'
                        : 'text-slate-700 hover:bg-slate-200/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-[11px] font-black">{c.code}</span>
                      <span className="truncate">{c.country}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 text-[10px]">
                      <span className={isHovered ? 'text-amber-300 font-bold' : 'text-slate-500'}>
                        {c.ports.length}
                      </span>
                      <ChevronRight className={`w-3 h-3 ${isHovered ? 'text-amber-300' : 'text-slate-400'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Ports in Selected Country */}
          <div className="flex-1 p-3.5 bg-white min-w-[340px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
                <div className="flex items-center gap-1.5 font-black text-[#0F2747]">
                  <span className="font-mono text-xs font-black text-[#2563EB]">{hoveredCountry.code}</span>
                  <span>Ports in {hoveredCountry.country}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-bold">
                  {displayedPorts.length} Available
                </span>
              </div>

              {/* Special India East / West Coast Switcher Tabs */}
              {hoveredCountry.code === 'IN' && (
                <div className="flex items-center gap-1 p-1 mb-2.5 bg-[#F1F5F9] rounded-lg text-[10.5px] font-bold">
                  {(['All', 'East Coast', 'West Coast'] as const).map((tab) => {
                    const count =
                      tab === 'All'
                        ? hoveredCountry.ports.length
                        : hoveredCountry.ports.filter((p) => p.coast === tab).length;
                    const isActive = selectedCoastTab === tab;
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setSelectedCoastTab(tab)}
                        className={`flex-1 py-1 px-2 rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          isActive
                            ? 'bg-[#0F2747] text-white shadow-xs'
                            : 'text-slate-600 hover:text-[#0F2747] hover:bg-slate-200'
                        }`}
                      >
                        <span>{tab}</span>
                        <span className={`text-[9px] font-mono px-1 rounded ${isActive ? 'bg-amber-400 text-black font-black' : 'text-slate-400'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Port Search Box */}
              <div className="relative mb-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Filter ports in ${hoveredCountry.country}...`}
                  className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-[#FAF9F5] border border-slate-200 text-xs text-[#0F2747] placeholder:text-slate-400 focus:outline-none focus:border-[#D6A63B]"
                />
                <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Ports List */}
              <div className="max-h-68 overflow-y-auto space-y-1.5 pr-1">
                {displayedPorts.map((p) => {
                  const isSelected =
                    matchedPort.name === p.name && matchedCountry.country === hoveredCountry.country;

                  return (
                    <div
                      key={p.name}
                      onClick={() => handleSelectPort(hoveredCountry, p)}
                      className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-[#D6A63B] bg-[#FFFDF7] shadow-xs'
                          : 'border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-bold text-[#0F2747] flex items-center gap-1.5 truncate">
                          <Anchor className="w-3 h-3 text-[#D6A63B] shrink-0" />
                          <span className="truncate">{p.name}</span>
                          {p.coast && (
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-black tracking-wide ${
                                p.coast === 'East Coast'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {p.coast}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 truncate flex items-center gap-2">
                          <span>{p.subLocation}</span>
                          {p.maxDraft && <span>• Max Draft: <strong className="text-[#0F2747]">{p.maxDraft}</strong></span>}
                        </div>
                      </div>
                      <div className="shrink-0">
                        <span className="text-[9.5px] font-semibold text-[#0F2747] bg-[#F1F5F9] border border-slate-200 px-2 py-0.5 rounded whitespace-nowrap">
                          {p.typicalCargo}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// 2. DESTINATION PORT CASCADING FLYOUT PICKER (NOW WITH EAST / WEST SPLIT)
// =========================================================================
interface DestinationPortDropdownProps {
  value: string; // e.g. "IN Paradip (Odisha)" or "Paradip Port (Odisha)"
  onChange: (portName: string, detail: DestinationPortDetail) => void;
  label?: string;
  required?: boolean;
  className?: string;
  dropdownAlign?: 'left' | 'right';
}

export const DestinationPortDropdown: React.FC<DestinationPortDropdownProps> = ({
  value,
  onChange,
  label,
  required,
  className = '',
  dropdownAlign = 'left',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCoastTab, setSelectedCoastTab] = useState<'All' | 'East Coast' | 'West Coast'>('All');

  // Identify current port detail
  const currentDetail = getIndianPortDetail(value);

  // Default hovered country is India
  const indiaCountry = ORIGIN_COUNTRY_CATALOG.find((c) => c.code === 'IN') || ORIGIN_COUNTRY_CATALOG[1];
  const [hoveredCountry, setHoveredCountry] = useState<OriginCountryItem>(indiaCountry);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (detail: DestinationPortDetail) => {
    onChange(detail.name, detail);
    setIsOpen(false);
  };

  // Filter ports for the hovered country
  let displayedPorts: DestinationPortDetail[] = [];
  if (hoveredCountry.code === 'IN') {
    displayedPorts = ALL_INDIAN_PORTS;
    if (selectedCoastTab !== 'All') {
      displayedPorts = displayedPorts.filter((p) => p.region === selectedCoastTab);
    }
  } else {
    // If international destination selected, adapt to DestinationPortDetail
    displayedPorts = hoveredCountry.ports.map((p) => ({
      name: p.name,
      cleanName: p.name,
      state: p.subLocation,
      region: 'East Coast' as const,
      maxDraft: '15.0m',
      maxLoa: '260m',
      berths: 8,
      currentQueue: 3,
      typicalCargo: p.typicalCargo,
    }));
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    displayedPorts = displayedPorts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.cleanName.toLowerCase().includes(q) ||
        p.state.toLowerCase().includes(q) ||
        (p.typicalCargo && p.typicalCargo.toLowerCase().includes(q))
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#475569] mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Trigger Button Matching Image 3 & Image 4 */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full bg-white hover:bg-slate-50 border rounded-lg pl-8 pr-7 py-2 text-xs font-bold text-[#0F2747] flex items-center justify-between text-left transition-all cursor-pointer ${
            isOpen ? 'border-[#D6A63B] ring-2 ring-[#D6A63B]/20 shadow-xs' : 'border-[#CBD5E1]'
          }`}
        >
          <span className="truncate flex items-center gap-1.5">
            <span className="font-mono font-black text-[#0F2747] text-[11px]">IN</span>
            <span className="truncate">
              {currentDetail.cleanName || currentDetail.name} ({currentDetail.state})
            </span>
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isOpen ? 'rotate-180 text-[#D6A63B]' : ''}`} />
        </button>
        <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* Cascading 2-Column Flyout for Discharge Destination with East/West Coast Partition */}
      {isOpen && (
        <div
          className={`absolute ${
            dropdownAlign === 'right' ? 'right-0' : 'left-0'
          } top-full mt-1.5 z-50 flex shadow-2xl rounded-xl border border-[#CBD5E1] bg-white text-xs animate-in fade-in duration-150 min-w-[580px] max-w-[95vw] overflow-hidden`}
        >
          {/* Left Column: Select Discharge Country / Trade Partner */}
          <div className="w-56 border-r border-[#E2E8F0] p-2 space-y-1 bg-[#F8FAFC]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2.5 py-1 border-b border-slate-200 mb-1">
              DISCHARGE REGION / COUNTRY
            </div>
            <div className="max-h-80 overflow-y-auto space-y-0.5 pr-0.5">
              {ORIGIN_COUNTRY_CATALOG.map((c) => {
                const isHovered = hoveredCountry.country === c.country;
                const isIndia = c.code === 'IN';

                return (
                  <div
                    key={c.country}
                    onMouseEnter={() => {
                      setHoveredCountry(c);
                      setSearchQuery('');
                    }}
                    onClick={() => {
                      setHoveredCountry(c);
                      setSearchQuery('');
                    }}
                    className={`flex items-center justify-between px-2.5 py-2 rounded-lg cursor-pointer transition-all ${
                      isHovered
                        ? 'bg-[#0F2747] text-white font-bold shadow-xs'
                        : isIndia
                        ? 'bg-amber-100/70 text-[#0F2747] font-bold'
                        : 'text-slate-700 hover:bg-slate-200/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-[11px] font-black">{c.code}</span>
                      <span className="truncate">{c.country}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 text-[10px]">
                      <span className={isHovered ? 'text-amber-300 font-bold' : 'text-slate-500'}>
                        {c.ports.length}
                      </span>
                      <ChevronRight className={`w-3 h-3 ${isHovered ? 'text-amber-300' : 'text-slate-400'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Ports with East / West Coast Switcher */}
          <div className="flex-1 p-3.5 bg-white min-w-[340px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
                <div className="flex items-center gap-1.5 font-black text-[#0F2747]">
                  <span className="font-mono text-xs font-black text-[#2563EB]">{hoveredCountry.code}</span>
                  <span>Discharge Ports in {hoveredCountry.country}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-bold">
                  {displayedPorts.length} Available
                </span>
              </div>

              {/* Special India East / West Coast Switcher Tabs */}
              {hoveredCountry.code === 'IN' && (
                <div className="flex items-center gap-1 p-1 mb-2.5 bg-[#F1F5F9] rounded-lg text-[10.5px] font-bold">
                  {(['All', 'East Coast', 'West Coast'] as const).map((tab) => {
                    const count =
                      tab === 'All'
                        ? ALL_INDIAN_PORTS.length
                        : ALL_INDIAN_PORTS.filter((p) => p.region === tab).length;
                    const isActive = selectedCoastTab === tab;
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setSelectedCoastTab(tab)}
                        className={`flex-1 py-1 px-2 rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          isActive
                            ? 'bg-[#0F2747] text-white shadow-xs'
                            : 'text-slate-600 hover:text-[#0F2747] hover:bg-slate-200'
                        }`}
                      >
                        <span>{tab}</span>
                        <span className={`text-[9px] font-mono px-1 rounded ${isActive ? 'bg-amber-400 text-black font-black' : 'text-slate-400'}`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Search Box */}
              <div className="relative mb-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search discharge ports in ${hoveredCountry.country}...`}
                  className="w-full pl-7 pr-3 py-1.5 rounded-lg bg-[#FAF9F5] border border-slate-200 text-xs text-[#0F2747] placeholder:text-slate-400 focus:outline-none focus:border-[#D6A63B]"
                />
                <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Ports List */}
              <div className="max-h-68 overflow-y-auto space-y-1.5 pr-1">
                {displayedPorts.map((port) => {
                  const isSelected =
                    currentDetail.name === port.name ||
                    value === port.name ||
                    value.includes(port.cleanName);

                  return (
                    <div
                      key={port.name}
                      onClick={() => handleSelect(port)}
                      className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-[#D6A63B] bg-[#FFFDF7] shadow-xs'
                          : 'border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-bold text-[#0F2747] flex items-center gap-1.5 truncate">
                          <Anchor className="w-3 h-3 text-[#D6A63B] shrink-0" />
                          <span className="truncate">{port.name}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-black tracking-wide ${
                              port.region === 'East Coast'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {port.region}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 truncate flex items-center gap-2">
                          <span>{port.state}</span>
                          <span>• Max Draft: <strong className="text-[#0F2747]">{port.maxDraft}</strong></span>
                          <span>• {port.berths} Berths</span>
                        </div>
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5">
                        {port.typicalCargo && (
                          <span className="text-[9.5px] font-semibold text-[#0F2747] bg-[#F1F5F9] border border-slate-200 px-2 py-0.5 rounded whitespace-nowrap">
                            {port.typicalCargo}
                          </span>
                        )}
                        {isSelected && <Check className="w-4 h-4 text-[#D6A63B] shrink-0 ml-1" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
