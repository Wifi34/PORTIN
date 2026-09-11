import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarCheck, Ship, Anchor, Compass, CloudSun, AlertTriangle,
  ShieldCheck, CheckCircle2, XCircle, ArrowRight, RefreshCw,
  Sparkles, TrendingUp, Clock, FileText, Download, Check,
  MapPin, DollarSign, Filter, Search, Info, Award, ChevronRight,
  ChevronDown, Layers, CheckCircle, ShieldAlert, X
} from 'lucide-react';
import { getCountryFlag, getPortFlag } from '../utils/countryFlags';
import { OriginPortFlyout, DestinationPortDropdown } from '../components/common/PortSelectors';
import { identifyCargoIntelligence, CargoIntelligence } from '../utils/cargoIntelligence';

interface PreBookingScanResult {
  overallScore: number;
  verdict: 'OPTIMAL FOR BOOKING' | 'CONDITIONAL CLEARANCE' | 'HIGH RISK WARNING';
  advisorySummary: string;
  weatherScan: {
    score: number;
    status: string;
    waveHeight: string;
    windSpeed: string;
    cycloneRisk: string;
    optimalDeparture: string;
    transitDays: number;
    details: string;
  };
  congestionScan: {
    score: number;
    status: string;
    destinationPort: string;
    queueVessels: number;
    expectedIdleDays: number;
    berthClearance: string;
    demurrageExposure: string;
    details: string;
  };
  vesselScan: {
    score: number;
    status: string;
    vesselName: string;
    vesselClass: string;
    loadedDraft: string;
    maxPermissibleDraft: string;
    draftMargin: string;
    berthCompatibility: string;
    handlingRate: string;
  };
  planScan: {
    score: number;
    status: string;
    strategyName: string;
    strikeRate: number;
    spotBenchmark: number;
    estimatedSavingsUsd: number;
    savingsPct: number;
    confidenceLevel: string;
  };
}

interface CharterBookingFixture {
  id: string;
  bookingRef: string;
  vesselName: string;
  vesselClass: string;
  route: string;
  originPort: string;
  destPort: string;
  cargoType: string;
  tonnage: number;
  contractRate: number;
  spotRateAtBooking: number;
  savingsUsd: number;
  status: 'In Transit - Bay of Bengal' | 'At Loading Port' | 'Approaching Anchorage' | 'Discharging' | 'Scheduled Departure';
  statusProgress: number;
  laycanWindow: string;
  eta: string;
  preBookingScore: number;
  demurrageRisk: 'LOW RISK' | 'MEDIUM RISK' | 'HIGH RISK';
  bookedAt: string;
  strategyPlan: string;
}

const ORIGIN_PORT_OPTIONS = [
  { country: 'Australia', flag: '🇦🇺', port: 'Hay Point', cargo: 'Prime Hard Coking Coal' },
  { country: 'Australia', flag: '🇦🇺', port: 'Gladstone', cargo: 'Coking Coal & Alumina' },
  { country: 'Australia', flag: '🇦🇺', port: 'Newcastle', cargo: 'Thermal & Met Coal' },
  { country: 'Australia', flag: '🇦🇺', port: 'Port Hedland', cargo: 'Iron Ore Lump & Fines' },
  { country: 'India', flag: '🇮🇳', port: 'Paradip', cargo: 'Coastal Thermal & Met Coal' },
  { country: 'India', flag: '🇮🇳', port: 'Visakhapatnam', cargo: 'Iron Ore & Met Coal' },
  { country: 'India', flag: '🇮🇳', port: 'Dhamra', cargo: 'Deepwater Pellets & Coal' },
  { country: 'India', flag: '🇮🇳', port: 'Jaigarh', cargo: 'Coastal Steam Coal' },
  { country: 'India', flag: '🇮🇳', port: 'Mundra', cargo: 'Industrial Minerals & Bulk' },
  { country: 'Indonesia', flag: '🇮🇩', port: 'Taboneo', cargo: 'Thermal Sub-Bituminous Coal' },
  { country: 'Indonesia', flag: '🇮🇩', port: 'Balikpapan', cargo: 'Steam Coal & Minerals' },
  { country: 'Indonesia', flag: '🇮🇩', port: 'Bunati', cargo: 'Steam Coal' },
  { country: 'Mozambique', flag: '🇲🇿', port: 'Maputo', cargo: 'Thermal & Coking Coal' },
  { country: 'South Africa', flag: '🇿🇦', port: 'Richards Bay', cargo: 'RBCT Steam Coal' },
  { country: 'Russia', flag: '🇷🇺', port: 'Vostochny', cargo: 'PCI Coal & Anthracite' },
  { country: 'United States', flag: '🇺🇸', port: 'Baltimore', cargo: 'Met Coal & Agri Bulk' },
  { country: 'United States', flag: '🇺🇸', port: 'Hampton Roads', cargo: 'Met Coal & Steam Coal' },
  { country: 'United States', flag: '🇺🇸', port: 'New Orleans', cargo: 'Petcoke & Minerals' },
];

const DESTINATION_PORT_OPTIONS = [
  { name: 'Paradip Port (Odisha)', maxDraft: '14.5m', maxLoa: '260m', berths: 16, currentQueue: 8, region: 'East Coast' as const },
  { name: 'Dhamra Port (Odisha)', maxDraft: '17.5m', maxLoa: '300m', berths: 5, currentQueue: 4, region: 'East Coast' as const },
  { name: 'Visakhapatnam (Andhra Pradesh)', maxDraft: '16.5m', maxLoa: '280m', berths: 24, currentQueue: 6, region: 'East Coast' as const },
  { name: 'Gangavaram (Andhra Pradesh)', maxDraft: '18.5m', maxLoa: '310m', berths: 8, currentQueue: 3, region: 'East Coast' as const },
  { name: 'Mundra Port (Gujarat)', maxDraft: '17.5m', maxLoa: '300m', berths: 12, currentQueue: 7, region: 'West Coast' as const },
  { name: 'Hazira Port (Gujarat)', maxDraft: '13.5m', maxLoa: '240m', berths: 6, currentQueue: 4, region: 'West Coast' as const },
  { name: 'Kamarajar / Ennore (Tamil Nadu)', maxDraft: '15.0m', maxLoa: '260m', berths: 9, currentQueue: 4, region: 'East Coast' as const },
  { name: 'Haldia Dock Complex (West Bengal)', maxDraft: '12.5m', maxLoa: '210m', berths: 12, currentQueue: 11, region: 'East Coast' as const },
];

export const BookingPage: React.FC = () => {
  const navigate = useNavigate();

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'new_booking' | 'active_fixtures' | 'booking_history'>('new_booking');

  // Booking Form Parameters
  const [cargoType, setCargoType] = useState('Coal - Coking');
  const [customCargoName, setCustomCargoName] = useState('');
  const effectiveCargoName = cargoType === 'Other Bulk Cargo' && customCargoName.trim() ? customCargoName.trim() : cargoType;
  const cargoInfo: CargoIntelligence = identifyCargoIntelligence(effectiveCargoName);
  const [cargoMt, setCargoMt] = useState<number>(70000);
  const [selectedOrigin, setSelectedOrigin] = useState(ORIGIN_PORT_OPTIONS[0]);
  const [selectedDestination, setSelectedDestination] = useState(DESTINATION_PORT_OPTIONS[0]);
  const [vesselClass, setVesselClass] = useState('Panamax');
  const [strategyPlan, setStrategyPlan] = useState<'Plan A' | 'Plan B' | 'Plan C'>('Plan A');
  const [laycanDate, setLaycanDate] = useState('2026-09-25');
  const [targetRate, setTargetRate] = useState<number>(15.40);

  // Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState<PreBookingScanResult | null>(null);

  // Execution & Fixture States
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionModalOpen, setExecutionModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active Fixtures List
  const [fixtures, setFixtures] = useState<CharterBookingFixture[]>([
    {
      id: 'fix-1',
      bookingRef: 'BK-2026-0901',
      vesselName: 'MV Odisha Pioneer',
      vesselClass: 'Panamax',
      route: 'Hay Point → Paradip Port',
      originPort: 'Hay Point',
      destPort: 'Paradip Port (Odisha)',
      cargoType: 'Coal - Coking',
      tonnage: 70000,
      contractRate: 15.40,
      spotRateAtBooking: 17.80,
      savingsUsd: 168000,
      status: 'In Transit - Bay of Bengal',
      statusProgress: 68,
      laycanWindow: 'Sep 20–25, 2026',
      eta: 'Oct 08, 2026',
      preBookingScore: 96,
      demurrageRisk: 'LOW RISK',
      bookedAt: '01 Sep 2026',
      strategyPlan: 'Plan A: Multi-Voyage Strategic Framework',
    },
    {
      id: 'fix-2',
      bookingRef: 'BK-2026-0888',
      vesselName: 'MV Dhamra Express',
      vesselClass: 'Capesize',
      route: 'Hay Point → Dhamra Port',
      originPort: 'Hay Point',
      destPort: 'Dhamra Port (Odisha)',
      cargoType: 'Coal - Thermal',
      tonnage: 160000,
      contractRate: 13.90,
      spotRateAtBooking: 15.60,
      savingsUsd: 272000,
      status: 'At Loading Port',
      statusProgress: 22,
      laycanWindow: 'Sep 28–Oct 04, 2026',
      eta: 'Oct 19, 2026',
      preBookingScore: 94,
      demurrageRisk: 'LOW RISK',
      bookedAt: '03 Sep 2026',
      strategyPlan: 'Plan A: Multi-Voyage Strategic Framework',
    },
    {
      id: 'fix-3',
      bookingRef: 'BK-2026-0872',
      vesselName: 'MV Bengal Trader',
      vesselClass: 'Supramax',
      route: 'Taboneo → Haldia Dock Complex',
      originPort: 'Taboneo',
      destPort: 'Haldia Dock Complex (West Bengal)',
      cargoType: 'Coal - Thermal',
      tonnage: 52000,
      contractRate: 11.80,
      spotRateAtBooking: 12.60,
      savingsUsd: 41600,
      status: 'Approaching Anchorage',
      statusProgress: 89,
      laycanWindow: 'Sep 05–10, 2026',
      eta: 'Sep 12, 2026',
      preBookingScore: 88,
      demurrageRisk: 'MEDIUM RISK',
      bookedAt: '28 Aug 2026',
      strategyPlan: 'Plan B: Prompt Spot Guaranteed Berth',
    },
  ]);

  const historyFixtures: CharterBookingFixture[] = [
    {
      id: 'hist-1',
      bookingRef: 'BK-2026-0810',
      vesselName: 'MV Kalinga Glory',
      vesselClass: 'Panamax',
      route: 'Gladstone → Paradip Port',
      originPort: 'Gladstone',
      destPort: 'Paradip Port (Odisha)',
      cargoType: 'Coal - Coking',
      tonnage: 75000,
      contractRate: 14.80,
      spotRateAtBooking: 16.90,
      savingsUsd: 157500,
      status: 'Discharging',
      statusProgress: 100,
      laycanWindow: 'Aug 10–15, 2026',
      eta: 'Aug 28, 2026 (Completed)',
      preBookingScore: 97,
      demurrageRisk: 'LOW RISK',
      bookedAt: '05 Aug 2026',
      strategyPlan: 'Plan A: Multi-Voyage Strategic Framework',
    },
    {
      id: 'hist-2',
      bookingRef: 'BK-2026-0765',
      vesselName: 'MV Samarinda Star',
      vesselClass: 'Supramax',
      route: 'Taboneo → Visakhapatnam',
      originPort: 'Taboneo',
      destPort: 'Visakhapatnam (Andhra Pradesh)',
      cargoType: 'Coal - Thermal',
      tonnage: 55000,
      contractRate: 10.90,
      spotRateAtBooking: 12.10,
      savingsUsd: 66000,
      status: 'Discharging',
      statusProgress: 100,
      laycanWindow: 'Jul 20–25, 2026',
      eta: 'Aug 04, 2026 (Completed)',
      preBookingScore: 93,
      demurrageRisk: 'LOW RISK',
      bookedAt: '12 Jul 2026',
      strategyPlan: 'Plan B: Spot Fixed Rate',
    },
  ];

  // Dynamic Rate Calculation based on strategy, corridor & commodity physical characteristics
  useEffect(() => {
    let base = 15.0;
    const isDomestic = selectedOrigin.country === 'India';
    const isDestWest = selectedDestination.region === 'West Coast' ||
      ['Mundra', 'Kandla', 'Dahej', 'Hazira', 'Pipavav', 'Jaigarh', 'JNPT', 'Mumbai', 'Mormugao', 'Mangalore', 'Cochin']
        .some(p => selectedDestination.name.toLowerCase().includes(p.toLowerCase()));

    if (isDomestic) {
      // Domestic Coastal Shipping (MoPSW Cabotage Guidelines)
      const isOriginWest = ['Mundra', 'Kandla', 'Dahej', 'Hazira', 'Pipavav', 'Jaigarh', 'JNPT', 'Mumbai', 'Mormugao', 'Mangalore', 'Cochin']
        .some(p => selectedOrigin.port.toLowerCase().includes(p.toLowerCase()));

      if (isOriginWest !== isDestWest) {
        base = 8.20; // Inter-coastal East-to-West / West-to-East (e.g. Paradip -> Hazira)
      } else {
        base = 5.20; // Intra-coastal same coast (e.g. Paradip -> Chennai)
      }
    } else {
      if (selectedOrigin.country === 'Australia') base = 15.4;
      else if (selectedOrigin.country === 'Indonesia') base = 11.8;
      else if (selectedOrigin.country === 'United States') base = 32.5;
      else if (selectedOrigin.country === 'Mozambique') base = 16.2;
      else if (selectedOrigin.country === 'South Africa') base = 14.9;
      else if (selectedOrigin.country === 'Russia') base = 28.5;

      // West Coast India differential for deep-sea routes
      if (isDestWest) {
        if (['Australia', 'Indonesia'].includes(selectedOrigin.country)) {
          base += 1.40; // Additional ~850 NM steaming around Sri Lanka
        } else if (['South Africa', 'Mozambique', 'United States', 'Russia'].includes(selectedOrigin.country)) {
          base -= 1.20; // Proximity bunker savings
        }
      }
    }

    // Apply cargo-specific market rate spread
    base += cargoInfo.marketRateSpreadUsd;

    if (vesselClass === 'Capesize') base *= (isDomestic ? 0.90 : 0.88);
    if (vesselClass === 'Supramax') base *= (isDomestic ? 1.00 : 1.08);
    if (vesselClass === 'Handysize') base *= (isDomestic ? 1.06 : 1.15);

    if (strategyPlan === 'Plan A') base *= 0.94; // Multi-voyage discount
    if (strategyPlan === 'Plan C') base *= 0.90; // Long term COA

    setTargetRate(Number(base.toFixed(2)));
  }, [selectedOrigin, selectedDestination, vesselClass, strategyPlan, effectiveCargoName, cargoInfo.marketRateSpreadUsd]);

  // Execute Real-Time Multi-Dimensional Scan with Commodity Physics
  const handleRunScan = () => {
    setIsScanning(true);
    setScanProgress(5);
    setScanStepIndex(0);

    const steps = [
      'Scanning Satellite Weather & Oceanic Swell along Voyage Corridor...',
      'Checking Destination Port Queue, Berth Turnaround & Demurrage Risk...',
      'Validating Vessel Draft Clearance & Terminal Loading Capabilities...',
      'Verifying Econometric Alpha & Comparison Plan Feasibility...',
    ];

    let current = 0;
    const interval = setInterval(() => {
      current++;
      setScanStepIndex(current);
      setScanProgress((prev) => Math.min(prev + 24, 98));

      if (current >= steps.length) {
        clearInterval(interval);
        setTimeout(() => {
          setScanProgress(100);
          setIsScanning(false);

          // Compute dynamic scan result incorporating cargo physics
          const spotRate = Number((targetRate * 1.14).toFixed(2));
          const diff = Number((spotRate - targetRate).toFixed(2));
          const savings = Math.round(cargoMt * diff);

          // Calculate loaded draft based on vessel class & cargo density
          const calculatedDraftM = (
            vesselClass === 'Capesize' ? 17.2 :
            vesselClass === 'Panamax' ? 13.6 :
            vesselClass === 'Supramax' ? 11.8 : 10.2
          );
          const maxPermissibleDraftM = parseFloat(selectedDestination.maxDraft.replace('m', '')) || 14.5;
          const draftMarginM = (maxPermissibleDraftM - calculatedDraftM).toFixed(1);
          const isDraftOk = Number(draftMarginM) >= 0.2;

          const isDomestic = selectedOrigin.country === 'India';

          const result: PreBookingScanResult = {
            overallScore: isDraftOk ? (cargoInfo.imsbcGroup === 'Group A' ? 94 : 96) : 78,
            verdict: isDraftOk ? 'OPTIMAL FOR BOOKING' : 'CONDITIONAL CLEARANCE',
            advisorySummary: isDomestic
              ? `Operational clearance verified for ${cargoInfo.materialName} (${cargoInfo.category}, SF: ${cargoInfo.stowageFactorM3PerMt} m³/MT). Domestic coastal transit captures an estimated 58% logistics cost advantage against Indian Railways rakes (approx ₹2,200/MT rail vs $${targetRate.toFixed(2)}/MT coastal). ${isDraftOk ? `Safe draft margin of +${draftMarginM}m confirmed at ${selectedDestination.name}.` : `Caution: Restricted draft under ${selectedDestination.maxDraft} limit.`} Net projected savings of $${savings.toLocaleString()} secured.`
              : `Operational clearance verified for ${cargoInfo.materialName} (${cargoInfo.category}, SF: ${cargoInfo.stowageFactorM3PerMt} m³/MT, IMSBC ${cargoInfo.imsbcGroup}). ${isDraftOk ? `Safe draft margin of +${draftMarginM}m confirmed at ${selectedDestination.name}.` : `Caution: Restricted draft clearance under ${selectedDestination.maxDraft} limit.`} Net projected savings of $${savings.toLocaleString()} secured against standard spot charter rates.`,
            weatherScan: {
              score: 95,
              status: 'WEATHER ROUTE CLEAR',
              waveHeight: isDomestic ? '1.1 – 1.6 m' : '1.6 – 2.1 m',
              windSpeed: '14 – 18 kts',
              cycloneRisk: 'Zero Tropical Depression in Bay of Bengal / Arabian Sea',
              optimalDeparture: laycanDate,
              transitDays: isDomestic ? 3.5 : (selectedOrigin.country === 'Indonesia' ? 7.5 : 14.5),
              details: isDomestic
                ? `Smooth coastal passage verified along Indian coastline. Hold preparation: ${cargoInfo.holdPreparation}.`
                : `Smooth oceanic passage verified along primary transit lanes. Hold condition: ${cargoInfo.holdPreparation}.`,
            },
            congestionScan: {
              score: 93,
              status: 'LOW CONGESTION WINDOW',
              destinationPort: selectedDestination.name,
              queueVessels: selectedDestination.currentQueue,
              expectedIdleDays: 2.1,
              berthClearance: 'Berth Slot CQ-2 Pre-Approved',
              demurrageExposure: 'Very Low ($0 expected demurrage loss)',
              details: `Expected vessel queue at ${selectedDestination.name} is manageable. Discharge speed rated for ${cargoInfo.targetLoadingRateTph} using ${cargoInfo.handlingEquipment}.`,
            },
            vesselScan: {
              score: isDraftOk ? 98 : 80,
              status: isDraftOk ? '100% BERTH & DRAFT CLEAR' : 'DRAFT MARGIN RESTRICTED',
              vesselName: `MV ${selectedOrigin.port} Voyager`,
              vesselClass: vesselClass,
              loadedDraft: `${calculatedDraftM} m`,
              maxPermissibleDraft: selectedDestination.maxDraft,
              draftMargin: `${Number(draftMarginM) >= 0 ? '+' : ''}${draftMarginM} m margin under ${selectedDestination.maxDraft} limit`,
              berthCompatibility: `Compatible with ${cargoInfo.handlingEquipment}`,
              handlingRate: cargoInfo.targetLoadingRateTph,
            },
            planScan: {
              score: 97,
              status: 'MAXIMUM STRATEGIC ALPHA',
              strategyName: `${strategyPlan} Framework Agreement`,
              strikeRate: targetRate,
              spotBenchmark: spotRate,
              estimatedSavingsUsd: savings,
              savingsPct: 13.8,
              confidenceLevel: '95% Machine-Verified Econometric Confidence',
            },
          };

          setScanResult(result);
        }, 350);
      }
    }, 450);
  };

  // Confirm and Execute Booking Fixture
  const handleConfirmBooking = () => {
    if (!scanResult) return;
    setIsExecuting(true);

    setTimeout(() => {
      const newFixture: CharterBookingFixture = {
        id: `fix-${Date.now()}`,
        bookingRef: `BK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        vesselName: scanResult.vesselScan.vesselName,
        vesselClass: vesselClass,
        route: `${selectedOrigin.port} → ${selectedDestination.name.split(' (')[0]}`,
        originPort: selectedOrigin.port,
        destPort: selectedDestination.name,
        cargoType: effectiveCargoName,
        tonnage: cargoMt,
        contractRate: targetRate,
        spotRateAtBooking: scanResult.planScan.spotBenchmark,
        savingsUsd: scanResult.planScan.estimatedSavingsUsd,
        status: 'Scheduled Departure',
        statusProgress: 5,
        laycanWindow: `${laycanDate} (Firm Laycan)`,
        eta: new Date(new Date(laycanDate).getTime() + (scanResult.weatherScan.transitDays * 86400000)).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        preBookingScore: scanResult.overallScore,
        demurrageRisk: 'LOW RISK',
        bookedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        strategyPlan: `${strategyPlan} Strategic Charter Booking`,
      };

      setFixtures([newFixture, ...fixtures]);
      setIsExecuting(false);
      setExecutionModalOpen(false);
      setToastMessage(`Booking ${newFixture.bookingRef} successfully executed and confirmed with 96% clearance score!`);
      setActiveTab('active_fixtures');

      setTimeout(() => setToastMessage(null), 4500);
    }, 600);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0F2747] text-white px-5 py-3 rounded-xl shadow-2xl border-2 border-[#D6A63B] flex items-center gap-3 text-xs animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-[#D6A63B]" />
          <div>
            <div className="font-black text-white">Charter Booking Executed</div>
            <div className="text-slate-300 text-[11px]">{toastMessage}</div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TOP HEADER & METRIC SUMMARY CARDS */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#D6A63B]">
              SMART CHARTERING CONSOLE
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
              <Sparkles className="w-3 h-3 text-[#059669]" />
              <span>Multi-Dimensional Scan Engine Active</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F2747] tracking-tight">
            Vessel Charter Booking &amp; Pre-Flight Clearance
          </h1>
          <p className="text-xs sm:text-sm text-[#68717D] mt-0.5 font-medium">
            Scan and clear all voyage variables before fixture lock: Weather conditions, Ship Congestion, Vessel Compatibility, and Strategy Plan.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#E2E8F0] shadow-xs shrink-0 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('new_booking')}
            className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'new_booking'
                ? 'bg-[#0F2747] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0F2747] hover:bg-slate-50'
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>New Booking &amp; Pre-Scan</span>
          </button>

          <button
            onClick={() => setActiveTab('active_fixtures')}
            className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'active_fixtures'
                ? 'bg-[#0F2747] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0F2747] hover:bg-slate-50'
            }`}
          >
            <Ship className="w-3.5 h-3.5" />
            <span>Active Fixtures ({fixtures.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('booking_history')}
            className={`px-3.5 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'booking_history'
                ? 'bg-[#0F2747] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0F2747] hover:bg-slate-50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Booking History</span>
          </button>
        </div>
      </div>

      {/* Top 4 Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-[14px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-[#68717D]">Active Fixtures</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1E65B8] flex items-center justify-center">
              <Ship className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-[#0F2747] mt-1 font-mono">
            {fixtures.length} Vessels
          </div>
          <div className="text-[11px] text-[#2F7D4B] font-semibold mt-0.5">
            282,000 MT in Transit
          </div>
        </div>

        <div className="p-4 rounded-[14px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-[#68717D]">Average Pre-Scan Score</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-[#0F2747] mt-1 font-mono">
            95.4 / 100
          </div>
          <div className="text-[11px] text-[#059669] font-semibold mt-0.5">
            100% Pre-Flight Cleared
          </div>
        </div>

        <div className="p-4 rounded-[14px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-[#68717D]">Demurrage Avoidance</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-[#0F2747] mt-1 font-mono">
            $481,600
          </div>
          <div className="text-[11px] text-[#68717D] font-semibold mt-0.5">
            Zero Demurrage Penalties
          </div>
        </div>

        <div className="p-4 rounded-[14px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-[#68717D]">Total Financial Alpha</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-[#2F7D4B] mt-1 font-mono">
            +$705,100
          </div>
          <div className="text-[11px] text-[#2F7D4B] font-semibold mt-0.5">
            11.4% Saved vs Spot Benchmark
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: NEW BOOKING & MULTI-DIMENSIONAL SCANNER (THE REQUESTED FEATURE) */}
      {/* ========================================================================= */}
      {activeTab === 'new_booking' && (
        <div className="space-y-6">
          {/* Main Booking Configuration Drawer & Interactive Scanner Bar */}
          <div className="bg-white rounded-[16px] border border-[#E4E2DC] shadow-sm p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E2DC]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#FAF9F5] border border-[#E4E2DC] text-[#0F2747]">
                  <CalendarCheck className="w-5 h-5 text-[#D6A63B]" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-[#0F2747] tracking-tight">
                    Step 1: Voyage Configuration &amp; Strategic Parameters
                  </h2>
                  <p className="text-xs text-[#68717D] mt-0.5 font-medium">
                    Enter trade corridor, vessel specification, and desired laycan. All variables will be multi-scanned simultaneously.
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[#68717D]">
                <span>Scan Standard:</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-[#0F2747] font-mono text-[11px] font-bold">
                  MIL-STD Maritime Alpha v4.2
                </span>
              </div>
            </div>

            {/* Form Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5 text-xs">
              {/* 1. Cargo Type */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#68717D] mb-1">
                  Cargo Material <span className="text-red-500">*</span>
                </label>
                <select
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#E4E2DC] rounded-lg px-2.5 py-2 font-bold text-[#0F2747] focus:outline-none focus:border-[#D6A63B] cursor-pointer"
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

              {/* 2. Parcel Size */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#68717D] mb-1">
                  Parcel Size (MT)
                </label>
                <input
                  type="number"
                  step="5000"
                  value={cargoMt}
                  onChange={(e) => setCargoMt(Number(e.target.value))}
                  className="w-full bg-[#FAF9F5] border border-[#E4E2DC] rounded-lg px-2.5 py-2 font-black font-mono text-[#0F2747] focus:outline-none focus:border-[#D6A63B]"
                />
              </div>

              {/* 3. Origin Loading Hub (Cascading Flyout - Image 4) */}
              <OriginPortFlyout
                label="Origin Loading Port"
                value={selectedOrigin.port}
                onChange={(portName, countryName, _fullDisplay, cargo) => {
                  setSelectedOrigin({
                    country: countryName,
                    flag: countryName === 'Australia' ? '🇦🇺' : countryName === 'Indonesia' ? '🇮🇩' : countryName === 'United States' ? '🇺🇸' : countryName === 'Mozambique' ? '🇲🇿' : countryName === 'South Africa' ? '🇿🇦' : countryName === 'Russia' ? '🇷🇺' : countryName === 'India' ? '🇮🇳' : '🌐',
                    port: portName,
                    cargo: cargo || (countryName === 'India' ? 'Coastal Bulk Cargo' : 'Bulk Cargo'),
                  });
                }}
              />

              {/* 4. Destination Discharge Port (Categorized Dropdown - Image 3) */}
              <DestinationPortDropdown
                label="Discharge Port (India - East & West Coast)"
                value={selectedDestination.name}
                onChange={(portName, detail) => {
                  setSelectedDestination({
                    name: portName,
                    maxDraft: detail.maxDraft,
                    maxLoa: detail.maxLoa,
                    berths: detail.berths,
                    currentQueue: detail.currentQueue,
                    region: detail.region,
                  });
                }}
              />

              {/* 5. Laycan Target Date */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#68717D] mb-1">
                  Target Laycan Date
                </label>
                <input
                  type="date"
                  value={laycanDate}
                  onChange={(e) => setLaycanDate(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#E4E2DC] rounded-lg px-2.5 py-2 font-semibold text-[#0F2747] focus:outline-none focus:border-[#D6A63B]"
                />
              </div>

              {/* 6. Strategy Plan & Vessel Class */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#68717D] mb-1">
                  Plan &amp; Vessel Class
                </label>
                <select
                  value={strategyPlan}
                  onChange={(e) => setStrategyPlan(e.target.value as any)}
                  className="w-full bg-[#FAF9F5] border border-[#E4E2DC] rounded-lg px-2 py-2 font-bold text-[#0F2747] focus:outline-none focus:border-[#D6A63B] cursor-pointer"
                >
                  <option value="Plan A">Plan A (Multi-Voyage Volume)</option>
                  <option value="Plan B">Plan B (Spot Guaranteed Berth)</option>
                  <option value="Plan C">Plan C (Strategic Long-Term COA)</option>
                </select>
              </div>
            </div>

            {/* Custom Cargo Specification Box when 'Other Bulk Cargo' is selected */}
            {cargoType === 'Other Bulk Cargo' && (
              <div className="p-3.5 rounded-xl bg-white border border-[#D6A63B] shadow-xs space-y-1.5 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#D6A63B]" />
                  <span className="text-[10.5px] font-black uppercase tracking-wider text-[#0F2747]">
                    SPECIFY CUSTOM CARGO NAME <span className="text-red-500">*</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider bg-[#0B1F38] text-white">
                    Custom Commodity
                  </span>
                </div>
                <p className="text-[10.5px] text-[#64748B] font-medium">
                  Enter the exact industrial bulk material classification:
                </p>
                <input
                  type="text"
                  value={customCargoName}
                  onChange={(e) => setCustomCargoName(e.target.value)}
                  placeholder="e.g. Copper Concentrate, Manganese Ore, Petcoke, Nickel Ore, DRI Pellets"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-[#D6A63B] text-xs font-semibold text-[#0F2747] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#D6A63B]"
                />
              </div>
            )}

            {/* Live AI Cargo Material Intelligence Panel */}
            <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E4E2DC] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
              <div className="flex items-start sm:items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0F2747] text-[#D6A63B] flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-[#0F2747] tracking-tight">
                      AI Material Analysis: {cargoInfo.materialName}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-[#EBF3FF] text-[#1E65B8] border border-[#BFDBFE]">
                      {cargoInfo.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold border ${
                      cargoInfo.imsbcGroup === 'Group A' 
                        ? 'bg-rose-50 text-rose-700 border-rose-200' 
                        : cargoInfo.imsbcGroup === 'Group B' 
                          ? 'bg-amber-50 text-amber-700 border-amber-200' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      IMSBC {cargoInfo.imsbcGroup}
                    </span>
                  </div>
                  <p className="text-[10.5px] text-[#68717D] mt-0.5">
                    {cargoInfo.hazardWarning}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                <div className="text-right">
                  <div className="text-[9.5px] font-bold uppercase text-[#68717D]">Stowage Factor</div>
                  <div className="text-xs font-black font-mono text-[#0F2747]">
                    {cargoInfo.stowageFactorM3PerMt} m³/MT
                  </div>
                </div>
                <div className="h-6 w-px bg-[#E4E2DC]" />
                <div className="text-right">
                  <div className="text-[9.5px] font-bold uppercase text-[#68717D]">Handling Rate</div>
                  <div className="text-xs font-black font-mono text-[#2F7D4B]">
                    {cargoInfo.targetLoadingRateTph}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar: Strike Rate & Trigger Pre-Booking Scan Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-[#E4E2DC]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]">
                  <div className="text-[10px] uppercase font-bold text-amber-800">Target Strike Freight Rate</div>
                  <div className="text-xl font-black font-mono text-[#0F2747] mt-0.5">
                    ${targetRate.toFixed(2)}{' '}
                    <span className="text-xs font-semibold text-[#68717D]">/ MT</span>
                  </div>
                </div>

                <div className="hidden md:block text-xs text-[#68717D] leading-tight">
                  <div className="font-bold text-[#0F2747]">
                    Corridor: {selectedOrigin.flag} {selectedOrigin.port} &rarr; 🇮🇳 {selectedDestination.name.split(' (')[0]}
                  </div>
                  <div className="text-[11px] mt-0.5">
                    Recommended Vessel: <strong className="text-[#0F2747]">{vesselClass}</strong> &bull; Strategy: <strong className="text-[#0F2747]">{strategyPlan}</strong>
                  </div>
                </div>
              </div>

              {/* The Scan Trigger Button */}
              <button
                type="button"
                onClick={handleRunScan}
                disabled={isScanning}
                className="px-6 py-3.5 rounded-xl bg-[#D6A63B] hover:bg-[#C4952D] text-[#0F2747] font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-75 shrink-0"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#0F2747]" />
                    <span>EXECUTING PRE-BOOKING MULTI-SCAN... ({scanProgress}%)</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#0F2747]" />
                    <span>RUN PRE-BOOKING INTELLIGENCE SCAN &rarr;</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* SCANNER TELEMETRY ANIMATION RADAR (WHEN SCANNING) */}
          {isScanning && (
            <div className="p-6 rounded-[16px] bg-[#0A192F] text-white border border-[#1E3A8A] shadow-xl space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-500/20 border border-blue-400/40 flex items-center justify-center animate-pulse">
                    <Compass className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black tracking-wider uppercase text-cyan-300">
                      Scanning Voyage Variables for Booking Clearance
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Cross-referencing Satellite Weather, Ship Congestion, Vessel Feasibility &amp; Econometric Strategy...
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xl font-black text-amber-400">{scanProgress}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-amber-400 to-emerald-400 transition-all duration-300 rounded-full"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs pt-1">
                <div className={`p-3 rounded-lg border ${scanStepIndex >= 1 ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300' : 'border-slate-800 bg-slate-900/50 text-slate-500'}`}>
                  <div className="font-bold flex items-center gap-1.5">
                    {scanStepIndex >= 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>1. Weather Route Scan</span>
                  </div>
                  <div className="text-[10px] mt-1 text-slate-400">Bay of Bengal &amp; oceanic storm check</div>
                </div>

                <div className={`p-3 rounded-lg border ${scanStepIndex >= 2 ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300' : 'border-slate-800 bg-slate-900/50 text-slate-500'}`}>
                  <div className="font-bold flex items-center gap-1.5">
                    {scanStepIndex >= 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>2. Ship Congestion Scan</span>
                  </div>
                  <div className="text-[10px] mt-1 text-slate-400">Paradip queue &amp; demurrage risk</div>
                </div>

                <div className={`p-3 rounded-lg border ${scanStepIndex >= 3 ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300' : 'border-slate-800 bg-slate-900/50 text-slate-500'}`}>
                  <div className="font-bold flex items-center gap-1.5">
                    {scanStepIndex >= 3 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>3. Vessel &amp; Berth Scan</span>
                  </div>
                  <div className="text-[10px] mt-1 text-slate-400">Draft limit, LOA &amp; TPH compatibility</div>
                </div>

                <div className={`p-3 rounded-lg border ${scanStepIndex >= 4 ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300' : 'border-slate-800 bg-slate-900/50 text-slate-500'}`}>
                  <div className="font-bold flex items-center gap-1.5">
                    {scanStepIndex >= 4 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    <span>4. Strategy Plan Scan</span>
                  </div>
                  <div className="text-[10px] mt-1 text-slate-400">Net savings &amp; strike rate alpha</div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SCAN RESULTS VERDICT: 4-DIMENSION CARDS + CLEARANCE SCORE (SHOWN POST-SCAN) */}
          {/* ========================================================================= */}
          {scanResult && !isScanning && (
            <div className="space-y-5 animate-in fade-in slide-in-from-top-3 duration-300">
              {/* TOP BANNER: OVERALL PRE-FLIGHT CLEARANCE VERDICT */}
              <div className="p-5 sm:p-6 rounded-[16px] bg-white border-2 border-[#2F7D4B] shadow-md flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] flex items-center justify-center shrink-0 shadow-xs">
                    <ShieldCheck className="w-8 h-8 text-[#059669]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                        {scanResult.verdict}
                      </span>
                      <span className="text-xs font-bold text-[#68717D]">
                        Clearance Ref: SCAN-2026-CLR96
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-[#0F2747] mt-1">
                      Pre-Booking Feasibility Score: <span className="text-[#2F7D4B] font-mono">{scanResult.overallScore} / 100</span>
                    </h3>
                    <p className="text-xs text-[#68717D] font-medium mt-1 max-w-3xl leading-relaxed">
                      {scanResult.advisorySummary}
                    </p>
                  </div>
                </div>

                {/* Final Execution Button */}
                <button
                  type="button"
                  onClick={() => setExecutionModalOpen(true)}
                  className="px-6 py-4 rounded-xl bg-[#0F2747] hover:bg-[#1A3B66] text-white font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer shrink-0 self-start md:self-center"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#D6A63B]" />
                  <span>CONFIRM &amp; EXECUTE BOOKING FIXTURE</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* 4 CARDS GRID: 4 INDIVIDUAL SCAN DIMENSIONS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. WEATHER DIMENSION */}
                <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#E4E2DC] shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E4E2DC]">
                    <div className="flex items-center gap-2 text-xs font-black text-[#0F2747]">
                      <CloudSun className="w-4 h-4 text-[#D6A63B]" />
                      <span>1. WEATHER ROUTING</span>
                    </div>
                    <span className="text-xs font-black font-mono text-[#2F7D4B]">
                      {scanResult.weatherScan.score}/100
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#68717D]">Route Status:</span>
                      <strong className="text-[#2F7D4B] font-bold">{scanResult.weatherScan.status}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#68717D]">Wave Swell:</span>
                      <strong className="font-mono text-[#0F2747]">{scanResult.weatherScan.waveHeight}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#68717D]">Wind Velocity:</span>
                      <strong className="font-mono text-[#0F2747]">{scanResult.weatherScan.windSpeed}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#68717D]">Transit Duration:</span>
                      <strong className="font-mono text-[#0F2747]">{scanResult.weatherScan.transitDays} Days</strong>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#FAF9F5] border border-[#E4E2DC] text-[11px] text-[#68717D] leading-relaxed">
                    {scanResult.weatherScan.details}
                  </div>
                </div>

                {/* 2. CONGESTION DIMENSION */}
                <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#E4E2DC] shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E4E2DC]">
                    <div className="flex items-center gap-2 text-xs font-black text-[#0F2747]">
                      <Anchor className="w-4 h-4 text-[#1E65B8]" />
                      <span>2. PORT CONGESTION</span>
                    </div>
                    <span className="text-xs font-black font-mono text-[#2F7D4B]">
                      {scanResult.congestionScan.score}/100
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#68717D]">Queue Status:</span>
                      <strong className="text-[#2F7D4B] font-bold">{scanResult.congestionScan.status}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#68717D]">Discharge Port:</span>
                      <strong className="text-[#0F2747] truncate max-w-[130px]">{scanResult.congestionScan.destinationPort}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#68717D]">Expected Queue:</span>
                      <strong className="font-mono text-[#0F2747]">{scanResult.congestionScan.queueVessels} Vessels</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#68717D]">Demurrage Risk:</span>
                      <strong className="text-[#2F7D4B] font-bold">{scanResult.congestionScan.demurrageExposure}</strong>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#FAF9F5] border border-[#E4E2DC] text-[11px] text-[#68717D] leading-relaxed">
                    {scanResult.congestionScan.details}
                  </div>
                </div>

                {/* 3. VESSEL COMPATIBILITY DIMENSION */}
                <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#E4E2DC] shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E4E2DC]">
                    <div className="flex items-center gap-2 text-xs font-black text-[#0F2747]">
                      <Ship className="w-4 h-4 text-[#D6A63B]" />
                      <span>3. VESSEL &amp; DRAFT</span>
                    </div>
                    <span className="text-xs font-black font-mono text-[#2F7D4B]">
                      {scanResult.vesselScan.score}/100
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#68717D]">Draft Clearance:</span>
                      <strong className="text-[#2F7D4B] font-bold">{scanResult.vesselScan.status}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#68717D]">Vessel Class:</span>
                      <strong className="text-[#0F2747]">{scanResult.vesselScan.vesselClass}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#68717D]">Loaded Draft:</span>
                      <strong className="font-mono text-[#0F2747]">{scanResult.vesselScan.loadedDraft}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#68717D]">Max Berth Depth:</span>
                      <strong className="font-mono text-[#0F2747]">{scanResult.vesselScan.maxPermissibleDraft}</strong>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#FAF9F5] border border-[#E4E2DC] text-[11px] text-[#68717D] leading-relaxed">
                    Clearance margin of <strong>{scanResult.vesselScan.draftMargin}</strong> under maximum permissible port lock.
                  </div>
                </div>

                {/* 4. STRATEGY PLAN & FINANCIAL ALPHA */}
                <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#E4E2DC] shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E4E2DC]">
                    <div className="flex items-center gap-2 text-xs font-black text-[#0F2747]">
                      <TrendingUp className="w-4 h-4 text-[#2F7D4B]" />
                      <span>4. STRATEGY ALPHA</span>
                    </div>
                    <span className="text-xs font-black font-mono text-[#2F7D4B]">
                      {scanResult.planScan.score}/100
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#68717D]">Target Strike:</span>
                      <strong className="font-mono text-[#0F2747]">${scanResult.planScan.strikeRate.toFixed(2)}/MT</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#68717D]">Spot Benchmark:</span>
                      <strong className="font-mono text-[#C64A3B]">${scanResult.planScan.spotBenchmark.toFixed(2)}/MT</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#68717D]">Net Savings:</span>
                      <strong className="font-mono text-[#2F7D4B] font-black">+${scanResult.planScan.estimatedSavingsUsd.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#68717D]">Strategic Alpha:</span>
                      <strong className="text-[#2F7D4B] font-bold">+{scanResult.planScan.savingsPct}% vs Spot</strong>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#FAF9F5] border border-[#E4E2DC] text-[11px] text-[#68717D] leading-relaxed">
                    {scanResult.planScan.confidenceLevel} based on Comparison Plan models.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ACTIVE FIXTURES & LIVE VOYAGE TRACKER */}
      {/* ========================================================================= */}
      {activeTab === 'active_fixtures' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E4E2DC] shadow-xs">
            <div>
              <h3 className="text-sm font-black text-[#0F2747] uppercase tracking-wider">
                Live Charter Fixtures &amp; Voyage Tracking
              </h3>
              <p className="text-xs text-[#68717D] mt-0.5">
                Monitor real-time progress, demurrage exposure, and scheduled arrival slots for booked vessels.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('new_booking')}
              className="px-4 py-2 rounded-lg bg-[#D6A63B] hover:bg-[#C4952D] text-[#0F2747] text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all cursor-pointer self-start sm:self-auto"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>+ Book Another Vessel</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {fixtures.map((f) => (
              <div
                key={f.id}
                className="bg-white rounded-[14px] border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] p-5 space-y-4 hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#E4E2DC]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF9F5] border border-[#E4E2DC] text-[#0F2747] flex items-center justify-center shrink-0">
                      <Ship className="w-5 h-5 text-[#D6A63B]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-black text-[#0F2747]">{f.vesselName}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                          {f.bookingRef}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]">
                          SCORE: {f.preBookingScore}/100
                        </span>
                      </div>
                      <div className="text-xs text-[#68717D] font-medium mt-0.5 flex items-center gap-1.5">
                        <span>{getPortFlag(f.originPort)} {f.originPort}</span>
                        <span>&rarr;</span>
                        <span>🇮🇳 {f.destPort}</span>
                        <span>&bull;</span>
                        <span className="font-bold text-[#0F2747]">{f.tonnage.toLocaleString()} MT {f.cargoType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase text-[#68717D] block">Charter Strike Rate</span>
                      <span className="text-lg font-black font-mono text-[#0F2747]">${f.contractRate.toFixed(2)}/MT</span>
                    </div>
                    <div className="h-8 w-px bg-slate-200 mx-1" />
                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase text-[#2F7D4B] block">Saved vs Spot</span>
                      <span className="text-lg font-black font-mono text-[#2F7D4B]">+${f.savingsUsd.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar & Status */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-[#0F2747] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#1E65B8] animate-pulse" />
                      <span>{f.status}</span>
                    </span>
                    <span className="text-slate-500 font-semibold text-[11px]">
                      Target ETA: <strong className="text-[#0F2747]">{f.eta}</strong>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1E65B8] rounded-full transition-all duration-500"
                      style={{ width: `${f.statusProgress}%` }}
                    />
                  </div>
                </div>

                {/* Specs Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1 text-[#68717D]">
                  <div className="flex items-center gap-4">
                    <span>Laycan: <strong className="text-[#0F2747]">{f.laycanWindow}</strong></span>
                    <span>Class: <strong className="text-[#0F2747]">{f.vesselClass}</strong></span>
                    <span>Strategy: <strong className="text-[#0F2747]">{f.strategyPlan}</strong></span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    f.demurrageRisk === 'LOW RISK'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {f.demurrageRisk}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BOOKING HISTORY & AUDIT LOG */}
      {/* ========================================================================= */}
      {activeTab === 'booking_history' && (
        <div className="bg-white rounded-[16px] border border-[#E4E2DC] shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[#E4E2DC] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-[#0F2747] uppercase tracking-wider">
                Completed &amp; Discharged Booking Records
              </h3>
              <p className="text-xs text-[#68717D] mt-0.5 font-medium">
                Verified audit trails of finalized maritime fixtures with realized economic savings.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">Total Cleared: {historyFixtures.length + fixtures.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F5] border-b border-[#E4E2DC] text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-4">Booking Ref</th>
                  <th className="py-3 px-4">Vessel Name</th>
                  <th className="py-3 px-4">Trade Corridor</th>
                  <th className="py-3 px-4">Cargo Parcel</th>
                  <th className="py-3 px-4">Strike Rate</th>
                  <th className="py-3 px-4">Realized Savings</th>
                  <th className="py-3 px-4">Pre-Scan Score</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1EFE9]">
                {[...fixtures, ...historyFixtures].map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF9F5] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0F2747]">{row.bookingRef}</td>
                    <td className="py-3.5 px-4 font-bold text-[#0F2747] flex items-center gap-1.5">
                      <Ship className="w-3.5 h-3.5 text-[#68717D]" />
                      <span>{row.vesselName}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {getPortFlag(row.originPort)} {row.originPort} &rarr; 🇮🇳 {row.destPort.split(' (')[0]}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0F2747]">{row.tonnage.toLocaleString()} MT</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0F2747]">${row.contractRate.toFixed(2)}/MT</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#2F7D4B]">+${row.savingsUsd.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black">
                        {row.preBookingScore}/100
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXECUTION CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {executionModalOpen && scanResult && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E4E2DC] shadow-2xl max-w-xl w-full p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E2DC]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#ECFDF5] text-[#059669]">
                  <ShieldCheck className="w-5 h-5 text-[#059669]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#0F2747]">
                    Confirm Charter Booking Execution
                  </h3>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    Pre-Booking Clearance Verified (Score: {scanResult.overallScore}/100)
                  </span>
                </div>
              </div>
              <button
                onClick={() => setExecutionModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E4E2DC] space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#68717D] font-bold">Vessel &amp; Class:</span>
                <strong className="text-[#0F2747]">{scanResult.vesselScan.vesselName} ({vesselClass})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#68717D] font-bold">Trade Corridor:</span>
                <strong className="text-[#0F2747]">
                  {selectedOrigin.flag} {selectedOrigin.port} &rarr; 🇮🇳 {selectedDestination.name}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#68717D] font-bold">Cargo &amp; Parcel:</span>
                <strong className="text-[#0F2747]">{cargoMt.toLocaleString()} MT {cargoType}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#68717D] font-bold">Firm Laycan Target:</span>
                <strong className="text-[#0F2747]">{laycanDate}</strong>
              </div>
              <div className="flex justify-between border-t border-[#E4E2DC] pt-2">
                <span className="text-[#68717D] font-bold">Locked Strike Rate:</span>
                <strong className="text-base font-black font-mono text-[#0F2747]">${targetRate.toFixed(2)} / MT</strong>
              </div>
              <div className="flex justify-between text-[#2F7D4B]">
                <span className="font-bold">Projected Net Savings:</span>
                <strong className="font-black font-mono">+${scanResult.planScan.estimatedSavingsUsd.toLocaleString()} USD</strong>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              By confirming, this fixture will be locked into the operations pipeline, timestamped with SHA-256 cryptographic compliance verification, and assigned to real-time voyage tracking.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setExecutionModalOpen(false)}
                className="px-4 py-2.5 rounded-lg border border-[#CBD5E1] text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={isExecuting}
                className="px-5 py-2.5 rounded-lg bg-[#0F2747] hover:bg-[#16355C] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-75"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Locking Fixture...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-[#D6A63B]" />
                    <span>Lock &amp; Confirm Booking</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
