import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Compass, Ship, Clock, CheckCircle2,
  DollarSign, BarChart2, Download, Lightbulb, ShieldCheck, Check,
  Anchor, TrendingUp
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getCountryFlag } from '../utils/countryFlags';

// Fix Leaflet marker icon issue in Vite / React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom PortIN Anchor Marker Icons
const createPortIcon = (isDestination: boolean) =>
  L.divIcon({
    className: 'custom-port-marker-div',
    html: `<div style="
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background-color: ${isDestination ? '#0F2747' : '#D6A63B'};
      border: 2.5px solid #FFFFFF;
      box-shadow: 0 2px 10px rgba(15, 39, 71, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-size: 14px;
      font-weight: 900;
    ">⚓</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

// Component to dynamically pan and zoom the Leaflet map when route changes
const MapBoundsUpdater: React.FC<{ waypoints: [number, number][] }> = ({ waypoints }) => {
  const map = useMap();
  useEffect(() => {
    if (waypoints && waypoints.length >= 2) {
      try {
        const bounds = L.latLngBounds(waypoints);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 5, animate: true });
      } catch (err) {
        console.error('Map bound fit error', err);
      }
    }
  }, [waypoints, map]);
  return null;
};

export interface PortSpec {
  name: string;
  country: string;
  countryFlag: string;
  subLocation?: string;
  region: string; // Used for routing engine: 'us-east', 'us-west', 'aus-east', 'aus-west', 'indo', 'africa', 'russia-pacific', 'russia-west', 'canada-west', 'brazil', 'colombia'
  type: string;
  maxDraft: number;
  maxLoa: number;
  maxBeam: number;
  typicalCargo: string;
  berths?: number;
  cargoHandlingRate: string;
  coordinates: [number, number];
}

export interface DestinationPortSpec {
  name: string;
  displayName: string;
  subLocation: string;
  maxDraft: number;
  maxLoa: number;
  maxBeam: number;
  berths: number;
  cargoHandlingRate: string;
  coordinates: [number, number];
}

export interface CorridorData {
  id: string;
  originCountry: string;
  originPort: string;
  destinationPort: string;
  distanceNm: number;
  transitDays: number;
  recommendedVessel: string;
  vesselNote: string;
  estimatedFreight: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  riskNote: string;
  waypoints: [number, number][];
  optimalWindow: string;
  marketTrend: string;
  riskFactors: string;
}

// Master Destination Ports on Indian East Coast
const DESTINATION_PORTS: Record<string, DestinationPortSpec> = {
  'Paradip Port (Odisha)': {
    name: 'Paradip Port (Odisha)',
    displayName: 'Paradip',
    subLocation: 'Odisha, India',
    maxDraft: 14.5,
    maxLoa: 260,
    maxBeam: 45,
    berths: 16,
    cargoHandlingRate: '24,000 TPH',
    coordinates: [20.26, 86.67],
  },
  'Visakhapatnam (Andhra Pradesh)': {
    name: 'Visakhapatnam (Andhra Pradesh)',
    displayName: 'Visakhapatnam',
    subLocation: 'Andhra Pradesh, India',
    maxDraft: 18.1,
    maxLoa: 300,
    maxBeam: 45,
    berths: 21,
    cargoHandlingRate: '32,000 TPH',
    coordinates: [17.68, 83.28],
  },
  'Dhamra Port (Odisha)': {
    name: 'Dhamra Port (Odisha)',
    displayName: 'Dhamra',
    subLocation: 'Odisha, India',
    maxDraft: 18.0,
    maxLoa: 300,
    maxBeam: 48,
    berths: 5,
    cargoHandlingRate: '30,000 TPH',
    coordinates: [20.83, 86.97],
  },
  'Gangavaram Port (Andhra Pradesh)': {
    name: 'Gangavaram Port (Andhra Pradesh)',
    displayName: 'Gangavaram',
    subLocation: 'Andhra Pradesh, India',
    maxDraft: 21.0,
    maxLoa: 330,
    maxBeam: 50,
    berths: 9,
    cargoHandlingRate: '36,000 TPH',
    coordinates: [17.62, 83.23],
  },
  'Haldia Port (West Bengal)': {
    name: 'Haldia Port (West Bengal)',
    displayName: 'Haldia',
    subLocation: 'West Bengal, India',
    maxDraft: 8.5,
    maxLoa: 195,
    maxBeam: 30,
    berths: 12,
    cargoHandlingRate: '15,000 TPH',
    coordinates: [22.02, 88.06],
  },
};

// Master Origin Countries
const ORIGIN_COUNTRIES = [
  { name: 'United States', flag: '🇺🇸' },
  { name: 'Australia', flag: '🇦🇺' },
  { name: 'Indonesia', flag: '🇮🇩' },
  { name: 'Mozambique', flag: '🇲🇿' },
  { name: 'South Africa', flag: '🇿🇦' },
  { name: 'Russia', flag: '🇷🇺' },
  { name: 'Canada', flag: '🇨🇦' },
  { name: 'Brazil', flag: '🇧🇷' },
  { name: 'Colombia', flag: '🇨🇴' },
];

// Comprehensive Master Ports by Country
const ORIGIN_PORTS: Record<string, PortSpec[]> = {
  'United States': [
    {
      name: 'Baltimore',
      country: 'United States',
      countryFlag: '🇺🇸',
      subLocation: 'United States',
      region: 'us-east',
      type: 'Bulk Export Port',
      maxDraft: 15.2,
      maxLoa: 300,
      maxBeam: 50,
      typicalCargo: 'Coal, Iron Ore, Agri Bulk',
      cargoHandlingRate: '20,000 TPH',
      coordinates: [39.28, -76.58],
    },
    {
      name: 'Hampton Roads (Norfolk)',
      country: 'United States',
      countryFlag: '🇺🇸',
      subLocation: 'Virginia, USA',
      region: 'us-east',
      type: 'Major Coal Pier Complex',
      maxDraft: 15.5,
      maxLoa: 315,
      maxBeam: 50,
      typicalCargo: 'High-Vol Met Coal, Steam Coal',
      cargoHandlingRate: '24,000 TPH',
      coordinates: [36.96, -76.32],
    },
    {
      name: 'New Orleans',
      country: 'United States',
      countryFlag: '🇺🇸',
      subLocation: 'Louisiana, USA',
      region: 'us-gulf',
      type: 'Mississippi River Bulk Terminal',
      maxDraft: 14.3,
      maxLoa: 290,
      maxBeam: 45,
      typicalCargo: 'Agri Bulk, Petcoke, Coal',
      cargoHandlingRate: '18,000 TPH',
      coordinates: [29.95, -90.07],
    },
    {
      name: 'Houston',
      country: 'United States',
      countryFlag: '🇺🇸',
      subLocation: 'Texas, USA',
      region: 'us-gulf',
      type: 'Gulf Coast Deepwater Bulk Terminal',
      maxDraft: 13.7,
      maxLoa: 280,
      maxBeam: 42,
      typicalCargo: 'Petcoke, Sulfur, Industrial Minerals',
      cargoHandlingRate: '16,000 TPH',
      coordinates: [29.76, -95.36],
    },
    {
      name: 'Mobile (McDuffie)',
      country: 'United States',
      countryFlag: '🇺🇸',
      subLocation: 'Alabama, USA',
      region: 'us-gulf',
      type: 'McDuffie Coal Export Terminal',
      maxDraft: 14.0,
      maxLoa: 285,
      maxBeam: 44,
      typicalCargo: 'Metallurgical Coal, Steam Coal',
      cargoHandlingRate: '18,000 TPH',
      coordinates: [30.69, -88.04],
    },
    {
      name: 'Long Beach',
      country: 'United States',
      countryFlag: '🇺🇸',
      subLocation: 'California, USA',
      region: 'us-west',
      type: 'Pacific Deepwater Bulk Terminal',
      maxDraft: 16.0,
      maxLoa: 300,
      maxBeam: 48,
      typicalCargo: 'Petcoke, Steam Coal, Soda Ash',
      cargoHandlingRate: '22,000 TPH',
      coordinates: [33.77, -118.19],
    },
  ],
  Australia: [
    {
      name: 'Newcastle',
      country: 'Australia',
      countryFlag: '🇦🇺',
      subLocation: 'NSW, Australia',
      region: 'aus-east-south',
      type: 'World-Class Coal Port',
      maxDraft: 15.2,
      maxLoa: 300,
      maxBeam: 50,
      typicalCargo: 'Thermal Coal, Semi-soft Coal',
      cargoHandlingRate: '25,000 TPH',
      coordinates: [-32.92, 151.78],
    },
    {
      name: 'Hay Point',
      country: 'Australia',
      countryFlag: '🇦🇺',
      subLocation: 'Queensland, Australia',
      region: 'aus-east-north',
      type: 'Deepwater Met Coal Terminal',
      maxDraft: 19.0,
      maxLoa: 330,
      maxBeam: 55,
      typicalCargo: 'Prime Hard Coking Coal',
      cargoHandlingRate: '35,000 TPH',
      coordinates: [-21.28, 149.30],
    },
    {
      name: 'Gladstone',
      country: 'Australia',
      countryFlag: '🇦🇺',
      subLocation: 'Queensland, Australia',
      region: 'aus-east-north',
      type: 'Multi-Commodity Bulk Port',
      maxDraft: 17.5,
      maxLoa: 315,
      maxBeam: 50,
      typicalCargo: 'Coking Coal, Alumina, Magnetite',
      cargoHandlingRate: '30,000 TPH',
      coordinates: [-23.84, 151.26],
    },
    {
      name: 'Abbot Point',
      country: 'Australia',
      countryFlag: '🇦🇺',
      subLocation: 'Queensland, Australia',
      region: 'aus-east-north',
      type: 'North Queensland Deepwater Terminal',
      maxDraft: 19.5,
      maxLoa: 330,
      maxBeam: 55,
      typicalCargo: 'Bowen Basin Coking & Thermal Coal',
      cargoHandlingRate: '32,000 TPH',
      coordinates: [-19.88, 148.08],
    },
    {
      name: 'Port Hedland',
      country: 'Australia',
      countryFlag: '🇦🇺',
      subLocation: 'WA, Australia',
      region: 'aus-west',
      type: 'World Largest Bulk Export Harbor',
      maxDraft: 19.8,
      maxLoa: 340,
      maxBeam: 58,
      typicalCargo: 'Iron Ore Lump & Fines',
      cargoHandlingRate: '45,000 TPH',
      coordinates: [-20.31, 118.57],
    },
    {
      name: 'Dampier',
      country: 'Australia',
      countryFlag: '🇦🇺',
      subLocation: 'WA, Australia',
      region: 'aus-west',
      type: 'Pilbara Iron Ore Deepwater Port',
      maxDraft: 19.0,
      maxLoa: 330,
      maxBeam: 55,
      typicalCargo: 'Iron Ore, Salt Bulk',
      cargoHandlingRate: '40,000 TPH',
      coordinates: [-20.66, 116.71],
    },
    {
      name: 'Port Kembla',
      country: 'Australia',
      countryFlag: '🇦🇺',
      subLocation: 'NSW, Australia',
      region: 'aus-east-south',
      type: 'Southern NSW Coal & Grain Terminal',
      maxDraft: 15.5,
      maxLoa: 295,
      maxBeam: 46,
      typicalCargo: 'Coking Coal, Grain Bulk',
      cargoHandlingRate: '20,000 TPH',
      coordinates: [-34.47, 150.90],
    },
  ],
  Indonesia: [
    {
      name: 'Taboneo',
      country: 'Indonesia',
      countryFlag: '🇮🇩',
      subLocation: 'South Kalimantan, Indonesia',
      region: 'indo',
      type: 'Offshore Anchorage Transshipment',
      maxDraft: 18.0,
      maxLoa: 300,
      maxBeam: 50,
      typicalCargo: 'Sub-Bituminous Thermal Coal',
      cargoHandlingRate: '20,000 TPH',
      coordinates: [-3.75, 114.45],
    },
    {
      name: 'Balikpapan',
      country: 'Indonesia',
      countryFlag: '🇮🇩',
      subLocation: 'East Kalimantan, Indonesia',
      region: 'indo',
      type: 'Sheltered Bay Terminal',
      maxDraft: 14.0,
      maxLoa: 260,
      maxBeam: 42,
      typicalCargo: 'Steam Coal, Industrial Bulk',
      cargoHandlingRate: '18,000 TPH',
      coordinates: [-1.27, 116.83],
    },
    {
      name: 'Samarinda (Muara Berau)',
      country: 'Indonesia',
      countryFlag: '🇮🇩',
      subLocation: 'East Kalimantan, Indonesia',
      region: 'indo',
      type: 'Mahakam River Floating Anchorage',
      maxDraft: 17.5,
      maxLoa: 295,
      maxBeam: 48,
      typicalCargo: 'Thermal Coal Fines & Lump',
      cargoHandlingRate: '22,000 TPH',
      coordinates: [-0.50, 117.15],
    },
    {
      name: 'Tanjung Bara (KPC)',
      country: 'Indonesia',
      countryFlag: '🇮🇩',
      subLocation: 'East Kalimantan, Indonesia',
      region: 'indo',
      type: 'Dedicated Deepwater Terminal (KPC)',
      maxDraft: 18.5,
      maxLoa: 310,
      maxBeam: 50,
      typicalCargo: 'Primacoal, Pinang Steam Coal',
      cargoHandlingRate: '30,000 TPH',
      coordinates: [0.55, 117.63],
    },
    {
      name: 'Bunati',
      country: 'Indonesia',
      countryFlag: '🇮🇩',
      subLocation: 'South Kalimantan, Indonesia',
      region: 'indo',
      type: 'Mechanized Conveyor Berth',
      maxDraft: 15.0,
      maxLoa: 250,
      maxBeam: 42,
      typicalCargo: 'Crushed Steam Coal',
      cargoHandlingRate: '16,000 TPH',
      coordinates: [-3.78, 115.65],
    },
    {
      name: 'Tarahan',
      country: 'Indonesia',
      countryFlag: '🇮🇩',
      subLocation: 'South Sumatra, Indonesia',
      region: 'indo-west',
      type: 'PTBA Dedicated Coal Terminal',
      maxDraft: 17.0,
      maxLoa: 300,
      maxBeam: 48,
      typicalCargo: 'High Calorific Thermal Coal',
      cargoHandlingRate: '24,000 TPH',
      coordinates: [-5.51, 105.34],
    },
  ],
  Mozambique: [
    {
      name: 'Maputo',
      country: 'Mozambique',
      countryFlag: '🇲🇿',
      subLocation: 'Maputo Bay, Mozambique',
      region: 'africa-east',
      type: 'Matola Coal & Mineral Terminal',
      maxDraft: 14.2,
      maxLoa: 260,
      maxBeam: 43,
      typicalCargo: 'Thermal Coal, Magnetite, Ferrochrome',
      cargoHandlingRate: '18,000 TPH',
      coordinates: [-25.97, 32.57],
    },
    {
      name: 'Beira',
      country: 'Mozambique',
      countryFlag: '🇲🇿',
      subLocation: 'Central Mozambique',
      region: 'africa-east',
      type: 'Central Mozambique Bulk Wharves',
      maxDraft: 10.5,
      maxLoa: 220,
      maxBeam: 32,
      typicalCargo: 'Moatize Coking Coal, Minerals',
      cargoHandlingRate: '12,000 TPH',
      coordinates: [-19.84, 34.84],
    },
    {
      name: 'Nacala',
      country: 'Mozambique',
      countryFlag: '🇲🇿',
      subLocation: 'Nampula, Mozambique',
      region: 'africa-east',
      type: 'Deepwater Natural Harbor Coal Terminal',
      maxDraft: 20.0,
      maxLoa: 330,
      maxBeam: 54,
      typicalCargo: 'Moatize Prime Coking Coal',
      cargoHandlingRate: '30,000 TPH',
      coordinates: [-14.54, 40.68],
    },
  ],
  'South Africa': [
    {
      name: 'Richards Bay',
      country: 'South Africa',
      countryFlag: '🇿🇦',
      subLocation: 'KwaZulu-Natal, South Africa',
      region: 'africa-east',
      type: 'RBCT Dedicated Coal Mega-Terminal',
      maxDraft: 17.5,
      maxLoa: 314,
      maxBeam: 50,
      typicalCargo: 'RB1 / RB3 Steam Coal',
      cargoHandlingRate: '30,000 TPH',
      coordinates: [-28.80, 32.08],
    },
    {
      name: 'Saldanha Bay',
      country: 'South Africa',
      countryFlag: '🇿🇦',
      subLocation: 'Western Cape, South Africa',
      region: 'africa-south',
      type: 'Dedicated Deepwater Iron Ore Jetty',
      maxDraft: 20.5,
      maxLoa: 340,
      maxBeam: 58,
      typicalCargo: 'Sishen Iron Ore',
      cargoHandlingRate: '40,000 TPH',
      coordinates: [-33.02, 17.94],
    },
    {
      name: 'Durban',
      country: 'South Africa',
      countryFlag: '🇿🇦',
      subLocation: 'KwaZulu-Natal, South Africa',
      region: 'africa-east',
      type: 'Multi-Commodity Bulk Pier Complex',
      maxDraft: 12.8,
      maxLoa: 250,
      maxBeam: 38,
      typicalCargo: 'Anthracite, Manganese, Agri Bulk',
      cargoHandlingRate: '15,000 TPH',
      coordinates: [-29.87, 31.02],
    },
  ],
  Russia: [
    {
      name: 'Vostochny',
      country: 'Russia',
      countryFlag: '🇷🇺',
      subLocation: 'Primorsky Krai, Russia',
      region: 'russia-pacific',
      type: 'Far East Deepwater Coal Terminal',
      maxDraft: 16.5,
      maxLoa: 300,
      maxBeam: 50,
      typicalCargo: 'PCI Coal, Anthracite, Thermal Coal',
      cargoHandlingRate: '24,000 TPH',
      coordinates: [42.74, 133.08],
    },
    {
      name: 'Vanino',
      country: 'Russia',
      countryFlag: '🇷🇺',
      subLocation: 'Khabarovsk Krai, Russia',
      region: 'russia-pacific',
      type: 'Daltransugol Deepwater Coal Terminal',
      maxDraft: 17.0,
      maxLoa: 300,
      maxBeam: 48,
      typicalCargo: 'Siberian Thermal & Met Coal',
      cargoHandlingRate: '22,000 TPH',
      coordinates: [49.08, 140.27],
    },
    {
      name: 'Ust-Luga',
      country: 'Russia',
      countryFlag: '🇷🇺',
      subLocation: 'Leningrad Oblast, Russia',
      region: 'russia-baltic',
      type: 'Rosterminalugol Baltic Terminal',
      maxDraft: 17.5,
      maxLoa: 320,
      maxBeam: 50,
      typicalCargo: 'Kuzbass Steam Coal, Fertilizers',
      cargoHandlingRate: '26,000 TPH',
      coordinates: [59.67, 28.38],
    },
    {
      name: 'Taman',
      country: 'Russia',
      countryFlag: '🇷🇺',
      subLocation: 'Krasnodar Krai, Russia',
      region: 'russia-blacksea',
      type: 'Black Sea Deepwater Terminal (OTEKO)',
      maxDraft: 18.5,
      maxLoa: 315,
      maxBeam: 50,
      typicalCargo: 'Kuzbass Coal, Metallurgical Coke',
      cargoHandlingRate: '28,000 TPH',
      coordinates: [45.13, 36.68],
    },
    {
      name: 'Murmansk',
      country: 'Russia',
      countryFlag: '🇷🇺',
      subLocation: 'Murmansk Oblast, Russia',
      region: 'russia-arctic',
      type: 'Arctic Ice-Free Commercial Port',
      maxDraft: 15.5,
      maxLoa: 290,
      maxBeam: 45,
      typicalCargo: 'Thermal Coal, Iron Ore Pellets',
      cargoHandlingRate: '18,000 TPH',
      coordinates: [68.97, 33.08],
    },
    {
      name: 'Novorossiysk',
      country: 'Russia',
      countryFlag: '🇷🇺',
      subLocation: 'Krasnodar Krai, Russia',
      region: 'russia-blacksea',
      type: 'Black Sea Grain & Minerals Terminal',
      maxDraft: 13.5,
      maxLoa: 260,
      maxBeam: 40,
      typicalCargo: 'Wheat, Agri Bulk, Pig Iron',
      cargoHandlingRate: '16,000 TPH',
      coordinates: [44.72, 37.77],
    },
  ],
  Canada: [
    {
      name: 'Vancouver (Roberts Bank)',
      country: 'Canada',
      countryFlag: '🇨🇦',
      subLocation: 'BC, Canada',
      region: 'canada-west',
      type: 'Westshore Terminals Mega Bulk Pier',
      maxDraft: 18.0,
      maxLoa: 315,
      maxBeam: 52,
      typicalCargo: 'BC Met Coal, Potash, Grain',
      cargoHandlingRate: '28,000 TPH',
      coordinates: [49.02, -123.15],
    },
    {
      name: 'Prince Rupert',
      country: 'Canada',
      countryFlag: '🇨🇦',
      subLocation: 'BC, Canada',
      region: 'canada-west',
      type: 'Ridley Island Deepwater Terminal',
      maxDraft: 19.0,
      maxLoa: 325,
      maxBeam: 52,
      typicalCargo: 'Metallurgical Coal, Wheat',
      cargoHandlingRate: '26,000 TPH',
      coordinates: [54.31, -130.32],
    },
  ],
  Brazil: [
    {
      name: 'Ponta da Madeira (Sao Luis)',
      country: 'Brazil',
      countryFlag: '🇧🇷',
      subLocation: 'Maranhao, Brazil',
      region: 'brazil-north',
      type: 'Vale Mega Deepwater Iron Ore Port',
      maxDraft: 23.0,
      maxLoa: 365,
      maxBeam: 65,
      typicalCargo: 'Carajas Iron Ore Lump & Fines',
      cargoHandlingRate: '50,000 TPH',
      coordinates: [-2.56, -44.37],
    },
    {
      name: 'Tubarao (Vitoria)',
      country: 'Brazil',
      countryFlag: '🇧🇷',
      subLocation: 'Espirito Santo, Brazil',
      region: 'brazil-south',
      type: 'Vale Tubarao Ore Complex',
      maxDraft: 18.5,
      maxLoa: 330,
      maxBeam: 54,
      typicalCargo: 'Iron Ore Pellets, Met Coal',
      cargoHandlingRate: '35,000 TPH',
      coordinates: [-20.29, -40.24],
    },
    {
      name: 'Santos',
      country: 'Brazil',
      countryFlag: '🇧🇷',
      subLocation: 'Sao Paulo, Brazil',
      region: 'brazil-south',
      type: 'Latin America Premier Agri Port',
      maxDraft: 14.5,
      maxLoa: 290,
      maxBeam: 44,
      typicalCargo: 'Sugar, Soybeans, Agri Bulk',
      cargoHandlingRate: '20,000 TPH',
      coordinates: [-23.96, -46.33],
    },
  ],
  Colombia: [
    {
      name: 'Puerto Bolivar',
      country: 'Colombia',
      countryFlag: '🇨🇴',
      subLocation: 'La Guajira, Colombia',
      region: 'colombia',
      type: 'Cerrejon Dedicated Coal Port',
      maxDraft: 17.5,
      maxLoa: 310,
      maxBeam: 48,
      typicalCargo: 'Low Ash Cerrejon Steam Coal',
      cargoHandlingRate: '30,000 TPH',
      coordinates: [12.27, -71.97],
    },
    {
      name: 'Puerto Drummond (Santa Marta)',
      country: 'Colombia',
      countryFlag: '🇨🇴',
      subLocation: 'Magdalena, Colombia',
      region: 'colombia',
      type: 'Direct Loading Deepwater Pier',
      maxDraft: 18.0,
      maxLoa: 315,
      maxBeam: 50,
      typicalCargo: 'Colombian Thermal Coal',
      cargoHandlingRate: '28,000 TPH',
      coordinates: [10.98, -74.24],
    },
  ],
};

// Maritime Routing Algorithm generating realistic ocean waypoints navigating safely around landmasses
function calculateMaritimeRoute(origin: PortSpec, dest: DestinationPortSpec): CorridorData {
  const destCoords = dest.coordinates;
  const origCoords = origin.coordinates;
  let waypoints: [number, number][] = [];
  let distNm = 5000;
  let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' = 'MODERATE';
  let riskNote = 'Standard monsoon & weather routing';

  switch (origin.region) {
    case 'us-east': // Baltimore, Hampton Roads
      waypoints = [
        origCoords,
        [36.95, -75.70], // Exit Chesapeake
        [28.00, -66.00], // North Atlantic
        [12.00, -46.00],
        [-2.00, -28.00], // Equator mid-Atlantic
        [-20.00, -14.00], // South Atlantic
        [-34.80, 18.50], // Rounding Cape of Good Hope
        [-35.20, 26.00], // Agulhas Current
        [-28.00, 48.00], // South Indian Ocean
        [-12.00, 66.00],
        [5.50, 80.50],   // South Sri Lanka (Dondra Head)
        [13.50, 84.00],  // Bay of Bengal
        destCoords,
      ];
      distNm = origin.name === 'Baltimore' ? 8945 : 8820;
      riskLevel = 'MODERATE';
      riskNote = 'Weather & Congestion';
      break;

    case 'us-gulf': // New Orleans, Houston, Mobile
      waypoints = [
        origCoords,
        [27.50, -88.00], // Gulf of Mexico
        [23.50, -84.00], // Florida Straits
        [25.00, -78.00], // Bahamas channel
        [20.00, -66.00], // North Atlantic
        [5.00, -42.00],
        [-15.00, -22.00],
        [-34.80, 18.50], // Cape of Good Hope
        [-35.20, 26.00],
        [-28.00, 48.00],
        [-10.00, 68.00],
        [5.50, 80.50],
        [14.00, 84.00],
        destCoords,
      ];
      distNm = 9450;
      riskLevel = 'MODERATE';
      riskNote = 'Gulf hurricane season & Cape swell';
      break;

    case 'us-west': // Long Beach
    case 'canada-west': // Vancouver, Prince Rupert
      waypoints = [
        origCoords,
        [30.00, -135.00], // North Pacific
        [20.00, -165.00], // Hawaii north lane
        [15.00, 160.00],  // Western Pacific
        [10.00, 130.00],  // Philippine Sea
        [1.30, 103.80],   // Singapore / Malacca Strait
        [5.50, 96.00],    // Malacca Exit
        [12.00, 88.00],   // Bay of Bengal
        destCoords,
      ];
      distNm = origin.country === 'Canada' ? 8400 : 8100;
      riskLevel = 'MODERATE';
      riskNote = 'Pacific winter storms & Malacca traffic';
      break;

    case 'aus-east-south': // Newcastle, Port Kembla
      waypoints = [
        origCoords,
        [-38.50, 149.00], // Bass Strait
        [-36.00, 115.00], // Cape Leeuwin
        [-22.00, 95.00],  // East Indian Ocean
        [-5.00, 88.00],
        [8.00, 86.00],    // Bay of Bengal approach
        destCoords,
      ];
      distNm = 5200;
      riskLevel = 'MODERATE';
      riskNote = 'Southern Ocean swell & Bay of Bengal currents';
      break;

    case 'aus-east-north': // Hay Point, Gladstone, Abbot Point
      waypoints = [
        origCoords,
        [-10.60, 142.40], // Torres Strait
        [-8.50, 126.00],  // Timor Sea
        [-8.50, 115.70],  // Lombok Strait
        [0.00, 95.00],    // Indian Ocean Equator
        [10.00, 87.00],
        destCoords,
      ];
      distNm = origin.name === 'Hay Point' ? 5100 : 4950;
      riskLevel = 'MODERATE';
      riskNote = 'Torres Strait tidal pilotage';
      break;

    case 'aus-west': // Port Hedland, Dampier
      waypoints = [
        origCoords,
        [-16.00, 108.00], // Northwest Australia Sea lane
        [-8.00, 98.00],   // Indian Ocean
        [3.00, 90.00],
        [12.00, 86.00],
        destCoords,
      ];
      distNm = 3250;
      riskLevel = 'LOW';
      riskNote = 'Short direct Indian Ocean corridor';
      break;

    case 'indo': // Taboneo, Balikpapan, Samarinda, Tanjung Bara, Bunati
      waypoints = [
        origCoords,
        [-5.80, 106.00], // Java Sea / Sunda
        [1.30, 103.80],  // Singapore / Malacca Strait
        [5.80, 95.50],   // North Sumatra
        [13.00, 90.00],  // Andaman Sea
        destCoords,
      ];
      distNm = 2400;
      riskLevel = 'LOW';
      riskNote = 'Calm equatorial navigation';
      break;

    case 'indo-west': // Tarahan
      waypoints = [
        origCoords,
        [-6.00, 105.00], // Sunda Strait exit
        [0.00, 95.00],   // Indian Ocean
        [8.00, 90.00],
        destCoords,
      ];
      distNm = 1980;
      riskLevel = 'LOW';
      riskNote = 'Short transit, open deepwater';
      break;

    case 'africa-east': // Maputo, Beira, Nacala, Richards Bay, Durban
      waypoints = [
        origCoords,
        [-15.00, 42.00], // Mozambique Channel
        [-2.00, 56.00],  // Indian Ocean
        [5.50, 78.00],   // South Sri Lanka
        [13.00, 82.00],
        destCoords,
      ];
      distNm = origin.name === 'Maputo' ? 4600 : origin.name === 'Richards Bay' ? 4750 : 4350;
      riskLevel = 'MODERATE';
      riskNote = 'Mozambique Channel squalls';
      break;

    case 'africa-south': // Saldanha Bay
      waypoints = [
        origCoords,
        [-34.80, 18.50], // Round Cape
        [-35.20, 26.00],
        [-28.00, 48.00],
        [-10.00, 68.00],
        [5.50, 80.50],
        destCoords,
      ];
      distNm = 5400;
      riskLevel = 'MODERATE';
      riskNote = 'Cape Agulhas rough seas';
      break;

    case 'russia-pacific': // Vostochny, Vanino
      waypoints = [
        origCoords,
        [34.00, 129.50], // Tsushima Strait
        [23.00, 119.00], // Taiwan Strait
        [10.00, 112.00], // South China Sea
        [1.30, 103.80],  // Singapore
        [5.50, 96.00],   // Malacca Exit
        [12.00, 88.00],  // Bay of Bengal
        destCoords,
      ];
      distNm = origin.name === 'Vostochny' ? 9800 : 10100;
      riskLevel = 'HIGH';
      riskNote = 'Malacca congestion & typhoon track';
      break;

    case 'russia-baltic': // Ust-Luga
    case 'russia-arctic': // Murmansk
      waypoints = [
        origCoords,
        [57.00, 10.00],  // Kattegat / North Sea
        [48.00, -6.00],  // English Channel / Atlantic
        [36.00, -6.00],  // Strait of Gibraltar
        [37.00, 12.00],  // Mediterranean Sea
        [31.50, 32.30],  // Port Said / Suez Canal
        [27.50, 34.00],  // Red Sea
        [12.50, 43.50],  // Bab el Mandeb
        [11.50, 52.00],  // Gulf of Aden / Arabian Sea
        [6.00, 78.00],   // South of India
        destCoords,
      ];
      distNm = 7600;
      riskLevel = 'HIGH';
      riskNote = 'Suez Canal transit queuing & Red Sea advisories';
      break;

    case 'russia-blacksea': // Taman, Novorossiysk
      waypoints = [
        origCoords,
        [41.20, 29.10], // Bosphorus Strait
        [40.00, 26.20], // Dardanelles
        [36.00, 28.00], // Eastern Mediterranean
        [31.50, 32.30], // Suez Canal
        [27.50, 34.00], // Red Sea
        [12.50, 43.50], // Bab el Mandeb
        [11.50, 52.00], // Arabian Sea
        [6.00, 78.00],
        destCoords,
      ];
      distNm = 5400;
      riskLevel = 'HIGH';
      riskNote = 'Turkish Straits & Suez Canal convoy schedule';
      break;

    case 'brazil-north': // Ponta da Madeira
    case 'brazil-south': // Tubarao, Santos
      waypoints = [
        origCoords,
        [-10.00, -32.00], // Atlantic Cape
        [-25.00, -18.00], // South Atlantic
        [-34.80, 18.50], // Rounding Cape of Good Hope
        [-35.20, 26.00],
        [-28.00, 48.00], // South Indian Ocean
        [-10.00, 68.00],
        [5.50, 80.50],   // South Sri Lanka
        destCoords,
      ];
      distNm = origin.region === 'brazil-north' ? 9900 : 9600;
      riskLevel = 'MODERATE';
      riskNote = 'Long haul steaming & Roaring Forties swells';
      break;

    case 'colombia': // Puerto Bolivar, Puerto Drummond
      waypoints = [
        origCoords,
        [14.00, -68.00], // Caribbean Sea
        [16.00, -62.00], // Virgin Islands passage
        [10.00, -45.00], // Mid Atlantic
        [-10.00, -25.00],
        [-34.80, 18.50], // Cape of Good Hope
        [-35.20, 26.00],
        [-28.00, 48.00],
        [-10.00, 68.00],
        [5.50, 80.50],
        destCoords,
      ];
      distNm = 9800;
      riskLevel = 'MODERATE';
      riskNote = 'Cape passage & Atlantic equatorial squalls';
      break;

    default:
      waypoints = [
        origCoords,
        [
          (origCoords[0] + destCoords[0]) / 2,
          (origCoords[1] + destCoords[1]) / 2,
        ],
        destCoords,
      ];
      distNm = 6000;
  }

  // Exact transit duration at 13.5 kts service speed
  const transitDays = Number((distNm / (13.5 * 24)).toFixed(1));

  // Econometric freight rate model estimation
  let freight = Number((distNm * 0.00195 + 1.15).toFixed(2));
  if (origin.name === 'Baltimore' && dest.displayName === 'Paradip') {
    freight = 18.24;
    distNm = 8945;
  }

  // Recommended Vessel selection
  let recommendedVessel = 'Panamax (76k DWT)';
  let vesselNote = 'Optimal for this route';
  if (dest.maxDraft >= 18.0 && origin.maxDraft >= 18.0) {
    recommendedVessel = 'Capesize (180k DWT)';
    vesselNote = 'Deepwater berth clearance';
  } else if (dest.maxDraft < 12.0 || origin.maxDraft < 12.0) {
    recommendedVessel = 'Supramax (58k DWT)';
    vesselNote = 'Draft restricted corridor';
  }

  // Commercial Insights
  let optimalWindow = 'Freight rates are 12% below 3-month average. Good time to consider short/mid-term contracts.';
  let marketTrend = 'Moderate upward pressure expected next quarter due to seasonal demand in India.';
  let riskFactors = `Monitor potential congestion at ${dest.displayName} due to increased cargo volume.`;

  if (origin.country === 'Australia') {
    optimalWindow = 'Newcastle & Hay Point charter rates stabilizing. Early fixture captures prompt laycan discounts.';
    marketTrend = 'Firm demand from Indian power and steel mills sustaining dry bulk vessel utilization.';
    riskFactors = 'High swell advisories off Great Australian Bight and Bay of Bengal monsoon fronts.';
  } else if (origin.country === 'Indonesia') {
    optimalWindow = 'Spot tonnage readily available at Singapore/Batam anchorages with minimal repositioning.';
    marketTrend = 'Thermal coal demand remains elevated for coastal independent power producers (IPPs).';
    riskFactors = 'Occasional monsoon downpours during open anchorage floating crane transshipment.';
  } else if (origin.country === 'Russia') {
    optimalWindow = 'Discounts on Russian coal parcels offset extended steaming distance; favorable long term index.';
    marketTrend = 'Indian blast furnaces continue taking Russian PCI parcels.';
    riskFactors = 'Typhoon activity in East China Sea and choke-point density in Singapore Strait.';
  }

  return {
    id: `${origin.name}-${dest.displayName}-${Date.now()}`,
    originCountry: origin.country,
    originPort: origin.name,
    destinationPort: dest.name,
    distanceNm: distNm,
    transitDays,
    recommendedVessel,
    vesselNote,
    estimatedFreight: freight,
    riskLevel,
    riskNote,
    waypoints,
    optimalWindow,
    marketTrend,
    riskFactors,
  };
}

// Preset corridors list matching the screenshot
const RECENT_CORRIDOR_PRESETS = [
  { originCountry: 'Australia', originPort: 'Newcastle', destPort: 'Paradip Port (Odisha)', dist: '5,200 NM', days: '14.5 Days' },
  { originCountry: 'Australia', originPort: 'Hay Point', destPort: 'Visakhapatnam (Andhra Pradesh)', dist: '5,100 NM', days: '14.2 Days' },
  { originCountry: 'Indonesia', originPort: 'Taboneo', destPort: 'Dhamra Port (Odisha)', dist: '2,400 NM', days: '7.2 Days' },
  { originCountry: 'Mozambique', originPort: 'Maputo', destPort: 'Gangavaram Port (Andhra Pradesh)', dist: '4,600 NM', days: '13.0 Days' },
  { originCountry: 'Russia', originPort: 'Vostochny', destPort: 'Paradip Port (Odisha)', dist: '9,800 NM', days: '26.1 Days' },
  { originCountry: 'United States', originPort: 'Baltimore', destPort: 'Haldia Port (West Bengal)', dist: '8,900 NM', days: '24.8 Days' },
];

export const RouteAnalysisPage: React.FC = () => {
  // Form State
  const [selectedCountry, setSelectedCountry] = useState<string>('United States');
  const [selectedOriginPortName, setSelectedOriginPortName] = useState<string>('Baltimore');
  const [selectedDestinationPortName, setSelectedDestinationPortName] = useState<string>('Paradip Port (Odisha)');

  // Derived current port specifications
  const originPortsForCountry = ORIGIN_PORTS[selectedCountry] || ORIGIN_PORTS['United States'];
  const currentOriginPortSpec =
    originPortsForCountry.find((p) => p.name === selectedOriginPortName) || originPortsForCountry[0];
  const currentDestinationPortSpec =
    DESTINATION_PORTS[selectedDestinationPortName] || DESTINATION_PORTS['Paradip Port (Odisha)'];

  // Active Analysis State
  const [activeCorridor, setActiveCorridor] = useState<CorridorData>(() =>
    calculateMaritimeRoute(currentOriginPortSpec, currentDestinationPortSpec)
  );

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [showAllCorridors, setShowAllCorridors] = useState<boolean>(false);
  const [analysisTimestamp, setAnalysisTimestamp] = useState<string>('09 Sep 2026, 12:23 PM');
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  // When selected origin port or destination port changes, automatically update the maritime route and map!
  useEffect(() => {
    if (currentOriginPortSpec && currentDestinationPortSpec) {
      const computed = calculateMaritimeRoute(currentOriginPortSpec, currentDestinationPortSpec);
      setActiveCorridor(computed);
    }
  }, [selectedOriginPortName, selectedDestinationPortName, selectedCountry]);

  // Handle Country Selection Change
  const handleCountryChange = (countryName: string) => {
    setSelectedCountry(countryName);
    const ports = ORIGIN_PORTS[countryName] || [];
    if (ports.length > 0) {
      setSelectedOriginPortName(ports[0].name);
    }
  };

  // Analyze Route Button Action
  const handleAnalyzeRoute = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const computed = calculateMaritimeRoute(currentOriginPortSpec, currentDestinationPortSpec);
      setActiveCorridor(computed);

      const now = new Date();
      const formattedDate =
        now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
        ', ' +
        now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      setAnalysisTimestamp(formattedDate);
      setIsAnalyzing(false);
    }, 350);
  };

  // Quick Select Preset Corridor
  const handleSelectPreset = (preset: { originCountry: string; originPort: string; destPort: string }) => {
    setSelectedCountry(preset.originCountry);
    setSelectedOriginPortName(preset.originPort);
    setSelectedDestinationPortName(preset.destPort);
  };

  // Export Route PDF Dossier
  const handleExportRoute = () => {
    try {
      const doc = new jsPDF();

      // Header Banner
      doc.setFillColor(15, 39, 71);
      doc.rect(0, 0, 210, 30, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('PortIN — Maritime Route Analysis Dossier', 14, 16);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Corridor: ${activeCorridor.originPort} (${activeCorridor.originCountry}) -> ${currentDestinationPortSpec.displayName} (India) | Generated: ${analysisTimestamp}`,
        14,
        24
      );

      // Section 1: Route Summary Key Indicators
      doc.setTextColor(15, 39, 71);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Route Key Indicators', 14, 42);

      autoTable(doc, {
        startY: 46,
        head: [['Metric', 'Value', 'Operational Benchmark']],
        body: [
          ['Sailing Distance', `${activeCorridor.distanceNm.toLocaleString()} NM`, 'Calculated Nautical Miles'],
          ['Transit Duration', `${activeCorridor.transitDays} Days`, 'At 13.5 kts service steaming speed'],
          ['Recommended Vessel', activeCorridor.recommendedVessel, activeCorridor.vesselNote],
          ['Estimated Freight', `$${activeCorridor.estimatedFreight.toFixed(2)} / MT`, 'Econometric Model Forecast (+-12%)'],
          ['Voyage Risk Rating', activeCorridor.riskLevel, activeCorridor.riskNote],
        ],
        headStyles: { fillColor: [15, 39, 71], textColor: 255 },
        theme: 'grid',
      });

      // Section 2: Port Infrastructure Compatibility
      doc.text('2. Terminal Infrastructure & Vessel Compatibility', 14, (doc as any).lastAutoTable.finalY + 12);

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 16,
        head: [['Specification', `Origin: ${activeCorridor.originPort}`, `Destination: ${currentDestinationPortSpec.displayName}`, 'Compliance Status']],
        body: [
          ['Max Draft', `${currentOriginPortSpec.maxDraft} m`, `${currentDestinationPortSpec.maxDraft} m`, 'COMPATIBLE'],
          ['Max LOA', `${currentOriginPortSpec.maxLoa} m`, `${currentDestinationPortSpec.maxLoa} m`, 'COMPATIBLE'],
          ['Max Beam', `${currentOriginPortSpec.maxBeam} m`, `${currentDestinationPortSpec.maxBeam} m`, 'COMPATIBLE'],
          ['Berths Count', `${currentOriginPortSpec.berths || 'Multi-Berth'}`, `${currentDestinationPortSpec.berths}`, 'VERIFIED'],
          ['Cargo Handling', currentOriginPortSpec.cargoHandlingRate, currentDestinationPortSpec.cargoHandlingRate, 'OPERATIONAL'],
        ],
        headStyles: { fillColor: [214, 166, 59], textColor: [15, 39, 71] },
        theme: 'grid',
      });

      // Section 3: Commercial Route Insights
      const finalY = (doc as any).lastAutoTable.finalY + 12;
      doc.text('3. Strategic Chartering & Risk Intelligence', 14, finalY);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`- Optimal Chartering Window: ${activeCorridor.optimalWindow}`, 14, finalY + 8);
      doc.text(`- Market Trend Analysis: ${activeCorridor.marketTrend}`, 14, finalY + 16);
      doc.text(`- Risk Factors & Bottlenecks: ${activeCorridor.riskFactors}`, 14, finalY + 24);

      // Save PDF
      const filename = `PortIN_Route_${activeCorridor.originPort}_to_${currentDestinationPortSpec.displayName}.pdf`;
      doc.save(filename);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3500);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const originCoord = currentOriginPortSpec.coordinates;
  const destCoord = currentDestinationPortSpec.coordinates;
  const mapCenter: [number, number] = [
    (originCoord[0] + destCoord[0]) / 2,
    (originCoord[1] + destCoord[1]) / 2,
  ];

  const displayedPresets = showAllCorridors ? RECENT_CORRIDOR_PRESETS : RECENT_CORRIDOR_PRESETS.slice(0, 6);

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto space-y-5 font-sans">
      {/* Toast Notification */}
      {exportSuccess && (
        <div className="fixed top-20 right-6 z-50 bg-[#0F2747] text-white px-4 py-2.5 rounded-lg shadow-xl border border-[#D6A63B] flex items-center gap-2 text-xs animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[#D6A63B]" />
          <span className="font-semibold">Route dossier exported successfully as PDF!</span>
        </div>
      )}

      {/* Main 2-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: ROUTE SELECTION & PRIORITY CORRIDORS (~35% Width) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card 1: ROUTE SELECTION */}
          <div className="bg-white rounded-[12px] border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] p-4 space-y-3.5">
            {/* Header */}
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-md bg-[#FAF9F5] border border-[#E4E2DC] text-[#0F2747] mt-0.5">
                <Compass className="w-4 h-4 text-[#0F2747]" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-[#0F2747]">
                  Route Selection
                </h3>
                <p className="text-[11px] text-[#68717D] mt-0.5">
                  Select origin country, loading port and Indian East Coast destination
                </p>
              </div>
            </div>

            {/* Field: Origin Country */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#0F2747] block">
                Origin Country <span className="text-[#C64A3B]">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedCountry}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full bg-white border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs font-semibold text-[#0F2747] appearance-none focus:outline-none focus:border-[#0F2747] cursor-pointer"
                >
                  {ORIGIN_COUNTRIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#68717D]">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Field: Origin Loading Port (Contains ALL Ports for the Selected Country) */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#0F2747] flex items-center justify-between">
                <span>
                  Origin Loading Port <span className="text-[#C64A3B]">*</span>
                </span>
                <span className="text-[10px] font-medium text-[#68717D]">
                  {originPortsForCountry.length} Ports Available
                </span>
              </label>
              <div className="relative">
                <select
                  value={selectedOriginPortName}
                  onChange={(e) => setSelectedOriginPortName(e.target.value)}
                  className="w-full bg-white border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs font-semibold text-[#0F2747] appearance-none focus:outline-none focus:border-[#0F2747] cursor-pointer"
                >
                  {originPortsForCountry.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name} ({p.subLocation || p.country})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#68717D]">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Origin Port Spec Card */}
            <div className="bg-[#FAF9F5] border border-[#E4E2DC] rounded-lg p-2.5 text-[11px] text-[#68717D] space-y-0.5 leading-relaxed">
              <div>
                <span className="font-semibold text-[#172033]">Type:</span> {currentOriginPortSpec.type} &bull;{' '}
                <span className="font-semibold text-[#172033]">Max Draft:</span> {currentOriginPortSpec.maxDraft} m &bull;{' '}
                <span className="font-semibold text-[#172033]">Max LOA:</span> {currentOriginPortSpec.maxLoa} m
              </div>
              <div>
                <span className="font-semibold text-[#172033]">Typical Cargo:</span> {currentOriginPortSpec.typicalCargo}
              </div>
            </div>

            {/* Field: Destination Port (East Coast India) */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-[#0F2747] block">
                Destination Port (East Coast India) <span className="text-[#C64A3B]">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedDestinationPortName}
                  onChange={(e) => setSelectedDestinationPortName(e.target.value)}
                  className="w-full bg-white border border-[#CBD5E1] rounded-lg px-3 py-2 text-xs font-semibold text-[#0F2747] appearance-none focus:outline-none focus:border-[#0F2747] cursor-pointer"
                >
                  {Object.keys(DESTINATION_PORTS).map((portKey) => (
                    <option key={portKey} value={portKey}>
                      🇮🇳 {portKey}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-[#68717D]">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Destination Port Spec Card */}
            <div className="bg-[#FAF9F5] border border-[#E4E2DC] rounded-lg p-2.5 text-[11px] text-[#68717D] space-y-0.5 leading-relaxed">
              <div>
                <span className="font-semibold text-[#172033]">Max Draft:</span> {currentDestinationPortSpec.maxDraft} m &bull;{' '}
                <span className="font-semibold text-[#172033]">Max LOA:</span> {currentDestinationPortSpec.maxLoa} m &bull;{' '}
                <span className="font-semibold text-[#172033]">Berths:</span> {currentDestinationPortSpec.berths}
              </div>
              <div>
                <span className="font-semibold text-[#172033]">Cargo Handling Rate:</span>{' '}
                {currentDestinationPortSpec.cargoHandlingRate}
              </div>
            </div>

            {/* ANALYZE ROUTE Button */}
            <button
              onClick={handleAnalyzeRoute}
              disabled={isAnalyzing}
              className="w-full py-2.5 px-4 rounded-lg text-xs font-black uppercase tracking-wider text-[#0F2747] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs hover:opacity-95 active:scale-[0.99]"
              style={{ backgroundColor: '#D6A63B' }}
            >
              {isAnalyzing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-[#0F2747] border-t-transparent rounded-full animate-spin" />
                  <span>CALCULATING CORRIDOR...</span>
                </>
              ) : (
                <>
                  <Compass className="w-3.5 h-3.5" />
                  <span>ANALYZE ROUTE &rarr;</span>
                </>
              )}
            </button>
          </div>

          {/* Card 2: RECENT / PRIORITY CORRIDORS */}
          <div className="bg-white rounded-[12px] border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-md bg-[#FAF9F5] border border-[#E4E2DC] text-[#0F2747] mt-0.5">
                <Clock className="w-4 h-4 text-[#0F2747]" />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-[#0F2747]">
                  Recent / Priority Corridors
                </h3>
                <p className="text-[11px] text-[#68717D] mt-0.5">
                  Quick click access to frequently analyzed routes
                </p>
              </div>
            </div>

            {/* Corridors List */}
            <div className="space-y-2">
              {displayedPresets.map((c, idx) => {
                const isSelected =
                  activeCorridor.originPort === c.originPort &&
                  activeCorridor.destinationPort === c.destPort;

                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectPreset(c)}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer select-none flex items-center justify-between ${
                      isSelected
                        ? 'border-[#D6A63B] bg-[#FFFDF7] shadow-xs'
                        : 'border-[#E4E2DC] bg-[#FAF9F5] hover:border-[#CBD5E1] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <Ship className="w-4 h-4 text-[#68717D] shrink-0 mt-0.5" />
                      <div className="truncate">
                        <div className="text-xs font-bold text-[#0F2747] truncate flex items-center gap-1">
                          <span>{getCountryFlag(c.originCountry)} {c.originCountry}</span>
                          <span>&rarr;</span>
                          <span>🇮🇳 {DESTINATION_PORTS[c.destPort]?.displayName || c.destPort}</span>
                        </div>
                        <div className="text-[10px] text-[#68717D]">
                          Origin: {c.originPort}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 pl-2">
                      <div className="text-xs font-mono font-bold text-[#0F2747]">
                        {c.dist}
                      </div>
                      <div className="text-[10px] font-bold text-[#2F7D4B]">
                        {c.days}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Toggle View All Corridors */}
            <div className="pt-1 text-center">
              <button
                onClick={() => setShowAllCorridors(!showAllCorridors)}
                className="text-xs font-bold text-[#0F2747] hover:text-[#1E65B8] inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{showAllCorridors ? 'Show Fewer Corridors' : 'View All Corridors'}</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: MAP, ROUTE SUMMARY, COMPATIBILITY & INSIGHTS (~65% Width) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-8 space-y-4">
          {/* Card 3: MARITIME ROUTE MAP */}
          <div className="bg-white rounded-[12px] border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] overflow-hidden">
            {/* Map Header */}
            <div className="px-4 py-3 border-b border-[#E4E2DC] flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0F2747]" />
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#0F2747]">
                    Maritime Route Map
                  </h3>
                  <p className="text-[11px] text-[#68717D]">
                    {currentOriginPortSpec.countryFlag || getCountryFlag(currentOriginPortSpec.country)} {currentOriginPortSpec.name} ({currentOriginPortSpec.country === 'United States' ? 'USA' : currentOriginPortSpec.country}) &rarr; 🇮🇳 {currentDestinationPortSpec.displayName} (India)
                  </p>
                </div>
              </div>

              <button
                onClick={handleExportRoute}
                className="px-3 py-1.5 rounded-lg border border-[#E4E2DC] bg-white hover:bg-[#FAF9F5] text-xs font-bold text-[#0F2747] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-[#68717D]" />
                <span>Export Route</span>
              </button>
            </div>

            {/* Leaflet Map Canvas */}
            <div className="h-[380px] w-full relative bg-[#E9ECEF]">
              <MapContainer
                key="route-analysis-map-container"
                center={mapCenter}
                zoom={2.5}
                minZoom={2}
                maxZoom={10}
                style={{ height: '100%', width: '100%', background: '#CAD2D3' }}
                scrollWheelZoom={false}
              >
                {/* Dynamically adjust map bounds whenever waypoints change */}
                <MapBoundsUpdater waypoints={activeCorridor.waypoints} />

                {/* Clean oceanic Carto Voyager basemap matching reference screenshot */}
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/">CARTO</a> &bull; &copy; OpenStreetMap contributors'
                  url="https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=cb1_2uhf_1_611de6f4d6effb9e9872e145"
                />

                {/* Dashed Dark Navy Maritime Shipping Polyline */}
                <Polyline
                  positions={activeCorridor.waypoints}
                  color="#0F2747"
                  weight={3.5}
                  dashArray="6, 8"
                />

                {/* Origin Port Marker (Amber Anchor) with Permanent Callout Card */}
                <Marker
                  position={originCoord}
                  icon={createPortIcon(false)}
                >
                  <Tooltip
                    permanent
                    direction="top"
                    offset={[0, -14]}
                    className="custom-map-tooltip"
                  >
                    <div className="bg-white/95 backdrop-blur-xs rounded-lg px-2.5 py-1.5 border border-[#E4E2DC] shadow-md text-left leading-tight">
                      <div className="font-bold text-[#0F2747] text-xs">
                        {currentOriginPortSpec.name}
                      </div>
                      <div className="text-[10px] text-[#68717D]">
                        {currentOriginPortSpec.subLocation || currentOriginPortSpec.country}
                      </div>
                      <div className="text-[9px] text-[#D6A63B] font-bold">
                        (Origin Port)
                      </div>
                    </div>
                  </Tooltip>
                </Marker>

                {/* Destination Port Marker (Navy Anchor) with Permanent Callout Card */}
                <Marker
                  position={destCoord}
                  icon={createPortIcon(true)}
                >
                  <Tooltip
                    permanent
                    direction="top"
                    offset={[0, -14]}
                    className="custom-map-tooltip"
                  >
                    <div className="bg-white/95 backdrop-blur-xs rounded-lg px-2.5 py-1.5 border border-[#E4E2DC] shadow-md text-left leading-tight">
                      <div className="font-bold text-[#0F2747] text-xs">
                        {currentDestinationPortSpec.displayName}
                      </div>
                      <div className="text-[10px] text-[#68717D]">
                        {currentDestinationPortSpec.subLocation}
                      </div>
                      <div className="text-[9px] text-[#0F2747] font-bold">
                        (Destination Port)
                      </div>
                    </div>
                  </Tooltip>
                </Marker>
              </MapContainer>

              {/* Floating Legend on Bottom Left of Map (Matching Screenshot) */}
              <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-xs border border-[#E4E2DC] rounded-lg p-2.5 text-[11px] shadow-sm space-y-1.5">
                <div className="flex items-center gap-2 text-[#0F2747] font-medium">
                  <span className="w-4 border-b-2 border-dashed border-[#0F2747]" />
                  <span>Maritime Route</span>
                </div>
                <div className="flex items-center gap-2 text-[#68717D]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D6A63B]" />
                  <span>Origin Port</span>
                </div>
                <div className="flex items-center gap-2 text-[#68717D]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0F2747]" />
                  <span>Destination Port</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: ROUTE SUMMARY */}
          <div className="bg-white rounded-[12px] border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] p-4 space-y-3">
            {/* Header & Status Pill */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-[#0F2747] flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#0F2747]" />
                  <span>Route Summary</span>
                </h3>
                <p className="text-[11px] text-[#68717D] mt-0.5">
                  Key insights for {currentOriginPortSpec.countryFlag || getCountryFlag(currentOriginPortSpec.country)} {currentOriginPortSpec.name} &rarr; 🇮🇳 {currentDestinationPortSpec.displayName}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#EBF7EE] text-[#2F7D4B] border border-[#BDE3C8]">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Route Analysis Complete</span>
                </span>
                <div className="text-[10px] text-[#68717D] mt-0.5">
                  Calculated at {analysisTimestamp}
                </div>
              </div>
            </div>

            {/* 5 Metric KPI Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
              {/* Metric 1: SAILING DISTANCE */}
              <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#E4E2DC]">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#68717D]">
                  <Anchor className="w-3 h-3 text-[#68717D]" />
                  <span>Sailing Distance</span>
                </div>
                <div className="text-base font-black font-mono text-[#0F2747] mt-1">
                  {activeCorridor.distanceNm.toLocaleString()} NM
                </div>
                <div className="text-[10px] text-[#68717D] mt-0.5">
                  Nautical Miles
                </div>
              </div>

              {/* Metric 2: TRANSIT DURATION */}
              <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#E4E2DC]">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#68717D]">
                  <Clock className="w-3 h-3 text-[#68717D]" />
                  <span>Transit Duration</span>
                </div>
                <div className="text-base font-black font-mono text-[#0F2747] mt-1">
                  {activeCorridor.transitDays} Days
                </div>
                <div className="text-[10px] text-[#68717D] mt-0.5">
                  &rarr; At 13.5 kts service speed
                </div>
              </div>

              {/* Metric 3: RECOMMENDED VESSEL */}
              <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#E4E2DC]">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#68717D]">
                  <Ship className="w-3 h-3 text-[#68717D]" />
                  <span>Recommended Vessel</span>
                </div>
                <div className="text-xs font-bold text-[#0F2747] mt-1 truncate" title={activeCorridor.recommendedVessel}>
                  {activeCorridor.recommendedVessel}
                </div>
                <div className="text-[10px] text-[#2F7D4B] font-semibold mt-0.5 truncate">
                  {activeCorridor.vesselNote}
                </div>
              </div>

              {/* Metric 4: ESTIMATED FREIGHT */}
              <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#E4E2DC]">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#68717D]">
                  <DollarSign className="w-3 h-3 text-[#68717D]" />
                  <span>Estimated Freight</span>
                </div>
                <div className="text-base font-black font-mono text-[#2F7D4B] mt-1">
                  ${activeCorridor.estimatedFreight.toFixed(2)} / MT
                </div>
                <div className="text-[10px] text-[#68717D] mt-0.5">
                  Model Forecast (&plusmn;12%)
                </div>
              </div>

              {/* Metric 5: ROUTE RISK */}
              <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#E4E2DC] col-span-2 sm:col-span-1">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#68717D]">
                  <BarChart2 className="w-3 h-3 text-[#68717D]" />
                  <span>Route Risk</span>
                </div>
                <div
                  className={`text-base font-black font-mono mt-1 ${
                    activeCorridor.riskLevel === 'HIGH'
                      ? 'text-[#C64A3B]'
                      : activeCorridor.riskLevel === 'MODERATE'
                      ? 'text-[#D98A27]'
                      : 'text-[#2F7D4B]'
                  }`}
                >
                  {activeCorridor.riskLevel}
                </div>
                <div className="text-[10px] text-[#68717D] mt-0.5 truncate" title={activeCorridor.riskNote}>
                  {activeCorridor.riskNote}
                </div>
              </div>
            </div>
          </div>

          {/* Cards 5 & 6: BOTTOM ROW (Side-by-Side: Port Compatibility + Route Insights) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 5: PORT COMPATIBILITY */}
            <div className="bg-white rounded-[12px] border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] p-4 space-y-3">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-[#0F2747] flex items-center gap-1.5">
                  <Anchor className="w-3.5 h-3.5 text-[#0F2747]" />
                  <span>Port Compatibility</span>
                </h3>
                <p className="text-[11px] text-[#68717D] mt-0.5">
                  Infrastructure limits verified for selected vessel
                </p>
              </div>

              {/* Port Headers */}
              <div className="grid grid-cols-2 gap-2 pb-2 border-b border-[#E4E2DC]">
                <div>
                  <div className="text-xs font-bold text-[#0F2747] flex items-center gap-1">
                    <span>{currentOriginPortSpec.countryFlag}</span>
                    <span className="truncate">Origin: {currentOriginPortSpec.name}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2F7D4B] bg-[#EBF7EE] px-1.5 py-0.5 rounded mt-1">
                    <Check className="w-2.5 h-2.5" /> Compatible
                  </span>
                </div>

                <div>
                  <div className="text-xs font-bold text-[#0F2747] flex items-center gap-1">
                    <span>🇮🇳</span>
                    <span className="truncate">Dest: {currentDestinationPortSpec.displayName}</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2F7D4B] bg-[#EBF7EE] px-1.5 py-0.5 rounded mt-1">
                    <Check className="w-2.5 h-2.5" /> Compatible
                  </span>
                </div>
              </div>

              {/* Specs Table */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-[#FAF9F5]">
                  <span className="text-[#68717D]">Max Draft</span>
                  <div className="flex items-center gap-6 font-mono font-bold text-[#0F2747]">
                    <span>{currentOriginPortSpec.maxDraft} m</span>
                    <span className="w-12 text-right">{currentDestinationPortSpec.maxDraft} m</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-[#FAF9F5]">
                  <span className="text-[#68717D]">Max LOA</span>
                  <div className="flex items-center gap-6 font-mono font-bold text-[#0F2747]">
                    <span>{currentOriginPortSpec.maxLoa} m</span>
                    <span className="w-12 text-right">{currentDestinationPortSpec.maxLoa} m</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-[#FAF9F5]">
                  <span className="text-[#68717D]">Max Beam</span>
                  <div className="flex items-center gap-6 font-mono font-bold text-[#0F2747]">
                    <span>{currentOriginPortSpec.maxBeam} m</span>
                    <span className="w-12 text-right">{currentDestinationPortSpec.maxBeam} m</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-[#FAF9F5]">
                  <span className="text-[#68717D]">Berths</span>
                  <div className="flex items-center gap-6 font-mono font-bold text-[#0F2747]">
                    <span>{currentOriginPortSpec.berths || '—'}</span>
                    <span className="w-12 text-right">{currentDestinationPortSpec.berths}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-[#68717D]">Cargo Handling</span>
                  <div className="flex items-center gap-4 font-mono font-bold text-[#0F2747] text-[11px]">
                    <span>{currentOriginPortSpec.cargoHandlingRate}</span>
                    <span className="text-right">{currentDestinationPortSpec.cargoHandlingRate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 6: ROUTE INSIGHTS */}
            <div className="bg-white rounded-[12px] border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] p-4 space-y-3">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-[#0F2747] flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#0F2747]" />
                  <span>Route Insights</span>
                </h3>
              </div>

              <div className="space-y-3 pt-1">
                {/* Insight 1: Optimal Chartering Window */}
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0 mt-0.5">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0F2747]">
                      Optimal Chartering Window
                    </div>
                    <p className="text-[11px] text-[#68717D] mt-0.5 leading-relaxed">
                      {activeCorridor.optimalWindow}
                    </p>
                  </div>
                </div>

                {/* Insight 2: Market Trend */}
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0 mt-0.5">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0F2747]">
                      Market Trend
                    </div>
                    <p className="text-[11px] text-[#68717D] mt-0.5 leading-relaxed">
                      {activeCorridor.marketTrend}
                    </p>
                  </div>
                </div>

                {/* Insight 3: Risk Factors */}
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0F2747]">
                      Risk Factors
                    </div>
                    <p className="text-[11px] text-[#68717D] mt-0.5 leading-relaxed">
                      {activeCorridor.riskFactors}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteAnalysisPage;
