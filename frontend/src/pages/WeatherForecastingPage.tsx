import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Tooltip, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import {
  Calendar, CloudSun, CloudRain, CloudLightning, Wind, Thermometer,
  AlertTriangle, Compass, Info, ChevronDown, Maximize2, ArrowRight,
  Sun, Cloud, Clock, RefreshCw, CheckCircle2, ShieldAlert, Award,
  Sparkles, Check, ChevronUp, ChevronLeft, ChevronRight, Navigation,
  Ship, CalendarCheck
} from 'lucide-react';
import {
  ResponsiveContainer, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, Legend, Line, ComposedChart, Area
} from 'recharts';
import { getCountryFlag } from '../utils/countryFlags';

// Fix Leaflet default marker icons in Vite / React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Port Marker Icon (Anchor)
const createPortIcon = (isDestination: boolean, label: string) =>
  L.divIcon({
    className: 'custom-port-marker-div',
    html: `
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background-color: ${isDestination ? '#0F2747' : '#D6A63B'};
          border: 2.5px solid #FFFFFF;
          box-shadow: 0 3px 12px rgba(15, 39, 71, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFFFFF;
          font-size: 15px;
          font-weight: 900;
        ">⚓</div>
        <div style="
          margin-top: 4px;
          background-color: #FFFFFF;
          border: 1px solid #E2E8F0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 800;
          color: #0F2747;
          white-space: nowrap;
          text-align: center;
          line-height: 1.1;
        ">
          <div>${label}</div>
          <div style="font-size: 8px; color: #64748B; font-weight: 600;">${isDestination ? 'India' : ''}</div>
        </div>
      </div>
    `,
    iconSize: [90, 56],
    iconAnchor: [45, 16],
  });

// Floating Weather Waypoint Marker Icon
const createWeatherWaypointIcon = (type: 'clear' | 'rain' | 'thunder' | 'wind') => {
  let bgColor = '#1E65B8';
  let symbol = '🌧️';
  let pulse = '';

  if (type === 'clear') {
    bgColor = '#10B981';
    symbol = '☀️';
  } else if (type === 'thunder') {
    bgColor = '#DC2626';
    symbol = '⚡';
    pulse = 'animation: pulse 1.8s infinite;';
  } else if (type === 'wind') {
    bgColor = '#0D9488';
    symbol = '💨';
  }

  return L.divIcon({
    className: 'custom-weather-waypoint-div',
    html: `
      <div style="
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background-color: ${bgColor};
        border: 2px solid #FFFFFF;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #FFFFFF;
        font-size: 13px;
        ${pulse}
      ">${symbol}</div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

// Map Bounds Auto-updater (runs when waypoints array reference updates on new forecast)
const MapBoundsUpdater: React.FC<{ waypoints: [number, number][] }> = ({ waypoints }) => {
  const map = useMap();
  useEffect(() => {
    if (waypoints && waypoints.length >= 2) {
      try {
        const bounds = L.latLngBounds(waypoints);
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 6, animate: true });
      } catch (err) {
        console.error('Fit bound error', err);
      }
    }
  }, [waypoints, map]);
  return null;
};

// Interactive Pan & Zoom Controller Component
const MapPanZoomController: React.FC<{ waypoints: [number, number][] }> = ({ waypoints }) => {
  const map = useMap();

  const handlePan = (dx: number, dy: number) => {
    map.panBy([dx, dy], { animate: true, duration: 0.25 });
  };

  const handleZoomIn = () => {
    map.zoomIn();
  };

  const handleZoomOut = () => {
    map.zoomOut();
  };

  const handleRecenter = () => {
    if (waypoints && waypoints.length >= 2) {
      const bounds = L.latLngBounds(waypoints);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 6, animate: true });
    }
  };

  return (
    <div className="absolute top-3 left-3 z-[1000] flex flex-col gap-1.5 select-none pointer-events-auto">
      {/* Zoom In & Zoom Out Buttons */}
      <div className="flex flex-col bg-white/95 backdrop-blur-xs rounded-lg border border-slate-200/90 shadow-md overflow-hidden">
        <button
          type="button"
          onClick={handleZoomIn}
          className="w-8 h-8 flex items-center justify-center text-slate-800 hover:bg-slate-100 font-black text-base border-b border-slate-200/60 transition-colors cursor-pointer"
          title="Zoom In (+)"
        >
          ＋
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="w-8 h-8 flex items-center justify-center text-slate-800 hover:bg-slate-100 font-black text-base transition-colors cursor-pointer"
          title="Zoom Out (−)"
        >
          －
        </button>
      </div>

      {/* D-Pad Pan Controller (Left, Right, Up, Down, and Recenter) */}
      <div className="bg-white/95 backdrop-blur-xs rounded-lg border border-slate-200/90 shadow-md p-1.5 flex flex-col items-center gap-1">
        <div className="text-[8px] font-black uppercase tracking-wider text-slate-400">Pan Map</div>
        <div className="grid grid-cols-3 gap-1 items-center justify-center">
          <div></div>
          <button
            type="button"
            onClick={() => handlePan(0, -140)}
            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[10px] text-slate-700 font-bold transition-all cursor-pointer active:scale-95"
            title="Pan Up"
          >
            ▲
          </button>
          <div></div>

          <button
            type="button"
            onClick={() => handlePan(-140, 0)}
            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[10px] text-slate-700 font-bold transition-all cursor-pointer active:scale-95"
            title="Pan Left"
          >
            ◀
          </button>
          <button
            type="button"
            onClick={handleRecenter}
            className="w-6 h-6 rounded bg-amber-50 hover:bg-amber-100 border border-amber-300/80 flex items-center justify-center text-[10px] text-[#D6A63B] font-black transition-all cursor-pointer active:scale-95"
            title="Recenter Route (Fit Bounds)"
          >
            🎯
          </button>
          <button
            type="button"
            onClick={() => handlePan(140, 0)}
            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[10px] text-slate-700 font-bold transition-all cursor-pointer active:scale-95"
            title="Pan Right"
          >
            ▶
          </button>

          <div></div>
          <button
            type="button"
            onClick={() => handlePan(0, 140)}
            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[10px] text-slate-700 font-bold transition-all cursor-pointer active:scale-95"
            title="Pan Down"
          >
            ▼
          </button>
          <div></div>
        </div>
      </div>
    </div>
  );
};

// Types & Interfaces
export interface PortItem {
  name: string;
  coordinates: [number, number];
  region: string;
}

export interface CountryData {
  name: string;
  flag: string;
  defaultPort: string;
  ports: PortItem[];
}

export interface IndianPort {
  name: string;
  coordinates: [number, number];
}

export interface WaypointForecastItem {
  id: string;
  name: string;
  dateStr: string;
  condition: string;
  weatherType: 'clear' | 'rain' | 'thunder' | 'wind';
  tempC: number;
  windKts: number;
  wavesM: number;
  coordinates: [number, number];
  dotColor: string;
}

export interface DailyForecastItem {
  date: string;
  position: string;
  condition: string;
  tempC: number;
  windKts: number;
  wavesM: number;
  precipMm: number;
  visibility: string;
  risk: 'Low' | 'Moderate' | 'High';
  isArrival?: boolean;
}

export interface StormHotspot {
  center: [number, number];
  radius: number;
  label: string;
  details: string;
  color: string;
}

export interface DeliveryOptimization {
  nominalArrivalDate: string;
  bestDeliveryDate: string;
  optimalDeliveryWindow: string;
  optimalDepartureDate: string;
  daysSaved: number;
  confidenceScore: number;
  weatherReason: string;
}

export interface RouteWeatherResult {
  originPort: string;
  originCountry: string;
  originCoords: [number, number];
  destinationPort: string;
  destinationCoords: [number, number];
  forecastDate: string;
  formattedDisplayDate: string;
  distanceNm: number;
  transitDays: number;
  avgTemp: number;
  overallRisk: 'LOW' | 'MODERATE' | 'HIGH';
  advisoryText: string;
  waypoints: [number, number][];
  timeline: WaypointForecastItem[];
  dailyForecast: DailyForecastItem[];
  stormHotspots: StormHotspot[];
  deliveryOpt: DeliveryOptimization;
}

// Origin Countries Catalog
const ORIGIN_COUNTRIES: CountryData[] = [
  {
    name: 'Australia',
    flag: '🇦🇺',
    defaultPort: 'Newcastle',
    ports: [
      { name: 'Newcastle', coordinates: [-32.93, 151.78], region: 'aus-east-south' },
      { name: 'Gladstone', coordinates: [-23.84, 151.25], region: 'aus-east-north' },
      { name: 'Hay Point', coordinates: [-21.29, 149.30], region: 'aus-east-north' },
      { name: 'Abbot Point', coordinates: [-19.88, 148.08], region: 'aus-east-north' },
      { name: 'Port Hedland', coordinates: [-20.31, 118.58], region: 'aus-west' },
      { name: 'Dampier', coordinates: [-20.66, 116.71], region: 'aus-west' },
      { name: 'Port Kembla', coordinates: [-34.47, 150.90], region: 'aus-east-south' },
    ],
  },
  {
    name: 'United States',
    flag: '🇺🇸',
    defaultPort: 'Baltimore',
    ports: [
      { name: 'Baltimore', coordinates: [39.28, -76.58], region: 'us-east' },
      { name: 'Hampton Roads', coordinates: [36.96, -76.32], region: 'us-east' },
      { name: 'New Orleans', coordinates: [29.95, -90.07], region: 'us-gulf' },
      { name: 'Houston', coordinates: [29.76, -95.36], region: 'us-gulf' },
      { name: 'Mobile', coordinates: [30.69, -88.04], region: 'us-gulf' },
      { name: 'Long Beach', coordinates: [33.75, -118.22], region: 'us-west' },
    ],
  },
  {
    name: 'Indonesia',
    flag: '🇮🇩',
    defaultPort: 'Taboneo',
    ports: [
      { name: 'Taboneo', coordinates: [-3.75, 114.45], region: 'indo' },
      { name: 'Balikpapan', coordinates: [-1.27, 116.83], region: 'indo' },
      { name: 'Samarinda (Muara Berau)', coordinates: [-0.58, 117.25], region: 'indo' },
      { name: 'Tanjung Bara (KPC)', coordinates: [0.55, 117.62], region: 'indo' },
      { name: 'Bunati', coordinates: [-3.78, 115.65], region: 'indo' },
      { name: 'Tarahan', coordinates: [-5.52, 105.33], region: 'indo-west' },
    ],
  },
  {
    name: 'Mozambique',
    flag: '🇲🇿',
    defaultPort: 'Maputo',
    ports: [
      { name: 'Maputo', coordinates: [-25.97, 32.57], region: 'africa-east' },
      { name: 'Beira', coordinates: [-19.84, 34.84], region: 'africa-east' },
      { name: 'Nacala', coordinates: [-14.54, 40.67], region: 'africa-east' },
    ],
  },
  {
    name: 'South Africa',
    flag: '🇿🇦',
    defaultPort: 'Richards Bay',
    ports: [
      { name: 'Richards Bay', coordinates: [-28.80, 32.08], region: 'africa-east' },
      { name: 'Saldanha Bay', coordinates: [-33.02, 17.96], region: 'africa-south' },
      { name: 'Durban', coordinates: [-29.87, 31.05], region: 'africa-east' },
    ],
  },
  {
    name: 'Russia',
    flag: '🇷🇺',
    defaultPort: 'Vostochny',
    ports: [
      { name: 'Vostochny', coordinates: [42.73, 133.08], region: 'russia-pacific' },
      { name: 'Vanino', coordinates: [49.09, 140.27], region: 'russia-pacific' },
      { name: 'Ust-Luga', coordinates: [59.65, 28.25], region: 'russia-baltic' },
      { name: 'Taman', coordinates: [45.13, 36.68], region: 'russia-blacksea' },
      { name: 'Murmansk', coordinates: [68.97, 33.06], region: 'russia-arctic' },
    ],
  },
  {
    name: 'Canada',
    flag: '🇨🇦',
    defaultPort: 'Vancouver (Roberts Bank)',
    ports: [
      { name: 'Vancouver (Roberts Bank)', coordinates: [49.02, -123.15], region: 'canada-west' },
      { name: 'Prince Rupert', coordinates: [54.31, -130.32], region: 'canada-west' },
    ],
  },
  {
    name: 'Brazil',
    flag: '🇧🇷',
    defaultPort: 'Ponta da Madeira',
    ports: [
      { name: 'Ponta da Madeira', coordinates: [-2.56, -44.37], region: 'brazil-north' },
      { name: 'Tubarao', coordinates: [-20.28, -40.24], region: 'brazil-south' },
      { name: 'Santos', coordinates: [-23.96, -46.30], region: 'brazil-south' },
    ],
  },
  {
    name: 'Colombia',
    flag: '🇨🇴',
    defaultPort: 'Puerto Drummond',
    ports: [
      { name: 'Puerto Drummond', coordinates: [11.02, -74.22], region: 'colombia' },
      { name: 'Puerto Bolivar', coordinates: [12.21, -71.97], region: 'colombia' },
    ],
  },
];

// Indian Destination Ports Catalog
const INDIAN_PORTS: IndianPort[] = [
  { name: 'Paradip Port (Odisha)', coordinates: [20.26, 86.67] },
  { name: 'Visakhapatnam (Andhra Pradesh)', coordinates: [17.68, 83.28] },
  { name: 'Dhamra Port (Odisha)', coordinates: [20.83, 86.97] },
  { name: 'Gangavaram Port (Andhra Pradesh)', coordinates: [17.62, 83.23] },
  { name: 'Haldia Port (West Bengal)', coordinates: [22.02, 88.06] },
  { name: 'Gopalpur Port (Odisha)', coordinates: [19.28, 84.97] },
  { name: 'Kakinada Port (Andhra Pradesh)', coordinates: [16.98, 82.28] },
  { name: 'Krishnapatnam Port (Andhra Pradesh)', coordinates: [14.25, 80.12] },
  { name: 'Ennore / Kamarajar (Tamil Nadu)', coordinates: [13.25, 80.34] },
  { name: 'Chennai Port (Tamil Nadu)', coordinates: [13.08, 80.29] },
  { name: 'Tuticorin / VOC Port (Tamil Nadu)', coordinates: [8.75, 78.18] },
  { name: 'Mumbai / JNPT (Maharashtra)', coordinates: [18.95, 72.95] },
  { name: 'Mormugao (Goa)', coordinates: [15.42, 73.80] },
  { name: 'New Mangalore (Karnataka)', coordinates: [12.92, 74.81] },
  { name: 'Kandla / Deendayal (Gujarat)', coordinates: [23.01, 70.22] },
  { name: 'Mundra (Gujarat)', coordinates: [22.75, 69.70] },
];

// Date helper: format to dd MMM yyyy
const formatDateStr = (date: Date): string => {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Add days to date
const addDaysToDate = (baseDateStr: string, daysToAdd: number): Date => {
  const d = new Date(baseDateStr);
  if (isNaN(d.getTime())) {
    const fallback = new Date('2026-09-25');
    fallback.setDate(fallback.getDate() + daysToAdd);
    return fallback;
  }
  d.setDate(d.getDate() + daysToAdd);
  return d;
};

// METEOROLOGICAL ENGINE: Computes dynamic oceanic route weather data for any origin-destination pair
function computeMaritimeRouteWeather(
  countryName: string,
  originPortName: string,
  destPortName: string,
  startDateStr: string
): RouteWeatherResult {
  const country = ORIGIN_COUNTRIES.find((c) => c.name === countryName) || ORIGIN_COUNTRIES[0];
  const origin = country.ports.find((p) => p.name === originPortName) || country.ports[0];
  const destination = INDIAN_PORTS.find((p) => p.name === destPortName) || INDIAN_PORTS[0];

  const origCoords = origin.coordinates;
  const destCoords = destination.coordinates;
  const region = origin.region;

  let waypoints: [number, number][] = [];
  let distanceNm = 5280;
  let transitDays = 24.6;
  let overallRisk: 'LOW' | 'MODERATE' | 'HIGH' = 'MODERATE';
  let advisoryText = 'Rough weather expected in central Indian Ocean between 28 Sep – 01 Oct. Consider weather routing.';
  let stormHotspots: StormHotspot[] = [];

  // 1. Build Oceanic Waypoints & Baseline Parameters
  if (region === 'aus-east-south') {
    // Newcastle, Port Kembla
    waypoints = [
      origCoords,
      [-38.5, 149.0],
      [-36.0, 115.0],
      [-22.0, 95.0],
      [-5.0, 88.0],
      [8.0, 86.0],
      destCoords,
    ];
    distanceNm = 5280;
    transitDays = 24.6;
    overallRisk = 'MODERATE';
    advisoryText = 'Rough weather expected in central Indian Ocean between 28 Sep – 01 Oct. Consider weather routing.';
    stormHotspots = [
      {
        center: [-8.5, 92.5],
        radius: 750000,
        label: '⛈️ Severe Thunderstorm Hotspot (Indian Ocean WP-2)',
        details: 'Wind: 32 kts | Waves: 4.1 m',
        color: '#EF4444',
      },
      {
        center: [-22.0, 102.0],
        radius: 650000,
        label: '🌧️ Frontal Squall Zone (WP-1)',
        details: 'Wind: 22 kts | Waves: 2.8 m',
        color: '#F59E0B',
      },
    ];
  } else if (region === 'aus-east-north') {
    // Gladstone, Hay Point, Abbot Point
    waypoints = [
      origCoords,
      [-10.6, 142.4],
      [-8.5, 126.0],
      [-8.5, 115.7],
      [0.0, 95.0],
      [10.0, 87.0],
      destCoords,
    ];
    distanceNm = origin.name === 'Hay Point' ? 5100 : 4950;
    transitDays = 15.7;
    overallRisk = 'MODERATE';
    advisoryText = 'Torres Strait tidal currents and tropical showers in Timor Sea. Moderate swells on Bay of Bengal approach.';
    stormHotspots = [
      {
        center: [-8.5, 126.0],
        radius: 550000,
        label: '🌧️ Timor Sea Squall Zone',
        details: 'Wind: 24 kts | Waves: 2.9 m',
        color: '#F59E0B',
      },
    ];
  } else if (region === 'aus-west') {
    // Port Hedland, Dampier
    waypoints = [
      origCoords,
      [-16.0, 108.0],
      [-8.0, 98.0],
      [3.0, 90.0],
      [12.0, 86.0],
      destCoords,
    ];
    distanceNm = 3250;
    transitDays = 10.0;
    overallRisk = 'LOW';
    advisoryText = 'Calm to moderate trade winds across eastern Indian Ocean. Favorable deepwater sailing conditions.';
    stormHotspots = [
      {
        center: [-8.0, 98.0],
        radius: 500000,
        label: '🌦️ Trade Wind Convergence',
        details: 'Wind: 18 kts | Waves: 2.1 m',
        color: '#10B981',
      },
    ];
  } else if (region === 'indo' || region === 'indo-west') {
    if (region === 'indo-west') {
      waypoints = [
        origCoords,
        [-6.0, 105.0],
        [0.0, 95.0],
        [8.0, 90.0],
        destCoords,
      ];
      distanceNm = 1980;
      transitDays = 6.1;
    } else {
      waypoints = [
        origCoords,
        [-5.8, 106.0],
        [1.3, 103.8],
        [5.8, 95.5],
        [13.0, 90.0],
        destCoords,
      ];
      distanceNm = 2400;
      transitDays = 7.4;
    }
    overallRisk = 'LOW';
    advisoryText = 'Tropical convective showers across Java Sea and Sunda Strait. Calmer swell entering Andaman Sea.';
    stormHotspots = [
      {
        center: [-5.8, 106.0],
        radius: 400000,
        label: '🌦️ Convective Squall Line',
        details: 'Wind: 20 kts | Waves: 2.0 m',
        color: '#F59E0B',
      },
    ];
  } else if (region === 'africa-east') {
    waypoints = [
      origCoords,
      [-15.0, 42.0],
      [-2.0, 56.0],
      [5.5, 78.0],
      [13.0, 82.0],
      destCoords,
    ];
    distanceNm = origin.name === 'Maputo' ? 4600 : origin.name === 'Richards Bay' ? 4750 : 4350;
    transitDays = 14.7;
    overallRisk = 'MODERATE';
    advisoryText = 'Agulhas current swell and high wave crests off South-East Africa. Monitor Mozambique Channel low-pressure trough.';
    stormHotspots = [
      {
        center: [-22.0, 38.0],
        radius: 650000,
        label: '🌊 Agulhas Heavy Swell',
        details: 'Wind: 28 kts | Waves: 3.6 m',
        color: '#F59E0B',
      },
    ];
  } else if (region === 'africa-south') {
    waypoints = [
      origCoords,
      [-34.8, 18.5],
      [-35.2, 26.0],
      [-28.0, 48.0],
      [-10.0, 68.0],
      [5.5, 80.5],
      destCoords,
    ];
    distanceNm = 5400;
    transitDays = 16.7;
    overallRisk = 'HIGH';
    advisoryText = 'Cape of Good Hope Roaring Forties westerly gale force winds and steep cross-swells. Weather routing recommended.';
    stormHotspots = [
      {
        center: [-35.0, 22.0],
        radius: 800000,
        label: '⛈️ Cape of Good Hope Storm System',
        details: 'Wind: 36 kts | Waves: 4.8 m',
        color: '#DC2626',
      },
    ];
  } else if (region === 'us-east') {
    waypoints = [
      origCoords,
      [36.0, -68.0],
      [20.0, -50.0],
      [-10.0, -25.0],
      [-34.8, 18.5],
      [-28.0, 48.0],
      [5.5, 80.5],
      destCoords,
    ];
    distanceNm = 8945;
    transitDays = 27.6;
    overallRisk = 'MODERATE';
    advisoryText = 'Long-haul Atlantic track. Roaring Forties westerly swells rounding Cape of Good Hope. Recommend southern track diversion.';
    stormHotspots = [
      {
        center: [-34.8, 18.5],
        radius: 750000,
        label: '🌊 South Atlantic Storm Front',
        details: 'Wind: 31 kts | Waves: 4.0 m',
        color: '#DC2626',
      },
    ];
  } else if (region === 'us-gulf') {
    waypoints = [
      origCoords,
      [24.0, -84.0],
      [20.0, -66.0],
      [-15.0, -22.0],
      [-34.8, 18.5],
      [-28.0, 48.0],
      [5.5, 80.5],
      destCoords,
    ];
    distanceNm = 9450;
    transitDays = 29.2;
    overallRisk = 'MODERATE';
    advisoryText = 'Florida Straits congestion and Atlantic trade winds. Swell builds significantly approaching South Africa.';
    stormHotspots = [
      {
        center: [-34.8, 18.5],
        radius: 750000,
        label: '🌊 Cape Swell',
        details: 'Wind: 30 kts | Waves: 3.9 m',
        color: '#DC2626',
      },
    ];
  } else if (region === 'us-west' || region === 'canada-west') {
    waypoints = [
      origCoords,
      [30.0, -135.0],
      [20.0, -165.0],
      [15.0, 160.0],
      [10.0, 130.0],
      [1.3, 103.8],
      destCoords,
    ];
    distanceNm = region === 'canada-west' ? 8400 : 8100;
    transitDays = 25.0;
    overallRisk = 'MODERATE';
    advisoryText = 'North Pacific swell and Singapore Strait maritime congestion. Expect mild monsoon swells in southern Bay of Bengal.';
    stormHotspots = [
      {
        center: [25.0, -150.0],
        radius: 700000,
        label: '🌦️ Pacific Low Pressure Front',
        details: 'Wind: 26 kts | Waves: 3.3 m',
        color: '#F59E0B',
      },
    ];
  } else if (region === 'russia-pacific') {
    waypoints = [
      origCoords,
      [34.0, 129.5],
      [23.0, 119.0],
      [10.0, 112.0],
      [1.3, 103.8],
      [12.0, 88.0],
      destCoords,
    ];
    distanceNm = 5400;
    transitDays = 16.7;
    overallRisk = 'HIGH';
    advisoryText = 'East China Sea seasonal swell and Singapore Strait maritime congestion. Good visibility in northern Bay of Bengal.';
    stormHotspots = [
      {
        center: [23.0, 119.0],
        radius: 500000,
        label: '⛈️ Taiwan Strait Gale Swell',
        details: 'Wind: 34 kts | Waves: 4.2 m',
        color: '#DC2626',
      },
    ];
  } else {
    waypoints = [
      origCoords,
      [-10.0, -25.0],
      [-34.8, 18.5],
      [-28.0, 48.0],
      [5.5, 80.5],
      destCoords,
    ];
    distanceNm = 9800;
    transitDays = 30.2;
    overallRisk = 'MODERATE';
    advisoryText = 'Cape passage and Atlantic equatorial squalls. Stable conditions entering northern Indian Ocean.';
    stormHotspots = [
      {
        center: [-34.8, 18.5],
        radius: 700000,
        label: '🌊 Cape Swells',
        details: 'Wind: 29 kts | Waves: 3.8 m',
        color: '#DC2626',
      },
    ];
  }

  // 2. Compute Weather-Optimized Best Delivery Window
  const totalDays = Math.max(transitDays, 4);
  const nominalArrival = addDaysToDate(startDateStr, Math.round(totalDays));

  let optimalDeparture = addDaysToDate(startDateStr, 0);
  let bestDelivery = nominalArrival;
  let optimalDeliveryWindow = `${formatDateStr(nominalArrival)} – ${formatDateStr(addDaysToDate(startDateStr, Math.round(totalDays) + 1))}`;
  let daysSaved = 0.8;
  let confidenceScore = 96;
  let weatherReason = `Current departure window offers benign wave conditions (< 2.2m) with predictable tailwinds for on-time delivery at ${destination.name.split(' (')[0]}.`;

  if (overallRisk === 'HIGH') {
    // Shifting departure 2 days earlier or routing through calmer weather saves vessel from severe speed loss
    optimalDeparture = addDaysToDate(startDateStr, -2);
    bestDelivery = addDaysToDate(startDateStr, Math.round(totalDays) - 2);
    const winStart = addDaysToDate(startDateStr, Math.round(totalDays) - 3);
    const winEnd = addDaysToDate(startDateStr, Math.round(totalDays) - 1);
    optimalDeliveryWindow = `${formatDateStr(winStart)} – ${formatDateStr(winEnd)}`;
    daysSaved = 2.4;
    confidenceScore = 92;
    weatherReason = `Departing on ${formatDateStr(optimalDeparture)} clears the high-risk gale system before wave heights crest over 4.0m, securing faster transit and optimal berthing window.`;
  } else if (overallRisk === 'MODERATE') {
    optimalDeparture = addDaysToDate(startDateStr, -1);
    bestDelivery = addDaysToDate(startDateStr, Math.round(totalDays) - 1);
    const winStart = addDaysToDate(startDateStr, Math.round(totalDays) - 2);
    const winEnd = addDaysToDate(startDateStr, Math.round(totalDays));
    optimalDeliveryWindow = `${formatDateStr(winStart)} – ${formatDateStr(winEnd)}`;
    daysSaved = 1.6;
    confidenceScore = 95;
    weatherReason = `Adjusting departure by 24 hours avoids central basin swell resistance, ensuring peak arrival reliability at ${destination.name.split(' (')[0]}.`;
  }

  const deliveryOpt: DeliveryOptimization = {
    nominalArrivalDate: formatDateStr(nominalArrival),
    bestDeliveryDate: formatDateStr(bestDelivery),
    optimalDeliveryWindow,
    optimalDepartureDate: formatDateStr(optimalDeparture),
    daysSaved,
    confidenceScore,
    weatherReason,
  };

  // 3. Build 5 Dynamic Waypoints for Right Column & Map Markers
  const fractions = [0, 0.25, 0.50, 0.75, 1.0];
  const legNames = [
    `${origin.name} (Origin)`,
    `${getOceanicZoneName(waypoints, 0.25, region)} (WP-1)`,
    `${getOceanicZoneName(waypoints, 0.50, region)} (WP-2)`,
    `${getOceanicZoneName(waypoints, 0.75, region)} (WP-3)`,
    `${destination.name.split(' (')[0]} (Destination)`,
  ];

  const timeline: WaypointForecastItem[] = fractions.map((frac, idx) => {
    const dayOffset = Math.round(totalDays * frac);
    const dateObj = addDaysToDate(startDateStr, dayOffset);
    const timeStr = idx === 0 ? '00:00' : idx === 4 ? '06:00' : idx % 2 === 1 ? '12:00' : '00:00';
    const dateFormatted = `${formatDateStr(dateObj)}, ${timeStr}`;

    const coordIdx = Math.min(
      Math.floor(frac * (waypoints.length - 1)),
      waypoints.length - 1
    );
    const coords = waypoints[coordIdx];

    let weatherType: 'clear' | 'rain' | 'thunder' | 'wind' = 'clear';
    let condition = 'Clear';
    let tempC = 27;
    let windKts = 14;
    let wavesM = 1.5;
    let dotColor = '#10B981';

    if (idx === 0) {
      weatherType = 'clear';
      condition = 'Clear';
      tempC = 24;
      windKts = 12;
      wavesM = 1.4;
      dotColor = '#10B981';
    } else if (idx === 1) {
      weatherType = 'rain';
      condition = 'Light Rain';
      tempC = 28;
      windKts = 22;
      wavesM = 2.8;
      dotColor = '#1E65B8';
    } else if (idx === 2) {
      if (overallRisk === 'HIGH' || overallRisk === 'MODERATE') {
        weatherType = 'thunder';
        condition = 'Thunderstorms';
        tempC = 26;
        windKts = 32;
        wavesM = 4.1;
        dotColor = '#DC2626';
      } else {
        weatherType = 'wind';
        condition = 'Moderate Breeze';
        tempC = 29;
        windKts = 20;
        wavesM = 2.3;
        dotColor = '#0D9488';
      }
    } else if (idx === 3) {
      weatherType = 'rain';
      condition = 'Moderate Rain';
      tempC = 29;
      windKts = 24;
      wavesM = 3.2;
      dotColor = '#1E65B8';
    } else {
      weatherType = 'clear';
      condition = 'Clear';
      tempC = 31;
      windKts = 16;
      wavesM = 1.6;
      dotColor = '#10B981';
    }

    return {
      id: `wp-${idx}`,
      name: legNames[idx],
      dateStr: dateFormatted,
      condition,
      weatherType,
      tempC,
      windKts,
      wavesM,
      coordinates: coords,
      dotColor,
    };
  });

  // 4. Build Daily Route Forecast (11 Rows)
  const dailyForecast: DailyForecastItem[] = [];
  const numSteps = 11;
  const stepDays = totalDays / (numSteps - 1);

  for (let i = 0; i < numSteps; i++) {
    const dayProgress = i * stepDays;
    const dateObj = addDaysToDate(startDateStr, Math.round(dayProgress));

    let position = `Near ${origin.name}`;
    let condition = 'Clear';
    let tempC = 25;
    let windKts = 14;
    let wavesM = 1.5;
    let precipMm = 0;
    let visibility = '> 10 km';
    let risk: 'Low' | 'Moderate' | 'High' = 'Low';
    let isArrival = false;

    if (i === 0) {
      position = `Near ${origin.name}`;
      condition = 'Clear';
      tempC = 24;
      windKts = 12;
      wavesM = 1.4;
      precipMm = 0;
      visibility = '> 10 km';
      risk = 'Low';
    } else if (i === 1) {
      position = `${origin.name} Offshore Shelf`;
      condition = 'Partly Cloudy';
      tempC = 26;
      windKts = 18;
      wavesM = 2.1;
      precipMm = 0;
      visibility = '> 10 km';
      risk = 'Low';
    } else if (i === 2) {
      position = `${getOceanicZoneName(waypoints, 0.2, region)} (WP-1 Approach)`;
      condition = 'Light Rain';
      tempC = 28;
      windKts = 22;
      wavesM = 2.8;
      precipMm = 4;
      visibility = '> 10 km';
      risk = 'Moderate';
    } else if (i === 3) {
      position = `${getOceanicZoneName(waypoints, 0.35, region)} (Open Sea)`;
      condition = 'Rain';
      tempC = 27;
      windKts = 26;
      wavesM = 3.5;
      precipMm = 12;
      visibility = '5–8 km';
      risk = 'High';
    } else if (i === 4) {
      position = `${getOceanicZoneName(waypoints, 0.5, region)} (Deep Basin)`;
      condition = overallRisk === 'LOW' ? 'Scattered Showers' : 'Thunderstorms';
      tempC = 26;
      windKts = overallRisk === 'LOW' ? 20 : 32;
      wavesM = overallRisk === 'LOW' ? 2.4 : 4.1;
      precipMm = 18;
      visibility = '3–5 km';
      risk = overallRisk === 'LOW' ? 'Moderate' : 'High';
    } else if (i === 5) {
      position = `${getOceanicZoneName(waypoints, 0.5, region)} (WP-2 Hotspot)`;
      condition = overallRisk === 'LOW' ? 'Partly Cloudy' : 'Thunderstorms';
      tempC = 26;
      windKts = overallRisk === 'LOW' ? 19 : 31;
      wavesM = overallRisk === 'LOW' ? 2.2 : 3.9;
      precipMm = 15;
      visibility = '3–6 km';
      risk = overallRisk === 'LOW' ? 'Low' : 'High';
    } else if (i === 6) {
      position = 'Equatorial Crossing / Mid Corridor';
      condition = 'Light Rain';
      tempC = 28;
      windKts = 21;
      wavesM = 2.7;
      precipMm = 5;
      visibility = '8–10 km';
      risk = 'Moderate';
    } else if (i === 7) {
      position = 'Southern Bay of Bengal / Passage';
      condition = 'Partly Cloudy';
      tempC = 29;
      windKts = 19;
      wavesM = 2.3;
      precipMm = 1;
      visibility = '> 10 km';
      risk = 'Low';
    } else if (i === 8) {
      position = 'Bay of Bengal Deep Water (WP-3)';
      condition = 'Moderate Rain';
      tempC = 29;
      windKts = 24;
      wavesM = 3.2;
      precipMm = 9;
      visibility = '6–8 km';
      risk = 'Moderate';
    } else if (i === 9) {
      position = `Approach ${destination.name.split(' (')[0]}`;
      condition = 'Partly Cloudy';
      tempC = 30;
      windKts = 17;
      wavesM = 1.9;
      precipMm = 0;
      visibility = '> 10 km';
      risk = 'Low';
    } else {
      position = `${destination.name.split(' (')[0]} Anchorage (Delivery)`;
      condition = 'Clear';
      tempC = 31;
      windKts = 16;
      wavesM = 1.6;
      precipMm = 0;
      visibility = '> 10 km';
      risk = 'Low';
      isArrival = true;
    }

    dailyForecast.push({
      date: formatDateStr(dateObj),
      position,
      condition,
      tempC,
      windKts,
      wavesM,
      precipMm,
      visibility,
      risk,
      isArrival,
    });
  }

  const avgTemp = Math.round(
    dailyForecast.reduce((acc, row) => acc + row.tempC, 0) / dailyForecast.length
  );

  return {
    originPort: origin.name,
    originCountry: country.name,
    originCoords: origCoords,
    destinationPort: destination.name,
    destinationCoords: destCoords,
    forecastDate: startDateStr,
    formattedDisplayDate: formatDateStr(new Date(startDateStr)),
    distanceNm,
    transitDays,
    avgTemp,
    overallRisk,
    advisoryText,
    waypoints,
    timeline,
    dailyForecast,
    stormHotspots,
    deliveryOpt,
  };
}

// Helper to label intermediate oceanic zones
function getOceanicZoneName(waypoints: [number, number][], frac: number, region: string): string {
  if (region === 'indo' || region === 'indo-west') {
    if (frac < 0.4) return 'Java Sea';
    if (frac < 0.7) return 'Sunda Strait';
    return 'Andaman Sea';
  }
  if (region === 'aus-west') {
    if (frac < 0.5) return 'North West Shelf';
    return 'Indian Ocean';
  }
  if (region.startsWith('africa')) {
    if (frac < 0.4) return 'Mozambique Channel';
    if (frac < 0.7) return 'Equatorial Indian Ocean';
    return 'Arabian Sea / Sri Lanka';
  }
  if (region.startsWith('us-') || region.startsWith('canada') || region.startsWith('brazil')) {
    if (frac < 0.4) return 'Atlantic Ocean';
    if (frac < 0.7) return 'Cape of Good Hope';
    return 'South Indian Ocean';
  }
  if (region.startsWith('russia')) {
    if (frac < 0.4) return 'Sea of Japan';
    if (frac < 0.7) return 'South China Sea';
    return 'Bay of Bengal';
  }
  if (frac < 0.4) return 'Coral Sea / Bight';
  if (frac < 0.7) return 'Indian Ocean';
  return 'Bay of Bengal';
}

export const WeatherForecastingPage: React.FC = () => {
  // -------------------------------------------------------------
  // DRAFT FORM STATE (Updated freely by user dropdowns/inputs)
  // -------------------------------------------------------------
  const [formCountry, setFormCountry] = useState<string>('Australia');
  const [formOriginPort, setFormOriginPort] = useState<string>('Newcastle');
  const [formDestinationPort, setFormDestinationPort] = useState<string>('Paradip Port (Odisha)');
  const [formDate, setFormDate] = useState<string>('2026-09-25');

  // Loading animation state when clicking "Get Weather Forecast"
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // -------------------------------------------------------------
  // APPLIED ACTIVE FORECAST STATE (ONLY UPDATES ON BUTTON CLICK)
  // -------------------------------------------------------------
  const [activeResult, setActiveResult] = useState<RouteWeatherResult>(() => {
    return computeMaritimeRouteWeather('Australia', 'Newcastle', 'Paradip Port (Odisha)', '2026-09-25');
  });

  // Map settings
  const [showWaypoints, setShowWaypoints] = useState<boolean>(true);
  const [mapStyle, setMapStyle] = useState<'satellite' | 'map'>('satellite');
  const [selectedWeatherLayer, setSelectedWeatherLayer] = useState<string>('Wind (kts)');
  const [windUnit, setWindUnit] = useState<string>('Wind (kts)');

  // Bottom view mode: Table or Chart
  const [bottomView, setBottomView] = useState<'table' | 'chart'>('table');

  // Selected Country in Draft Form
  const selectedDraftCountry = useMemo(() => {
    return ORIGIN_COUNTRIES.find((c) => c.name === formCountry) || ORIGIN_COUNTRIES[0];
  }, [formCountry]);

  // When form country changes, ensure form origin port belongs to that country
  const handleCountryChange = (countryName: string) => {
    setFormCountry(countryName);
    const newCountry = ORIGIN_COUNTRIES.find((c) => c.name === countryName) || ORIGIN_COUNTRIES[0];
    if (!newCountry.ports.some((p) => p.name === formOriginPort)) {
      setFormOriginPort(newCountry.ports[0]?.name || '');
    }
  };

  // -------------------------------------------------------------
  // ACTION HANDLER: RUN FORECAST ON BUTTON CLICK
  // -------------------------------------------------------------
  const handleRunForecast = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const result = computeMaritimeRouteWeather(
        formCountry,
        formOriginPort,
        formDestinationPort,
        formDate
      );
      setActiveResult(result);
      setIsCalculating(false);
    }, 250);
  };

  // Weather condition icon helper
  const getWeatherIcon = (cond: string) => {
    switch (cond.toLowerCase()) {
      case 'clear':
        return <Sun className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'partly cloudy':
        return <CloudSun className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'light rain':
      case 'moderate rain':
      case 'rain':
      case 'scattered showers':
        return <CloudRain className="w-4 h-4 text-blue-500 shrink-0" />;
      case 'thunderstorms':
        return <CloudLightning className="w-4 h-4 text-red-500 shrink-0" />;
      default:
        return <Cloud className="w-4 h-4 text-slate-500 shrink-0" />;
    }
  };

  return (
    <div className="min-h-full bg-[#F8F7F3] p-4 sm:p-6 lg:p-7 space-y-6 font-sans">
      {/* ========================================================================= */}
      {/* HEADER SECTION WITH TITLE & TAGLINE */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="text-[11px] font-black uppercase tracking-wider text-[#D6A63B] mb-1">
            WEATHER FORECASTING
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F2747] tracking-tight">
            Maritime Route Weather Forecast
          </h1>
          <p className="text-xs sm:text-sm text-[#68717D] mt-1">
            Plan safer voyages with real-time and forecasted weather conditions along your selected route.
          </p>
        </div>

        <div className="text-right hidden md:block">
          <div className="text-[11px] font-bold text-[#68717D] tracking-wider uppercase">
            SAFER ROUTES. SMARTER DECISIONS.
          </div>
          <div className="text-[11px] font-bold text-[#0F2747] tracking-wider uppercase">
            POWERED BY REAL-TIME MARITIME WEATHER.
          </div>
          <div className="h-0.5 w-16 bg-[#D6A63B] ml-auto mt-1" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3-COLUMN UPPER SECTION: CONTROLS | ROUTE WEATHER MAP | ROUTE WAYPOINTS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: ROUTE SELECTION FORM (3 COLUMNS) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-[#E4E2DC] shadow-xs p-4 sm:p-5 space-y-4">
          {/* Forecast Date */}
          <div>
            <label className="block text-xs font-bold text-[#0F2747] mb-1.5">
              Forecast Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium text-[#0F2747] bg-[#FAF9F5] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E65B8] transition-colors"
              />
            </div>
          </div>

          {/* Origin Country */}
          <div>
            <label className="block text-xs font-bold text-[#0F2747] mb-1.5">
              Origin Country <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full appearance-none px-3 py-2 text-xs font-medium text-[#0F2747] bg-[#FAF9F5] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E65B8] transition-colors pr-8 cursor-pointer"
              >
                {ORIGIN_COUNTRIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Origin Port */}
          <div>
            <label className="block text-xs font-bold text-[#0F2747] mb-1.5">
              Origin Port <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formOriginPort}
                onChange={(e) => setFormOriginPort(e.target.value)}
                className="w-full appearance-none px-3 py-2 text-xs font-medium text-[#0F2747] bg-[#FAF9F5] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E65B8] transition-colors pr-8 cursor-pointer"
              >
                {selectedDraftCountry.ports.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Destination Port (India) */}
          <div>
            <label className="block text-xs font-bold text-[#0F2747] mb-1.5">
              Destination Port (India) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formDestinationPort}
                onChange={(e) => setFormDestinationPort(e.target.value)}
                className="w-full appearance-none px-3 py-2 text-xs font-medium text-[#0F2747] bg-[#FAF9F5] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#1E65B8] transition-colors pr-8 cursor-pointer"
              >
                {INDIAN_PORTS.map((p) => (
                  <option key={p.name} value={p.name}>
                    🇮🇳 {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Get Weather Forecast Button */}
          <button
            type="button"
            onClick={handleRunForecast}
            disabled={isCalculating}
            className="w-full mt-2 py-2.5 px-4 rounded-lg bg-[#D6A63B] hover:bg-[#C4952D] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-75"
          >
            {isCalculating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Simulating Maritime Weather...</span>
              </>
            ) : (
              <>
                <span>Get Weather Forecast</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* WEATHER-OPTIMIZED DELIVERY RECOMMENDATION CARD */}
          <div className="mt-3 p-3 rounded-lg bg-emerald-50/70 border border-emerald-200/80 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-900">
              <CalendarCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Optimal Delivery Recommendation</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] text-slate-600 font-medium">Best Delivery Date:</span>
              <span className="text-xs font-extrabold text-emerald-800 font-mono">
                {activeResult.deliveryOpt.bestDeliveryDate}
              </span>
            </div>
            <div className="flex items-baseline justify-between text-[10px]">
              <span className="text-slate-600">Optimal Departure:</span>
              <span className="font-semibold text-slate-800 font-mono">
                {activeResult.deliveryOpt.optimalDepartureDate}
              </span>
            </div>
            <div className="text-[9px] text-emerald-700 pt-1 border-t border-emerald-200/60 leading-tight">
              Window: <span className="font-bold">{activeResult.deliveryOpt.optimalDeliveryWindow}</span> (Saves {activeResult.deliveryOpt.daysSaved}d transit)
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: ROUTE WEATHER MAP (6 COLUMNS) */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-[#E4E2DC] shadow-xs flex flex-col overflow-hidden">
          {/* Map Header */}
          <div className="px-4 py-3 border-b border-[#E4E2DC] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                <Compass className="w-4 h-4 text-[#D6A63B]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#0F2747] truncate">
                  ROUTE WEATHER MAP
                </h3>
                <div className="text-[10px] text-[#68717D] truncate">
                  {getCountryFlag(activeResult.originCountry)} {activeResult.originPort} ({activeResult.originCountry}) → 🇮🇳 {activeResult.destinationPort.split(' (')[0]} (India) | {activeResult.formattedDisplayDate}
                </div>
              </div>
            </div>

            {/* Weather Layer & Unit Selectors */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative">
                <select
                  value={selectedWeatherLayer}
                  onChange={(e) => setSelectedWeatherLayer(e.target.value)}
                  className="text-[11px] font-semibold bg-[#FAF9F5] border border-[#E2E8F0] rounded-md px-2.5 py-1 text-[#0F2747] appearance-none pr-6 cursor-pointer focus:outline-none"
                >
                  <option value="Wind (kts)">Weather Layers ▾</option>
                  <option value="Wind Speed">Wind Speed (kts)</option>
                  <option value="Wave Height">Significant Wave Height</option>
                  <option value="Precipitation">Precipitation Storms</option>
                  <option value="Cloud Cover">Satellite Cloud Cover</option>
                </select>
              </div>

              <div className="relative">
                <select
                  value={windUnit}
                  onChange={(e) => setWindUnit(e.target.value)}
                  className="text-[11px] font-semibold bg-[#FAF9F5] border border-[#E2E8F0] rounded-md px-2 py-1 text-[#0F2747] appearance-none pr-5 cursor-pointer focus:outline-none"
                >
                  <option value="Wind (kts)">Wind (kts) ▾</option>
                  <option value="Wind (m/s)">Wind (m/s)</option>
                  <option value="Wind (km/h)">Wind (km/h)</option>
                </select>
              </div>

              <button
                type="button"
                className="p-1.5 rounded-md border border-[#E2E8F0] bg-[#FAF9F5] text-slate-600 hover:bg-slate-100 transition-colors"
                title="Full View"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Leaflet Maritime Route Map with Interactive Free-Pan & D-Pad Controls */}
          <div className="relative h-[350px] w-full bg-[#0A192F] overflow-hidden group">
            <MapContainer
              center={activeResult.originCoords}
              zoom={3}
              zoomControl={false}
              scrollWheelZoom={true}
              doubleClickZoom={true}
              touchZoom={true}
              dragging={true}
              className="h-full w-full z-10"
              style={{ background: '#0b1d33', cursor: 'grab' }}
            >
              {mapStyle === 'satellite' ? (
                <TileLayer
                  attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  maxZoom={12}
                />
              ) : (
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                  maxZoom={12}
                />
              )}

              {/* Dynamic Map Bounds on corridor change */}
              <MapBoundsUpdater waypoints={activeResult.waypoints} />

              {/* On-Map Interactive Navigation (Pan Left, Right, Up, Down & Zoom In/Out & Recenter) */}
              <MapPanZoomController waypoints={activeResult.waypoints} />

              {/* Dynamic Oceanic Storm & Swell Hotspot Overlays along the active route */}
              {activeResult.stormHotspots.map((spot, sIdx) => (
                <Circle
                  key={sIdx}
                  center={spot.center}
                  radius={spot.radius}
                  pathOptions={{
                    fillColor: spot.color,
                    fillOpacity: 0.25,
                    color: spot.color,
                    weight: 1.5,
                    dashArray: '4, 4',
                  }}
                >
                  <Tooltip direction="top" offset={[0, -10]}>
                    <div className="text-[10px] font-bold" style={{ color: spot.color }}>
                      {spot.label}
                      <div className="text-slate-600 font-normal">{spot.details}</div>
                    </div>
                  </Tooltip>
                </Circle>
              ))}

              {/* Voyage Route Dash Line */}
              <Polyline
                positions={activeResult.waypoints}
                pathOptions={{
                  color: '#FFFFFF',
                  weight: 3,
                  dashArray: '6, 6',
                  opacity: 0.9,
                }}
              />

              {/* Origin Port Marker */}
              <Marker
                position={activeResult.originCoords}
                icon={createPortIcon(false, activeResult.originPort)}
              >
                <Tooltip direction="top" offset={[0, -20]} permanent>
                  <span className="font-bold text-[10px] text-[#0F2747]">
                    {getCountryFlag(activeResult.originCountry)} {activeResult.originPort} ({activeResult.originCountry})
                  </span>
                </Tooltip>
              </Marker>

              {/* Destination Port Marker */}
              <Marker
                position={activeResult.destinationCoords}
                icon={createPortIcon(true, activeResult.destinationPort.split(' (')[0])}
              >
                <Tooltip direction="top" offset={[0, -20]} permanent>
                  <span className="font-bold text-[10px] text-[#0F2747]">
                    🇮🇳 {activeResult.destinationPort.split(' (')[0]} (India)
                  </span>
                </Tooltip>
              </Marker>

              {/* Floating Weather Waypoints along Route */}
              {showWaypoints &&
                activeResult.timeline.slice(1, -1).map((item) => (
                  <Marker
                    key={item.id}
                    position={item.coordinates}
                    icon={createWeatherWaypointIcon(item.weatherType)}
                  >
                    <Tooltip direction="top" offset={[0, -15]}>
                      <div className="text-[10px] font-bold text-[#0F2747]">
                        {item.name}
                        <div className="text-slate-500 font-medium">
                          {item.condition} | {item.tempC}°C | {item.windKts} kts | Waves: {item.wavesM}m
                        </div>
                      </div>
                    </Tooltip>
                  </Marker>
                ))}
            </MapContainer>

            {/* Bottom-Left Overlays: Wind Speed Color Scale */}
            <div className="absolute bottom-3 left-3 z-20 bg-white/90 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-slate-200/80 shadow-md text-[9px] text-[#0F2747]">
              <div className="font-bold mb-1">Wind Speed (kts)</div>
              <div className="flex items-center gap-1">
                <div
                  className="w-36 h-2 rounded-xs"
                  style={{
                    background: 'linear-gradient(to right, #3B82F6, #06B6D4, #10B981, #F59E0B, #EF4444, #7F1D1D)',
                  }}
                />
              </div>
              <div className="flex justify-between text-[8px] font-mono font-semibold text-slate-600 mt-0.5 w-36">
                <span>0</span>
                <span>10</span>
                <span>20</span>
                <span>30</span>
                <span>40</span>
                <span>50+</span>
              </div>
            </div>

            {/* Bottom-Right Overlays: Show Waypoints Toggle & Satellite/Map Segmented Control */}
            <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2">
              {/* Show Waypoints Toggle */}
              <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-md text-[10px] font-bold text-[#0F2747]">
                <button
                  type="button"
                  onClick={() => setShowWaypoints(!showWaypoints)}
                  className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    showWaypoints ? 'bg-[#1E65B8]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      showWaypoints ? 'translate-x-3' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="select-none text-[10px]">Show Route Waypoints</span>
              </div>

              {/* Satellite vs Map Switcher */}
              <div className="flex items-center bg-white/95 backdrop-blur-xs rounded-lg p-0.5 border border-slate-200 shadow-md text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => setMapStyle('satellite')}
                  className={`px-2 py-0.8 rounded-md transition-all cursor-pointer ${
                    mapStyle === 'satellite'
                      ? 'bg-[#0F2747] text-white shadow-xs'
                      : 'text-slate-600 hover:text-[#0F2747]'
                  }`}
                >
                  Satellite
                </button>
                <button
                  type="button"
                  onClick={() => setMapStyle('map')}
                  className={`px-2 py-0.8 rounded-md transition-all cursor-pointer ${
                    mapStyle === 'map'
                      ? 'bg-[#0F2747] text-white shadow-xs'
                      : 'text-slate-600 hover:text-[#0F2747]'
                  }`}
                >
                  Map
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ROUTE WAYPOINTS (FORECAST) (3 COLUMNS) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-[#E4E2DC] shadow-xs p-4 sm:p-5 flex flex-col">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#0F2747] pb-3 border-b border-[#E4E2DC] mb-3">
            ROUTE WAYPOINTS (FORECAST)
          </h3>

          <div className="relative pl-4 space-y-4 text-xs flex-1">
            {/* Vertical timeline connector */}
            <div className="absolute left-[7px] top-2 bottom-3 w-0.5 bg-slate-200" />

            {activeResult.timeline.map((item, idx) => {
              const Icon =
                item.weatherType === 'clear'
                  ? Sun
                  : item.weatherType === 'thunder'
                  ? CloudLightning
                  : item.weatherType === 'wind'
                  ? Wind
                  : CloudRain;

              return (
                <div key={item.id} className="relative group">
                  {/* Timeline Dot */}
                  <span
                    className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full border-2 border-white shadow-xs"
                    style={{ backgroundColor: item.dotColor }}
                  />

                  <div>
                    <div className="font-bold text-[#0F2747] text-xs leading-tight flex items-center gap-1">
                      <span>{idx === 0 ? getCountryFlag(activeResult.originCountry) : idx === activeResult.timeline.length - 1 ? '🇮🇳' : ''}</span>
                      <span>{item.name}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {item.dateStr}
                    </div>

                    <div className="mt-1 flex items-center gap-1.5 text-xs">
                      <Icon
                        className="w-3.5 h-3.5 shrink-0"
                        style={{
                          color:
                            item.weatherType === 'clear'
                              ? '#D97706'
                              : item.weatherType === 'thunder'
                              ? '#DC2626'
                              : '#2563EB',
                        }}
                      />
                      <span className="font-bold text-[#0F2747]">{item.tempC}°C</span>
                      <span className="text-slate-600 font-medium">{item.condition}</span>
                    </div>

                    <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                      Wind: <span className="font-bold text-slate-700">{item.windKts} kts</span> | Waves:{' '}
                      <span className="font-bold text-slate-700">{item.wavesM} m</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5-KPI METRIC CARDS ROW + KEY ADVISORY (FEATURING BEST DELIVERY DATE) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-stretch">
        {/* Metric 1: Total Distance */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E4E2DC] shadow-xs p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#0F2747] shrink-0">
            <Compass className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-500">Total Distance</div>
            <div className="text-lg font-black text-[#0F2747] leading-tight">
              {activeResult.distanceNm.toLocaleString()} NM
            </div>
          </div>
        </div>

        {/* Metric 2: Estimated Transit */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E4E2DC] shadow-xs p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[#0F2747] shrink-0">
            <Clock className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-500">Estimated Transit</div>
            <div className="text-lg font-black text-[#0F2747] leading-tight">
              {activeResult.transitDays} Days
            </div>
            <div className="text-[9px] text-slate-400 font-semibold">(at 13.5 kts)</div>
          </div>
        </div>

        {/* Metric 3: Best Delivery Date (Optimized ETA) */}
        <div className="lg:col-span-2 bg-emerald-50/70 rounded-xl border border-emerald-200/90 shadow-xs p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-emerald-800">Best Delivery Date</div>
            <div className="text-base font-black text-emerald-950 leading-tight">
              {activeResult.deliveryOpt.bestDeliveryDate}
            </div>
            <div className="text-[9px] text-emerald-700 font-semibold">
              Window: {activeResult.deliveryOpt.optimalDeliveryWindow}
            </div>
          </div>
        </div>

        {/* Metric 4: Weather Risk */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E4E2DC] shadow-xs p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-500">Weather Risk</div>
            <div
              className={`text-xs font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1.5 mt-0.5 ${
                activeResult.overallRisk === 'LOW'
                  ? 'bg-emerald-100 text-emerald-900'
                  : activeResult.overallRisk === 'MODERATE'
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-red-100 text-red-900'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  activeResult.overallRisk === 'LOW'
                    ? 'bg-emerald-500'
                    : activeResult.overallRisk === 'MODERATE'
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
              />
              <span>{activeResult.overallRisk}</span>
            </div>
          </div>
        </div>

        {/* Key Advisory & Best Delivery Route Guidance */}
        <div className="lg:col-span-4 bg-[#F0F7FF] rounded-xl border border-[#BFDBFE] p-3.5 flex items-start gap-3 shadow-xs">
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-[#1E65B8] shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#0F2747] flex items-center gap-2">
              <span>Key Advisory & Delivery Timing</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-[#1E65B8]">
                {activeResult.deliveryOpt.confidenceScore}% Confidence
              </span>
            </div>
            <p className="text-xs text-[#1E3A8A] mt-0.5 leading-relaxed">
              {activeResult.advisoryText}{' '}
              <span className="font-semibold text-[#0F2747] block mt-0.5">
                Optimal Departure: {activeResult.deliveryOpt.optimalDepartureDate} ➔ Best Delivery: {activeResult.deliveryOpt.bestDeliveryDate} ({activeResult.deliveryOpt.daysSaved}d faster).
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* BOTTOM SECTION: DAILY ROUTE FORECAST (TABLE & CHART VIEWS) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-xl border border-[#E4E2DC] shadow-xs overflow-hidden">
        {/* Card Header with View Toggle */}
        <div className="px-5 py-3.5 border-b border-[#E4E2DC] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#D6A63B]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-[#0F2747]">
              DAILY ROUTE FORECAST (SELECTED DATE RANGE)
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold text-[11px]">View:</span>
            <div className="flex items-center bg-[#FAF9F5] p-0.5 rounded-lg border border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setBottomView('table')}
                className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  bottomView === 'table'
                    ? 'bg-white text-[#0F2747] shadow-xs border border-[#E2E8F0]'
                    : 'text-slate-500 hover:text-[#0F2747]'
                }`}
              >
                Table
              </button>
              <button
                type="button"
                onClick={() => setBottomView('chart')}
                className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                  bottomView === 'chart'
                    ? 'bg-white text-[#0F2747] shadow-xs border border-[#E2E8F0]'
                    : 'text-slate-500 hover:text-[#0F2747]'
                }`}
              >
                Chart
              </button>
            </div>
          </div>
        </div>

        {/* Content: Table or Chart */}
        {bottomView === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F5] border-b border-[#E4E2DC] text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Position (Approx.)</th>
                  <th className="py-3 px-4">Weather Condition</th>
                  <th className="py-3 px-4">Temperature</th>
                  <th className="py-3 px-4">Wind (kts)</th>
                  <th className="py-3 px-4">Waves (m)</th>
                  <th className="py-3 px-4">Precipitation</th>
                  <th className="py-3 px-4">Visibility</th>
                  <th className="py-3 px-4">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1EFE9] text-[#0F2747] font-medium">
                {activeResult.dailyForecast.map((row, i) => (
                  <tr
                    key={i}
                    className={`transition-colors ${
                      row.isArrival ? 'bg-emerald-50/50 hover:bg-emerald-50/80 font-bold' : 'hover:bg-[#FAF9F5]'
                    }`}
                  >
                    <td className="py-3 px-4 font-bold text-slate-800 whitespace-nowrap flex items-center gap-1.5">
                      {row.isArrival && <span title="Target Delivery Arrival">🏆</span>}
                      <span>{row.date}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {row.position}
                      {row.isArrival && (
                        <span className="ml-2 text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                          Best Delivery Window
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getWeatherIcon(row.condition)}
                        <span>{row.condition}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold">{row.tempC}°C</td>
                    <td className="py-3 px-4 font-mono font-semibold">{row.windKts}</td>
                    <td className="py-3 px-4 font-mono font-semibold">{row.wavesM}</td>
                    <td className="py-3 px-4 text-slate-600">{row.precipMm} mm</td>
                    <td className="py-3 px-4 text-slate-600">{row.visibility}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.risk === 'Low'
                            ? 'bg-emerald-50 text-emerald-700'
                            : row.risk === 'Moderate'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            row.risk === 'Low'
                              ? 'bg-emerald-500'
                              : row.risk === 'Moderate'
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                        />
                        <span>{row.risk}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5">
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={activeResult.dailyForecast}
                  margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    tickMargin={8}
                  />
                  <YAxis
                    yAxisId="left"
                    orientation="left"
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    label={{ value: 'Wind (kts) / Temp (°C)', angle: -90, position: 'insideLeft', fill: '#64748B', fontSize: 10 }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    label={{ value: 'Significant Waves (m)', angle: 90, position: 'insideRight', fill: '#64748B', fontSize: 10 }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      fontSize: '11px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="windKts"
                    name="Wind Speed (kts)"
                    fill="#93C5FD"
                    stroke="#1E65B8"
                    fillOpacity={0.4}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="wavesM"
                    name="Wave Height (m)"
                    stroke="#EF4444"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="tempC"
                    name="Temperature (°C)"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 2 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
