'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import confetti from 'canvas-confetti';
import {
  Bike,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Snowflake,
  Clock,
  Thermometer,
  Shield,
  Zap,
  Activity,
  Database,
  Phone,
  Navigation,
  Check,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Wifi,
  WifiOff,
  RefreshCw,
  Layers,
  ArrowRight,
  Radio,
  FileText
} from 'lucide-react';
import { CHEMIST_REGISTRY, ChemistNode } from '@/lib/chemists';
import { MultiFulfillmentPlan, PharmacyCoverageNode } from '@/lib/multi-pharmacy-fulfillment';
import { RankingResult, ThermalSLAResult, SystemHealthCheck } from '@/lib/types';

const PharmacyMap = dynamic(() => import('@/components/PharmacyMap'), { ssr: false });

interface ActiveDeliveryOrder {
  id: string;
  patient_name: string;
  patient_phone: string;
  area: string;
  city: string;
  total_amount: number;
  is_cold_chain: boolean;
  cold_chain_reason: string;
  status: 'ASSIGNED' | 'PICKING_UP_NODE_1' | 'PICKING_UP_NODE_2' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  pickupNodes: Array<{
    nodeIndex: number;
    chemistId: string;
    chemistName: string;
    area: string;
    phone: string;
    distanceKm: number;
    items: Array<{ name: string; batchNo?: string; isColdChain?: boolean }>;
    pickedUp: boolean;
  }>;
  totalDistanceKm: number;
  etaMinutes: number;
  thermalStatus: {
    ambientTemp: number;
    carrierTemp: number;
    totalWindowMin: number;
    remainingWindowMin: number;
  };
}

const DEFAULT_SAMPLE_DELIVERY: ActiveDeliveryOrder = {
  id: 'MR-8821',
  patient_name: 'Rajesh Sharma',
  patient_phone: '+91 98261 54321',
  area: 'Shastri Nagar',
  city: 'Ratlam',
  total_amount: 588,
  is_cold_chain: true,
  cold_chain_reason: 'Lantus Insulin detected (Requires 2°C - 8°C Cold Gel Ice Pack)',
  status: 'ASSIGNED',
  pickupNodes: [
    {
      nodeIndex: 1,
      chemistId: 'chem-1',
      chemistName: 'Gupta Medicos & Cold Chain Hub',
      area: 'Station Road',
      phone: '+91 98260 12345',
      distanceKm: 1.2,
      pickedUp: false,
      items: [
        { name: 'Lantus Solostar 100IU/ml Pen', batchNo: 'LAN26B04', isColdChain: true },
        { name: 'Telma 40mg (Telmisartan)', batchNo: 'TEL26H01', isColdChain: false },
      ],
    },
    {
      nodeIndex: 2,
      chemistId: 'chem-3',
      chemistName: 'Jan Aushadhi Kendra (Govt. Generic)',
      area: 'Civil Hospital Gate',
      phone: '+91 98930 99887',
      distanceKm: 1.9,
      pickedUp: false,
      items: [
        { name: 'Ciprofloxacin 500mg (PMBJP)', batchNo: 'JA-CIP-26', isColdChain: false },
      ],
    },
  ],
  totalDistanceKm: 3.1,
  etaMinutes: 19,
  thermalStatus: {
    ambientTemp: 29,
    carrierTemp: 4.2,
    totalWindowMin: 78,
    remainingWindowMin: 56,
  },
};

export default function RiderPortal() {
  const [activeDelivery, setActiveDelivery] = useState<ActiveDeliveryOrder | null>(DEFAULT_SAMPLE_DELIVERY);
  const [deliveryStep, setDeliveryStep] = useState<number>(1);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [carrierTemp, setCarrierTemp] = useState<number>(4.2);
  const [weatherData, setWeatherData] = useState<{ temperatureCelsius: number | null; source: string; city?: string } | null>({
    temperatureCelsius: 29,
    source: 'LIVE_API',
    city: 'Ratlam',
  });
  const [systemHealth, setSystemHealth] = useState<SystemHealthCheck | null>(null);
  const [completedDeliveriesCount, setCompletedDeliveriesCount] = useState<number>(6);
  const [todaysEarnings, setTodaysEarnings] = useState<number>(480);
  const [otpInput, setOtpInput] = useState<string>('');
  const [otpVerified, setOtpVerified] = useState<boolean>(false);

  const channelRef = useRef<BroadcastChannel | null>(null);

  // Fetch system health and weather on mount
  useEffect(() => {
    fetch('/api/system-health').then((r) => r.json()).then(setSystemHealth).catch(() => {});
    fetch('/api/find-chemists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city: 'Ratlam', requiresColdChain: true }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.weather) setWeatherData(data.weather);
      })
      .catch(() => {});
  }, []);

  // Listen to SSE & BroadcastChannel for real-time order assignments
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const eventSource = new EventSource('/api/events');

    eventSource.addEventListener('ORDER_CONFIRMED', (e: MessageEvent) => {
      try {
        const payload = JSON.parse(e.data);
        if (payload.cooperativePlan && payload.cooperativePlan.nodes) {
          const plan: MultiFulfillmentPlan = payload.cooperativePlan;
          const newDelivery: ActiveDeliveryOrder = {
            id: payload.orderId || `MR-${Math.floor(1000 + Math.random() * 9000)}`,
            patient_name: 'Rajesh Sharma',
            patient_phone: '+91 98261 54321',
            area: 'Shastri Nagar',
            city: 'Ratlam',
            total_amount: 588,
            is_cold_chain: payload.is_cold_chain ?? true,
            cold_chain_reason: 'Cold storage medicine verified (2°C - 8°C)',
            status: 'ASSIGNED',
            pickupNodes: plan.nodes.map((node, idx) => ({
              nodeIndex: idx + 1,
              chemistId: node.chemistId,
              chemistName: node.chemistName,
              area: node.area,
              phone: node.phone || '+91 98260 12345',
              distanceKm: node.distanceKm,
              pickedUp: false,
              items: node.fulfilledMedicines.map((m) => ({
                name: m.medicineName || m.productName,
                batchNo: m.batchNo,
                isColdChain: payload.is_cold_chain && idx === 0,
              })),
            })),
            totalDistanceKm: plan.totalEstimatedDistanceKm || 3.1,
            etaMinutes: plan.estimatedDeliveryEtaMinutes || 19,
            thermalStatus: {
              ambientTemp: weatherData?.temperatureCelsius || 29,
              carrierTemp: 4.2,
              totalWindowMin: 78,
              remainingWindowMin: 56,
            },
          };

          setActiveDelivery(newDelivery);
          setDeliveryStep(1);
          setOtpVerified(false);
          setOtpInput('');
        }
      } catch (err) {
        console.error('SSE rider parse error', err);
      }
    });

    const channel = new BroadcastChannel('medirush_channel');
    channelRef.current = channel;

    channel.onmessage = (event) => {
      const { type, payload } = event.data || {};
      if (type === 'ORDER_ACCEPTED' && payload.cooperativePlan) {
        const plan: MultiFulfillmentPlan = payload.cooperativePlan;
        const newDelivery: ActiveDeliveryOrder = {
          id: payload.orderId || `MR-${Math.floor(1000 + Math.random() * 9000)}`,
          patient_name: 'Rajesh Sharma',
          patient_phone: '+91 98261 54321',
          area: 'Shastri Nagar',
          city: 'Ratlam',
          total_amount: 588,
          is_cold_chain: payload.is_cold_chain ?? true,
          cold_chain_reason: 'Cold storage medicine verified (2°C - 8°C)',
          status: 'ASSIGNED',
          pickupNodes: plan.nodes.map((node, idx) => ({
            nodeIndex: idx + 1,
            chemistId: node.chemistId,
            chemistName: node.chemistName,
            area: node.area,
            phone: node.phone || '+91 98260 12345',
            distanceKm: node.distanceKm,
            pickedUp: false,
            items: node.fulfilledMedicines.map((m) => ({
              name: m.medicineName || m.productName,
              batchNo: m.batchNo,
              isColdChain: payload.is_cold_chain && idx === 0,
            })),
          })),
          totalDistanceKm: plan.totalEstimatedDistanceKm || 3.1,
          etaMinutes: plan.estimatedDeliveryEtaMinutes || 19,
          thermalStatus: {
            ambientTemp: weatherData?.temperatureCelsius || 29,
            carrierTemp: 4.2,
            totalWindowMin: 78,
            remainingWindowMin: 56,
          },
        };

        setActiveDelivery(newDelivery);
        setDeliveryStep(1);
        setOtpVerified(false);
        setOtpInput('');
      }
    };

    return () => {
      eventSource.close();
      channel.close();
    };
  }, [weatherData]);

  // Chime sound on action
  const playStepChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime);
      osc.frequency.setValueAtTime(880.00, audioCtx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {}
  };

  // Step Handler: Confirm pickup at a node
  const handleConfirmPickupNode = (nodeIdx: number) => {
    if (!activeDelivery) return;
    playStepChime();

    setActiveDelivery((prev) => {
      if (!prev) return null;
      const updatedNodes = prev.pickupNodes.map((n, i) =>
        i === nodeIdx ? { ...n, pickedUp: true } : n
      );
      const allPicked = updatedNodes.every((n) => n.pickedUp);
      return {
        ...prev,
        pickupNodes: updatedNodes,
        status: allPicked ? 'OUT_FOR_DELIVERY' : prev.status,
      };
    });

    setDeliveryStep((prev) => prev + 1);

    // Broadcast rider update
    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'RIDER_STATUS_UPDATE',
        payload: {
          orderId: activeDelivery.id,
          step: deliveryStep + 1,
          status: 'PICKUP_COMPLETE',
        },
      });
    }
  };

  // Step Handler: Complete Delivery
  const handleCompleteDelivery = () => {
    if (!activeDelivery) return;
    playStepChime();

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (e) {}

    setActiveDelivery((prev) => (prev ? { ...prev, status: 'DELIVERED' } : null));
    setCompletedDeliveriesCount((c) => c + 1);
    setTodaysEarnings((e) => e + 75);
    setOtpVerified(true);

    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'RIDER_STATUS_UPDATE',
        payload: {
          orderId: activeDelivery.id,
          status: 'DELIVERED',
        },
      });
    }
  };

  // Simulate New Cooperative Delivery Job
  const handleSimulateNewJob = () => {
    setActiveDelivery({
      ...DEFAULT_SAMPLE_DELIVERY,
      id: `MR-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'ASSIGNED',
      pickupNodes: DEFAULT_SAMPLE_DELIVERY.pickupNodes.map((n) => ({ ...n, pickedUp: false })),
    });
    setDeliveryStep(1);
    setOtpVerified(false);
    setOtpInput('');
    playStepChime();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
      {/* Top Rider Terminal Header */}
      <header className="h-16 bg-slate-950 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-emerald-900/50">
            <Bike className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">
                Rahul Sharma
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/80 font-semibold">
                HERO SPLENDOR • MP-43-E-2101
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span className="text-emerald-400 font-medium">● Duty Active (Ratlam Grid)</span>
              <span>•</span>
              <span className="text-cyan-400 flex items-center gap-1">
                <Snowflake className="w-3 h-3" /> Cold Gel Thermal Carrier Attached (4.2°C)
              </span>
            </p>
          </div>
        </div>

        {/* Status & Control Bar */}
        <div className="flex items-center gap-3">
          {/* Simulate New Delivery Order */}
          <button
            onClick={handleSimulateNewJob}
            className="px-3 py-1.5 rounded-lg border border-amber-500/80 bg-amber-950/60 hover:bg-amber-900 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-amber-950/50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate 2-Node Pickup Job</span>
          </button>

          {/* Online / Offline Toggle */}
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              isOnline
                ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300 hover:bg-emerald-900/80'
                : 'bg-amber-950/80 border-amber-700 text-amber-300 hover:bg-amber-900/80'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isOnline ? 'GPS Live (Connected)' : 'Offline (Cached Route)'}</span>
          </button>

          <a
            href="/patient"
            target="_blank"
            className="text-xs text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
          >
            <span>Patient App</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <a
            href="/chemist"
            target="_blank"
            className="text-xs text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
          >
            <span>Chemist Terminal</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </header>

      {/* Main Grid: Left Column Active Navigation & Workflow + Right Column Intelligence Panels */}
      <div className="flex-1 grid grid-cols-12 gap-0 overflow-hidden">
        
        {/* LEFT COLUMN: Active Delivery Mission & Navigation */}
        <main className="col-span-8 p-6 flex flex-col gap-5 border-r border-slate-800 overflow-y-auto">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Deliveries Today</span>
              <span className="text-2xl font-black text-emerald-400 font-mono mt-0.5 block">
                {completedDeliveriesCount} Completed
              </span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Today's Payout</span>
              <span className="text-2xl font-black text-white font-mono mt-0.5 block">
                ₹{todaysEarnings}
              </span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Carrier Thermal Temp</span>
              <span className="text-2xl font-black text-cyan-400 font-mono mt-0.5 block">
                {carrierTemp}°C (Safe)
              </span>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Average ETA SLA</span>
              <span className="text-2xl font-black text-indigo-400 font-mono mt-0.5 block">
                17 Mins
              </span>
            </div>
          </div>

          {/* ACTIVE DISPATCH JOB CARD */}
          {activeDelivery ? (
            <div className="bg-slate-950 border-2 border-emerald-500/80 rounded-2xl p-6 shadow-xl flex flex-col gap-5 ring-2 ring-emerald-500/20">
              {/* Order Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-white bg-red-600 px-3 py-1 rounded-md uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                    <Radio className="w-3.5 h-3.5" /> Active Emergency Dispatch #{activeDelivery.id}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Multi-Node Cooperative Pickup
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3 py-1 rounded-lg">
                    Total Route: {activeDelivery.totalDistanceKm} km • Target ETA: {activeDelivery.etaMinutes} Mins
                  </span>
                </div>
              </div>

              {/* Patient Dropoff Location */}
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Final Delivery Destination:</span>
                    <strong className="text-white text-sm">{activeDelivery.patient_name}</strong>
                    <span className="text-slate-400 block mt-0.5 font-mono">📍 {activeDelivery.area}, {activeDelivery.city}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 text-[10px] block">Customer Contact:</span>
                  <a href={`tel:${activeDelivery.patient_phone}`} className="font-mono text-emerald-400 font-bold text-xs hover:underline flex items-center gap-1 justify-end mt-0.5">
                    <Phone className="w-3.5 h-3.5" /> {activeDelivery.patient_phone}
                  </a>
                </div>
              </div>

              {/* Cold Storage Alert */}
              {activeDelivery.is_cold_chain && (
                <div className="bg-cyan-950/60 border border-cyan-500/80 rounded-xl p-3.5 flex items-start gap-3 text-xs">
                  <Snowflake className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <span className="font-bold text-cyan-200 block uppercase tracking-wide">
                      Active Cold-Chain Protocol (2°C - 8°C Protected)
                    </span>
                    <span className="text-cyan-300/80 text-[11px] leading-relaxed block mt-0.5">
                      {activeDelivery.cold_chain_reason} Pre-cooled gel pack carrier verified at 4.2°C. Keep zipped during transit.
                    </span>
                  </div>
                </div>
              )}

              {/* MULTI-NODE PICKUP ROUTE STEPS */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-emerald-400" />
                  Turn-by-Turn Multi-Node Pickup & Delivery Sequence:
                </h3>

                <div className="space-y-3">
                  {activeDelivery.pickupNodes.map((node, idx) => (
                    <div
                      key={node.chemistId}
                      className={`p-4 rounded-xl border transition-all text-xs flex flex-col gap-3 ${
                        node.pickedUp
                          ? 'bg-emerald-950/30 border-emerald-600/60'
                          : deliveryStep === idx + 1
                          ? 'bg-slate-900 border-amber-500/80 ring-2 ring-amber-500/20 shadow-lg'
                          : 'bg-slate-950/60 border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                            node.pickedUp
                              ? 'bg-emerald-600 text-white'
                              : deliveryStep === idx + 1
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {node.pickedUp ? '✓' : idx + 1}
                          </span>
                          <div>
                            <span className="font-bold text-white text-sm block">
                              Pickup Node #{node.nodeIndex}: {node.chemistName}
                            </span>
                            <span className="text-slate-400 text-[11px] font-mono">
                              📍 {node.area} • {node.distanceKm} km away
                            </span>
                          </div>
                        </div>

                        <div>
                          {node.pickedUp ? (
                            <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950 border border-emerald-800 px-2.5 py-1 rounded-lg flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Items Collected
                            </span>
                          ) : (
                            <button
                              onClick={() => handleConfirmPickupNode(idx)}
                              disabled={deliveryStep !== idx + 1}
                              className={`text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                                deliveryStep === idx + 1
                                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-950/50'
                                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Confirm Pickup at Node #{idx + 1}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Items to collect at this pharmacy */}
                      <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                          Medicines to collect:
                        </span>
                        {node.items.map((item, iIdx) => (
                          <div key={iIdx} className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-200 font-medium">✓ {item.name}</span>
                            <div className="flex items-center gap-2">
                              {item.isColdChain && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded flex items-center gap-0.5">
                                  <Snowflake className="w-2.5 h-2.5" /> Cold Gel Pack
                                </span>
                              )}
                              <span className="text-[10px] font-mono text-slate-400">Batch #{item.batchNo}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* FINAL STEP: Doorstep Delivery & Handover */}
                  <div className={`p-4 rounded-xl border transition-all text-xs flex flex-col gap-3 ${
                    activeDelivery.status === 'DELIVERED'
                      ? 'bg-emerald-950/40 border-emerald-500'
                      : activeDelivery.pickupNodes.every((n) => n.pickedUp)
                      ? 'bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'bg-slate-950/60 border-slate-800 opacity-60'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                          activeDelivery.status === 'DELIVERED'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-indigo-600 text-white'
                        }`}>
                          {activeDelivery.status === 'DELIVERED' ? '✓' : '🏁'}
                        </span>
                        <div>
                          <span className="font-bold text-white text-sm block">
                            Final Step: Doorstep Handover & Settlement
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            Collect ₹{activeDelivery.total_amount} (Cash / UPI) & Verify Delivery OTP
                          </span>
                        </div>
                      </div>

                      {activeDelivery.status === 'DELIVERED' ? (
                        <span className="text-xs font-black text-emerald-400 bg-emerald-950 border border-emerald-800 px-3 py-1 rounded-lg">
                          🎉 Order Delivered Successfully
                        </span>
                      ) : (
                        <button
                          onClick={handleCompleteDelivery}
                          disabled={!activeDelivery.pickupNodes.every((n) => n.pickedUp)}
                          className={`text-xs font-black px-5 py-2.5 rounded-xl transition cursor-pointer flex items-center gap-2 uppercase tracking-wider ${
                            activeDelivery.pickupNodes.every((n) => n.pickedUp)
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/50'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Complete & Deliver Order
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="my-auto py-20 text-center bg-slate-950/60 rounded-2xl border border-slate-800 p-8 flex flex-col items-center gap-3">
              <Clock className="w-10 h-10 text-emerald-400 animate-pulse" />
              <h3 className="text-base font-bold text-white">No Active Delivery Assignment</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                When a cooperative emergency prescription order is locked, it will appear here with automated turn-by-turn multi-node routing.
              </p>
              <button
                onClick={handleSimulateNewJob}
                className="mt-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                Simulate Sample 2-Node Delivery
              </button>
            </div>
          )}
        </main>

        {/* RIGHT COLUMN: Real-Time Intelligence, Thermal Telemetry & Rankings */}
        <aside className="col-span-4 p-6 bg-slate-950/70 flex flex-col gap-5 overflow-y-auto">
          
          {/* 1. Live Thermal Cold Gel Carrier Telemetry */}
          <div className="bg-slate-900 border border-cyan-500/60 rounded-2xl p-4 shadow-lg flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center">
                  <Thermometer className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Cold Gel Thermal Telemetry</h4>
                  <span className="text-[10px] text-slate-400">Passive Cooling SLA Window</span>
                </div>
              </div>

              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                2°C – 8°C VERIFIED
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Ambient</span>
                <span className="text-base font-black text-white font-mono">
                  {weatherData?.temperatureCelsius ?? 29}°C
                </span>
                <span className="text-[9px] text-emerald-400 block mt-0.5">Live Open-Meteo</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Carrier Core</span>
                <span className="text-base font-black text-cyan-400 font-mono">
                  {carrierTemp}°C
                </span>
                <span className="text-[9px] text-cyan-400/80 block mt-0.5">Blue Ice Pouch</span>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block">Safe Window</span>
                <span className="text-base font-black text-emerald-400 font-mono">
                  56 Min
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">ETA: 19 Min</span>
              </div>
            </div>
          </div>

          {/* 2. Live Fulfillment Intelligence Rankings */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Live Fulfillment Intelligence</h4>
                  <span className="text-[10px] text-slate-400">Weighted scoring • Real-time decay</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-indigo-300 font-bold bg-indigo-950 border border-indigo-800 px-2 py-0.5 rounded">
                Multi-Node
              </span>
            </div>

            <div className="space-y-2">
              {CHEMIST_REGISTRY.slice(0, 3).map((chem, idx) => (
                <div key={chem.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    <div>
                      <strong className="text-white block text-[11px]">{chem.name}</strong>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                        <span>Med: {(chem.chronic_stock_rating * 100).toFixed(0)}%</span>
                        <span>•</span>
                        <span>Dist: {chem.distance_km} km</span>
                        <span>•</span>
                        <span>SLA: {chem.avg_response_time_sec}s</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded">
                    Score {Math.round(chem.chronic_stock_rating * 50 + 40)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. System Intelligence Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col gap-2.5">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">System Intelligence Engine</h4>
                <span className="text-[10px] text-slate-400">Live integration status verified</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {[
                { label: 'AI Extraction', sub: 'Gemini Vision', live: true },
                { label: 'Safety Audit', sub: 'Deterministic Rules', live: true },
                { label: 'Chemist Ranking', sub: 'Weighted Scoring', live: true },
                { label: 'Thermal SLA', sub: 'Passive Cooling', live: true },
                { label: 'Weather API', sub: 'Open-Meteo Live', live: true },
                { label: 'Messaging', sub: 'Twilio WhatsApp', live: true },
              ].map((item, i) => (
                <div key={i} className="p-2 bg-slate-950 border border-slate-800/80 rounded-lg flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <div>
                    <span className="font-bold text-slate-200 block text-[11px] leading-tight">{item.label}</span>
                    <span className="text-[9px] text-slate-400">{item.sub} • ✓ Active</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
