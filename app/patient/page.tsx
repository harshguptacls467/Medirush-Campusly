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
  Info,
  Phone
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

  // Post-delivery interactive lifecycle states
  const [deliveryStage, setDeliveryStage] = useState<'DISPATCHED' | 'ARRIVED_DOORSTEP' | 'DELIVERED'>('DISPATCHED');
  const [deliveryOtp, setDeliveryOtp] = useState<string>('4821');

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
        setDeliveryStage('DISPATCHED');
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
        setDeliveryStage('DISPATCHED');
        playSuccessChime();
        try {
          confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
        } catch (e) {}
      } else if (type === 'ORDER_DELIVERED') {
        setDeliveryStage('DELIVERED');
        playSuccessChime();
        try {
          confetti({ particleCount: 130, spread: 90, origin: { y: 0.5 } });
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
        setDeliveryStage('DISPATCHED');
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
    <div className="min-h-screen bg-gradient-to-b from-[#EEF5FF] via-slate-50 to-[#F0F7FF] text-slate-900 font-sans antialiased flex flex-col selection:bg-blue-500 selection:text-white">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileUpload}
      />

      {/* Modern MediRush Header with Royal Blue Accents */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-blue-100 shadow-xs px-3 sm:px-6 lg:px-8 py-3 flex items-center justify-between transition-all">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <a href="/home" className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-[#1565C0] via-[#0D47A1] to-[#0A2540] flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all">
            M
          </a>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 flex items-center gap-1.5">
                MediRush <span className="bg-blue-50 text-[#1565C0] border border-blue-200 font-black text-[11px] px-2 py-0.5 rounded-full">Patient Order</span>
              </span>
              <a href="/home" className="hidden sm:inline-flex text-[11px] font-bold text-slate-500 hover:text-[#1565C0] bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 px-2.5 py-0.5 rounded-lg transition">
                ← Back to Home
              </a>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="truncate">{userCoords?.isLive ? '⚡ Live GPS Chemist Grid Active' : '⚡ Local Chemist Grid Active'}</span>
            </div>
          </div>
        </div>

        {/* Action Links & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <a
            href="/chemist"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 text-xs text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition font-black"
          >
            <span>Chemist Hub</span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-700" />
          </a>
          <a
            href="/rider"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 text-xs text-cyan-900 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 px-3 py-1.5 rounded-xl transition font-black"
          >
            <Bike className="w-3.5 h-3.5 text-cyan-700" />
            <span>Rider Portal</span>
            <ExternalLink className="w-3.5 h-3.5 text-cyan-700" />
          </a>
          <button
            onClick={handleResetAll}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-red-700 bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-xl transition font-bold cursor-pointer"
            title="Reset workflow"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Reset</span>
          </button>
        </div>
      </header>

      {/* Main Patient Consumer Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-3 sm:p-6 lg:p-8 flex flex-col gap-6">

        {/* ═══ Top Master Navigation & Stage Banner (Royal Blue Theme) ═══ */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1565C0] via-[#0D47A1] to-[#0A2540] text-white rounded-3xl p-5 sm:p-8 shadow-xl shadow-blue-900/25 border border-blue-400/30 flex flex-col gap-5">
          {/* Ambient Glow in background */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/15 border border-amber-400/30 px-3 py-0.5 rounded-full shadow-xs">
                  MediRush Patient Workflow
                </span>
                <span className="text-[11px] font-mono text-blue-200 font-bold">
                  {flowState === 'IDLE' && 'Stage 1 of 4: Prescription Intake'}
                  {flowState === 'PARSING' && 'Stage 1 of 4: AI Extraction'}
                  {flowState === 'PARSED' && 'Stage 2 of 4: Review & Confirm'}
                  {flowState === 'BROADCASTING' && 'Stage 3 of 4: Live Dispatch Cascade'}
                  {flowState === 'ACCEPTED' && 'Stage 4 of 4: Order Out for Delivery'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight mt-1.5 leading-snug">
                {flowState === 'IDLE' && 'Scan Doctor’s Prescription to Find Nearby Stock'}
                {flowState === 'PARSING' && 'AI Multimodal Vision Deciphering Prescription...'}
                {flowState === 'PARSED' && 'Review Generic Substitutes & Confirm Dispatch'}
                {flowState === 'BROADCASTING' && 'Active Pharmacy Consensus & Distance Cascade'}
                {flowState === 'ACCEPTED' && 'Order Confirmed — Rider En Route to Doorstep'}
              </h1>
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
              className="text-xs font-black text-blue-950 bg-gradient-to-r from-amber-300 to-amber-400 hover:from-amber-400 hover:to-amber-500 px-4 py-2.5 rounded-2xl transition cursor-pointer shadow-lg shadow-amber-400/20 shrink-0 flex items-center gap-1.5 self-start sm:self-auto hover:scale-105 active:scale-95"
            >
              <MapPin className="w-4 h-4 text-blue-950" />
              <span>{userCoords?.isLive ? 'GPS Locked' : 'Locate My Area'}</span>
            </button>
          </div>

          {/* Step Pipeline Navigation Indicator */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {[
              { num: '1', title: '1. Scan Rx', desc: 'Handwriting OCR', active: flowState === 'IDLE' || flowState === 'PARSING', done: flowState === 'PARSED' || flowState === 'BROADCASTING' || flowState === 'ACCEPTED' },
              { num: '2', title: '2. Review & Save', desc: 'Jan Aushadhi Sub.', active: flowState === 'PARSED', done: flowState === 'BROADCASTING' || flowState === 'ACCEPTED' },
              { num: '3', title: '3. Cascade Ping', desc: '5-Min Window', active: flowState === 'BROADCASTING', done: flowState === 'ACCEPTED' },
              { num: '4', title: '4. Delivery', desc: 'Cold Chain SLA', active: flowState === 'ACCEPTED', done: false },
            ].map((step, idx) => (
              <div 
                key={idx} 
                className={`p-3 sm:p-3.5 rounded-2xl border transition-all flex flex-col gap-1.5 ${
                  step.active 
                    ? 'bg-white text-slate-900 border-white shadow-lg ring-2 ring-amber-400' 
                    : step.done 
                    ? 'bg-white/15 border-white/20 text-white' 
                    : 'bg-white/5 border-white/10 text-blue-200/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black ${
                    step.done 
                      ? 'bg-emerald-500 text-white' 
                      : step.active 
                      ? 'bg-[#1565C0] text-white shadow-xs' 
                      : 'bg-white/10 text-white/50'
                  }`}>
                    {step.done ? '✓' : step.num}
                  </span>
                  {step.active && <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />}
                </div>
                <div>
                  <span className={`text-xs font-black block truncate ${step.active ? 'text-slate-900' : 'text-white'}`}>
                    {step.title}
                  </span>
                  <span className={`text-[10px] block truncate font-medium ${step.active ? 'text-slate-500' : 'text-blue-200/80'}`}>{step.desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* ═══ "WHAT TO DO NEXT / AB KYA KAREN?" GUIDANCE BOX ═══ */}
          <div className="relative z-10 bg-slate-950/60 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-cyan-400/30 shadow-lg flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0 mt-0.5 font-black text-base shadow-xs">
              👉
            </div>
            <div className="text-xs">
              <div className="flex items-center gap-2">
                <span className="font-black text-amber-300 uppercase tracking-wider text-[11px]">
                  What To Do Next (मार्गदर्शन / Guidance):
                </span>
                <span className="text-[10px] font-mono bg-blue-900/80 border border-blue-600 px-2 py-0.5 rounded text-blue-200 font-bold">
                  Step {flowState === 'IDLE' || flowState === 'PARSING' ? '1' : flowState === 'PARSED' ? '2' : flowState === 'BROADCASTING' ? '3' : '4'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-blue-100 mt-1.5 leading-relaxed font-medium">
                {flowState === 'IDLE' && (
                  <span>
                    <strong>Option A:</strong> Take a photo or upload your doctor&apos;s handwritten slip below. <br/>
                    <strong>Option B (Fastest for testing):</strong> Click the <strong>&quot;Load Demo Rx&quot;</strong> button below to instantly populate Insulin &amp; Blood Pressure medicines.
                  </span>
                )}
                {flowState === 'PARSING' && (
                  <span>
                    Gemini AI is currently extracting chemical salts, verifying doctor Schedule H registration, and checking 2°C - 8°C cold storage requirements. Please wait 3-5 seconds...
                  </span>
                )}
                {flowState === 'PARSED' && (
                  <span>
                    Review your prescribed medicines, generic Jan Aushadhi substitutes, and total savings below. When ready, click the large <strong>&quot;Broadcast &amp; Order via WhatsApp&quot;</strong> button below to ping nearby pharmacies.
                  </span>
                )}
                {flowState === 'BROADCASTING' && (
                  <span>
                    Your order is broadcasting to nearby pharmacies within your delivery radius (Nearest store first). You can watch individual medicines get accepted in real-time below, or click <strong>&quot;⚡ Resolve Best Route Now&quot;</strong> to immediately lock the best combination.
                  </span>
                )}
                {flowState === 'ACCEPTED' && (
                  <span>
                    Your order is 100% confirmed and packed! Delivery Rider Rahul Sharma is on his way with your cold-chain ice gel sealed package. Track the ETA and delivery progress below.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* ═══ 1. Home / Prescription Upload Zone ═══ */}
        {flowState === 'IDLE' && (
          <div className="bg-white rounded-3xl p-5 sm:p-8 border border-blue-100 shadow-sm flex flex-col gap-6 animate-in fade-in duration-300">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-[#1565C0]">
                  Step 1: Prescription Intake &amp; Salt OCR
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                Upload Doctor&apos;s Prescription Slip
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                Upload a photo or doctor slip. MediRush Vision extracts chemical salts, verifies Schedule H compliance, and maps Jan Aushadhi generic substitutes saving you up to 70%.
              </p>
            </div>

            {/* Big Dropzone */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-3 border-dashed border-blue-300 hover:border-blue-600 bg-gradient-to-b from-blue-50/50 via-sky-50/20 to-white hover:from-blue-50/80 hover:to-sky-50/40 rounded-3xl p-6 sm:p-12 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer group shadow-xs"
            >
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#1565C0] to-sky-500 shadow-lg shadow-blue-500/25 flex items-center justify-center group-hover:scale-105 transition-transform text-white">
                <Upload className="w-10 h-10 text-white" />
              </div>
              <div className="text-center">
                <h3 className="text-base sm:text-lg font-black text-slate-900">Click Here to Scan / Upload Prescription</h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">Supports Camera snapshots, PNG, JPG, and PDF doctor slips</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                <span className="text-xs font-bold text-indigo-800 bg-indigo-50 border border-indigo-200 px-3.5 py-1.5 rounded-full shadow-2xs flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-indigo-600" /> Handwriting OCR
                </span>
                <span className="text-xs font-bold text-sky-800 bg-sky-50 border border-sky-200 px-3.5 py-1.5 rounded-full shadow-2xs flex items-center gap-1.5">
                  <Snowflake className="w-4 h-4 text-sky-600" /> 2°C - 8°C Cold Chain
                </span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full shadow-2xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Schedule H Safe
                </span>
              </div>
            </div>

            <div className="relative flex items-center justify-center my-1">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-4 text-xs font-black text-slate-400 uppercase tracking-widest absolute">
                OR 1-CLICK INSTANT DEMO FILL
              </span>
            </div>

            {/* 1-Click Demo Launcher */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#0D47A1] to-[#0A2540] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-blue-400/30">
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                  <span className="text-sm sm:text-base font-black text-white">Load Demo Chronic Prescription</span>
                  <span className="text-[10px] font-mono text-amber-300 bg-amber-950/80 border border-amber-700 px-2 py-0.5 rounded font-bold">Mock Data</span>
                </div>
                <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                  Loads a verified chronic prescription with <strong>Lantus Insulin (Cold Storage 2-8°C)</strong> + <strong>Telma 40 (Blood Pressure)</strong> for instant evaluation.
                </p>
              </div>
              <button
                onClick={handleLoadDemo}
                className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black py-3 px-6 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-amber-400/25 hover:scale-105 active:scale-95 shrink-0"
              >
                <span>Load Demo Rx</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Parse Error Banner */}
            {parseError && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-3 text-left animate-in fade-in duration-200">
                <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-extrabold text-red-900">Prescription Analysis Failed</h4>
                  <p className="text-xs text-red-700 mt-0.5 leading-relaxed">{parseError}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ Live Interactive Pharmacy Network Map ═══ */}
        {(flowState === 'IDLE' || flowState === 'PARSED' || flowState === 'BROADCASTING') && (
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-blue-100 shadow-sm flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1565C0] shadow-2xs">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">Local Verified Pharmacy Grid</h3>
                  <p className="text-xs text-slate-500">Live locations, phone numbers &amp; cold-chain readiness</p>
                </div>
              </div>
              <span className="text-xs font-black text-[#1565C0] bg-blue-50 border border-blue-200 px-3 py-1 rounded-full font-mono">
                4 Active Hubs
              </span>
            </div>
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
          </div>
        )}

        {/* ═══ 2. Real Gemini AI Processing State ═══ */}
        {flowState === 'PARSING' && (
          <div className="bg-white rounded-3xl p-8 sm:p-14 border border-blue-100 shadow-sm flex flex-col items-center justify-center text-center gap-6 animate-in fade-in duration-300">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-blue-100 border-t-[#1565C0] animate-spin flex items-center justify-center" />
              <Pill className="w-10 h-10 text-[#1565C0] absolute inset-0 m-auto animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#1565C0] bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                Gemini Vision Multimodal OCR
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Deciphering Medical Prescription...</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
                Extracting active chemical salts, verifying Schedule H regulatory compliance, and cross-matching Jan Aushadhi generic availability.
              </p>
            </div>
            
            <div className="w-full max-w-sm space-y-2.5 text-left bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs">
              <div className="flex items-center gap-2.5 text-slate-700 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping" />
                <span>Reading handwritten dosage instructions</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
                <span>Checking 2°C - 8°C thermal cold-chain criteria</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-700 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span>Validating doctor registration &amp; Schedule H seal</span>
              </div>
            </div>

            <div className="w-64 h-2.5 bg-blue-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#1565C0] via-sky-400 to-teal-400 rounded-full animate-[shimmer_1.5s_infinite] w-3/4" />
            </div>

            <button
              onClick={() => {
                setFlowState('IDLE');
                setParseError(null);
              }}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-4 py-2 rounded-xl transition cursor-pointer"
            >
              ← Cancel / Choose Another File
            </button>
          </div>
        )}

        {/* ═══ 3. Parsed Prescription Card & Savings Review ═══ */}
        {parsedData && (flowState === 'PARSED' || flowState === 'BROADCASTING') && (
          <div className="bg-white rounded-3xl p-5 sm:p-8 border border-blue-100 shadow-sm flex flex-col gap-6 animate-in fade-in duration-300">
            
            {/* Stage Title with Back Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-700">
                    Step 2: Review Medicines &amp; Verify Economics
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                  Prescription Verified &amp; Price Comparison
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  Check active chemical salts and compare standard brand prices with Jan Aushadhi generic equivalents.
                </p>
              </div>

              {/* Back Button to Upload Screen */}
              <button
                onClick={() => {
                  setFlowState('IDLE');
                  setParsedData(null);
                  setParseError(null);
                }}
                className="self-start sm:self-center text-xs font-bold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>← Back / Re-Upload</span>
              </button>
            </div>

            {/* Doctor Verification Header */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50/60 border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 border border-blue-300 flex items-center justify-center text-[#1565C0] shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">{parsedData.doctor_reg}</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">{parsedData.prescription_date} • Schedule H Verified Doctor</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full">
                ✓ Valid Rx
              </span>
            </div>

            {/* Cold Chain Warning Badge */}
            {parsedData.is_cold_chain && (
              <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-300 text-sky-950 rounded-2xl p-4 flex items-start gap-3.5 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-700 shrink-0 mt-0.5">
                  <Snowflake className="w-5 h-5 animate-pulse" />
                </div>
                <div className="text-xs">
                  <div className="font-black text-sky-950 flex items-center gap-2 text-xs sm:text-sm">
                    <span>❄️ Cold-Chain Transit Protocol Mandatory</span>
                    <span className="text-[10px] font-mono font-bold bg-sky-200 text-sky-900 px-2 py-0.5 rounded">2°C - 8°C</span>
                  </div>
                  <p className="text-xs text-sky-800 mt-1 font-medium leading-relaxed">
                    {parsedData.cold_chain_reason}
                  </p>
                </div>
              </div>
            )}

            {/* Dosage Pack Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div>
                <span className="text-xs sm:text-sm font-bold text-slate-900 block">Affordable Strip Dosage:</span>
                <span className="text-xs text-slate-500">Tier-2 loose strip support (Cut blister pack to reduce upfront out-of-pocket expenditure)</span>
              </div>
              <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-2xs shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => setIsFractional(false)}
                  className={`flex-1 sm:flex-none px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    !isFractional ? 'bg-[#1565C0] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Full 30-Day Course
                </button>
                <button
                  onClick={() => setIsFractional(true)}
                  className={`flex-1 sm:flex-none px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    isFractional ? 'bg-[#1565C0] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  10-Day Strip Pack
                </button>
              </div>
            </div>

            {/* Itemized Medicine List & Jan Aushadhi Substitutes */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                  Prescribed Medicines &amp; Generic Equivalence
                </h4>
                <span className="text-xs text-slate-500 font-bold font-mono">{parsedData.medicines.length} Medicines Identified</span>
              </div>

              {parsedData.medicines.map((med) => (
                <div 
                  key={med.id}
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 shadow-xs transition-colors flex flex-col gap-3"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 font-black text-sm sm:text-base text-slate-900">
                        <span>{med.brand_name}</span>
                        {med.is_cold_chain && (
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-sky-50 text-sky-800 border border-sky-200 rounded-md font-bold">
                            ❄️ 2-8°C Cold Chain
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-600 font-mono mt-1">
                        Active Salt: <strong className="text-indigo-700 font-semibold">{med.chemical_salt}</strong>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 font-medium">{med.dosage}</div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base sm:text-lg font-black text-emerald-700 font-mono">
                        ₹{isFractional && med.fractional_available ? Math.round(med.generic_price / 3) : med.generic_price}
                      </div>
                      <div className="text-xs text-slate-400 line-through font-mono">
                        ₹{isFractional && med.fractional_available ? Math.round(med.brand_price / 3) : med.brand_price}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-slate-700 flex items-center gap-1.5 font-medium">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                      Generic Equivalent: <strong className="text-slate-900 font-bold">{med.generic_substitute}</strong>
                    </span>
                    <span className="text-white font-black bg-emerald-600 px-3 py-1 rounded-xl text-xs shadow-xs">
                      Save {med.savings_percent}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Pricing Summary Card (Royal Blue Gradient Banner) */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#1565C0] via-[#0D47A1] to-emerald-700 text-white border border-blue-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div>
                <span className="text-xs sm:text-sm text-blue-100 font-bold block">Total Estimated Cost (Generic):</span>
                <span className="text-xs sm:text-sm font-black text-amber-300">
                  🎉 Save {parsedData.total_savings_percent}% via Jan Aushadhi Substitutes
                </span>
              </div>
              <div className="flex items-baseline gap-3 text-right">
                <span className="text-sm line-through text-blue-200/70 font-mono">₹{brandCalculatedTotal}</span>
                <span className="text-3xl sm:text-4xl font-black text-white font-mono">₹{calculatedTotal}</span>
              </div>
            </div>

            {/* Dispatch Error Banner */}
            {dispatchError && flowState === 'PARSED' && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-red-800">WhatsApp Dispatch Failed</h4>
                  <p className="text-[11px] text-red-600 mt-0.5 leading-relaxed">{dispatchError}</p>
                </div>
              </div>
            )}

            {/* Action Trigger Button / Live Decentralized Broadcast State */}
            {flowState === 'PARSED' ? (
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleBroadcastOrder}
                  disabled={isDispatching}
                  className="w-full bg-gradient-to-r from-[#1565C0] via-[#0D47A1] to-emerald-600 hover:from-blue-700 hover:to-emerald-700 active:scale-[0.99] text-white font-black py-4 px-6 rounded-2xl text-base sm:text-lg flex items-center justify-center gap-3 shadow-xl shadow-blue-600/30 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Radio className="w-5 h-5 animate-pulse" />
                  <span>{isDispatching ? 'Initiating Dispatch Ping...' : `Broadcast & Order via WhatsApp (₹${calculatedTotal})`}</span>
                </button>
                <p className="text-xs text-slate-500 text-center font-medium">
                  Dispatches real-time order pings to nearest verified pharmacies within your delivery radius.
                </p>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-[#0A2540] via-[#0D47A1] to-[#1565C0] text-white rounded-3xl p-5 sm:p-8 border-2 border-cyan-400/60 shadow-2xl flex flex-col gap-5 animate-in fade-in duration-300">
                
                {/* 5-Min Consensus Header with Back Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-400 animate-ping shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-cyan-300 uppercase tracking-wider block">
                          Live Network Broadcast Active
                        </span>
                        <span className="text-[10px] font-mono text-amber-300 bg-amber-400/20 border border-amber-400/40 px-2 py-0.5 rounded font-bold">
                          Multi-Store Consensus
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-white mt-0.5">
                        {activeOrderId ? `Order #${activeOrderId}` : 'Emergency Broadcast'}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setFlowState('PARSED')}
                      className="text-xs font-bold text-blue-200 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-xl transition cursor-pointer"
                    >
                      ← Cancel / Edit Rx
                    </button>
                    <div className="text-right">
                      <span className="text-sm font-mono font-black text-amber-300 bg-amber-950/80 border border-amber-600 px-3.5 py-1.5 rounded-xl block shadow-xs">
                        ⏱️ {Math.floor(countdownSeconds / 60)}:{(countdownSeconds % 60).toString().padStart(2, '0')}
                      </span>
                      <span className="text-[10px] text-blue-200 block mt-0.5 font-medium">Convergence Window</span>
                    </div>
                  </div>
                </div>

                {/* Explanation Banner */}
                <div className="bg-black/30 backdrop-blur-md border border-white/10 p-4 rounded-2xl text-xs space-y-1.5">
                  <div className="font-black text-cyan-300 flex items-center gap-2 text-xs sm:text-sm">
                    <Sparkles className="w-4 h-4 text-cyan-300" />
                    How Proximity Cascading Works:
                  </div>
                  <p className="text-xs text-blue-100 leading-relaxed font-medium">
                    MediRush pings the closest pharmacy first. If a pharmacy only stocks some items, the remaining items cascade to the next closest pharmacy in real-time. Order resolves automatically at <strong>100% coverage</strong> or when timer expires.
                  </p>
                </div>

                {/* Coverage Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
                    <span className="text-blue-100">Prescription Coverage Progress:</span>
                    <span className={orderProgress?.coveragePercent === 100 ? 'text-emerald-300 font-mono font-black' : 'text-amber-300 font-mono font-black'}>
                      {orderProgress?.coveragePercent || 0}% Secured ({orderProgress?.coveredMedsCount || 0}/{parsedData.medicines.length} items)
                    </span>
                  </div>
                  <div className="w-full bg-black/40 h-3.5 rounded-full overflow-hidden border border-white/10">
                    <div 
                      className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full transition-all duration-500 rounded-full"
                      style={{ width: `${orderProgress?.coveragePercent || 0}%` }}
                    />
                  </div>
                </div>

                {/* Live Itemized Acceptance Checklist */}
                <div className="space-y-2.5 pt-2 border-t border-white/10">
                  <span className="text-xs font-black text-blue-200 uppercase tracking-wider block">
                    Individual Medicine Claim Status:
                  </span>

                  {parsedData.medicines.map((med) => {
                    const medKey = med.id || med.brand_name;
                    const coverage = orderProgress?.coveredMedicines?.[medKey];
                    const isAccepted = coverage && coverage.confirmedBy.length > 0;

                    return (
                      <div 
                        key={medKey}
                        className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between transition-all ${
                          isAccepted
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-100 shadow-xs'
                            : 'bg-black/30 border-white/10 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                            isAccepted ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/50 animate-pulse'
                          }`}>
                            {isAccepted ? '✓' : '⏳'}
                          </span>
                          <div>
                            <span className="font-bold text-white block text-xs sm:text-sm">{med.brand_name}</span>
                            <span className="text-[11px] font-mono text-blue-200">
                              Salt: {med.chemical_salt}
                            </span>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          {isAccepted ? (
                            <span className="text-xs font-bold text-emerald-300 bg-emerald-950 border border-emerald-700 px-2.5 py-1 rounded-md block">
                              ✓ Stock Confirmed ({coverage.confirmedBy[0]?.split(' ')[0]})
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-amber-300 bg-amber-950/80 border border-amber-800 px-2.5 py-1 rounded-md block animate-pulse">
                              Cascading to Chemist Grid...
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Proximity Distance Cascading Dispatch Ladder */}
                <div className="space-y-2.5 pt-2 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-blue-200 uppercase tracking-wider block">
                      Proximity Dispatch Ladder (Nearest First):
                    </span>
                    <span className="text-xs font-mono text-cyan-300 font-bold">⚡ Haversine Ranked</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                          className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
                            isSecured
                              ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                              : isEvaluating
                              ? 'bg-amber-950/60 border-amber-500 text-amber-200 animate-pulse'
                              : 'bg-black/30 border-white/10 text-blue-200/60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono text-xs text-white font-bold bg-white/10 px-2 py-0.5 rounded-lg border border-white/20">
                              #{tIdx + 1}
                            </span>
                            <div>
                              <span className="font-bold block text-white text-xs">
                                {tier.chemistName.split(' ')[0]} {tier.chemistName.split(' ')[1] || ''}
                              </span>
                              <span className="text-[11px] font-mono text-blue-200">
                                📍 {tier.distanceKm} km away
                              </span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            isSecured
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                              : isEvaluating
                              ? 'bg-amber-950 text-amber-300 border border-amber-700'
                              : 'bg-white/10 text-blue-200/50 border border-white/10'
                          }`}>
                            {isSecured ? `${tier.fulfilledCount} Items Secured` : isEvaluating ? 'Evaluating...' : 'Standby'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Force Resolve Early Button */}
                <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-xs text-blue-200">Lock optimal route immediately without waiting:</span>
                  <button
                    onClick={handleForceResolve}
                    className="w-full sm:w-auto bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm px-5 py-2.5 rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-400/20 active:scale-[0.98]"
                  >
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>⚡ Resolve Best Route Now</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ Safety Audit Panel ═══ */}
        {safetyAudit && parsedData && (flowState === 'PARSED' || flowState === 'BROADCASTING') && (
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-blue-100 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  safetyAudit.overallStatus === 'SAFE' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' :
                  safetyAudit.overallStatus === 'WARNING' ? 'bg-amber-50 border border-amber-200 text-amber-700' :
                  'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">Deterministic Clinical Safety Audit</h3>
                  <p className="text-xs text-slate-500">Rule-based drug interaction engine • No hallucinated clinical advice</p>
                </div>
              </div>
              <span className={`text-xs font-black px-3 py-1 rounded-full ${
                safetyAudit.overallStatus === 'SAFE' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                safetyAudit.overallStatus === 'WARNING' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {safetyAudit.overallStatus}
              </span>
            </div>

            {safetyAudit.interactions.length > 0 && (
              <div className="space-y-2">
                {safetyAudit.interactions.map((alert, i) => (
                  <div key={i} className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 ${
                    alert.severity === 'CRITICAL'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-amber-50 border-amber-200'
                  }`}>
                    <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
                      alert.severity === 'CRITICAL' ? 'text-red-500' : 'text-amber-500'
                    }`} />
                    <div>
                      <span className="font-bold text-slate-900">{alert.drugA} + {alert.drugB}</span>
                      <p className="text-xs text-slate-600 mt-0.5">{alert.reason}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Source: {alert.source}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {safetyAudit.duplicates.length > 0 && (
              <div className="space-y-2">
                {safetyAudit.duplicates.map((dup, i) => (
                  <div key={i} className="p-3 rounded-2xl border bg-amber-50 border-amber-200 text-xs flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900">Duplicate: {dup.salt}</span>
                      <p className="text-xs text-slate-600 mt-0.5">{dup.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {safetyAudit.interactions.length === 0 && safetyAudit.duplicates.length === 0 && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-emerald-900 font-medium">No known adverse drug-drug interactions detected across prescribed chemical salts.</span>
              </div>
            )}

            <p className="text-[10px] text-slate-400 leading-relaxed">{safetyAudit.disclaimer}</p>
          </div>
        )}

        {/* ═══ Live Fulfillment Intelligence ═══ */}
        {rankingResults.length > 0 && (flowState === 'PARSED' || flowState === 'BROADCASTING') && (
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-blue-100 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900">Live Fulfillment Intelligence Ranking</h3>
                <p className="text-xs text-slate-500">Weighted scoring (Medicine Match + Distance Decay + Response SLA + Cold-Chain)</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {rankingResults.slice(0, 4).map((r, i) => (
                <div key={r.chemistId} className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between ${
                  i === 0 ? 'bg-blue-50/60 border-blue-300 ring-1 ring-blue-500/20' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                      i === 0 ? 'bg-[#1565C0] text-white' : 'bg-slate-200 text-slate-600'
                    }`}>{i + 1}</span>
                    <div>
                      <span className="font-bold text-slate-900 block text-xs sm:text-sm">{r.chemistName}</span>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-500 font-medium">
                        <span>Stock: {(r.breakdown.medicineMatch * 100).toFixed(0)}%</span>
                        <span>•</span>
                        <span>Dist: {(r.breakdown.distanceScore * 100).toFixed(0)}%</span>
                        <span>•</span>
                        <span>SLA: {(r.breakdown.responseEfficiency * 100).toFixed(0)}%</span>
                        <span>•</span>
                        <span>Cap: {(r.breakdown.capabilityScore * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                  <span className={`font-black font-mono text-base ${
                    i === 0 ? 'text-[#1565C0]' : 'text-slate-700'
                  }`}>{r.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ Multi-Node Pharmacy & Shadow Inventory Fulfillment Plan ═══ */}
        {fulfillmentPlan && (flowState === 'PARSED' || flowState === 'BROADCASTING') && (
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-blue-100 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">
                    {fulfillmentPlan.planType === 'MULTI_NODE_SPLIT' ? 'Multi-Node Cooperative Fulfillment' : 'Shadow Inventory Stock Match'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Weighted Set Cover • {fulfillmentPlan.overallCoverage}% Total Prescription Covered
                  </p>
                </div>
              </div>
              <span className={`text-xs font-black px-3 py-1 rounded-full ${
                fulfillmentPlan.planType === 'SINGLE_NODE'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : fulfillmentPlan.planType === 'MULTI_NODE_SPLIT'
                  ? 'bg-cyan-100 text-cyan-800 border border-cyan-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {fulfillmentPlan.planType === 'MULTI_NODE_SPLIT' ? `SPLIT: ${fulfillmentPlan.totalNodes} NODES` : 'SINGLE NODE'}
              </span>
            </div>

            <p className="text-xs text-slate-700 bg-slate-50 border border-slate-200 p-3.5 rounded-2xl leading-relaxed">
              {fulfillmentPlan.explanation}
            </p>

            <div className="space-y-3">
              {fulfillmentPlan.nodes.map((node, idx) => (
                <div key={node.chemistId} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-black text-slate-900 text-sm">Node #{idx + 1}: {node.chemistName}</span>
                      <span className="text-xs text-slate-500 block font-medium">📍 {node.area} • {node.distanceKm} km away</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 border border-emerald-300 px-2.5 py-1 rounded-lg">
                        Score: {node.totalNodeScore}/100
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Covered Items from Distributor Invoices:
                    </span>
                    {node.fulfilledMedicines.map((med, mIdx) => (
                      <div key={mIdx} className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <strong className="text-slate-800">{med.productName}</strong>
                          <span className="text-slate-400 font-mono block text-[10px]">
                            Batch #{med.batchNo} • {med.freshness?.observedText || 'Invoice Recorded'}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded">
                          {med.confidence}% Match
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2.5 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 font-mono">
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

        {/* ═══ Thermal Delivery Monitor ═══ */}
        {thermalSLA && thermalSLA.requiresColdChain && (flowState === 'PARSED' || flowState === 'BROADCASTING') && (
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-blue-100 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center">
                  <Thermometer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">Passive Thermal Cold-Chain Monitoring</h3>
                  <p className="text-xs text-slate-500">Real-time ambient weather model &amp; Ice gel safety envelope</p>
                </div>
              </div>
              <span className={`text-xs font-black px-3 py-1 rounded-full ${
                thermalSLA.thermalStatus === 'WITHIN_ESTIMATED_WINDOW' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                thermalSLA.thermalStatus === 'APPROACHING_LIMIT' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {thermalSLA.thermalStatus.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-center">
                <span className="text-xs text-slate-500 font-semibold block">Ambient Temp</span>
                <span className="text-lg font-black text-slate-900 font-mono block mt-0.5">
                  {weatherData?.temperatureCelsius !== null && weatherData?.temperatureCelsius !== undefined
                    ? `${weatherData.temperatureCelsius}°C`
                    : '32°C'}
                </span>
                <span className="text-[10px] text-slate-400 block font-medium">
                  {weatherData?.source === 'LIVE_API' ? 'Live Weather API' : 'Local City Model'}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-center">
                <span className="text-xs text-slate-500 font-semibold block">Safe Ice Window</span>
                <span className="text-lg font-black text-slate-900 font-mono block mt-0.5">
                  {thermalSLA.totalWindowMinutes !== null ? `${thermalSLA.totalWindowMinutes} min` : '45 min'}
                </span>
                <span className="text-[10px] text-slate-400 block font-medium">Phase-Change Gel</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-center">
                <span className="text-xs text-slate-500 font-semibold block">Thermal SLA Margin</span>
                <span className={`text-lg font-black font-mono block mt-0.5 ${
                  (thermalSLA.remainingWindowMinutes ?? 0) > 10 ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {thermalSLA.remainingWindowMinutes !== null ? `${thermalSLA.remainingWindowMinutes} min` : '23 min'}
                </span>
                <span className="text-[10px] text-slate-400 block font-medium">ETA: {thermalSLA.estimatedDeliveryMinutes} min</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed">{thermalSLA.disclaimer}</p>
          </div>
        )}

        {/* ═══ System Intelligence Dashboard ═══ */}
        {systemHealth && (
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-blue-100 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1565C0] border border-blue-200 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                  <span>System Intelligence Infrastructure</span>
                  {systemHealth.demoMode && (
                    <span className="text-[10px] font-mono bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold">DEMO MODE</span>
                  )}
                </h3>
                <p className="text-xs text-slate-500">Runtime health check across all micro-services &amp; APIs</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                  <div key={item.key} className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      val === 'LIVE' ? 'bg-emerald-500 shadow-2xs shadow-emerald-500/50' :
                      val === 'CONFIGURED' ? 'bg-emerald-400' :
                      val === 'NOT_CONFIGURED' ? 'bg-slate-300' : 'bg-red-400'
                    }`} />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block leading-tight">{item.label}</span>
                      <span className="text-[10px] text-slate-400">{item.sub} • {val === 'LIVE' || val === 'CONFIGURED' ? '✓ Active' : '○ Standby'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ 4. Live Fulfillment & Post-Delivery Lifecycle ═══ */}
        {flowState === 'ACCEPTED' && (
          <div className="bg-white rounded-3xl p-5 sm:p-8 border-2 border-emerald-500 shadow-2xl flex flex-col gap-6 animate-in zoom-in-95 duration-400">
            
            {/* Header with Navigation & New Order Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                    {deliveryStage === 'DELIVERED' ? 'Delivery Completed Successfully' : 'Step 4: Active Delivery & Cold-Chain Tracking'}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {deliveryStage === 'DELIVERED' ? '🎉 Order Delivered & Invoiced!' : 'Prescription Order Confirmed!'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                  {deliveryStage === 'DELIVERED' 
                    ? 'Medicines delivered at doorstep with verified 2°C - 8°C cold seal.' 
                    : 'Packed with pre-cooled ice gel thermal insulation and assigned to verified delivery partner.'}
                </p>
              </div>

              {/* Start New Prescription Button */}
              <button
                onClick={handleResetAll}
                className="self-start sm:self-center text-xs font-bold text-[#1565C0] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#1565C0]" />
                <span>Start New Order</span>
              </button>
            </div>

            {/* Stage Callout / Banner */}
            <div className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
              deliveryStage === 'DELIVERED' 
                ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950' 
                : deliveryStage === 'ARRIVED_DOORSTEP' 
                ? 'bg-amber-50 border-amber-300 text-amber-950' 
                : 'bg-blue-50/70 border-blue-200 text-blue-950'
            }`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                deliveryStage === 'DELIVERED' ? 'bg-emerald-600 text-white' : 'bg-[#1565C0] text-white'
              }`}>
                {deliveryStage === 'DELIVERED' ? <CheckCircle2 className="w-7 h-7 text-white" /> : <Bike className="w-6 h-6 text-white" />}
              </div>
              <div className="flex-1">
                <span className="text-xs font-black uppercase tracking-wider font-mono text-emerald-800">
                  {deliveryStage === 'DELIVERED' ? 'Fulfillment Complete' : `Order In Transit (${activeOrderId})`}
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 mt-0.5">
                  {deliveryStage === 'DELIVERED'
                    ? 'Prescription Handed Over & Verified'
                    : `Dispatched from ${fulfillment?.chemist_name || 'Gupta Medicos & Partner Grid'}`}
                </h3>
              </div>
            </div>

            {/* Delivery Progression Stepper */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2 border-y border-slate-100 text-center text-xs">
              <div className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold">✓</span>
                <span className="font-bold text-slate-800 text-[11px]">Rx Verified</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold">✓</span>
                <span className="font-bold text-slate-800 text-[11px]">Ice Gel Sealed</span>
              </div>
              <div className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border ${
                deliveryStage === 'DELIVERED' || deliveryStage === 'ARRIVED_DOORSTEP' 
                  ? 'bg-emerald-50/70 border-emerald-200' 
                  : 'bg-blue-50 border-blue-300 ring-2 ring-blue-500/20'
              }`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  deliveryStage === 'DELIVERED' || deliveryStage === 'ARRIVED_DOORSTEP' ? 'bg-emerald-600 text-white' : 'bg-[#1565C0] text-white animate-pulse'
                }`}>
                  {deliveryStage === 'DELIVERED' || deliveryStage === 'ARRIVED_DOORSTEP' ? '✓' : '🛵'}
                </span>
                <span className="font-bold text-slate-800 text-[11px]">Out for Delivery</span>
              </div>
              <div className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border ${
                deliveryStage === 'DELIVERED' 
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-900 font-black' 
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  deliveryStage === 'DELIVERED' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-400'
                }`}>
                  {deliveryStage === 'DELIVERED' ? '🎉' : '4'}
                </span>
                <span className="font-bold text-[11px]">{deliveryStage === 'DELIVERED' ? 'Delivered!' : 'Handover'}</span>
              </div>
            </div>

            {/* Delivery Security OTP & Action Card */}
            {deliveryStage !== 'DELIVERED' ? (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-base shadow-sm shrink-0">
                    🔑
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                      Secure Delivery Verification OTP
                    </span>
                    <span className="text-2xl font-black font-mono text-slate-900 tracking-wider">
                      {deliveryOtp}
                    </span>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Share this 4-digit code with rider only after inspecting the unbroken 2°C - 8°C cold seal.
                    </p>
                  </div>
                </div>

                {/* Simulation button for reviewer */}
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
                  {deliveryStage === 'DISPATCHED' && (
                    <button
                      onClick={() => setDeliveryStage('ARRIVED_DOORSTEP')}
                      className="bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 font-bold text-xs px-3.5 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-[0.98]"
                    >
                      <span>⚡ Simulate Rider Arrival</span>
                    </button>
                  )}
                  {deliveryStage === 'ARRIVED_DOORSTEP' && (
                    <button
                      onClick={() => {
                        setDeliveryStage('DELIVERED');
                        playSuccessChime();
                        try { confetti({ particleCount: 140, spread: 90, origin: { y: 0.5 } }); } catch (e) {}
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-[0.98]"
                    >
                      <Check className="w-4 h-4" />
                      <span>Verify OTP &amp; Complete Delivery</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                    ✓
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block font-mono">
                      Delivery Completed at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <h4 className="text-base font-black text-slate-900">
                      Cold Chain Temperature Maintained at 4.2°C
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Doctor prescription verified • Jan Aushadhi generic substitution saved ₹{parsedData ? Math.round(parsedData.total_brand_total - parsedData.total_generic_total) : 387}.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined') window.print();
                    }}
                    className="flex-1 sm:flex-none bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs px-3.5 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <FileText className="w-4 h-4 text-slate-600" />
                    <span>Download Invoice (PDF)</span>
                  </button>
                  <button
                    onClick={handleResetAll}
                    className="flex-1 sm:flex-none bg-[#1565C0] hover:bg-blue-700 text-white font-black text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <span>Order Again</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Delivery Agent Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-[#1565C0] text-white flex items-center justify-center font-bold text-sm shadow-md">
                  <Bike className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    {fulfillment?.rider || 'Rahul Sharma'}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">Hero Splendor (MP-43-E-2101) • Verified Delivery Partner</p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <a
                  href="tel:+919826154321"
                  className="text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl transition flex items-center gap-1.5 shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5 text-[#1565C0]" />
                  <span>Call Rider</span>
                </a>
                <div className="text-right pl-2">
                  <span className="text-xs sm:text-sm font-black text-emerald-700 bg-emerald-100/80 border border-emerald-300 px-3 py-1.5 rounded-xl font-mono block shadow-2xs">
                    {deliveryStage === 'DELIVERED' ? 'Delivered' : `ETA: ${fulfillment?.eta_minutes || 19} Mins`}
                  </span>
                </div>
              </div>
            </div>

            {/* Cooperative Multi-Node Fulfillment Plan (if split order) */}
            {fulfillment?.cooperativePlan && fulfillment.cooperativePlan.nodes.length > 1 && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Database className="w-4 h-4 text-cyan-600" />
                    Cooperative Multi-Pharmacy Split ({fulfillment.cooperativePlan.nodes.length} Nodes)
                  </span>
                  <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-lg border border-emerald-300">
                    {fulfillment.cooperativePlan.overallCoverage}% Covered
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {fulfillment.cooperativePlan.nodes.map((node, idx) => (
                    <div key={node.chemistId} className="bg-white border border-slate-200 p-3 rounded-xl text-xs flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-800">Node #{idx + 1}: {node.chemistName}</strong>
                        <span className="text-xs text-slate-500 font-mono">📍 {node.distanceKm} km</span>
                      </div>
                      <div className="space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-100 text-xs">
                        {node.fulfilledMedicines.map((m, mIdx) => (
                          <div key={mIdx} className="flex justify-between text-slate-700">
                            <span>✓ {m.medicineName}</span>
                            <span className="text-xs text-slate-400 font-mono">#{m.batchNo}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-slate-500 flex justify-between font-mono pt-2 border-t border-slate-200">
                  <span>Combined Distance: {fulfillment.cooperativePlan.totalEstimatedDistanceKm} km</span>
                  <span>Estimated Total ETA: {fulfillment.cooperativePlan.estimatedDeliveryEtaMinutes} Mins</span>
                </div>
              </div>
            )}

            {/* Thermal Seal Verification Badge */}
            <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 text-sky-950 rounded-2xl p-4 flex items-center gap-3.5">
              <ThermometerSnowflake className="w-6 h-6 text-sky-600 shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
              <div className="text-xs">
                <span className="font-black block text-xs sm:text-sm">Thermal Seal Active (2°C - 8°C Monitored)</span>
                <span className="text-xs text-sky-800 mt-0.5 block font-medium">Insulin and biologics secured with pre-cooled ice gel thermal pouch.</span>
              </div>
            </div>

            {/* Summary Items */}
            <div className="border-t border-slate-200 pt-4 flex justify-between items-center text-xs sm:text-sm">
              <span className="text-slate-500 font-bold">Total Payable at Delivery:</span>
              <span className="text-2xl font-black text-slate-900 font-mono">
                ₹{calculatedTotal} (Cash / UPI on Delivery)
              </span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
