import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
  Compass, MapPin, Ship, Clock, AlertTriangle, ArrowRight,
  TrendingUp, ShieldAlert, Waves, Info, Layers
} from 'lucide-react';
import { apiClient } from '../api/client';
import { DataProvenanceBadge } from '../components/common/DataProvenanceBadge';
import { Route } from '../types';

// Fix Leaflet marker icon issue in Vite / React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom PortIN Anchor Marker Icon
const createPortIcon = (isDestination: boolean) =>
  L.divIcon({
    className: 'custom-port-marker',
    html: `<div style="
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background-color: ${isDestination ? '#0F2747' : '#D6A63B'};
      border: 2.5px solid #FFFFFF;
      box-shadow: 0 2px 8px rgba(15, 39, 71, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${isDestination ? '#D6A63B' : '#0F2747'};
      font-size: 13px;
      font-weight: 900;
    ">${isDestination ? '⚓' : '●'}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });

export const RouteAnalysisPage: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Basemap style switcher: Voyager (User API Key) or Dark Matter
  const [mapStyle, setMapStyle] = useState<'voyager' | 'dark'>('voyager');

  const cartoApiKey = 'cb1_2uhf_1_611de6f4d6effb9e9872e145';
  const voyagerUrl = `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${cartoApiKey}`;
  const darkMatterUrl = `https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=${cartoApiKey}`;

  useEffect(() => {
    const fetchRoutes = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/routes');
        setRoutes(res.data);
        if (res.data.length > 0) {
          setSelectedRouteId(res.data[0].id);
        }
      } catch (err) {
        console.error('Failed to load routes', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoutes();
  }, []);

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  return (
    <div className="space-y-6">
      {/* Enterprise Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[16px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] border-t-[3px] border-t-[#D6A63B]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#D6A63B]">
              Maritime GIS & Corridors
            </span>
            <DataProvenanceBadge sourceType="OFFICIAL STATIC" sourceName="Nautical Mile Distance Tables & Carto Voyager" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F2747] tracking-tight">
            Global Trade Lanes & Voyage Distance Intelligence
          </h2>
          <p className="text-xs text-[#D98A27] mt-1 font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Voyage planning visualization & navigational distance computation — calibrated for East Coast India discharge.</span>
          </p>
        </div>

        {/* Map Style Selector: Carto Voyager vs Dark Matter */}
        <div className="inline-flex rounded-lg border border-[#E4E2DC] p-0.5 bg-[#F8F7F3] shrink-0">
          <button
            onClick={() => setMapStyle('voyager')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
              mapStyle === 'voyager'
                ? 'bg-[#0F2747] text-white shadow-xs'
                : 'text-[#68717D] hover:text-[#0F2747]'
            }`}
          >
            Carto Voyager (Official)
          </button>
          <button
            onClick={() => setMapStyle('dark')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
              mapStyle === 'dark'
                ? 'bg-[#0F2747] text-white shadow-xs'
                : 'text-[#68717D] hover:text-[#0F2747]'
            }`}
          >
            Maritime Dark
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Trade Lane Selector List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#68717D] block px-1">
            Bulk Procurement Corridors ({routes.length})
          </span>

          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {routes.map((r) => {
              const isSelected = selectedRoute?.id === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRouteId(r.id)}
                  className={`p-4 rounded-[10px] cursor-pointer transition-all duration-200 border ${
                    isSelected
                      ? 'bg-[#FFFFFF] border-[#D6A63B] shadow-md shadow-[#D6A63B]/10'
                      : 'bg-[#FFFFFF] border-[#E4E2DC] hover:border-[#CBD5E1]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-[#0F2747] text-sm">
                      {r.origin_country} &rarr; {r.destination_port_name}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#0F2747]">
                      {r.distance_nm.toLocaleString()} NM
                    </span>
                  </div>
                  <div className="text-xs text-[#68717D] flex items-center justify-between mt-2">
                    <span className="font-medium">Origin: {r.origin_port}</span>
                    <span className="text-[#2F7D4B] font-bold">{r.typical_days} Days Transit</span>
                  </div>
                  <div className="mt-2 text-[10px] text-[#68717D] flex items-center justify-between pt-2 border-t border-[#E4E2DC]">
                    <span>Weather Risk:</span>
                    <span
                      className={`font-bold uppercase px-1.5 py-0.2 rounded text-[9px] ${
                        r.weather_risk_level === 'HIGH'
                          ? 'text-[#C64A3B] bg-[#FDF2F2]'
                          : 'text-[#2F7D4B] bg-[#F3FAF7]'
                      }`}
                    >
                      {r.weather_risk_level}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center & Right: Interactive Leaflet Map with Carto Voyager Basemap (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Interactive Leaflet Map Container with Carto Voyager */}
          <div className="h-[460px] rounded-[10px] overflow-hidden border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] relative">
            {selectedRoute && (
              <MapContainer
                key={`${selectedRoute.id}-${mapStyle}`}
                center={[(selectedRoute.origin_lat + selectedRoute.dest_lat) / 2, (selectedRoute.origin_lng + selectedRoute.dest_lng) / 2]}
                zoom={3}
                style={{ height: '100%', width: '100%', background: mapStyle === 'voyager' ? '#E9ECEF' : '#0B1F38' }}
                scrollWheelZoom={false}
              >
                {/* CARTO Basemap with Provided User API Key */}
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/">CARTO</a> &bull; &copy; OpenStreetMap contributors'
                  url={mapStyle === 'voyager' ? voyagerUrl : darkMatterUrl}
                />

                {/* Origin Marker */}
                <Marker
                  position={[selectedRoute.origin_lat, selectedRoute.origin_lng]}
                  icon={createPortIcon(false)}
                >
                  <Popup>
                    <div className="text-xs text-[#172033] p-1 font-sans">
                      <strong className="text-[#0F2747] block text-sm mb-1">Origin: {selectedRoute.origin_port}</strong>
                      <div className="text-[#68717D]">Country: <span className="font-semibold text-[#172033]">{selectedRoute.origin_country}</span></div>
                      <div className="text-[#68717D]">Coordinates: {selectedRoute.origin_lat.toFixed(2)}°, {selectedRoute.origin_lng.toFixed(2)}°</div>
                    </div>
                  </Popup>
                </Marker>

                {/* Destination Marker */}
                <Marker
                  position={[selectedRoute.dest_lat, selectedRoute.dest_lng]}
                  icon={createPortIcon(true)}
                >
                  <Popup>
                    <div className="text-xs text-[#172033] p-1 font-sans">
                      <strong className="text-[#0F2747] block text-sm mb-1">Destination: {selectedRoute.destination_port_name}</strong>
                      <div className="text-[#2F7D4B] font-bold">Discharge Port &bull; East Coast of India</div>
                      <div className="text-[#68717D]">Coordinates: {selectedRoute.dest_lat.toFixed(2)}°, {selectedRoute.dest_lng.toFixed(2)}°</div>
                    </div>
                  </Popup>
                </Marker>

                {/* Shipping Lane Polyline */}
                <Polyline
                  positions={[
                    [selectedRoute.origin_lat, selectedRoute.origin_lng],
                    [selectedRoute.dest_lat, selectedRoute.dest_lng],
                  ]}
                  color="#0F2747"
                  weight={3.5}
                  dashArray="6, 8"
                />
              </MapContainer>
            )}

            {/* Map Legend Overlay */}
            <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm border border-[#E4E2DC] rounded-lg p-2.5 text-[11px] shadow-lg text-[#172033] space-y-1">
              <div className="font-bold text-[#0F2747] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#D6A63B]" />
                <span>Trade Corridor GIS</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-[#68717D]">
                <span className="w-2 h-2 rounded-full bg-[#D6A63B]"></span> Origin Terminal
                <span className="w-2 h-2 rounded-full bg-[#0F2747] ml-2"></span> Discharge Port
              </div>
            </div>
          </div>

          {/* Detailed Route Planning Summary Card */}
          {selectedRoute && (
            <div className="p-5 rounded-[10px] bg-white border border-[#E4E2DC] shadow-[0_1px_3px_rgba(15,39,71,0.04)] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
                <span className="text-[#68717D] block text-[10px] font-bold uppercase tracking-wider">Sailing Distance:</span>
                <span className="text-base font-black text-[#0F2747] font-mono mt-0.5 block">
                  {selectedRoute.distance_nm.toLocaleString()} NM
                </span>
                <span className="text-[10px] text-[#68717D] block">Nautical Miles</span>
              </div>

              <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
                <span className="text-[#68717D] block text-[10px] font-bold uppercase tracking-wider">Transit Duration:</span>
                <span className="text-base font-black text-[#0F2747] font-mono mt-0.5 block">
                  {selectedRoute.typical_days} Days
                </span>
                <span className="text-[10px] text-[#68717D] block">At 13.5 kts service speed</span>
              </div>

              <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
                <span className="text-[#68717D] block text-[10px] font-bold uppercase tracking-wider">Recommended Vessel:</span>
                <span className="text-base font-bold text-[#0F2747] mt-0.5 block">Panamax (76k DWT)</span>
                <span className="text-[10px] text-[#2F7D4B] font-semibold block">Optimal Draft Clearance</span>
              </div>

              <div className="p-3 rounded-[8px] bg-[#F8F7F3] border border-[#E4E2DC]">
                <span className="text-[#68717D] block text-[10px] font-bold uppercase tracking-wider">Estimated Freight:</span>
                <span className="text-base font-black text-[#2F7D4B] font-mono mt-0.5 block">
                  ${(selectedRoute.distance_nm * 0.0028).toFixed(2)} / MT
                </span>
                <span className="text-[10px] text-[#68717D] block">Voyage Baseline Cost</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
