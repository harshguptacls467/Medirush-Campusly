'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChemistNode, CHEMIST_REGISTRY } from '@/lib/chemists';
import { calculateHaversineDistance } from '@/lib/multi-pharmacy-fulfillment';
import { MapPin, Phone, Snowflake, ShieldCheck, Search, Navigation, Store, ExternalLink, Crosshair, RefreshCw } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface PharmacyMapProps {
  city?: string;
  selectedChemistId?: string;
  userCoords?: { lat: number; lng: number; isLive: boolean } | null;
  onUserLocationChange?: (coords: { lat: number; lng: number; isLive: boolean }) => void;
  onSelectChemist?: (chemist: ChemistNode) => void;
}

export default function PharmacyMap({ 
  city = 'Ratlam', 
  selectedChemistId, 
  userCoords,
  onUserLocationChange,
  onSelectChemist 
}: PharmacyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [chemists, setChemists] = useState<ChemistNode[]>(CHEMIST_REGISTRY);
  const [activeChemist, setActiveChemist] = useState<ChemistNode | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number; isLive: boolean; name: string }>(() => {
    if (userCoords) {
      return {
        lat: userCoords.lat,
        lng: userCoords.lng,
        isLive: userCoords.isLive,
        name: userCoords.isLive ? 'Live GPS Location' : 'Detecting GPS Anchor...',
      };
    }
    return {
      lat: 23.3340,
      lng: 75.0400,
      isLive: false,
      name: 'Detecting Live Location...',
    };
  });

  // Handle Live Geolocation
  const handleGetLiveLocation = (isUserInitiated: boolean = false) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      if (isUserInitiated) alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const live = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          isLive: true,
          name: `Live Location (±${Math.round(pos.coords.accuracy)}m)`,
        };
        setCurrentLocation(live);

        if (onUserLocationChange) {
          onUserLocationChange(live);
        }

        try {
          const res = await fetch('/api/nearby-pharmacies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lat: live.lat,
              lng: live.lng,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.pharmacies && data.pharmacies.length > 0) {
              setChemists(data.pharmacies);
            }
          }
        } catch (e) {
          // Fallback to local distance recalculation
          const updated = CHEMIST_REGISTRY.map((c) => ({
            ...c,
            distance_km: calculateHaversineDistance(live.lat, live.lng, c.lat, c.lng),
          })).sort((a, b) => a.distance_km - b.distance_km);
          setChemists(updated);
        } finally {
          setIsLocating(false);
        }

        const map = mapInstanceRef.current;
        if (map) {
          map.flyTo([live.lat, live.lng], 15, { duration: 1.2 });
        }
      },
      (err) => {
        console.warn('Geolocation denied/failed:', err.message);
        setIsLocating(false);
        if (isUserInitiated) {
          alert('Could not retrieve live GPS location. Please allow location access in your browser.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  // Auto-request live location on mount
  useEffect(() => {
    handleGetLiveLocation(false);
  }, []);

  // Sync external userCoords prop
  useEffect(() => {
    if (userCoords && userCoords.isLive && (!currentLocation.isLive || currentLocation.lat !== userCoords.lat)) {
      setCurrentLocation({
        lat: userCoords.lat,
        lng: userCoords.lng,
        isLive: true,
        name: 'Live GPS Location',
      });
      const map = mapInstanceRef.current;
      if (map) {
        map.flyTo([userCoords.lat, userCoords.lng], 15, { duration: 1.0 });
      }
    }
  }, [userCoords]);

  // Filter chemists based on search query
  const filteredChemists = chemists.filter((c) => {
    const matchesCity = city ? c.city.toLowerCase() === city.toLowerCase() || currentLocation.isLive : true;
    const matchesQuery = searchQuery
      ? c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery)
      : true;
    return matchesCity && matchesQuery;
  });

  // Map Initialization
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [currentLocation.lat, currentLocation.lng],
      zoom: 14,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers & User Position
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing pharmacy markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    // Remove user marker/circle
    if (userMarkerRef.current) userMarkerRef.current.remove();
    if (userCircleRef.current) userCircleRef.current.remove();

    // User Location Marker
    const userSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
        <circle cx="12" cy="12" r="10" fill="#2563eb" stroke="#ffffff" stroke-width="2.5"/>
        <circle cx="12" cy="12" r="4" fill="#ffffff"/>
      </svg>
    `;
    const userIcon = L.divIcon({
      className: 'user-leaflet-marker',
      html: userSvg,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    userMarkerRef.current = L.marker([currentLocation.lat, currentLocation.lng], { icon: userIcon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <strong style="color: #2563eb;">📍 ${currentLocation.isLive ? 'Your Live GPS Location' : 'Default Patient Anchor'}</strong>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">${currentLocation.name}</p>
        </div>
      `);

    // Radius circle around user
    userCircleRef.current = L.circle([currentLocation.lat, currentLocation.lng], {
      color: '#3b82f6',
      fillColor: '#60a5fa',
      fillOpacity: 0.12,
      radius: 3000,
    }).addTo(map);

    // Pharmacy custom icon generator
    const createCustomIcon = (isColdChain: boolean, isSelected: boolean) => {
      const color = isSelected ? '#059669' : isColdChain ? '#0284c7' : '#10b981';
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="34" height="34">
          <path fill="${color}" stroke="#ffffff" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      `;
      return L.divIcon({
        className: 'custom-leaflet-marker',
        html: svg,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -30],
      });
    };

    // Render Pharmacy Markers
    filteredChemists.forEach((chemist) => {
      const isSelected = chemist.id === selectedChemistId || chemist.id === activeChemist?.id;
      const marker = L.marker([chemist.lat, chemist.lng], {
        icon: createCustomIcon(chemist.cold_storage_certified, isSelected),
      }).addTo(map);

      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 200px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-space-between; gap: 6px;">
            <strong style="font-size: 13px; color: #0f172a;">${chemist.name}</strong>
          </div>
          <p style="font-size: 11px; color: #64748b; margin: 4px 0;">📍 ${chemist.address || chemist.area}</p>
          <div style="margin: 6px 0; font-size: 11px; display: flex; gap: 6px; flex-wrap: wrap;">
            <span style="background: #ecfdf5; color: #047857; padding: 2px 6px; border-radius: 4px; font-weight: 600;">
              ${chemist.distance_km} km away
            </span>
            ${chemist.cold_storage_certified ? `
              <span style="background: #f0f9ff; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-weight: 600;">
                ❄️ Cold Chain 2-8°C
              </span>
            ` : ''}
          </div>
          <div style="margin-top: 8px; border-top: 1px solid #e2e8f0; padding-top: 6px; display: flex; align-items: center; justify-content: space-between;">
            <a href="tel:${chemist.phone}" style="color: #059669; font-weight: 700; text-decoration: none; font-size: 12px; display: flex; align-items: center; gap: 4px;">
              📞 ${chemist.phone}
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        setActiveChemist(chemist);
        if (onSelectChemist) onSelectChemist(chemist);
      });

      markersRef.current[chemist.id] = marker;
    });

    // Auto-fit bounds
    if (filteredChemists.length > 0) {
      const bounds = L.latLngBounds(
        [[currentLocation.lat, currentLocation.lng], ...filteredChemists.map((c) => [c.lat, c.lng] as [number, number])]
      );
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [filteredChemists, selectedChemistId, activeChemist, currentLocation]);

  const handleSelectCard = (chemist: ChemistNode) => {
    setActiveChemist(chemist);
    if (onSelectChemist) onSelectChemist(chemist);
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([chemist.lat, chemist.lng], 16, { duration: 1.2 });
      const marker = markersRef.current[chemist.id];
      if (marker) marker.openPopup();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col gap-0">
      
      {/* Search & Location Action Header */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              Live Medical Store Map 
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                {filteredChemists.length} Stores Verified
              </span>
            </h3>
            <p className="text-[10px] text-slate-500">Tier-2 Pharmacy Grid • Real GPS Proximity</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleGetLiveLocation(true)}
            disabled={isLocating}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              currentLocation.isLive
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {isLocating ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
            ) : (
              <Crosshair className={`w-3.5 h-3.5 ${currentLocation.isLive ? 'text-blue-600' : 'text-slate-600'}`} />
            )}
            <span>{currentLocation.isLive ? 'Live GPS Active' : 'Use My Live GPS'}</span>
          </button>

          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search store or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 text-xs rounded-xl pl-8 pr-3 py-1.5 focus:outline-none focus:border-emerald-500 font-medium placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Map View Container */}
      <div className="relative w-full h-[320px] bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Floating Quick Action */}
        <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur border border-slate-200 rounded-xl px-3 py-1.5 shadow-md flex items-center gap-2 text-[11px] font-semibold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{currentLocation.isLive ? 'Showing pharmacies around your live GPS coordinates' : 'Connecting to local verified pharmacy grid...'}</span>
        </div>
      </div>

      {/* Nearby Medical Stores Cards Horizontal List */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50">
        <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Nearby Verified Pharmacies</span>
          <span className="text-slate-400 font-normal">Tap card to fly on map</span>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
          {filteredChemists.map((c) => {
            const isSelected = c.id === (selectedChemistId || activeChemist?.id);
            return (
              <div
                key={c.id}
                onClick={() => handleSelectCard(c)}
                className={`min-w-[240px] max-w-[260px] p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">{c.name}</h4>
                    {c.cold_storage_certified && (
                      <span className="text-[9px] bg-sky-100 text-sky-800 border border-sky-200 rounded px-1.5 py-0.2 shrink-0 font-semibold">
                        2-8°C
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">📍 {c.address || c.area}</p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-600 font-mono">
                    <strong>{c.distance_km} km</strong> away
                  </div>
                  <a
                    href={`tel:${c.phone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 hover:bg-emerald-200 border border-emerald-300 px-2 py-1 rounded-md transition"
                  >
                    <Phone className="w-3 h-3 text-emerald-700" />
                    <span>Call</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
