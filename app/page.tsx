'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Search, 
  Clock, 
  Truck, 
  FileText, 
  HeartPulse, 
  Activity, 
  ChevronRight, 
  Zap, 
  Pill, 
  Stethoscope, 
  MapPin, 
  Map, 
  PhoneCall, 
  ShieldCheck, 
  ArrowRight, 
  AlertTriangle,
  Leaf,
  Bell,
  CheckCircle2,
  Shield,
  Sparkles,
  Bike,
  Store,
  Snowflake,
  Wifi,
  WifiOff,
  Layers,
  Database,
  Cpu,
  RefreshCw,
  Terminal,
  Radio,
  Sliders,
  DollarSign,
  TrendingDown,
  Timer,
  Check,
  Smartphone,
  ScanLine,
  HelpCircle,
  Thermometer,
  Boxes,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Hero Mockup Component
const HeroMockup = () => {
  return (
    <div className="relative w-full max-w-lg mx-auto lg:max-w-none h-[480px] sm:h-[560px] flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="w-[300px] sm:w-[320px] h-[520px] bg-white rounded-[2.8rem] p-3 shadow-2xl relative z-20 border-[5px] border-white/60 backdrop-blur-xl"
      >
        <div className="w-full h-full bg-[#F5F9FF] rounded-[2.3rem] overflow-hidden relative flex flex-col shadow-inner">
          {/* Mockup Header */}
          <div className="pt-8 pb-4 px-5 bg-gradient-to-br from-[#1565C0] to-[#0D47A1] text-white">
             <div className="flex justify-between items-center mb-4">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-widest font-extrabold text-blue-200">Hyperlocal Grid</span>
                  <span className="text-xs font-black flex items-center gap-1">
                    <MapPin size={11} className="text-blue-300"/> Civil Hospital Cluster
                  </span>
                </div>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                   <Activity size={15} />
                </div>
             </div>
             
             {/* Quick Search */}
             <Link href="/patient" className="block relative">
                <div className="w-full bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-md rounded-xl py-2.5 pl-9 pr-3 text-[11px] font-bold text-white placeholder-blue-100 border border-white/30 flex items-center justify-between">
                  <span>Search emergency medicines...</span>
                  <ArrowRight size={12} className="text-white/80" />
                </div>
                <Search size={13} className="absolute left-3 top-3 text-white/80" />
             </Link>
          </div>
          
          {/* Mockup Body */}
          <div className="p-3.5 space-y-3 flex-1 bg-gradient-to-b from-slate-50 to-white overflow-hidden text-slate-800">
             {/* Urgent SOS Alert */}
             <Link href="/emergency" className="block bg-red-50 hover:bg-red-100/80 transition-colors p-3 rounded-2xl border border-red-200 flex items-center gap-2.5 shadow-sm">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 text-red-600 animate-pulse">
                   <Zap size={16} />
                </div>
                <div className="flex-1 min-w-0">
                   <h4 className="text-xs font-black text-red-950 truncate">10-Min Emergency SOS</h4>
                   <p className="text-[9px] font-bold text-red-600 uppercase tracking-wider">Fastest Chemist Auto-Lock</p>
                </div>
             </Link>

             {/* Live Order Tracker */}
             <Link href="/patient" className="block bg-white p-3 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 transition-all">
                <div className="flex justify-between items-center mb-2">
                   <h4 className="text-[11px] font-black text-slate-900 flex items-center gap-1">
                     <Snowflake size={11} className="text-blue-600" /> Cold-Chain Gel Pack
                   </h4>
                   <span className="text-[8px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-black uppercase">2°C - 8°C Safe</span>
                </div>
                <div className="flex gap-2.5 items-center">
                   <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                      <Truck size={16} />
                   </div>
                   <div className="flex-1 min-w-0">
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-600 w-[78%] animate-pulse" />
                      </div>
                      <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase flex justify-between">
                        <span>ETA: 7 mins away</span>
                        <span className="text-blue-600 font-black">Lantus Insulin</span>
                      </p>
                   </div>
                </div>
             </Link>

             {/* Quick Action Buttons */}
             <div className="grid grid-cols-2 gap-2">
                <Link href="/patient" className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm text-center flex flex-col items-center hover:bg-blue-50/50 transition-colors">
                   <Pill size={18} className="text-blue-600 mb-1" />
                   <span className="text-[10px] font-black text-slate-800">Order Meds</span>
                </Link>
                <Link href="/report-simplifier" className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm text-center flex flex-col items-center hover:bg-indigo-50/50 transition-colors">
                   <FileText size={18} className="text-indigo-600 mb-1" />
                   <span className="text-[10px] font-black text-slate-800">AI Report</span>
                </Link>
             </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Badges */}
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[12%] right-[-4%] sm:right-[4%] z-30 bg-white/95 backdrop-blur-xl p-3 sm:p-3.5 rounded-2xl shadow-xl border border-white/80 flex items-center gap-3"
      >
        <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-inner">
          <FileText size={18} />
        </div>
        <div>
          <p className="text-xs font-black text-slate-900">Rx Deciphered</p>
          <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest">Generic Savings 40%</p>
        </div>
      </motion.div>

      <motion.div 
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[16%] left-[-4%] sm:left-[2%] z-30 bg-white/95 backdrop-blur-xl p-3 sm:p-3.5 rounded-2xl shadow-xl border border-white/80 flex items-center gap-3"
      >
        <div className="w-9 h-9 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shadow-inner">
          <HeartPulse size={18} />
        </div>
        <div>
          <p className="text-xs font-black text-slate-900">Sub-10 Min SLA</p>
          <p className="text-[9px] font-bold text-red-600 uppercase tracking-widest">Live Rider GPS Active</p>
        </div>
      </motion.div>
    </div>
  );
};

export default function LandingPage() {
  // Offline Simulator State
  const [offlineState, setOfflineState] = useState<'ONLINE' | 'OFFLINE' | 'SYNCED'>('ONLINE');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[00:00:01] SQLite local medicine trie: 1,480 entities cached in IndexedDB.',
    '[00:00:02] Background Service Worker active: offline drug normalizer ready.',
    '[00:00:03] Proximity Grid connected: 8 active chemists in 2.5km radius.'
  ]);

  // Multi-Pharmacy Set Cover Simulator State
  const [activeSetCoverStep, setActiveSetCoverStep] = useState<1 | 2 | 3>(2);

  const toggleOfflineSim = () => {
    if (offlineState === 'ONLINE') {
      setOfflineState('OFFLINE');
      setTerminalLogs(prev => [
        ...prev,
        '[NETWORK DROP] Cellular data lost (0-connectivity). Switched to offline IndexedDB trie search.',
        '[CACHE-FIRST] Resolved query "Lantus Insulin 100IU" locally in 4ms with zero network packets.'
      ]);
    } else {
      setOfflineState('SYNCED');
      setTerminalLogs(prev => [
        ...prev,
        '[NETWORK RESTORED] Background sync worker flushed queued order MR-4821 to pharmacy broadcast.',
        '[STATUS: 200] Chemist auto-confirmation received via WebSockets.'
      ]);
      setTimeout(() => setOfflineState('ONLINE'), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F9FF] font-sans overflow-x-hidden selection:bg-blue-600 selection:text-white">
      <Navbar />

      {/* ─── 1. HERO SECTION ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[95vh] flex items-center pt-28 pb-20 bg-gradient-to-br from-[#1565C0] via-[#0D47A1] to-slate-950 overflow-hidden text-white">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-extrabold px-3.5 py-1.5 rounded-full mb-6 uppercase tracking-wider shadow-sm">
                <Zap size={14} className="mr-1.5 text-yellow-300 animate-bounce" /> Sub-10 Minute Emergency Network
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-6 tracking-tight drop-shadow-md">
                Emergency healthcare support when <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-300 via-amber-300 to-yellow-200">every second counts.</span>
              </h1>
              
              <p className="text-base sm:text-lg text-blue-100 mb-8 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed drop-shadow-sm">
                Instant medicine delivery from nearby verified pharmacies, generic price comparison, AI report simplification, symptom triage, and real-time cold-chain rider tracking.
              </p>
              
              {/* CTAs -> Main Button opens Harsh's full patient ordering flow */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/patient" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto py-4 px-8 text-base bg-white text-[#0D47A1] hover:bg-blue-50 transition-all duration-300 shadow-xl shadow-blue-950/40 rounded-2xl font-black flex items-center justify-center gap-2 group cursor-pointer">
                    <Pill size={18} className="text-blue-600" />
                    Order Medicine Now
                    <ArrowRight className="ml-1 group-hover:translate-x-1.5 transition-transform" size={18}/>
                  </button>
                </Link>

                <Link href="/emergency" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto py-4 px-7 text-base bg-red-600 hover:bg-red-700 transition-all duration-300 text-white rounded-2xl shadow-xl shadow-red-950/30 font-black flex items-center justify-center gap-2 animate-pulse cursor-pointer border border-red-400/40">
                    <PhoneCall size={18}/> Emergency SOS (108)
                  </button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-bold text-blue-200">
                <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-400" /> Jan Aushadhi generic options</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-400" /> 2°C - 8°C Cold Gel Ice Pack</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={15} className="text-emerald-400" /> Offline-First PWA</span>
              </div>
            </motion.div>

            {/* Right Phone Mockup */}
            <div className="relative">
              <HeroMockup />
            </div>
            
          </div>
        </div>
      </section>

      {/* ─── 2. TRUST STATS BAR ──────────────────────────────────────────────── */}
      <section className="py-10 bg-[#F5F9FF] relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#1565C0] text-white rounded-3xl p-8 md:p-12 shadow-xl border border-blue-400/30 relative overflow-hidden -mt-20 backdrop-blur-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-black tracking-tight">10 Min</div>
                <div className="text-xs font-bold text-blue-200 uppercase tracking-wider">Average Dispatch SLA</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-black tracking-tight">24 / 7</div>
                <div className="text-xs font-bold text-blue-200 uppercase tracking-wider">Emergency Readiness</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-black tracking-tight">500+</div>
                <div className="text-xs font-bold text-blue-200 uppercase tracking-wider">Connected Pharmacies</div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl sm:text-4xl font-black tracking-tight">40-70%</div>
                <div className="text-xs font-bold text-blue-200 uppercase tracking-wider">Generic Drug Savings</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. HOW IT WORKS (THE FULL 10-MINUTE DISPATCH LIFECYCLE) ─────────── */}
      <section className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 text-blue-600 font-extrabold text-xs uppercase tracking-widest mb-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              <Clock size={14} /> Sub-10 Minute Delivery Lifecycle
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              How emergency medicine reaches your doorstep in 10 minutes.
            </h2>
            <p className="text-slate-600 mt-3 text-sm sm:text-base font-medium">
              Standard delivery apps take 2 hours to 2 days because they rely on distant warehouses. MediRush utilizes hyperlocal clusters of registered retail chemists.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <div className="bg-[#F5F9FF] rounded-2xl p-6 border border-slate-200/90 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center mb-4 shadow-md">
                  01
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2">Prescription Scan & Salt Lookup</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Patient searches brand or uploads prescription. Gemini AI deciphers doctor handwriting, verifies Schedule-H rules, and suggests Jan Aushadhi generic equivalents.
                </p>
              </div>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-100/60 px-2 py-1 rounded-md w-fit">
                Time: 0 - 30 seconds
              </span>
            </div>

            {/* Step 2 */}
            <div className="bg-[#F5F9FF] rounded-2xl p-6 border border-slate-200/90 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center mb-4 shadow-md">
                  02
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2">Automated Chemist Lock</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  System broadcasts to the top 3 closest verified chemists within 2 km. First chemist taps "Accept", locking inventory and generating single QR invoice.
                </p>
              </div>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/60 px-2 py-1 rounded-md w-fit">
                Time: 30s - 2 minutes
              </span>
            </div>

            {/* Step 3 */}
            <div className="bg-[#F5F9FF] rounded-2xl p-6 border border-slate-200/90 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-600 text-white font-black text-lg flex items-center justify-center mb-4 shadow-md">
                  03
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2">Cold-Chain Gel Packaging</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  If insulin or temperature-sensitive biologics are detected, chemist packs with pre-frozen 2°C - 8°C cold gel packs verified against ambient temperature.
                </p>
              </div>
              <span className="text-[10px] font-bold text-cyan-700 bg-cyan-100/60 px-2 py-1 rounded-md w-fit">
                Time: 2 - 4 minutes
              </span>
            </div>

            {/* Step 4 */}
            <div className="bg-[#F5F9FF] rounded-2xl p-6 border border-slate-200/90 flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center mb-4 shadow-md">
                  04
                </div>
                <h3 className="text-base font-black text-slate-900 mb-2">GPS Rider Arrival & OTP Delivery</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Dedicated rider picks up sealed package and arrives at patient's doorstep. Verified via digital 4-digit security OTP with real-time map tracking.
                </p>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-1 rounded-md w-fit">
                Total: &lt; 10 minutes
              </span>
            </div>

          </div>

          <div className="mt-12 text-center">
            <Link href="/patient">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-black text-sm px-8 py-4 rounded-2xl shadow-xl shadow-blue-500/20 inline-flex items-center gap-2 cursor-pointer transition-transform hover:scale-105">
                <Pill size={18} /> Test Live Patient Order Hub →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 4. DEEP-DIVE TECHNICAL ARCHITECTURE (EXPLAINING HARSH TECH) ─────── */}
      <section id="technology" className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 text-blue-400 font-extrabold text-xs uppercase tracking-widest mb-2 bg-blue-950/80 border border-blue-800 px-3.5 py-1.5 rounded-full">
              <Cpu size={14} /> Proprietary Technical Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Solving real healthcare challenges in Tier-2 & Tier-3 cities.
            </h2>
            <p className="text-slate-400 mt-3 text-sm sm:text-base font-medium">
              We engineered specialized algorithms for zero-Wi-Fi connectivity drops, extreme summer temperatures, and multi-pharmacy stockouts.
            </p>
          </div>

          {/* Deep-Dive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            
            {/* 1. Offline-First SQLite Trie & Zero Wi-Fi Sync */}
            <div className="bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-700/80 space-y-5 hover:border-blue-500 transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                    <WifiOff size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-950 px-3 py-1 rounded-full border border-blue-800">
                    PWA Cache-First
                  </span>
                </div>

                <h3 className="text-xl font-black text-white mb-2">
                  Zero Wi-Fi & Offline-First Medicine Search
                </h3>

                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
                  In rural or basement locations where internet drops to 2G or zero connectivity, users cannot afford search failure. MediRush bundles a compiled Trie search tree of 1,480+ medicines directly in client IndexedDB. Users search and queue orders without internet; background service workers auto-sync the moment connection flickers back.
                </p>
              </div>

              {/* Interactive Simulator Bar */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-700 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-slate-400 font-bold flex items-center gap-1.5">
                    <Terminal size={14} className="text-blue-400" /> Status: {offlineState}
                  </span>
                  <button
                    onClick={toggleOfflineSim}
                    className="text-[11px] font-black text-blue-400 underline cursor-pointer"
                  >
                    {offlineState === 'ONLINE' ? 'Simulate Network Drop' : 'Reconnect Online'}
                  </button>
                </div>
                <div className="font-mono text-[11px] text-emerald-400 space-y-1">
                  {terminalLogs.slice(-2).map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Multi-Pharmacy Cooperative Set-Cover */}
            <div className="bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-700/80 space-y-5 hover:border-emerald-500 transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <Layers size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
                    Greedy Set-Cover
                  </span>
                </div>

                <h3 className="text-xl font-black text-white mb-2">
                  Multi-Pharmacy Cooperative Fulfillment
                </h3>

                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
                  When a patient needs 3 medicines (e.g. Rare Biologic + Daily BP + Antibiotic) and no single chemist has all 3, traditional apps cancel the order. MediRush uses greedy set-cover optimization to split the order across 2 nearby pharmacies and dispatches a multi-stop rider to combine items into one delivery.
                </p>
              </div>

              {/* Set Cover Visual Representation */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-700 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400 font-bold text-[10px] uppercase">
                  <span>Prescription: 3 Drugs</span>
                  <span className="text-emerald-400">100% Fulfilled</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-blue-400 font-bold block">Chemist A (500m)</span>
                    <span className="text-slate-300">Lantus Insulin (Cold)</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-emerald-400 font-bold block">Chemist B (800m)</span>
                    <span className="text-slate-300">Telma 40 + Augmentin</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Ambient Weather Thermal Cold-Chain SLA */}
            <div className="bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-700/80 space-y-5 hover:border-cyan-500 transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                    <Snowflake size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-950 px-3 py-1 rounded-full border border-cyan-800">
                    Thermal Physics
                  </span>
                </div>

                <h3 className="text-xl font-black text-white mb-2">
                  Weather-Aware 2°C - 8°C Cold Pack SLA
                </h3>

                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
                  Insulin and biologics spoil if temperature rises above 8°C. MediRush queries live OpenWeatherMap API feeds to read real-time ambient heat (e.g. 40°C in Indian summers), computes thermodynamic gel decay rates, and locks a strict dynamic delivery deadline (e.g. 18 mins maximum safe window).
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-700 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[10px] block">Summer Ambient Temp</span>
                  <span className="text-amber-400 font-black text-sm">38.5°C Detected</span>
                </div>
                <div className="text-right space-y-0.5">
                  <span className="text-slate-400 text-[10px] block">Decay Safe Window</span>
                  <span className="text-cyan-400 font-black text-sm">22 Min Delivery Cap</span>
                </div>
              </div>
            </div>

            {/* 4. Chemist Decay Ranking & Shadow Stock OCR */}
            <div className="bg-slate-800/90 rounded-3xl p-6 sm:p-8 border border-slate-700/80 space-y-5 hover:border-purple-500 transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                    <Radio size={24} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 bg-purple-950 px-3 py-1 rounded-full border border-purple-800">
                    Ranking Formula
                  </span>
                </div>

                <h3 className="text-xl font-black text-white mb-2">
                  Decay-Weighted Proximity & Stock Ranking
                </h3>

                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">
                  Chemists are dynamically ranked based on Haversine distance, historical fulfillment speed, Schedule-H license validity, and an exponential inventory confidence score that decays over 24 hours to prevent orders going to out-of-date stock records.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-700 flex items-center justify-between text-xs font-mono">
                <div className="text-slate-400">Score = Dist^-1 × Conf × Freshness</div>
                <span className="text-purple-400 font-bold bg-purple-950 px-2 py-0.5 rounded">Top Ranked</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 5. FULL HEALTHCARE AI & DIAGNOSTIC TOOLS (ALL 6 SERVICES) ───────── */}
      <section className="py-20 bg-[#F5F9FF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 text-blue-600 font-extrabold text-xs uppercase tracking-widest mb-2 bg-blue-100/60 px-3 py-1 rounded-full">
              <Sparkles size={14} /> Comprehensive Patient Suite
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Clinical diagnostic & wellness tools for daily life.
            </h2>
            <p className="text-slate-600 mt-3 text-sm sm:text-base font-medium">
              Everything integrated into a single unified health platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. Order Medicine Flow */}
            <Link 
              href="/patient" 
              className="bg-white rounded-2xl p-7 border border-slate-200/80 hover:border-blue-500 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Pill size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                  Emergency Medicine Order
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                  Instant stock lookup across nearby chemists, generic price substitution, thermal cold-chain ice pack packaging, and rider live GPS track.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                <span>Launch Ordering Hub</span>
                <ArrowRight size={14} />
              </div>
            </Link>

            {/* 2. Medical Report Simplifier */}
            <Link 
              href="/report-simplifier" 
              className="bg-white rounded-2xl p-7 border border-slate-200/80 hover:border-indigo-500 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <FileText size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  AI Report Simplifier
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                  Upload prescription photos & pathology lab test reports. Google Gemini AI explains abnormal blood markers, customized diets, and follow-up advice.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                <span>Analyze Lab Report</span>
                <ArrowRight size={14} />
              </div>
            </Link>

            {/* 3. Symptom Checker & Triage */}
            <Link 
              href="/symptom-checker" 
              className="bg-white rounded-2xl p-7 border border-slate-200/80 hover:border-teal-500 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Stethoscope size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-teal-600 transition-colors">
                  AI Symptom Checker
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                  Conversational diagnostic triage chat. Predicts probable health conditions, suggests home precautions, and flags acute emergencies.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-teal-600 group-hover:translate-x-1 transition-transform">
                <span>Start Symptom Check</span>
                <ArrowRight size={14} />
              </div>
            </Link>

            {/* 4. Home Remedies & Ayurvedic Care */}
            <Link 
              href="/remedies" 
              className="bg-white rounded-2xl p-7 border border-slate-200/80 hover:border-emerald-500 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Leaf size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                  Ayurvedic & Home Remedies
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                  50+ evidence-backed home treatments for cough, acidity, headache, fever, sleep, and digestion with preparation recipes and precautions.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition-transform">
                <span>Explore Remedies</span>
                <ArrowRight size={14} />
              </div>
            </Link>

            {/* 5. Medicine Dose Reminders */}
            <Link 
              href="/reminders" 
              className="bg-white rounded-2xl p-7 border border-slate-200/80 hover:border-amber-500 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Bell size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">
                  Medicine Dose Reminders
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                  Custom schedule for Morning, Afternoon, and Night doses. Sound alerts, pill tracker, and progress check to never miss critical prescriptions.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-amber-600 group-hover:translate-x-1 transition-transform">
                <span>View Dose Schedule</span>
                <ArrowRight size={14} />
              </div>
            </Link>

            {/* 6. Nearby Healthcare */}
            <Link 
              href="/nearby" 
              className="bg-white rounded-2xl p-7 border border-slate-200/80 hover:border-purple-500 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <MapPin size={24} />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">
                  Nearby 24/7 Healthcare
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-medium">
                  Locate verified 24-hour pharmacies, government Jan Aushadhi Kendras, regional blood banks, and trauma centers with instant contact info.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-purple-600 group-hover:translate-x-1 transition-transform">
                <span>Open Radar Map</span>
                <ArrowRight size={14} />
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* ─── 6. EMERGENCY CALLOUT ────────────────────────────────────────────── */}
      <section className="py-16 bg-[#F5F9FF]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-red-600 to-rose-700 rounded-3xl p-8 sm:p-12 shadow-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6 border border-red-400/40">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white flex-shrink-0 animate-pulse">
                <AlertTriangle size={32} />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-black">Facing a Critical Medical Emergency?</h3>
                <p className="text-red-100 text-xs sm:text-sm mt-1 font-medium">
                  Trigger immediate emergency SOS dispatch or connect directly with regional ambulance & hospital ER hotlines.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Link href="/emergency" className="w-full sm:w-auto">
                <button className="w-full bg-white text-red-600 hover:bg-red-50 font-black px-6 py-3.5 rounded-xl shadow-md text-sm transition-all cursor-pointer">
                  Activate Emergency SOS
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
