'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Pill, 
  ArrowRight, 
  CheckCircle2, 
  Radio, 
  Check, 
  CheckCircle,
  Wifi, 
  WifiOff, 
  Layers,
  Snowflake,
  ShieldCheck,
  Navigation,
  FileCheck2,
  Cpu,
  Search,
  Zap,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Sample Queries for the Live Interactive Sandbox
const SAMPLE_QUERIES = [
  {
    name: 'Lantus Insulin',
    brand: 'Lantus 100IU Cartridge',
    salt: 'Insulin Glargine 100 IU/ml',
    substitute: 'Basalog PMBJP Cartridge (Biocon)',
    brandPrice: 680,
    genericPrice: 410,
    savings: 40,
    isColdChain: true,
    stores: 3,
    nearest: 'Gupta Medicos & Cold Chain (0.6 km)',
    confidence: 98
  },
  {
    name: 'Ciproflx',
    brand: 'Ciprofloxacin 500mg',
    salt: 'Ciprofloxacin Hydrochloride 500mg',
    substitute: 'PMBJP Ciprofloxacin 500 (Jan Aushadhi)',
    brandPrice: 78,
    genericPrice: 18,
    savings: 77,
    isColdChain: false,
    stores: 6,
    nearest: 'Jan Aushadhi Kendra #4 (1.1 km)',
    confidence: 96
  },
  {
    name: 'Telma 40',
    brand: 'Telma 40 (Glenmark)',
    salt: 'Telmisartan IP 40mg',
    substitute: 'Telmisartan PMBJP Tablets',
    brandPrice: 145,
    genericPrice: 28,
    savings: 81,
    isColdChain: false,
    stores: 8,
    nearest: 'Apollo 24/7 MedPlus (0.4 km)',
    confidence: 99
  },
  {
    name: 'Augmentin',
    brand: 'Augmentin 625 Duo',
    salt: 'Amoxicillin 500mg + Clavulanic Acid 125mg',
    substitute: 'Amoxy-Clav PMBJP 625mg',
    brandPrice: 215,
    genericPrice: 68,
    savings: 68,
    isColdChain: false,
    stores: 5,
    nearest: 'Civil Lines Medicos (0.9 km)',
    confidence: 97
  },
  {
    name: 'Glycomet-SR 500',
    brand: 'Glycomet-SR 500',
    salt: 'Metformin Hydrochloride 500mg (Sustained Release)',
    substitute: 'Metformin PMBJP Prolonged Release',
    brandPrice: 65,
    genericPrice: 12,
    savings: 81,
    isColdChain: false,
    stores: 7,
    nearest: 'Jan Aushadhi Kendra (0.8 km)',
    confidence: 95
  }
];

export default function LandingPage() {
  // Interactive Live Medicine Normalizer Sandbox State
  const [selectedSampleIndex, setSelectedSampleIndex] = useState(4); // default Glycomet-SR 500
  const activeSample = SAMPLE_QUERIES[selectedSampleIndex];

  // Interactive Set Cover Calculator State
  const [selectedMeds, setSelectedMeds] = useState<{ [key: string]: boolean }>({
    'Lantus Insulin': true,
    'Telma 40mg': true,
    'Ciprofloxacin 500mg': true
  });

  const toggleMedSelection = (med: string) => {
    setSelectedMeds(prev => ({ ...prev, [med]: !prev[med] }));
  };

  const selectedCount = Object.values(selectedMeds).filter(Boolean).length;

  // Offline Diagnostics State
  const [offlineState, setOfflineState] = useState<'ONLINE' | 'OFFLINE' | 'SYNCED'>('ONLINE');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[00:00:01] Initialized SQLite local medicine trie: 1,480 entities indexed.',
    '[00:00:02] Connected to Overpass Pharmacy Proximity Grid: Lat 23.334, Lng 75.040.',
    '[00:00:03] Background service worker registered: cache-first local normalizer active.'
  ]);

  const toggleOfflineSim = () => {
    if (offlineState === 'ONLINE') {
      setOfflineState('OFFLINE');
      setTerminalLogs(prev => [
        ...prev,
        '[NETWORK DROP] Cellular internet disconnected (0-connectivity simulation).',
        '[OFFLINE TRIE] Resolving drug "Lantus Insulin 100IU" locally in IndexedDB in 0.3ms.',
        '[QUEUE ACTIVE] Order MR-9842 stored locally in offline IndexedDB dispatch queue.'
      ]);
    } else {
      setOfflineState('SYNCED');
      setTerminalLogs(prev => [
        ...prev,
        '[NETWORK RESTORED] Background Sync worker detected 4G connection.',
        '[FLUSH QUEUE] Auto-broadcasted queued order MR-9842 to nearest 3 retail chemists.',
        '[STATUS: 200 OK] Chemist confirmation and live rider GPS stream established.'
      ]);
      setTimeout(() => setOfflineState('ONLINE'), 3500);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFD] text-slate-900 font-sans selection:bg-blue-600 selection:text-white antialiased">
      <Navbar />

      {/* ─── 1. HERO SECTION (EDITORIAL ASYMMETRIC + REALISTIC SMARTPHONE PRESENTATION) ─── */}
      <section className="relative min-h-[94vh] flex items-center pt-32 pb-24 lg:pt-36 lg:pb-32 bg-[#0B132B] text-white overflow-hidden">
        
        {/* Soft Ambient Depth & Lighting */}
        <div className="absolute top-0 right-1/4 w-[620px] h-[620px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/10 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
        
        {/* Subtle Fine Grid Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-80" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Editorial Presentation */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 space-y-8 text-left"
            >
              {/* Intentional Pill Badge */}
              <div className="inline-flex items-center gap-2.5 bg-white/[0.07] backdrop-blur-md border border-white/15 text-blue-200 text-xs font-semibold px-4 py-1.5 rounded-full shadow-inner tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Tier-2 / Tier-3 Medicine Access Network</span>
              </div>
              
              {/* Editorial Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-bold text-white leading-[1.08] tracking-[-0.03em]">
                When the medicine is nearby, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-sky-100 to-amber-200">
                  getting it shouldn't be difficult.
                </span>
              </h1>
              
              {/* Calm, Human Copy */}
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed text-balance">
                Patients shouldn't have to call pharmacy after pharmacy, travel across the city, or wait days to find a prescribed medicine. MediRush connects patients with nearby pharmacies and turns fragmented local supply into smarter, faster doorstep fulfillment.
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link href="/patient" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto py-4 px-8 text-sm font-semibold bg-white text-[#0B132B] hover:bg-blue-50 transition-all duration-200 shadow-xl shadow-black/30 rounded-2xl flex items-center justify-center gap-2.5 group cursor-pointer hover:translate-y-[-1px] active:translate-y-[1px]">
                    <Pill size={17} className="text-blue-600" />
                    <span>Scan Prescription Live</span>
                    <ArrowRight className="ml-0.5 group-hover:translate-x-1 transition-transform" size={16} />
                  </button>
                </Link>

                <a href="#set-cover" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto py-4 px-7 text-sm font-medium bg-white/[0.06] hover:bg-white/[0.12] backdrop-blur-md border border-white/15 text-slate-200 hover:text-white rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer hover:translate-y-[-1px] active:translate-y-[1px]">
                    <Layers size={16} className="text-blue-300" />
                    <span>Explore Set Cover Solver</span>
                  </button>
                </a>
              </div>

              {/* 3 Core Hero Metrics */}
              <div className="pt-8 border-t border-white/10 grid grid-cols-3 gap-6 sm:gap-8 max-w-xl text-left">
                <div className="space-y-1">
                  <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">100%</div>
                  <div className="text-xs text-slate-400 font-medium leading-snug">Prescription Coverage via Multi-Store Split</div>
                </div>
                <div className="space-y-1 border-l border-white/10 pl-6 sm:pl-8">
                  <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">~18 min</div>
                  <div className="text-xs text-slate-400 font-medium leading-snug">Average Hyper-Local Delivery Window</div>
                </div>
                <div className="space-y-1 border-l border-white/10 pl-6 sm:pl-8">
                  <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">2°C–8°C</div>
                  <div className="text-xs text-slate-400 font-medium leading-snug">Thermal Monitored Cold-Chain Seal</div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Realistic Titanium Smartphone Product Presentation */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 relative flex justify-center lg:justify-end"
            >
              
              {/* Floating UI Detail 1 (Top-Right): Multi-Store Split Solved */}
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-5 -right-2 sm:-right-4 z-30 bg-[#0F172A]/90 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] text-left max-w-[210px] hidden sm:block ring-1 ring-white/10"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">100% Split Solved</span>
                </div>
                <p className="text-xs font-semibold text-slate-200 leading-snug">
                  Cooperative 2-Node Routing Active (1.2 km & 1.9 km)
                </p>
              </motion.div>

              {/* Floating UI Detail 2 (Bottom-Left): Cold-Chain Thermal SLA */}
              <motion.div 
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -bottom-5 -left-2 sm:-left-4 z-30 bg-white/95 backdrop-blur-xl border border-slate-200/80 p-4 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.3)] text-left max-w-[220px] text-slate-900 hidden sm:block"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-sky-700 mb-1">
                  <Snowflake size={13} className="text-sky-600" />
                  <span>Cold-Chain Assurance</span>
                </div>
                <p className="text-xs font-semibold text-slate-800 leading-snug">
                  Lantus Glargine sealed at 2°C–8°C thermal buffer
                </p>
              </motion.div>

              {/* Realistic Smartphone Shell (iPhone 16 Pro Titanium Framing) */}
              <div className="relative w-[300px] sm:w-[325px] rounded-[50px] bg-gradient-to-b from-slate-600 via-slate-700 to-slate-900 p-[10px] shadow-[0_30px_80px_-15px_rgba(0,0,0,0.8),0_0_30px_rgba(59,130,246,0.15)] border border-slate-600/70 ring-1 ring-white/25">
                
                {/* Outer Glass Bezel Ring */}
                <div className="relative bg-slate-950 rounded-[42px] overflow-hidden border border-black aspect-[9/19] flex flex-col justify-between text-left select-none shadow-inner">
                  
                  {/* Dynamic Island Pill */}
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-40 flex items-center justify-between px-2.5 shadow-md">
                    <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-800" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 animate-pulse" />
                  </div>

                  {/* Inside Screen Content (Live MediRush Patient App Experience) */}
                  <div className="p-4 pt-10 text-slate-900 font-sans bg-[#F8FAFC] h-full overflow-hidden flex flex-col justify-between">
                    
                    {/* App Header */}
                    <div>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-200/80">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                            M
                          </div>
                          <span className="text-xs font-bold text-slate-900">MediRush Live</span>
                        </div>
                        <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          GPS: Active
                        </span>
                      </div>

                      {/* Rx Extracted Card */}
                      <div className="mt-3 p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Prescription OCR #MP-782</span>
                          <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">Schedule H ✓</span>
                        </div>
                        
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between items-center font-semibold">
                            <span className="text-slate-800">1. Lantus Insulin 100IU</span>
                            <span className="text-[9px] text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded font-bold">❄️ 2-8°C</span>
                          </div>
                          <div className="flex justify-between items-center font-semibold">
                            <span className="text-slate-800">2. Telma 40 (Telmisartan)</span>
                            <span className="text-emerald-700 font-bold">₹28</span>
                          </div>
                        </div>
                      </div>

                      {/* Generic Substitute Banner */}
                      <div className="mt-2.5 p-2.5 bg-emerald-50/80 rounded-xl border border-emerald-200/80">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-emerald-800">PMBJP Jan Aushadhi Switch</span>
                          <span className="font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Save 81%</span>
                        </div>
                        <div className="text-[10px] text-slate-600 font-medium mt-0.5">
                          Metformin 500mg: ₹65 ➔ ₹12
                        </div>
                      </div>
                    </div>

                    {/* Dispatch Map / Route Visual Pill */}
                    <div className="p-3 bg-slate-900 rounded-2xl text-white space-y-2 shadow-md">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                          <Navigation size={12} className="text-blue-400" />
                          <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider">Live Rider Dispatch</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400">ETA ~18 Mins</span>
                      </div>
                      
                      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 w-3/4 rounded-full" />
                      </div>
                      
                      <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                        <span>Gupta Medicos (1.2 km)</span>
                        <span>Rider Rahul S.</span>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Speaker Chin Line */}
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 bg-white/20 rounded-full" />
              </div>

            </motion.div>

          </div>
        </div>
      </section>

      {/* ─── 2. LIVE MEDICINE NORMALIZER & STOCK SANDBOX (INTERACTIVE QUERY SIMULATOR) ─── */}
      <section className="py-16 sm:py-24 bg-[#FAFBFD] relative z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.03)] space-y-6 -mt-20 relative z-10">
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-5 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                  Live Medicine Normalizer & Stock Sandbox
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 tracking-tight">
                  Interactive Query Simulator
                </h3>
              </div>
              
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Auto-Lookup Active</span>
              </div>
            </div>

            {/* Clickable Chips */}
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2.5">Click chips to switch query:</p>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_QUERIES.map((sample, idx) => (
                  <button
                    key={sample.name}
                    onClick={() => setSelectedSampleIndex(idx)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                      selectedSampleIndex === idx
                        ? "bg-slate-900 text-white shadow-sm"
                        : "bg-slate-100/80 text-slate-700 hover:bg-slate-200/70"
                    )}
                  >
                    {sample.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Result Box */}
            <div className="p-6 bg-slate-50/70 rounded-2xl border border-slate-200/70 space-y-5">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Brand Trade Name</span>
                  <h4 className="text-lg font-bold text-slate-900">{activeSample.brand}</h4>
                </div>
                <div className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1.5 rounded-lg w-fit">
                  Active Salt: <span className="font-semibold">{activeSample.salt}</span> ({activeSample.confidence}% Confidence)
                </div>
              </div>

              {/* Pricing & Generic Substitute */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl border border-slate-200/80 space-y-1.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Jan Aushadhi Generic Substitute</span>
                  <p className="text-xs font-bold text-slate-900">{activeSample.substitute}</p>
                  <div className="flex items-center gap-2 text-xs pt-1">
                    <span className="line-through text-slate-400 font-medium">₹{activeSample.brandPrice}</span>
                    <span className="text-emerald-700 font-bold text-sm">₹{activeSample.genericPrice}</span>
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      Save {activeSample.savings}%
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200/80 space-y-1.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Hyperlocal Stock Availability</span>
                  <p className="text-xs font-bold text-slate-900">{activeSample.nearest}</p>
                  <p className="text-[11px] text-blue-700 font-medium pt-1">
                    ✓ Verified in {activeSample.stores} connected stores in your radius
                  </p>
                </div>
              </div>

              <div className="pt-1 text-right">
                <Link href="/patient">
                  <span className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer inline-flex items-center gap-1">
                    Test this medicine in Live Patient Ordering App →
                  </span>
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 3. THE REALITY OF FRAGMENTED ACCESS (6 PHASES VS RADAR) ─────────── */}
      <section className="py-20 sm:py-28 bg-white border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-left max-w-3xl mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">
              The Reality of Fragmented Medicine Access
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mt-3">
              The problem isn't always availability. It's access.
            </h2>
            <p className="text-slate-600 mt-3 text-sm sm:text-base leading-relaxed">
              A medicine may exist in a verified distributor invoice just 1.5 kilometres away, yet reaching it can still mean calling multiple retail pharmacies, travelling across congested city roads, or making repeated visits.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            
            {/* 6 Escalation Phases */}
            <div className="lg:col-span-6 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Traditional Patient Friction Cycle
              </h3>

              {[
                { phase: '01', title: 'Prescription', desc: 'Doctor writes handwritten acute/chronic prescription.' },
                { phase: '02', title: 'Call Pharmacy', desc: 'Manual phone calls to 2–3 nearby chemists during rush hour.' },
                { phase: '03', title: 'No Stock', desc: 'Chemist has only 1 out of 3 medicines in physical storefront.' },
                { phase: '04', title: 'Travel 5–8 km', desc: 'Patient or family member travels across town to search again.' },
                { phase: '05', title: 'Search Again', desc: 'Incomplete partial stock split across fragmented retail stores.' },
                { phase: '06', title: 'Dosage Delayed', desc: 'Critical dosages delayed by 24–48 hours due to logistical friction.' }
              ].map((p) => (
                <div key={p.phase} className="p-4 bg-[#FAFBFD] rounded-2xl border border-slate-200/80 flex items-start gap-4 hover:border-slate-300 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 border border-red-100 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    {p.phase}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{p.title}</h4>
                    <p className="text-xs text-slate-500 font-normal leading-snug mt-0.5">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Proximity Radar Box */}
            <div className="lg:col-span-6 bg-[#0F172A] rounded-3xl p-6 sm:p-8 text-white space-y-4 shadow-xl border border-slate-800">
              <div className="flex justify-between items-center pb-3.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Radio size={15} className="text-blue-400 animate-pulse" />
                  <span className="text-xs font-semibold text-slate-300">Proximity Radar • Real Local Pharmacy Invoices</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Request: Ciprofloxacin 500mg</span>
              </div>

              <div className="space-y-3 text-xs">
                {/* Pharmacy 1 */}
                <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <span className="text-red-400">✕</span> Pharmacy 01 (Station Rd)
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">📍 1.8 km away • No distributor invoice in 30 days</div>
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-red-950/80 text-red-300 px-2 py-0.5 rounded border border-red-800/80">Sold Out</span>
                </div>

                {/* Pharmacy 2 */}
                <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <span className="text-amber-400">?</span> Pharmacy 02 (Main Market)
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">📍 2.4 km away • Manual records, no verified digital stock stream</div>
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded border border-amber-800/80">Phone Busy</span>
                </div>

                {/* Pharmacy 3 - Optimal Match */}
                <div className="p-4 bg-emerald-950/50 rounded-xl border border-emerald-500/50 flex justify-between items-center shadow-lg">
                  <div>
                    <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle size={14} className="text-emerald-400" /> Pharmacy 03 (Jan Aushadhi Kendra)
                    </div>
                    <div className="text-[11px] text-emerald-200/80 mt-0.5">📍 1.1 km away • Fresh Invoice: Batch #JA-CIP-26 (120 Strips)</div>
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-emerald-500 text-slate-950 px-2.5 py-1 rounded-md shadow-sm">Optimal Match →</span>
                </div>

                {/* Pharmacy 4 */}
                <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      <span className="text-red-400">✕</span> Pharmacy 04 (Civil Hospital Gate)
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">📍 3.0 km away • 2 Strips Only (Insufficient for full course)</div>
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-red-950/80 text-red-300 px-2 py-0.5 rounded border border-red-800/80">Short Stock</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 font-normal">
                MediRush eliminates manual calls by querying real shadow invoice feeds across the entire grid.
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 4. ALGORITHMIC CORE • WEIGHTED SET COVER (COOPERATIVE FULFILLMENT) ─── */}
      <section id="set-cover" className="py-20 sm:py-28 bg-[#FAFBFD]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-left max-w-3xl mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Algorithmic Core • Weighted Set Cover
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mt-3">
              Cooperative fulfillment when one store isn't enough.
            </h2>
            <p className="text-slate-600 mt-3 text-sm sm:text-base leading-relaxed">
              When no single pharmacy has all prescribed medicines, MediRush solves the optimal combination to achieve 100% coverage with minimum combined distance and shortest ETA.
            </p>
          </div>

          {/* Interactive Set Cover Calculator */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Basket Selector */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Prescribed Medicine Basket</h3>
                <span className="text-[11px] text-slate-400 font-medium">Toggle to recalculate</span>
              </div>

              <div className="space-y-2.5">
                {[
                  { id: 'Lantus Insulin', label: 'Lantus Insulin (Cold Storage 2-8°C)', note: 'Chemist 1 Specialist', tag: 'Cold Chain' },
                  { id: 'Telma 40mg', label: 'Telma 40mg (Telmisartan)', note: 'Chemist 1 & 2 Stock', tag: 'Chronic' },
                  { id: 'Ciprofloxacin 500mg', label: 'Ciprofloxacin 500mg (PMBJP Generic)', note: 'Chemist 3 Jan Aushadhi', tag: 'Generic' }
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleMedSelection(item.id)}
                    className={cn(
                      "p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3",
                      selectedMeds[item.id]
                        ? "bg-blue-50/50 border-blue-400 shadow-xs"
                        : "bg-slate-50/70 border-slate-200/70 opacity-60"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 text-xs",
                      selectedMeds[item.id] ? "bg-blue-600 text-white font-bold" : "border border-slate-300 bg-white"
                    )}>
                      {selectedMeds[item.id] && <Check size={12} />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{item.label}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{item.note}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-xs font-medium text-slate-600 flex justify-between">
                <span>Total Items Selected: {selectedCount}</span>
                <span className="text-blue-700 font-semibold">Optimal: Cooperative 2-Node Split</span>
              </div>
            </div>

            {/* Right Solver Output */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Multi-Node Cooperative Solver Result</h4>
                    <span className="text-[11px] text-emerald-700 font-semibold">100% Prescription Covered</span>
                  </div>
                </div>

                <span className="text-xs font-medium text-slate-500">
                  Total Distance: <span className="text-slate-900 font-bold">3.1 km</span> • ETA: <span className="text-blue-700 font-bold">19 Mins</span>
                </span>
              </div>

              {/* Node Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/70 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-900">Node #1: Gupta Medicos & Cold Chain</span>
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">1.2 km</span>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1.5 font-normal">
                    <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-600" /> Lantus Insulin (Batch #LAN26B04)</li>
                    <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-600" /> Telma 40 (Batch #TEL26H01)</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/70 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-900">Node #2: Jan Aushadhi Kendra (PMBJP)</span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">1.9 km</span>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1.5 font-normal">
                    <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-600" /> Ciprofloxacin 500mg (Batch #JA-CIP-26)</li>
                  </ul>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Link href="/patient">
                  <button className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-5 py-3 rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer transition-transform hover:translate-y-[-1px]">
                    <Pill size={14} /> 
                    <span>Order this split in App →</span>
                  </button>
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 5. SHADOW INVENTORY INNOVATION (OCR DISTRIBUTOR SLIPS) ─────────── */}
      <section className="py-20 sm:py-28 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-left max-w-3xl mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Under The Hood • Core Innovation
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mt-3">
              Built for the pharmacies that already exist.
            </h2>
            <p className="text-slate-600 mt-3 text-sm sm:text-base leading-relaxed">
              Many Tier-2 and Tier-3 pharmacies don't have sophisticated digital inventory software. MediRush doesn't require them to replace their workflow. It builds a digital intelligence layer around the paper invoices they already receive daily.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* 4 Pipeline Steps */}
            <div className="lg:col-span-6 space-y-3.5">
              {[
                { step: '01', title: 'Paper Distributor Slip', desc: 'Pharmacist captures photo of physical distributor trade invoice.' },
                { step: '02', title: 'OCR & Canonicalization', desc: 'Optical model extracts drug name, strength, batch #, and expiry date.' },
                { step: '03', title: 'Shadow Inventory', desc: 'Items indexed into local shadow inventory with timestamped freshness.' },
                { step: '04', title: 'Doorstep Delivery', desc: 'Available for instant patient matching and WhatsApp order dispatch.' }
              ].map((item) => (
                <div key={item.step} className="flex gap-4 items-start p-4 bg-[#FAFBFD] rounded-2xl border border-slate-200/80">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual Invoice Card */}
            <div className="lg:col-span-6 bg-[#0F172A] rounded-3xl p-6 sm:p-8 text-white space-y-4 shadow-xl border border-slate-800">
              <div className="flex justify-between items-center pb-3.5 border-b border-slate-800">
                <div>
                  <span className="text-xs font-semibold text-slate-300">Sun Pharma Regional C&F Depo • Invoice #SP/IND/2026/8892</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Captured 2 days ago • High OCR Confidence (97%)</p>
                </div>
                <span className="text-[10px] font-bold uppercase bg-indigo-950/80 text-indigo-300 px-2.5 py-1 rounded border border-indigo-800/80">Fresh Batch</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-white">Lantus Solostar 100IU/ml Pen</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Batch: LAN26B04 • Expiry: Aug 2027 • Qty: 14 Pens</div>
                  </div>
                  <span className="text-[10px] font-bold text-sky-300 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">❄️ Cold Chain 2-8°C</span>
                </div>

                <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60 flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-white">Augmentin 625 Duo Tablet</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Batch: AUG26E12 • Expiry: Nov 2027 • Qty: 45 Strips</div>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Standard Room Temp</span>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-slate-400 font-normal">
                Transparent Disclaimer: Inventory estimates are derived from the latest available pharmacy distributor invoice and decay over time as medicines are sold.
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 6. ZERO DOWNTIME RESILIENCE (OFFLINE DIAGNOSTICS) ──────────────── */}
      <section className="py-20 sm:py-28 bg-[#0B132B] text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-left max-w-3xl mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
              Zero Downtime Resilience
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-3">
              What if the internet disappears?
            </h2>
            <p className="text-slate-300 mt-3 text-sm sm:text-base leading-relaxed">
              The pharmacy shouldn't stop working. In Tier-2 and Tier-3 towns, cellular internet drops are frequent. MediRush runs on a local SQLite and IndexedDB architecture so medicine queries, invoices, and dispense logs operate uninterrupted.
            </p>
          </div>

          <div className="bg-[#070D1F] rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-4 max-w-4xl">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "w-2.5 h-2.5 rounded-full",
                  offlineState === 'ONLINE' ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                )} />
                <span className="text-xs font-mono font-semibold text-slate-300">
                  MediRush Edge Runtime Diagnostics :: {offlineState}
                </span>
              </div>

              <button
                onClick={toggleOfflineSim}
                className={cn(
                  "text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer w-fit",
                  offlineState === 'ONLINE'
                    ? "bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25"
                    : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25"
                )}
              >
                {offlineState === 'ONLINE' ? <WifiOff size={13} /> : <Wifi size={13} />}
                {offlineState === 'ONLINE' ? '1. Disconnect Net & Test Offline' : '4. Reconnect & Auto-Sync'}
              </button>
            </div>

            <div className="font-mono text-xs text-emerald-400/90 space-y-1.5 max-h-36 overflow-y-auto">
              {terminalLogs.map((log, i) => (
                <div key={i} className="leading-relaxed">
                  ❯ {log}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-900">
              <span>SQLite Cache: 1,480 Medicines (0.3ms)</span>
              <span>IndexedDB Queue: Active</span>
            </div>
          </div>

        </div>
      </section>

      {/* ─── 7. PRODUCTION ARCHITECTURE (6 DETERMINISTIC PROTOCOLS) ──────────── */}
      <section className="py-20 sm:py-28 bg-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-left max-w-3xl mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Production Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mt-3">
              A transparent, production-grade stack.
            </h2>
            <p className="text-slate-600 mt-3 text-sm sm:text-base leading-relaxed">
              Zero fake AI buzzwords. Every layer is built on verifiable deterministic protocols.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { num: '01', title: 'Prescription Extraction Layer', desc: 'Parses doctor handwriting, drug strengths, dosage intervals, and Schedule H compliance.', tech: 'Gemini 2.5 Flash Vision OCR' },
              { num: '02', title: 'Deterministic Medicine Normalizer', desc: 'Maps trade brand names into universal chemical salts with drug interaction safety audits.', tech: 'Fuzzy Salt Matching & Canonical DB' },
              { num: '03', title: 'Local Shadow Inventory Store', desc: 'Tracks batch numbers, expiry dates, and freshness degradation across local pharmacies.', tech: 'Distributor Invoice OCR Parser' },
              { num: '04', title: 'Chemist Proximity Grid Engine', desc: 'Haversine distance calculation and capability filtering (cold-chain, chronic specialist).', tech: 'OpenStreetMap Overpass API & GPS' },
              { num: '05', title: 'Multi-Node Cooperative Solver', desc: 'Discovers single or multi-store combinations maximizing prescription coverage (100%).', tech: 'Weighted Set Cover & Thermal SLA' },
              { num: '06', title: 'Real-Time Messaging Bus', desc: 'Instant WhatsApp broadcast to chemists and cross-tab synchronization.', tech: 'Twilio WhatsApp API & SSE Bus' }
            ].map((layer) => (
              <div key={layer.num} className="p-6 bg-[#FAFBFD] rounded-2xl border border-slate-200/80 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors">
                <div>
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold text-xs flex items-center justify-center mb-3">
                    {layer.num}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{layer.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">{layer.desc}</p>
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md w-fit">
                  {layer.tech}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── 8. FINAL CALLOUT ────────────────────────────────────────────────── */}
      <section className="py-24 sm:py-32 bg-[#FAFBFD]">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Medicine access should feel simple.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
            MediRush connects the patient, the nearby pharmacy, and the medicine supply into one intelligent fulfillment network.
          </p>

          <div className="flex flex-wrap justify-center gap-3.5 pt-4">
            <Link href="/patient">
              <button className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-8 py-4 rounded-2xl shadow-md cursor-pointer transition-transform hover:translate-y-[-1px] active:translate-y-[1px]">
                Launch Patient Web App →
              </button>
            </Link>
            <Link href="/chemist">
              <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-sm px-6 py-4 rounded-2xl shadow-xs cursor-pointer transition-transform hover:translate-y-[-1px] active:translate-y-[1px]">
                Chemist Merchant Terminal
              </button>
            </Link>
            <Link href="/rider">
              <button className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-sm px-6 py-4 rounded-2xl shadow-xs cursor-pointer transition-transform hover:translate-y-[-1px] active:translate-y-[1px]">
                Rider Delivery Portal
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

