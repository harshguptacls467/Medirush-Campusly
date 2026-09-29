'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Zap,
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
  Activity,
  ArrowUpRight,
  Sparkles
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
    <div className="min-h-screen bg-[#F5F9FF] text-slate-900 font-sans selection:bg-blue-600 selection:text-white antialiased overflow-x-hidden">
      <Navbar />

      {/* ─── 1. HERO SECTION (ICONIC MEDIRUSH ROYAL BLUE + SMARTPHONE MOCKUP) ─── */}
      <section className="relative min-h-[95vh] flex items-center pt-32 pb-24 lg:pt-36 lg:pb-28 bg-gradient-to-br from-[#1565C0] via-[#0D47A1] to-[#0A2540] text-white overflow-hidden shadow-2xl">
        
        {/* Vibrant Ambient Glows */}
        <div className="absolute -top-20 -right-20 w-[650px] h-[650px] bg-sky-400/25 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-24 -left-20 w-[550px] h-[550px] bg-blue-500/25 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-400/15 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Subtle Micro-Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0f_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0f_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Bold, High-Energy Presentation */}
            <motion.div 
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 space-y-7 text-left"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-md uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-pulse" />
                <span className="text-amber-200">Tier-2 / Tier-3 Medicine Access Network</span>
              </div>
              
              {/* Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-[64px] font-black text-white leading-[1.06] tracking-tight drop-shadow-sm">
                When the medicine is nearby, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-300 via-amber-200 to-yellow-200">
                  getting it shouldn't be difficult.
                </span>
              </h1>
              
              {/* Human-centered Copy */}
              <p className="text-base sm:text-lg lg:text-xl text-blue-100 max-w-2xl font-normal leading-relaxed text-balance">
                Patients shouldn't have to call pharmacy after pharmacy, travel across the city, or wait days to find a prescribed medicine. MediRush connects patients with nearby pharmacies and turns fragmented local supply into smarter, faster doorstep fulfillment.
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Link href="/patient" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto py-4 px-8 text-base bg-white text-[#0D47A1] hover:bg-blue-50 transition-all duration-200 shadow-2xl shadow-blue-950/40 rounded-2xl font-black flex items-center justify-center gap-2.5 group cursor-pointer hover:scale-[1.02] active:scale-[0.98]">
                    <Pill size={18} className="text-[#1565C0]" />
                    <span>Scan Prescription Live</span>
                    <ArrowRight className="ml-0.5 group-hover:translate-x-1.5 transition-transform" size={17} />
                  </button>
                </Link>

                <a href="#set-cover" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto py-4 px-7 text-base bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/25 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]">
                    <Layers size={18} className="text-sky-300" />
                    <span>Explore Set Cover Solver</span>
                  </button>
                </a>
              </div>

              {/* 3 Core Hero Metrics */}
              <div className="pt-8 border-t border-white/15 grid grid-cols-3 gap-4 sm:gap-8 max-w-xl text-left">
                <div className="space-y-1">
                  <div className="text-2xl sm:text-4xl font-black text-emerald-400">100%</div>
                  <div className="text-xs font-semibold text-blue-100 leading-snug">Prescription Coverage via Multi-Store Split</div>
                </div>
                <div className="space-y-1 border-l border-white/15 pl-4 sm:pl-8">
                  <div className="text-2xl sm:text-4xl font-black text-cyan-300">~18 min</div>
                  <div className="text-xs font-semibold text-blue-100 leading-snug">Average Hyper-Local Delivery Window</div>
                </div>
                <div className="space-y-1 border-l border-white/15 pl-4 sm:pl-8">
                  <div className="text-2xl sm:text-4xl font-black text-amber-300">2°C–8°C</div>
                  <div className="text-xs font-semibold text-blue-100 leading-snug">Thermal Monitored Cold-Chain Seal</div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Realistic Smartphone Product Presentation */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.94, y: 28 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 relative flex justify-center lg:justify-end"
            >
              
              {/* Floating UI Detail 1 (Top-Right): Multi-Store Split Solved */}
              <motion.div 
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-6 -right-2 sm:-right-4 z-30 bg-slate-900/95 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl text-left max-w-[215px] hidden sm:block"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">100% Split Solved</span>
                </div>
                <p className="text-xs font-bold text-white leading-tight">
                  Cooperative 2-Node Routing Active (1.2 km & 1.9 km)
                </p>
              </motion.div>

              {/* Floating UI Detail 2 (Bottom-Left): Cold-Chain Thermal SLA */}
              <motion.div 
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -bottom-6 -left-2 sm:-left-4 z-30 bg-white/95 backdrop-blur-xl border border-slate-200 p-4 rounded-2xl shadow-2xl text-left max-w-[220px] text-slate-900 hidden sm:block"
              >
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-cyan-800 mb-1">
                  <Snowflake size={13} className="text-cyan-600" />
                  <span>Cold-Chain Assurance</span>
                </div>
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  Lantus Glargine sealed at 2°C–8°C thermal buffer
                </p>
              </motion.div>

              {/* Realistic Smartphone Shell (Titanium Pro Framing) */}
              <div className="relative w-[305px] sm:w-[330px] rounded-[48px] bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 p-[10px] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(59,130,246,0.3)] border border-slate-600/70 ring-1 ring-white/20">
                
                {/* Outer Glass Bezel Ring */}
                <div className="relative bg-slate-950 rounded-[40px] overflow-hidden border border-black aspect-[9/19] flex flex-col justify-between text-left select-none">
                  
                  {/* Dynamic Island / Pill Camera */}
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-40 flex items-center justify-between px-2.5">
                    <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-700" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 animate-pulse" />
                  </div>

                  {/* Inside Screen Content (Live MediRush Patient App Experience) */}
                  <div className="p-4 pt-10 text-slate-900 font-sans bg-[#F8FAFC] h-full overflow-hidden flex flex-col justify-between">
                    
                    {/* App Header */}
                    <div>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-lg bg-[#1565C0] text-white flex items-center justify-center font-black text-[10px]">
                            M
                          </div>
                          <span className="text-xs font-black text-slate-900">MediRush Live</span>
                        </div>
                        <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          GPS: Active
                        </span>
                      </div>

                      {/* Rx Extracted Card */}
                      <div className="mt-3 p-3 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Prescription OCR #MP-782</span>
                          <span className="text-[9px] font-black text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">Schedule H ✓</span>
                        </div>
                        
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between items-center font-bold">
                            <span className="text-slate-900">1. Lantus Insulin 100IU</span>
                            <span className="text-[9px] text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded font-black">❄️ 2-8°C</span>
                          </div>
                          <div className="flex justify-between items-center font-bold">
                            <span className="text-slate-900">2. Telma 40 (Telmisartan)</span>
                            <span className="text-emerald-700 font-black">₹28</span>
                          </div>
                        </div>
                      </div>

                      {/* Generic Substitute Banner */}
                      <div className="mt-2.5 p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-black text-emerald-800">PMBJP Jan Aushadhi Switch</span>
                          <span className="font-black text-emerald-700 bg-emerald-200 px-1 rounded">Save 81%</span>
                        </div>
                        <div className="text-[10px] text-slate-600 font-semibold mt-0.5">
                          Metformin 500mg: ₹65 ➔ ₹12
                        </div>
                      </div>
                    </div>

                    {/* Dispatch Map / Route Visual Pill */}
                    <div className="p-3 bg-slate-900 rounded-2xl text-white space-y-2 shadow-lg">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5">
                          <Navigation size={12} className="text-blue-400 animate-pulse" />
                          <span className="text-[10px] font-black text-slate-200 uppercase">Live Rider Dispatch</span>
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
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/20 rounded-full" />
              </div>

            </motion.div>

          </div>
        </div>
      </section>

      {/* ─── 2. LIVE MEDICINE NORMALIZER & STOCK SANDBOX (INTERACTIVE QUERY SIMULATOR) ─── */}
      <section className="py-20 bg-[#F5F9FF] relative z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl space-y-6 -mt-24 relative z-10">
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1565C0] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  Live Medicine Normalizer & Stock Sandbox
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                  Interactive Query Simulator
                </h3>
              </div>
              
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 w-fit">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Auto-Lookup Active
              </div>
            </div>

            {/* Clickable Chips */}
            <div>
              <p className="text-xs font-bold text-slate-500 mb-2">Click chips to switch query:</p>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_QUERIES.map((sample, idx) => (
                  <button
                    key={sample.name}
                    onClick={() => setSelectedSampleIndex(idx)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer",
                      selectedSampleIndex === idx
                        ? "bg-[#1565C0] text-white shadow-md shadow-blue-500/25"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    )}
                  >
                    {sample.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Result Box */}
            <div className="p-5 bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wide">Brand Trade Name</span>
                  <h4 className="text-lg font-black text-slate-900">{activeSample.brand}</h4>
                </div>
                <div className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-lg w-fit">
                  Active Salt: {activeSample.salt} ({activeSample.confidence}% Confidence)
                </div>
              </div>

              {/* Pricing & Generic Substitute */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Jan Aushadhi Generic Substitute</span>
                  <p className="text-xs font-black text-slate-900">{activeSample.substitute}</p>
                  <div className="flex items-center gap-2 text-xs pt-1">
                    <span className="line-through text-slate-400 font-bold">₹{activeSample.brandPrice}</span>
                    <span className="text-emerald-700 font-black text-sm">₹{activeSample.genericPrice}</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-1.5 py-0.5 rounded">
                      Save {activeSample.savings}%
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Hyperlocal Stock Availability</span>
                  <p className="text-xs font-black text-slate-900">{activeSample.nearest}</p>
                  <p className="text-[11px] text-[#1565C0] font-bold pt-1">
                    ✓ Verified in {activeSample.stores} connected stores in your radius
                  </p>
                </div>
              </div>

              <div className="pt-2 text-right">
                <Link href="/patient">
                  <button className="text-xs font-black text-[#1565C0] hover:text-blue-800 underline cursor-pointer inline-flex items-center gap-1">
                    Test this medicine in Live Patient Ordering App →
                  </button>
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 3. THE REALITY OF FRAGMENTED ACCESS (6 PHASES VS RADAR) ─────────── */}
      <section className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-black uppercase tracking-wider text-red-600 bg-red-50 px-3.5 py-1.5 rounded-full border border-red-200">
              The Reality of Fragmented Medicine Access
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
              The problem isn't always availability. It's access.
            </h2>
            <p className="text-slate-600 mt-3 text-sm sm:text-base font-medium">
              A medicine may exist in a verified distributor invoice just 1.5 kilometres away, yet reaching it can still mean calling multiple retail pharmacies, travelling across congested city roads, or making repeated visits.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            
            {/* 6 Escalation Phases */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
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
                <div key={p.phase} className="p-3.5 bg-[#F5F9FF] rounded-2xl border border-slate-200/90 flex items-start gap-3.5 hover:border-red-300 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-black text-xs flex-shrink-0">
                    {p.phase}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">{p.title}</h4>
                    <p className="text-[11px] text-slate-500 font-medium leading-snug">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Proximity Radar Box */}
            <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white space-y-4 shadow-xl border border-slate-800">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Radio size={16} className="text-blue-400 animate-pulse" />
                  <span className="text-xs font-bold text-slate-300">Proximity Radar • Real Local Pharmacy Invoices</span>
                </div>
                <span className="text-[10px] text-slate-400">Request: Ciprofloxacin 500mg</span>
              </div>

              <div className="space-y-2.5 text-xs">
                {/* Pharmacy 1 */}
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span className="text-red-400">✕</span> Pharmacy 01 (Station Rd)
                    </div>
                    <div className="text-[10px] text-slate-400">📍 1.8 km away • No distributor invoice in 30 days</div>
                  </div>
                  <span className="text-[10px] font-black uppercase bg-red-950 text-red-400 px-2 py-0.5 rounded border border-red-800">Sold Out</span>
                </div>

                {/* Pharmacy 2 */}
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span className="text-amber-400">?</span> Pharmacy 02 (Main Market)
                    </div>
                    <div className="text-[10px] text-slate-400">📍 2.4 km away • Manual records, no verified digital stock stream</div>
                  </div>
                  <span className="text-[10px] font-black uppercase bg-amber-950 text-amber-400 px-2 py-0.5 rounded border border-amber-800">Phone Busy</span>
                </div>

                {/* Pharmacy 3 - Optimal Match */}
                <div className="p-3.5 bg-emerald-950/60 rounded-xl border border-emerald-500/60 flex justify-between items-center shadow-lg">
                  <div>
                    <div className="font-black text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle size={14} className="text-emerald-400" /> Pharmacy 03 (Jan Aushadhi Kendra)
                    </div>
                    <div className="text-[10px] text-emerald-200/80">📍 1.1 km away • Fresh Invoice: Batch #JA-CIP-26 (120 Strips)</div>
                  </div>
                  <span className="text-[10px] font-black uppercase bg-emerald-500 text-slate-950 px-2.5 py-1 rounded-md shadow-sm">Optimal Match →</span>
                </div>

                {/* Pharmacy 4 */}
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span className="text-red-400">✕</span> Pharmacy 04 (Civil Hospital Gate)
                    </div>
                    <div className="text-[10px] text-slate-400">📍 3.0 km away • 2 Strips Only (Insufficient for full course)</div>
                  </div>
                  <span className="text-[10px] font-black uppercase bg-red-950 text-red-400 px-2 py-0.5 rounded border border-red-800">Short Stock</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 font-medium">
                MediRush eliminates manual calls by querying real shadow invoice feeds across the entire grid.
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 4. ALGORITHMIC CORE • WEIGHTED SET COVER (COOPERATIVE FULFILLMENT) ─── */}
      <section id="set-cover" className="py-20 bg-[#F5F9FF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-black uppercase tracking-wider text-[#1565C0] bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200">
              Algorithmic Core • Weighted Set Cover
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
              Cooperative fulfillment when one store isn't enough.
            </h2>
            <p className="text-slate-600 mt-3 text-sm sm:text-base font-medium">
              When no single pharmacy has all prescribed medicines, MediRush solves the optimal combination to achieve 100% coverage with minimum combined distance and shortest ETA.
            </p>
          </div>

          {/* Interactive Set Cover Calculator */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Basket Selector */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-md space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900">Prescribed Medicine Basket</h3>
                <span className="text-[10px] text-slate-400 font-bold">Toggle to recalculate</span>
              </div>

              <div className="space-y-2">
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
                        ? "bg-blue-50/60 border-blue-500 shadow-xs"
                        : "bg-slate-50 border-slate-200 opacity-60"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5",
                      selectedMeds[item.id] ? "bg-[#1565C0] text-white" : "border border-slate-300 bg-white"
                    )}>
                      {selectedMeds[item.id] && <Check size={12} />}
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">{item.label}</div>
                      <div className="text-[10px] text-slate-500 font-medium">{item.note}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-xs font-bold text-slate-600 flex justify-between">
                <span>Total Items Selected: {selectedCount}</span>
                <span className="text-[#1565C0] font-black">Optimal: Cooperative 2-Node Split</span>
              </div>
            </div>

            {/* Right Solver Output */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase">Multi-Node Cooperative Solver Result</h4>
                    <span className="text-[10px] text-emerald-700 font-black">100% Prescription Covered</span>
                  </div>
                </div>

                <span className="text-xs font-black text-slate-500">
                  Total Distance: <span className="text-slate-900">3.1 km</span> • ETA: <span className="text-[#1565C0]">19 Mins</span>
                </span>
              </div>

              {/* Node Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black text-slate-900">Node #1: Gupta Medicos & Cold Chain</span>
                    <span className="text-[9px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">1.2 km</span>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1 font-medium">
                    <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-600" /> Lantus Insulin (Batch #LAN26B04)</li>
                    <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-600" /> Telma 40 (Batch #TEL26H01)</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black text-slate-900">Node #2: Jan Aushadhi Kendra (PMBJP)</span>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">1.9 km</span>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1 font-medium">
                    <li className="flex items-center gap-1.5"><Check size={12} className="text-emerald-600" /> Ciprofloxacin 500mg (Batch #JA-CIP-26)</li>
                  </ul>
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <Link href="/patient">
                  <button className="bg-[#1565C0] hover:bg-blue-700 text-white font-black text-xs px-5 py-3 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer">
                    <Pill size={14} /> Order this split in App →
                  </button>
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 5. SHADOW INVENTORY INNOVATION (OCR DISTRIBUTOR SLIPS) ─────────── */}
      <section className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-200">
              Under The Hood • Core Innovation
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
              Built for the pharmacies that already exist.
            </h2>
            <p className="text-slate-600 mt-3 text-sm sm:text-base font-medium">
              Many Tier-2 and Tier-3 pharmacies don't have sophisticated digital inventory software. MediRush doesn't require them to replace their workflow. It builds a digital intelligence layer around the paper invoices they already receive daily.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            {/* 4 Pipeline Steps */}
            <div className="space-y-4">
              {[
                { step: '01', title: 'Paper Distributor Slip', desc: 'Pharmacist captures photo of physical distributor trade invoice.' },
                { step: '02', title: 'OCR & Canonicalization', desc: 'Optical model extracts drug name, strength, batch #, and expiry date.' },
                { step: '03', title: 'Shadow Inventory', desc: 'Items indexed into local shadow inventory with timestamped freshness.' },
                { step: '04', title: 'Doorstep Delivery', desc: 'Available for instant patient matching and WhatsApp order dispatch.' }
              ].map((item) => (
                <div key={item.step} className="flex gap-4 items-start p-4 bg-[#F5F9FF] rounded-2xl border border-slate-200/90">
                  <div className="w-10 h-10 rounded-xl bg-[#1565C0] text-white font-black text-sm flex items-center justify-center flex-shrink-0 shadow-md">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual Invoice Card */}
            <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white space-y-4 shadow-xl border border-slate-800">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <div>
                  <span className="text-xs font-bold text-slate-300">Sun Pharma Regional C&F Depo • Invoice #SP/IND/2026/8892</span>
                  <p className="text-[10px] text-slate-400">Captured 2 days ago • High OCR Confidence (97%)</p>
                </div>
                <span className="text-[10px] font-black uppercase bg-indigo-950 text-indigo-400 px-2.5 py-1 rounded border border-indigo-800">Fresh Batch</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">Lantus Solostar 100IU/ml Pen</div>
                    <div className="text-[10px] text-slate-400">Batch: LAN26B04 • Expiry: Aug 2027 • Qty: 14 Pens</div>
                  </div>
                  <span className="text-[10px] font-black text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">❄️ Cold Chain 2-8°C</span>
                </div>

                <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white">Augmentin 625 Duo Tablet</div>
                    <div className="text-[10px] text-slate-400">Batch: AUG26E12 • Expiry: Nov 2027 • Qty: 45 Strips</div>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Standard Room Temp</span>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-slate-400 font-medium">
                Transparent Disclaimer: Inventory estimates are derived from the latest available pharmacy distributor invoice and decay over time as medicines are sold.
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 6. ZERO DOWNTIME RESILIENCE (OFFLINE DIAGNOSTICS) ──────────────── */}
      <section className="py-20 bg-slate-900 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400 bg-emerald-950 px-3.5 py-1.5 rounded-full border border-emerald-800">
              Zero Downtime Resilience
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-3">
              What if the internet disappears?
            </h2>
            <p className="text-slate-400 mt-3 text-sm sm:text-base font-medium">
              The pharmacy shouldn't stop working. In Tier-2 and Tier-3 towns, cellular internet drops are frequent. MediRush runs on a local SQLite and IndexedDB architecture so medicine queries, invoices, and dispense logs operate uninterrupted.
            </p>
          </div>

          <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-4 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "w-2.5 h-2.5 rounded-full",
                  offlineState === 'ONLINE' ? "bg-emerald-500 animate-ping" : "bg-red-500"
                )} />
                <span className="text-xs font-mono font-bold text-slate-300">
                  MediRush Edge Runtime Diagnostics :: {offlineState}
                </span>
              </div>

              <button
                onClick={toggleOfflineSim}
                className={cn(
                  "text-xs font-black px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer w-fit",
                  offlineState === 'ONLINE'
                    ? "bg-red-500/20 text-red-400 border border-red-500/40"
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                )}
              >
                {offlineState === 'ONLINE' ? <WifiOff size={13} /> : <Wifi size={13} />}
                {offlineState === 'ONLINE' ? '1. Disconnect Net & Test Offline' : '4. Reconnect & Auto-Sync'}
              </button>
            </div>

            <div className="font-mono text-xs text-emerald-400/90 space-y-1 max-h-36 overflow-y-auto">
              {terminalLogs.map((log, i) => (
                <div key={i} className="leading-relaxed">
                  ❯ {log}
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-900">
              <span>SQLite Cache: 1,480 Medicines (0.3ms)</span>
              <span>IndexedDB Queue: Active</span>
            </div>
          </div>

        </div>
      </section>

      {/* ─── 7. PRODUCTION ARCHITECTURE (6 DETERMINISTIC PROTOCOLS) ──────────── */}
      <section className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-black uppercase tracking-wider text-[#1565C0] bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-200">
              Production Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3">
              A transparent, production-grade stack.
            </h2>
            <p className="text-slate-600 mt-3 text-sm sm:text-base font-medium">
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
              <div key={layer.num} className="p-6 bg-[#F5F9FF] rounded-2xl border border-slate-200/90 flex flex-col justify-between space-y-4 hover:border-blue-400 transition-colors">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#1565C0] text-white font-black text-sm flex items-center justify-center mb-3 shadow-md">
                    {layer.num}
                  </div>
                  <h4 className="text-base font-black text-slate-900 mb-1">{layer.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{layer.desc}</p>
                </div>
                <div className="text-[10px] font-black uppercase text-blue-700 bg-blue-100/60 px-2.5 py-1 rounded-md w-fit">
                  {layer.tech}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── 8. FINAL CALLOUT ────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#F5F9FF]">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Medicine access should feel simple.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            MediRush connects the patient, the nearby pharmacy, and the medicine supply into one intelligent fulfillment network.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link href="/patient">
              <button className="bg-[#1565C0] hover:bg-blue-700 text-white font-black text-sm px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/25 cursor-pointer transition-transform hover:scale-105 active:scale-95">
                Launch Patient Web App →
              </button>
            </Link>
            <Link href="/login">
              <button className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-black text-sm px-6 py-4 rounded-2xl shadow-sm cursor-pointer transition-transform hover:scale-105 active:scale-95 flex items-center gap-2">
                <span>🔐 Staff &amp; Partner Login (Chemist / Rider)</span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}


