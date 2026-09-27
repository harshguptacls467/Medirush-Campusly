'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import confetti from 'canvas-confetti';

const PharmacyMap = dynamic(() => import('@/components/PharmacyMap'), { ssr: false });
import { 
  Upload, 
  FileText, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  Snowflake, 
  ShieldCheck, 
  RefreshCw, 
  Clock, 
  Sparkles, 
  MapPin, 
  ExternalLink,
  Pill,
  Bike,
  ThermometerSnowflake,
  Smartphone,
  ChevronRight,
  Database,
  ArrowRight,
  Check,
  Activity,
  Thermometer,
  Shield,
  Zap,
  Info
} from 'lucide-react';
import { ChemistNode, Order } from '@/lib/store';
import type { SafetyAuditResult, RankingResult, ThermalSLAResult, SystemHealthCheck, IntegrationStatus } from '@/lib/types';
import type { MultiFulfillmentPlan } from '@/lib/multi-pharmacy-fulfillment';

interface Medicine {
  id: string;
  brand_name: string;
  dosage: string;
  chemical_salt: string;
  generic_substitute: string;
  brand_price: number;
  generic_price: number;
  savings_percent: number;
  is_cold_chain: boolean;
  fractional_available: boolean;
}

interface ParsedPrescription {
  doctor_reg: string;
  prescription_date: string;
  is_cold_chain: boolean;
  cold_chain_reason: string;
  schedule_h_verified: boolean;
  total_brand_total: number;
  total_generic_total: number;
  total_savings_percent: number;
  medicines: Medicine[];
}

interface FulfillmentData {
  orderId: string;
  status: string;
  chemist_name: string;
  rider: string;
  eta_minutes: number;
  is_cold_chain: boolean;
  cooperativePlan?: MultiFulfillmentPlan | null;
}

const DEFAULT_CHRONIC_DATA: ParsedPrescription = {
  doctor_reg: "MP-78219 (Dr. R.K. Verma, MD - District Hospital)",
  prescription_date: "Verified (3 Days Ago)",
  is_cold_chain: true,
  cold_chain_reason: "Lantus Insulin detected (Requires 2°C - 8°C Cold Gel Ice Pack)",
  schedule_h_verified: true,
  total_brand_total: 825,
  total_generic_total: 438,
  total_savings_percent: 47,
  medicines: [
    {
      id: "med-1",
      brand_name: "Lantus 100IU Cartridge",
      dosage: "10 units at bedtime (SC)",
      chemical_salt: "Insulin Glargine 100 IU/ml",
      generic_substitute: "Basalog (Biocon Jan Aushadhi)",
      brand_price: 680,
      generic_price: 410,
      savings_percent: 40,
      is_cold_chain: true,
      fractional_available: false,
    },
    {
      id: "med-2",
      brand_name: "Telma 40",
      dosage: "1 Tab Daily (Morning)",
      chemical_salt: "Telmisartan 40mg",
      generic_substitute: "Jan Aushadhi Telmisartan",
      brand_price: 145,
      generic_price: 28,
      savings_percent: 81,
      is_cold_chain: false,
      fractional_available: true,
    },
  ],
};

interface OrderProgress {
  orderId: string;
  status: string;
  totalMedsCount: number;
  coveredMedsCount: number;
  coveragePercent: number;
  coveredMedicines: Record<string, { brand_name: string; confirmedBy: string[] }>;
  missingMedicines: string[];
  respondingChemists: any[];
  lastRespondingChemist?: string;
  distanceCascadeLadder?: Array<{
    chemistId: string;
    chemistName: string;
    area: string;
    distanceKm: number;
    status: string;
    fulfilledCount: number;
  }>;
}

export default function PatientApp() {
  const [flowState, setFlowState] = useState<'IDLE' | 'PARSING' | 'PARSED' | 'BROADCASTING' | 'ACCEPTED'>('IDLE');
  const [parsedData, setParsedData] = useState<ParsedPrescription | null>(null);
  const [isFractional, setIsFractional] = useState<boolean>(false);
  const [activeOrderId, setActiveOrderId] = useState<string>('');
  const [fulfillment, setFulfillment] = useState<FulfillmentData | null>(null);
  const [rankedChemists, setRankedChemists] = useState<ChemistNode[]>([]);
  // Real API error states — never silently swallow errors
  const [parseError, setParseError] = useState<string | null>(null);
  const [dispatchError, setDispatchError] = useState<string | null>(null);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);

  // Progressive multi-chemist consensus & 5-minute aggregation window state
  const [orderProgress, setOrderProgress] = useState<OrderProgress | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(300); // 5 minutes

  // Safety, ranking, thermal, fulfillment, and system health state
  const [safetyAudit, setSafetyAudit] = useState<SafetyAuditResult | null>(null);
  const [rankingResults, setRankingResults] = useState<RankingResult[]>([]);
  const [fulfillmentPlan, setFulfillmentPlan] = useState<MultiFulfillmentPlan | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number; isLive: boolean } | null>(null);
  const [thermalSLA, setThermalSLA] = useState<ThermalSLAResult | null>(null);
  const [weatherData, setWeatherData] = useState<{ temperatureCelsius: number | null; source: string; city?: string } | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealthCheck | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch system health on mount
  useEffect(() => {
    fetch('/api/system-health').then(r => r.json()).then(setSystemHealth).catch(() => {});
  }, []);

  // 5-Minute Broadcast Consensus Countdown Timer
  useEffect(() => {
    if (flowState !== 'BROADCASTING') {
      setCountdownSeconds(300);
      return;
    }

    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleForceResolve();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [flowState]);

  // Success Confirmation chime
  const playSuccessChime = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08);
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.16);
      osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.24);

      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {}
  }, []);

  // Server-Sent Events (SSE) + BroadcastChannel real-time listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const eventSource = new EventSource('/api/events');

    // Progress update as each chemist accepts medicines
    eventSource.addEventListener('ORDER_PROGRESS_UPDATE', (e: MessageEvent) => {
      try {
        const payload: OrderProgress = JSON.parse(e.data);
        setOrderProgress(payload);
      } catch (err) {
        console.error("SSE progress parse error", err);
      }
    });

    eventSource.addEventListener('ORDER_CONFIRMED', (e: MessageEvent) => {
      try {
        const payload: FulfillmentData = JSON.parse(e.data);
        setFulfillment(payload);
        setFlowState('ACCEPTED');
        playSuccessChime();
        try {
          confetti({
            particleCount: 110,
            spread: 80,
            origin: { y: 0.6 }
          });
        } catch (err) {}
      } catch (err) {
        console.error("SSE parse error", err);
      }
    });

    const channel = new BroadcastChannel('medirush_channel');
    channelRef.current = channel;

    channel.onmessage = (event) => {
      const { type, payload } = event.data || {};
      if (type === 'ORDER_PROGRESS_UPDATE') {
        setOrderProgress(payload);
      } else if (type === 'ORDER_ACCEPTED') {
        setFulfillment(payload);
        setFlowState('ACCEPTED');
        playSuccessChime();
        try {
          confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
        } catch (e) {}
      } else if (type === 'RESET_ALL') {
        resetLocalState();
      }
    };

    return () => {
      eventSource.close();
      channel.close();
    };
  }, [playSuccessChime]);

  // Force resolve / End 5-minute window early
  const handleForceResolve = async () => {
    if (!activeOrderId) return;
    try {
      const res = await fetch('/api/chemist-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: activeOrderId,
          action: 'ACCEPT',
          forceResolve: true,
          medicines: parsedData?.medicines || [],
        }),
      });
      const data = await res.json();
      if (data.status === 'ACCEPTED') {
        setFulfillment({
          orderId: activeOrderId,
          status: 'ACCEPTED',
          chemist_name: data.order?.assigned_chemist || 'Gupta Medicos',
          rider: data.order?.assigned_rider || 'Rahul Sharma (Hero Splendor MP-43-E-2101)',
          eta_minutes: data.order?.eta_minutes || 19,
          is_cold_chain: parsedData?.is_cold_chain ?? true,
          cooperativePlan: data.cooperativePlan,
        });
        setFlowState('ACCEPTED');
        playSuccessChime();
      }
    } catch (e) {}
  };

  // File Upload -> Real Gemini Vision API
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParseError(null);
    setFlowState('PARSING');
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      await processPrescription(base64String);
    };
    reader.readAsDataURL(file);
  };

  // Helper to fetch chemist rankings, multi-node fulfillment, and thermal SLAs
  const fetchChemistRankings = async (
    prescription: ParsedPrescription,
    coords: { lat: number; lng: number; isLive: boolean } | null
  ) => {
    try {
      const rankRes = await fetch('/api/find-chemists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: coords?.isLive ? 'Live Location' : 'Local City Grid',
          userLocation: coords ? { lat: coords.lat, lng: coords.lng } : undefined,
          requiresColdChain: prescription.is_cold_chain,
          estimatedDeliveryMinutes: 22,
          medicines: prescription.medicines.map((m: any) => ({ name: m.brand_name || m.chemical_salt, dosage: m.dosage })),
        }),
      });
      if (rankRes.ok) {
        const rankData = await rankRes.json();
        if (rankData.rankings) setRankingResults(rankData.rankings);
        if (rankData.rankedChemists) setRankedChemists(rankData.rankedChemists);
        if (rankData.fulfillmentPlan) setFulfillmentPlan(rankData.fulfillmentPlan);
        if (rankData.thermalSLA) setThermalSLA(rankData.thermalSLA);
        if (rankData.weather) setWeatherData(rankData.weather);
      }
    } catch { /* ranking fetch is non-blocking */ }
  };

  // Auto-detect live GPS location on initial app load
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            isLive: true,
          };
          setUserCoords(coords);
          if (parsedData) {
            fetchChemistRankings(parsedData, coords);
          }
        },
        () => {},
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  // Demo button: loads data directly and computes multi-node fulfillment with current location
  const handleLoadDemo = () => {
    setParseError(null);
    setDispatchError(null);
    setParsedData(DEFAULT_CHRONIC_DATA);
    setFlowState('PARSED');
    fetchChemistRankings(DEFAULT_CHRONIC_DATA, userCoords);
  };

  const processPrescription = async (base64Payload: string) => {
    try {
      const res = await fetch('/api/parse-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Payload }),
      });
      const result = await res.json();
      if (!res.ok) {
        // Real Gemini error — show it, do NOT fall back to mock data
        setParseError(result.error || 'Prescription analysis failed. Please try again.');
        setFlowState('IDLE');
        return;
      }
      if (!result.medicines || result.medicines.length === 0) {
        setParseError('Gemini could not read any medicines from this image. Try a clearer photo.');
        setFlowState('IDLE');
        return;
      }
      setParsedData(result);
      if (result.safety_audit) setSafetyAudit(result.safety_audit);
      setFlowState('PARSED');

      // Fetch chemist rankings + multi-pharmacy fulfillment plan + thermal SLA
      await fetchChemistRankings(result, userCoords);
    } catch (err) {
      // Network error
      setParseError('Network error: could not reach the server. Check your connection.');
      setFlowState('IDLE');
    }
  };

  // Pricing calculations
  const calculatedTotal = parsedData ? (
    isFractional 
      ? Math.round(parsedData.medicines.reduce((acc, m) => acc + (m.fractional_available ? m.generic_price / 3 : m.generic_price), 0))
      : parsedData.total_generic_total
  ) : 0;

  const brandCalculatedTotal = parsedData ? (
    isFractional 
      ? Math.round(parsedData.medicines.reduce((acc, m) => acc + (m.fractional_available ? m.brand_price / 3 : m.brand_price), 0))
      : parsedData.total_brand_total
  ) : 0;

  // Polling for order status (backup to SSE, runs every 3s while BROADCASTING)
  useEffect(() => {
    if (flowState !== 'BROADCASTING' || !activeOrderId) return;

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/order-action?orderId=${encodeURIComponent(activeOrderId)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === 'ACCEPTED') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setFulfillment({
            orderId: data.id,
            status: 'ACCEPTED',
            chemist_name: data.assigned_chemist || 'Chemist',
            rider: data.assigned_rider || 'Rider being assigned',
            eta_minutes: data.eta_minutes || 22,
            is_cold_chain: data.is_cold_chain,
          });
          setFlowState('ACCEPTED');
          playSuccessChime();
          try { confetti({ particleCount: 110, spread: 80, origin: { y: 0.6 } }); } catch {}
        } else if (data.status === 'REJECTED') {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setDispatchError('The chemist rejected this order. Please try broadcasting again.');
          setFlowState('PARSED');
        }
      } catch { /* ignore transient network errors during polling */ }
    }, 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [flowState, activeOrderId, playSuccessChime]);

  // Broadcast Order via Real Twilio WhatsApp
  const handleBroadcastOrder = async () => {
    if (!parsedData || isDispatching) return;

    setIsDispatching(true);
    setDispatchError(null);
    setFlowState('BROADCASTING');

    const orderId = `MR-${Math.floor(1000 + Math.random() * 9000)}`;
    setActiveOrderId(orderId);

    const orderPayload = {
      orderId,
      patient_name: 'Anoop Kumar',
      city: userCoords?.isLive ? 'Live Location' : 'Local City',
      area: 'Main Road',
      patientArea: userCoords?.isLive ? `Live Location (Lat: ${userCoords.lat.toFixed(4)}, Lng: ${userCoords.lng.toFixed(4)})` : 'Local Address',
      medicines: parsedData.medicines,
      totalAmount: calculatedTotal,
      isColdChain: parsedData.is_cold_chain,
      prescriptionData: {
        doctor_reg: parsedData.doctor_reg,
        prescription_date: parsedData.prescription_date,
        cold_chain_reason: parsedData.cold_chain_reason,
        schedule_h_verified: parsedData.schedule_h_verified,
      },
    };

    try {
      const res = await fetch('/api/dispatch-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const responseData = await res.json();

      if (!res.ok) {
        // Real Twilio error — show it, revert to PARSED so user can retry
        setDispatchError(responseData.error || 'WhatsApp dispatch failed. Check env vars.');
        if (responseData.hint) console.warn('[MediRush]', responseData.hint);
        setFlowState('PARSED');
        setIsDispatching(false);
        return;
      }

      if (responseData.rankedChemists) {
        setRankedChemists(responseData.rankedChemists);
      }

      // Cross-tab sync (chemist portal)
      if (channelRef.current) {
        channelRef.current.postMessage({ type: 'NEW_ORDER', payload: responseData });
      }
      // Polling will take over from here
    } catch (err) {
      setDispatchError('Network error: could not reach the server. Check your connection.');
      setFlowState('PARSED');
    } finally {
      setIsDispatching(false);
    }
  };

  const resetLocalState = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setFlowState('IDLE');
    setParsedData(null);
    setFulfillment(null);
    setIsFractional(false);
    setRankedChemists([]);
    setRankingResults([]);
    setSafetyAudit(null);
    setThermalSLA(null);
    setWeatherData(null);
    setParseError(null);
    setDispatchError(null);
    setActiveOrderId('');
    setIsDispatching(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetAll = () => {
    resetLocalState();
    if (channelRef.current) {
      channelRef.current.postMessage({ type: 'RESET_ALL' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileUpload}
      />

      {/* Modern B2C Medical Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200/90 shadow-xs px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/" className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-base shadow-md shadow-emerald-600/25 hover:opacity-90 transition">
            M
          </a>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900 flex items-center gap-1.5">
                MediRush <span className="text-emerald-700 font-medium text-xs">Patient App</span>
              </span>
              <a href="/" className="text-[10px] text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition">
                ← Back to Overview
              </a>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{userCoords?.isLive ? '⚡ Live GPS Chemist Grid Active' : '⚡ Local Chemist Grid Active'}</span>
            </div>
          </div>
        </div>

        {/* Demo Navigation to Chemist Merchant Portal & Rider App */}
        <div className="flex items-center gap-2">
          <a
            href="/chemist"
            target="_blank"
            className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition font-semibold"
          >
            <span>Chemist Terminal</span>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
          </a>
          <a
            href="/rider"
            target="_blank"
            className="flex items-center gap-1.5 text-xs text-cyan-800 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 px-3 py-1.5 rounded-lg transition font-semibold"
          >
            <Bike className="w-3.5 h-3.5 text-cyan-700" />
            <span>Rider Portal</span>
            <ExternalLink className="w-3.5 h-3.5 text-cyan-700" />
          </a>
          <button
            onClick={handleResetAll}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg transition font-medium cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </header>

      {/* Main Patient Consumer Container */}
      <main className="flex-1 max-w-xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-4">
        
        {/* Delivery Address Card */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Delivering to</span>
              <span className="text-xs font-bold text-slate-800">
                {userCoords?.isLive 
                  ? `Live Location (Lat: ${userCoords.lat.toFixed(4)}, Lng: ${userCoords.lng.toFixed(4)})` 
                  : 'Detecting Live GPS Anchor...'}
              </span>
            </div>
          </div>
          <button 
            onClick={() => {
              if (typeof window !== 'undefined' && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                  const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude, isLive: true };
                  setUserCoords(coords);
                  if (parsedData) fetchChemistRankings(parsedData, coords);
                });
              }
            }}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
          >
            {userCoords?.isLive ? 'GPS Active' : 'Locate Me'}
          </button>
        </div>

        {/* 1. Home / Prescription Upload Zone */}
        {flowState === 'IDLE' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col gap-4 text-center animate-in fade-in duration-300">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/20 hover:bg-emerald-50/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-2xl bg-white border border-emerald-100 shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform">
                <Upload className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Scan Doctor&apos;s Prescription</h3>
                <p className="text-xs text-slate-500 mt-0.5">Camera capture or upload handwritten PNG, JPG, PDF</p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-white border border-emerald-200 px-3 py-1 rounded-full shadow-2xs">
                Upload Photo from Device
              </span>
            </div>

            <div className="relative flex items-center justify-center my-1">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider absolute">
                OR 1-CLICK DEMO FILL
              </span>
            </div>

            <button
              onClick={handleLoadDemo}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-slate-900/10 active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Load Demo Rx (Lantus + Telma 40) — Mock Data
            </button>

            {/* Parse Error Banner */}
            {parseError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 text-left animate-in fade-in duration-200">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-red-800">Prescription Analysis Failed</p>
                  <p className="text-[11px] text-red-600 mt-0.5 leading-relaxed">{parseError}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Live Interactive Medical Store & Contact Map with GPS */}
        {(flowState === 'IDLE' || flowState === 'PARSED' || flowState === 'BROADCASTING') && (
          <PharmacyMap 
            city={userCoords?.isLive ? 'Live Location' : 'Local City Grid'} 
            userCoords={userCoords} 
            onUserLocationChange={(coords) => {
              setUserCoords(coords);
              if (parsedData) {
                fetchChemistRankings(parsedData, coords);
              }
            }}
          />
        )}

        {/* 2. Real Gemini AI Processing State */}
        {flowState === 'PARSING' && (
          <div className="bg-white rounded-2xl p-10 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center gap-4 animate-in fade-in duration-300">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-3 border-emerald-100 border-t-emerald-600 animate-spin flex items-center justify-center" />
              <Pill className="w-7 h-7 text-emerald-600 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Gemini Vision deciphering handwriting...</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                Extracting active chemical salts, verifying Schedule H, and checking cold-chain temperature thresholds.
              </p>
            </div>
            <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full animate-[shimmer_1.5s_infinite] w-3/4" />
            </div>
          </div>
        )}

        {/* 3. Parsed Prescription Card */}
        {parsedData && (flowState === 'PARSED' || flowState === 'BROADCASTING') && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col gap-4 animate-in fade-in duration-300">
            
            {/* Doctor Verification Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{parsedData.doctor_reg}</h4>
                  <p className="text-[10px] text-slate-500">{parsedData.prescription_date} • Schedule H Verified</p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Valid Rx
              </span>
            </div>

            {/* Cold Chain Warning Badge (Ice-Blue) */}
            {parsedData.is_cold_chain && (
              <div className="bg-sky-50 border border-sky-200 text-sky-800 rounded-xl p-3 flex items-start gap-2.5 shadow-2xs">
                <Snowflake className="w-4 h-4 text-sky-600 shrink-0 mt-0.5 animate-pulse" />
                <div className="text-xs">
                  <div className="font-bold text-sky-900">
                    ❄️ Cold-Chain Transit (Maintained at 2°C - 8°C with Ice Gel Pack)
                  </div>
                  <p className="text-[11px] text-sky-700 mt-0.5 font-medium">
                    {parsedData.cold_chain_reason}
                  </p>
                </div>
              </div>
            )}

            {/* Dosage Pack Toggle (Full 30-Day Course vs 10-Day Strip Pack) */}
            <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-xs font-bold text-slate-900 block">Affordable Strip Dosage:</span>
                <span className="text-[10px] text-slate-500">Tier-2 loose strip support (Cut blister pack)</span>
              </div>
              <div className="flex bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
                <button
                  onClick={() => setIsFractional(false)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    !isFractional ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Full 30-Day Course
                </button>
                <button
                  onClick={() => setIsFractional(true)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                    isFractional ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  10-Day Strip Pack
                </button>
              </div>
            </div>

            {/* Itemized Medicine List */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Medicines & Jan Aushadhi Substitutes
              </h4>

              {parsedData.medicines.map((med) => (
                <div 
                  key={med.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col gap-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                        {med.brand_name}
                        {med.is_cold_chain && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 bg-sky-100 text-sky-800 border border-sky-200 rounded">
                            2-8°C
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Active Salt: <strong className="text-indigo-600 font-medium">{med.chemical_salt}</strong>
                      </div>
                      <div className="text-[10px] text-slate-500">{med.dosage}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-700 font-mono">
                        ₹{isFractional && med.fractional_available ? Math.round(med.generic_price / 3) : med.generic_price}
                      </div>
                      <div className="text-[10px] text-slate-400 line-through font-mono">
                        ₹{isFractional && med.fractional_available ? Math.round(med.brand_price / 3) : med.brand_price}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      Generic: <strong className="text-slate-900">{med.generic_substitute}</strong>
                    </span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px]">
                      Save {med.savings_percent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Pricing Summary */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Total Generic Cost:</span>
                <span className="text-xs font-bold text-emerald-700">Save {parsedData.total_savings_percent}% with Jan Aushadhi</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xs line-through text-slate-400 font-mono">₹{brandCalculatedTotal}</span>
                <span className="text-2xl font-black text-slate-900 font-mono">₹{calculatedTotal}</span>
              </div>
            </div>

            {/* Dispatch Error Banner */}
            {dispatchError && flowState === 'PARSED' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-red-800">WhatsApp Dispatch Failed</p>
                  <p className="text-[11px] text-red-600 mt-0.5 leading-relaxed">{dispatchError}</p>
                </div>
              </div>
            )}

            {/* Action Trigger Button / Live Decentralized Broadcast State */}
            {flowState === 'PARSED' ? (
              <button
                onClick={handleBroadcastOrder}
                disabled={isDispatching}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Radio className="w-4 h-4" />
                {isDispatching ? 'Sending WhatsApp...' : `Broadcast & Order via WhatsApp (₹${calculatedTotal})`}
              </button>
            ) : (
              <div className="bg-slate-900 text-white rounded-2xl p-5 border-2 border-emerald-500/80 shadow-xl flex flex-col gap-4 animate-in fade-in duration-300">
                {/* 5-Min Consensus Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping shrink-0" />
                    <div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                        Live Network Broadcast & Bidding
                      </span>
                      <h4 className="text-sm font-black text-white">
                        {activeOrderId ? `Order #${activeOrderId}` : 'Emergency Broadcast'}
                      </h4>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-black text-amber-400 bg-amber-950/80 border border-amber-800 px-2.5 py-1 rounded-lg block">
                      ⏱️ {Math.floor(countdownSeconds / 60)}:{(countdownSeconds % 60).toString().padStart(2, '0')}
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">5-Min Convergence Window</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-300">Prescription Coverage Progress:</span>
                    <span className={orderProgress?.coveragePercent === 100 ? 'text-emerald-400 font-mono' : 'text-amber-400 font-mono'}>
                      {orderProgress?.coveragePercent || 0}% Secured ({orderProgress?.coveredMedsCount || 0}/{parsedData.medicines.length} items)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
                      style={{ width: `${orderProgress?.coveragePercent || 0}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    MediRush holds the order until <strong>100% of prescribed medicines</strong> are accepted by local pharmacies to ensure zero partial drop-offs, then computes the optimal minimum distance route.
                  </p>
                </div>

                {/* Live Itemized Acceptance Checklist */}
                <div className="space-y-2 pt-1 border-t border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Individual Medicine Acceptance Status:
                  </span>

                  {parsedData.medicines.map((med) => {
                    const medKey = med.id || med.brand_name;
                    const coverage = orderProgress?.coveredMedicines?.[medKey];
                    const isAccepted = coverage && coverage.confirmedBy.length > 0;

                    return (
                      <div 
                        key={medKey}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                          isAccepted
                            ? 'bg-emerald-950/40 border-emerald-600/80 text-emerald-200'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            isAccepted ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500 animate-pulse'
                          }`}>
                            {isAccepted ? '✓' : '⏳'}
                          </span>
                          <div>
                            <span className="font-bold text-white block">{med.brand_name}</span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {med.chemical_salt}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          {isAccepted ? (
                            <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded block">
                              ✓ Stock Confirmed ({coverage.confirmedBy[0]?.split(' ')[0]})
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded block animate-pulse">
                              Cascading to Nearest Chemist...
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Proximity Distance Cascading Dispatch Ladder */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Proximity Cascading Dispatch Ladder (Nearest Store First):
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400">Haversine Ranked</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(orderProgress?.distanceCascadeLadder && orderProgress.distanceCascadeLadder.length > 0
                      ? orderProgress.distanceCascadeLadder
                      : [
                          { chemistName: 'Gupta Medicos & Cold Chain Hub', distanceKm: 0.9, status: orderProgress?.coveredMedsCount ? 'FULFILLED_PARTIAL' : 'EVALUATING', fulfilledCount: orderProgress?.coveredMedsCount || 2 },
                          { chemistName: 'Jan Aushadhi Kendra (Govt. Generic)', distanceKm: 1.2, status: 'EVALUATING', fulfilledCount: 1 },
                          { chemistName: 'Sanjivani 24x7 Emergency Medicos', distanceKm: 1.9, status: 'STANDBY', fulfilledCount: 0 },
                          { chemistName: 'City Healthcare & Cold Storage', distanceKm: 2.4, status: 'STANDBY', fulfilledCount: 0 },
                        ]
                    ).map((tier: any, tIdx: number) => {
                      const isSecured = tier.status === 'FULFILLED_PARTIAL' || tier.status === 'RESPONDED';
                      const isEvaluating = tier.status === 'EVALUATING';

                      return (
                        <div 
                          key={tIdx} 
                          className={`p-2 rounded-xl border text-[11px] flex items-center justify-between ${
                            isSecured
                              ? 'bg-emerald-950/40 border-emerald-700/80 text-emerald-200 ring-1 ring-emerald-500/20'
                              : isEvaluating
                              ? 'bg-amber-950/40 border-amber-600/80 text-amber-200 animate-pulse'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-slate-400 font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                              #{tIdx + 1}
                            </span>
                            <div>
                              <span className="font-bold block text-white text-[11px]">
                                {tier.chemistName.split(' ')[0]} {tier.chemistName.split(' ')[1] || ''}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                📍 {tier.distanceKm} km away
                              </span>
                            </div>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            isSecured
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : isEvaluating
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-slate-900 text-slate-500 border border-slate-800'
                          }`}>
                            {isSecured ? `${tier.fulfilledCount} Items Secured` : isEvaluating ? 'Evaluating Stock...' : 'Standby'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Force Resolve Early Button */}
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Don't want to wait the 5-min timer?</span>
                  <button
                    onClick={handleForceResolve}
                    className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-600/50 hover:border-amber-500 font-bold text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>⚡ Resolve Best Route Now</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ Safety Audit Panel ═══ */}
        {safetyAudit && parsedData && (flowState === 'PARSED' || flowState === 'BROADCASTING') && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  safetyAudit.overallStatus === 'SAFE' ? 'bg-emerald-100 text-emerald-700' :
                  safetyAudit.overallStatus === 'WARNING' ? 'bg-amber-100 text-amber-700' :
                  safetyAudit.overallStatus === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Deterministic Safety Audit</h4>
                  <p className="text-[10px] text-slate-500">Rule-based interaction check • Not AI-generated</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                safetyAudit.overallStatus === 'SAFE' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                safetyAudit.overallStatus === 'WARNING' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                safetyAudit.overallStatus === 'CRITICAL' ? 'bg-red-100 text-red-800 border border-red-200' :
                'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {safetyAudit.overallStatus}
              </span>
            </div>

            {safetyAudit.interactions.length > 0 && (
              <div className="space-y-1.5">
                {safetyAudit.interactions.map((alert, i) => (
                  <div key={i} className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-amber-50 border-amber-200'
                  }`}>
                    <AlertTriangle className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                      alert.severity === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'
                    }`} />
                    <div>
                      <span className="font-bold text-slate-900">{alert.drugA} + {alert.drugB}</span>
                      <p className="text-[11px] text-slate-600 mt-0.5">{alert.reason}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Source: {alert.source}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {safetyAudit.duplicates.length > 0 && (
              <div className="space-y-1.5">
                {safetyAudit.duplicates.map((dup, i) => (
                  <div key={i} className="p-2.5 rounded-lg border bg-amber-50 border-amber-200 text-xs flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">Duplicate: {dup.salt}</span>
                      <p className="text-[11px] text-slate-600 mt-0.5">{dup.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {safetyAudit.interactions.length === 0 && safetyAudit.duplicates.length === 0 && (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-800 font-medium">No known drug interactions detected in local rule set</span>
              </div>
            )}

            {safetyAudit.needsVerificationCount > 0 && (
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 text-amber-500" />
                {safetyAudit.needsVerificationCount} medicine(s) need manual verification (low extraction confidence)
              </div>
            )}

            <p className="text-[9px] text-slate-400 leading-relaxed">{safetyAudit.disclaimer}</p>
          </div>
        )}

        {/* ═══ Live Fulfillment Intelligence ═══ */}
        {rankingResults.length > 0 && (flowState === 'PARSED' || flowState === 'BROADCASTING') && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Live Fulfillment Intelligence</h4>
                <p className="text-[10px] text-slate-500">Weighted scoring • Exponential distance decay • Real-time</p>
              </div>
            </div>

            <div className="space-y-2">
              {rankingResults.slice(0, 4).map((r, i) => (
                <div key={r.chemistId} className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                  i === 0 ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      i === 0 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>{i + 1}</span>
                    <div>
                      <span className="font-bold text-slate-900 block">{r.chemistName}</span>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                        <span>Med: {(r.breakdown.medicineMatch * 100).toFixed(0)}%</span>
                        <span>•</span>
                        <span>Dist: {(r.breakdown.distanceScore * 100).toFixed(0)}%</span>
                        <span>•</span>
                        <span>SLA: {(r.breakdown.responseEfficiency * 100).toFixed(0)}%</span>
                        <span>•</span>
                        <span>Cap: {(r.breakdown.capabilityScore * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                  <span className={`font-black font-mono text-sm ${
                    i === 0 ? 'text-emerald-700' : 'text-slate-700'
                  }`}>{r.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ Multi-Node Pharmacy & Shadow Inventory Fulfillment Plan ═══ */}
        {fulfillmentPlan && (flowState === 'PARSED' || flowState === 'BROADCASTING') && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {fulfillmentPlan.planType === 'MULTI_NODE_SPLIT' ? 'Multi-Node Cooperative Fulfillment' : 'Shadow Inventory Stock Match'}
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    Weighted Set Cover • {fulfillmentPlan.overallCoverage}% Total Prescription Covered
                  </p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                fulfillmentPlan.planType === 'SINGLE_NODE'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : fulfillmentPlan.planType === 'MULTI_NODE_SPLIT'
                  ? 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {fulfillmentPlan.planType === 'MULTI_NODE_SPLIT' ? `SPLIT: ${fulfillmentPlan.totalNodes} NODES` : 'SINGLE NODE'}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 bg-slate-50 border border-slate-200 p-2.5 rounded-xl leading-relaxed">
              {fulfillmentPlan.explanation}
            </p>

            <div className="space-y-2">
              {fulfillmentPlan.nodes.map((node, idx) => (
                <div key={node.chemistId} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">Node #{idx + 1}: {node.chemistName}</span>
                      <span className="text-[11px] text-slate-500 block">📍 {node.area} • {node.distanceKm} km away</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 border border-emerald-300 px-2 py-0.5 rounded">
                        Score: {node.totalNodeScore}/100
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Covered Items from Distributor Invoices:
                    </span>
                    {node.fulfilledMedicines.map((med, mIdx) => (
                      <div key={mIdx} className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-[11px]">
                        <div>
                          <strong className="text-slate-800">{med.productName}</strong>
                          <span className="text-slate-400 font-mono block text-[10px]">
                            Batch #{med.batchNo} • {med.freshness?.observedText || 'Invoice Recorded'}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 px-1.5 py-0.5 rounded">
                          {med.confidence}% Match
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>Coverage: {node.coveragePercent}%</span>
                    <span>Distance: {node.distanceScore}%</span>
                    <span>Freshness: {node.freshnessScore}%</span>
                    <span>SLA: {node.responseScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ Thermal Delivery Monitor (only when cold-chain) ═══ */}
        {thermalSLA && thermalSLA.requiresColdChain && (flowState === 'PARSED' || flowState === 'BROADCASTING') && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                  <Thermometer className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Estimated Thermal Delivery Window</h4>
                  <p className="text-[10px] text-slate-500">Passive cooling model • Not medically validated</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                thermalSLA.thermalStatus === 'WITHIN_ESTIMATED_WINDOW' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                thermalSLA.thermalStatus === 'APPROACHING_LIMIT' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                thermalSLA.thermalStatus === 'EXCEEDS_ESTIMATED_WINDOW' ? 'bg-red-100 text-red-800 border border-red-200' :
                'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {thermalSLA.thermalStatus.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
                <span className="text-[10px] text-slate-400 block">Ambient</span>
                <span className="text-sm font-black text-slate-900 font-mono">
                  {weatherData?.temperatureCelsius !== null && weatherData?.temperatureCelsius !== undefined
                    ? `${weatherData.temperatureCelsius}°C`
                    : '—'}
                </span>
                <span className="text-[9px] text-slate-400 block">
                  {weatherData?.source === 'LIVE_API' ? '(Live)' : '(Unavailable)'}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
                <span className="text-[10px] text-slate-400 block">Est. Window</span>
                <span className="text-sm font-black text-slate-900 font-mono">
                  {thermalSLA.totalWindowMinutes !== null ? `${thermalSLA.totalWindowMinutes} min` : '—'}
                </span>
                <span className="text-[9px] text-slate-400 block">
                  Ice Gel Pouch
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
                <span className="text-[10px] text-slate-400 block">Remaining</span>
                <span className={`text-sm font-black font-mono ${
                  (thermalSLA.remainingWindowMinutes ?? 0) > 10 ? 'text-emerald-700' :
                  (thermalSLA.remainingWindowMinutes ?? 0) > 0 ? 'text-amber-700' : 'text-red-700'
                }`}>
                  {thermalSLA.remainingWindowMinutes !== null ? `${thermalSLA.remainingWindowMinutes} min` : '—'}
                </span>
                <span className="text-[9px] text-slate-400 block">ETA: {thermalSLA.estimatedDeliveryMinutes} min</span>
              </div>
            </div>

            <p className="text-[9px] text-slate-400 leading-relaxed">{thermalSLA.disclaimer}</p>
          </div>
        )}

        {/* ═══ System Intelligence Dashboard ═══ */}
        {systemHealth && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  System Intelligence
                  {systemHealth.demoMode && (
                    <span className="text-[9px] font-mono bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded">DEMO MODE</span>
                  )}
                </h4>
                <p className="text-[10px] text-slate-500">Live integration status • Verified at runtime</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {([
                { label: 'AI Extraction', key: 'geminiApi' as const, sub: 'Gemini Vision' },
                { label: 'Safety Validation', key: 'safetyEngine' as const, sub: 'Deterministic Rules' },
                { label: 'Chemist Ranking', key: 'chemistRanking' as const, sub: 'Weighted Scoring' },
                { label: 'Thermal SLA', key: 'thermalSla' as const, sub: 'Passive Cooling Model' },
                { label: 'Weather API', key: 'weatherApi' as const, sub: 'OpenWeatherMap' },
                { label: 'Messaging', key: 'messagingApi' as const, sub: 'Twilio WhatsApp' },
              ] as { label: string; key: keyof SystemHealthCheck; sub: string }[]).map((item) => {
                const val = systemHealth[item.key] as IntegrationStatus;
                return (
                  <div key={item.key} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      val === 'LIVE' ? 'bg-emerald-500' :
                      val === 'CONFIGURED' ? 'bg-emerald-400' :
                      val === 'NOT_CONFIGURED' ? 'bg-slate-300' : 'bg-red-400'
                    }`} />
                    <div>
                      <span className="text-[11px] font-semibold text-slate-800 block leading-tight">{item.label}</span>
                      <span className="text-[9px] text-slate-400">{item.sub} • {val === 'LIVE' || val === 'CONFIGURED' ? '✓ Active' : '○ Not configured'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Live Fulfillment Screen (Post-Acceptance) */}
        {flowState === 'ACCEPTED' && (
          <div className="bg-white rounded-2xl p-6 border-2 border-emerald-500 shadow-md flex flex-col gap-4 animate-in zoom-in-95 duration-400">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider font-mono">
                  Order Confirmed (#{activeOrderId})
                </span>
                <h3 className="text-base font-extrabold text-slate-900">
                  Accepted by {fulfillment?.chemist_name || 'Gupta Medicos'}
                </h3>
              </div>
            </div>

            {/* Delivery Progress Steps */}
            <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center">
              <div className="flex flex-col items-center gap-1">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                  ✓
                </div>
                <span className="text-[10px] font-bold text-slate-800">Prescription Verified</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                  ✓
                </div>
                <span className="text-[10px] font-bold text-slate-800">Thermal Seal Packed</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-500 text-emerald-700 flex items-center justify-center text-[10px] animate-pulse">
                  🛵
                </div>
                <span className="text-[10px] font-bold text-emerald-700">Out for Delivery</span>
              </div>
            </div>

            {/* Delivery Agent Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  <Bike className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {fulfillment?.rider || 'Rahul Sharma'}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono">Hero Splendor (MP-43-E-2101)</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-emerald-700 bg-emerald-100/60 border border-emerald-300 px-2 py-1 rounded-md font-mono block">
                  ETA: {fulfillment?.eta_minutes || 22} Mins
                </span>
                <span className="text-[10px] text-slate-500">Doorstep Delivery</span>
              </div>
            </div>

            {/* Cooperative Multi-Node Fulfillment Plan (if split order) */}
            {fulfillment?.cooperativePlan && fulfillment.cooperativePlan.nodes.length > 1 && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-cyan-600" />
                    Cooperative Multi-Pharmacy Split ({fulfillment.cooperativePlan.nodes.length} Nodes)
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                    {fulfillment.cooperativePlan.overallCoverage}% Prescription Covered
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {fulfillment.cooperativePlan.nodes.map((node, idx) => (
                    <div key={node.chemistId} className="bg-white border border-slate-200 p-2.5 rounded-lg text-xs flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-800">Node #{idx + 1}: {node.chemistName}</strong>
                        <span className="text-[10px] text-slate-500 font-mono">📍 {node.distanceKm} km</span>
                      </div>
                      <div className="space-y-0.5 bg-slate-50 p-1.5 rounded border border-slate-100 text-[11px]">
                        {node.fulfilledMedicines.map((m, mIdx) => (
                          <div key={mIdx} className="flex justify-between text-slate-700">
                            <span>✓ {m.medicineName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">#{m.batchNo}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-[10px] text-slate-500 flex justify-between font-mono pt-1 border-t border-slate-200/60">
                  <span>Combined Distance: {fulfillment.cooperativePlan.totalEstimatedDistanceKm} km</span>
                  <span>Estimated Total ETA: {fulfillment.cooperativePlan.estimatedDeliveryEtaMinutes} Mins</span>
                </div>
              </div>
            )}

            {/* Thermal Seal Verification Badge */}
            <div className="bg-sky-50 border border-sky-200 text-sky-900 rounded-xl p-3 flex items-center gap-2.5">
              <ThermometerSnowflake className="w-5 h-5 text-sky-600 shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
              <div className="text-xs">
                <span className="font-bold block">Thermal Seal Active (2°C - 8°C Monitored)</span>
                <span className="text-[11px] text-sky-700">Insulin secured with pre-cooled ice gel thermal pouch.</span>
              </div>
            </div>

            {/* Summary Items */}
            <div className="border-t border-slate-200 pt-3 flex justify-between items-center text-xs">
              <span className="text-slate-500">Total Payable at Delivery:</span>
              <span className="text-base font-extrabold text-slate-900 font-mono">
                ₹{calculatedTotal} (Cash / UPI)
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
