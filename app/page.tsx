'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Check, 
  ChevronRight, 
  FileText, 
  Activity, 
  ShieldCheck, 
  Database, 
  Layers, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Sparkles, 
  MapPin, 
  ExternalLink,
  Store,
  Clock,
  Snowflake,
  Search,
  CheckCircle2,
  AlertTriangle,
  Send,
  Zap,
  PhoneCall,
  Navigation,
  Pill,
  Thermometer,
  Eye,
  Sliders,
  Play,
  Share2,
  Cpu,
  Terminal,
  Shield,
  Bike,
  Flame,
  CheckCircle,
  HelpCircle,
  BarChart3,
  TrendingDown,
  Lock,
  ArrowUpRight,
  Radio,
  Workflow,
  Compass,
  QrCode,
  ScanLine
} from 'lucide-react';

const SAMPLE_QUERIES = [
  'Lantus 100IU Cartridge',
  'Ciproflx 500mg',
  'Telma 40 (Telmisartan)',
  'Augmentin 625 Duo',
  'Glycomet-SR 500'
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  
  // Interactive Hero Demo State
  const [heroSearch, setHeroSearch] = useState('Lantus 100IU Cartridge');
  const [tickerIndex, setTickerIndex] = useState(0);
  const [heroFlowStep, setHeroFlowStep] = useState<1 | 2 | 3>(1);
  const [isAutoTyping, setIsAutoTyping] = useState(true);
  
  // Interactive Network Radar Simulation State
  const [selectedPharmacyRadar, setSelectedPharmacyRadar] = useState<number>(2);
  const [radarAngle, setRadarAngle] = useState(0);

  // Interactive Set Cover Calculator State
  const [selectedMeds, setSelectedMeds] = useState<string[]>(['Lantus Insulin', 'Telma 40', 'Ciprofloxacin']);
  
  // Interactive Offline Terminal Simulator State
  const [offlineState, setOfflineState] = useState<'ONLINE' | 'OFFLINE' | 'SYNCING' | 'SYNCED'>('ONLINE');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '[00:00:01] Initialized SQLite local medicine trie: 1,480 entities indexed.',
    '[00:00:02] Connected to Overpass Pharmacy Proximity Grid: Lat 23.334, Lng 75.040.',
    '[00:00:03] Background service worker registered: cache-first local normalizer active.'
  ]);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Automatic hero progression
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroFlowStep((prev) => (prev >= 3 ? 1 : (prev + 1) as 1 | 2 | 3));
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  // Automatic query ticker cycle
  useEffect(() => {
    if (!isAutoTyping) return;
    const interval = setInterval(() => {
      setTickerIndex((prev) => {
        const next = (prev + 1) % SAMPLE_QUERIES.length;
        setHeroSearch(SAMPLE_QUERIES[next]);
        return next;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoTyping]);

  // Radar continuous rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setRadarAngle((prev) => (prev + 2) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Normalization sandbox lookup
  const normalizedPreview = useMemo(() => {
    const q = heroSearch.toLowerCase().trim();
    if (q.includes('lan') || q.includes('insul')) {
      return {
        salt: 'Insulin Glargine 100 IU/ml',
        brand: 'Lantus Solostar Pen',
        generic: 'Basalog (Biocon Jan Aushadhi)',
        brandPrice: 680,
        genericPrice: 410,
        savings: 40,
        coldChain: true,
        category: 'Chronic Diabetes (2°C-8°C)',
        confidence: 98,
        matchType: 'EXACT_SALT',
        pharmacyCount: 3,
        bestChemist: 'Gupta Medicos & Cold Chain Hub (1.2 km)',
        batch: 'LAN26B04',
        expiry: 'Aug 2027'
      };
    } else if (q.includes('cip') || q.includes('cif')) {
      return {
        salt: 'Ciprofloxacin 500mg',
        brand: 'Ciplox 500 Tablet',
        generic: 'Ciprofloxacin PMBJP Generic',
        brandPrice: 85,
        genericPrice: 14,
        savings: 83,
        coldChain: false,
        category: 'Acute Antibiotic',
        confidence: 96,
        matchType: 'CANONICAL_MATCH',
        pharmacyCount: 4,
        bestChemist: 'Jan Aushadhi Kendra #4412 (0.8 km)',
        batch: 'JA-CIP-26',
        expiry: 'Mar 2028'
      };
    } else if (q.includes('tel') || q.includes('bp')) {
      return {
        salt: 'Telmisartan 40mg',
        brand: 'Telma 40 Tablet',
        generic: 'Jan Aushadhi Telmisartan',
        brandPrice: 145,
        genericPrice: 28,
        savings: 81,
        coldChain: false,
        category: 'Cardiovascular / HTN',
        confidence: 97,
        matchType: 'EXACT_SALT',
        pharmacyCount: 5,
        bestChemist: 'Verma Pharma & Healthcare (1.4 km)',
        batch: 'TEL26H01',
        expiry: 'Oct 2027'
      };
    } else if (q.includes('aug') || q.includes('clov') || q.includes('amox')) {
      return {
        salt: 'Amoxicillin + Clavulanic Acid 625mg',
        brand: 'Augmentin 625 Duo',
        generic: 'Amoxy-Clav PMBJP Generic 625',
        brandPrice: 210,
        genericPrice: 65,
        savings: 69,
        coldChain: false,
        category: 'Broad-Spectrum Antibiotic',
        confidence: 97,
        matchType: 'COMBINATION_SALT',
        pharmacyCount: 3,
        bestChemist: 'Gupta Medicos & Retail (1.2 km)',
        batch: 'AUG26E12',
        expiry: 'Nov 2027'
      };
    } else {
      return {
        salt: 'Metformin Hydrochloride 500mg',
        brand: 'Glycomet-SR 500',
        generic: 'Metformin PMBJP Prolonged Release',
        brandPrice: 65,
        genericPrice: 12,
        savings: 81,
        coldChain: false,
        category: 'Metabolic / Glycemic',
        confidence: 95,
        matchType: 'FUZZY_NORMALIZED',
        pharmacyCount: 4,
        bestChemist: 'Jan Aushadhi Kendra (0.8 km)',
        batch: 'JA-MET-44',
        expiry: 'May 2028'
      };
    }
  }, [heroSearch]);

  const handleSimulateOfflineAction = (action: 'DISCONNECT' | 'SEARCH_OFFLINE' | 'QUEUE_ORDER' | 'RECONNECT') => {
    const time = new Date().toTimeString().split(' ')[0];
    if (action === 'DISCONNECT') {
      setOfflineState('OFFLINE');
      setTerminalLogs(prev => [
        `[${time}] ⚠️ Network Disconnected: Offline fallbacks engaged.`,
        `[${time}] 🔒 Switched to Local IndexedDB & SQLite Cache (0.28ms latency).`,
        ...prev.slice(0, 5)
      ]);
    } else if (action === 'SEARCH_OFFLINE') {
      setTerminalLogs(prev => [
        `[${time}] 🔍 Local Trie Search executed for "${heroSearch}". Match score: 98% (0.31ms).`,
        `[${time}] 📦 Retrieved 14 local shadow inventory batch records without internet.`,
        ...prev.slice(0, 5)
      ]);
    } else if (action === 'QUEUE_ORDER') {
      setTerminalLogs(prev => [
        `[${time}] 📥 Dispense order #MR-LOCAL-91 recorded to pending sync queue.`,
        `[${time}] 📋 1 transaction awaiting cloud reconciliation.`,
        ...prev.slice(0, 5)
      ]);
    } else if (action === 'RECONNECT') {
      setOfflineState('SYNCING');
      setTerminalLogs(prev => [
        `[${time}] 🌐 Network Restored: Initiating two-way cryptographic delta sync...`,
        ...prev.slice(0, 5)
      ]);
      setTimeout(() => {
        setOfflineState('SYNCED');
        setTerminalLogs(prev => [
          `[${new Date().toTimeString().split(' ')[0]}] ✅ Sync complete: 1 pending invoice reconciled with cloud registry.`,
          ...prev.slice(0, 5)
        ]);
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#09090b] font-sans antialiased selection:bg-teal-900 selection:text-teal-50 relative overflow-x-hidden">
      
      {/* Dynamic Animated Ambient Background Glows */}
      <div className="fixed top-[-150px] left-[20%] w-[600px] h-[600px] bg-teal-400/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-float" />
      <div className="fixed bottom-[-100px] right-[10%] w-[500px] h-[500px] bg-emerald-400/8 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Background Technical Dot Pattern */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.04] z-0" 
        style={{ 
          backgroundImage: `radial-gradient(#042f2e 1.2px, transparent 1.2px)`, 
          backgroundSize: '24px 24px' 
        }} 
      />

      {/* ─── 1. NAVBAR ──────────────────────────────────────────────────────── */}
      <header 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-[#fafaf9]/92 backdrop-blur-md border-b border-stone-200/90 py-3 shadow-xs' 
            : 'bg-transparent py-4 border-b border-transparent'
        }`}
      >
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#042f2e] to-[#0f766e] text-white flex items-center justify-center font-black text-sm tracking-tight shadow-md shadow-teal-950/20 group-hover:scale-105 transition-transform">
                M
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-[#09090b] leading-tight flex items-center gap-1.5">
                  MediRush
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </span>
                <span className="text-[10px] font-mono text-stone-400 font-medium leading-tight">
                  Healthcare Logistics OS
                </span>
              </div>
            </Link>
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-stone-600">
            <a href="#problem" className="hover:text-teal-900 transition">Problem</a>
            <a href="#how-it-works" className="hover:text-teal-900 transition">How It Works</a>
            <a href="#shadow-inventory" className="hover:text-teal-900 transition">Shadow Inventory</a>
            <a href="#set-cover" className="hover:text-teal-900 transition">Multi-Store Solver</a>
            <a href="#offline-first" className="hover:text-teal-900 transition">Offline Engine</a>
            <a href="#technology" className="hover:text-teal-900 transition">Tech Stack</a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            <Link 
              href="/chemist"
              target="_blank"
              className="text-xs font-bold text-stone-700 hover:text-stone-950 bg-white hover:bg-stone-100 border border-stone-300/80 px-3 py-2 rounded-xl transition shadow-2xs hidden md:inline-flex items-center gap-1.5"
            >
              <span>Chemist Terminal</span>
              <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
            </Link>

            <Link 
              href="/rider"
              target="_blank"
              className="text-xs font-bold text-cyan-800 hover:text-cyan-950 bg-cyan-50/80 hover:bg-cyan-100/80 border border-cyan-300/80 px-3 py-2 rounded-xl transition shadow-2xs hidden sm:inline-flex items-center gap-1.5"
            >
              <Bike className="w-3.5 h-3.5 text-cyan-600" />
              <span>Rider Portal</span>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-500" />
            </Link>

            <Link
              href="/patient"
              className="text-xs font-bold text-white bg-[#042f2e] hover:bg-[#0f766e] px-4 py-2 rounded-xl transition flex items-center gap-2 shadow-sm shadow-teal-950/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Patient App</span>
              <ArrowRight className="w-3.5 h-3.5 text-teal-300" />
            </Link>
          </div>
        </div>
      </header>

      {/* ─── 2. HERO SECTION WITH ANIMATED SANDBOX ───────────────────────────── */}
      <section className="pt-10 pb-20 md:pt-16 md:pb-28 border-b border-stone-200/80 relative">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            
            {/* Left Column */}
            <div className="lg:col-span-6 flex flex-col items-start z-10">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50/90 border border-teal-200 text-teal-900 text-[11px] font-bold tracking-wider uppercase mb-5 shadow-2xs animate-pulse-glow">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Tier-2 / Tier-3 Medicine Access Network</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[48px] font-black text-[#09090b] tracking-tight leading-[1.12] mb-6">
                When the medicine is nearby, getting it shouldn&apos;t be difficult.
              </h1>

              <p className="text-base sm:text-lg text-stone-600 leading-relaxed font-normal mb-8 max-w-xl">
                Patients shouldn&apos;t have to call pharmacy after pharmacy, travel across the city, or wait days to find a prescribed medicine. MediRush connects patients with nearby pharmacies and turns fragmented local supply into smarter, faster doorstep fulfillment.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <Link
                  href="/patient"
                  className="px-6 py-3.5 rounded-xl bg-[#042f2e] hover:bg-[#0f766e] text-white text-sm font-bold flex items-center justify-center gap-2.5 transition shadow-md shadow-teal-950/20 group hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4 text-teal-300 animate-spin" style={{ animationDuration: '4s' }} />
                  <span>Scan Prescription Live</span>
                  <ArrowRight className="w-4 h-4 text-teal-300 group-hover:translate-x-1 transition-transform" />
                </Link>

                <a
                  href="#set-cover"
                  className="px-5 py-3.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-sm font-bold flex items-center justify-center gap-2 transition shadow-2xs hover:border-teal-400"
                >
                  <Workflow className="w-4 h-4 text-teal-700" />
                  <span>Explore Set Cover Solver</span>
                </a>
              </div>

              {/* Verified Metrics Counter */}
              <div className="mt-10 pt-6 border-t border-stone-200/90 w-full grid grid-cols-3 gap-4 text-left">
                <div className="p-3 bg-white/70 rounded-xl border border-stone-200 shadow-2xs">
                  <div className="text-xl sm:text-2xl font-black font-mono text-teal-950 flex items-center gap-1">
                    100% <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                  </div>
                  <div className="text-[11px] text-stone-500 font-medium mt-0.5 leading-snug">Prescription Coverage via Multi-Store Split</div>
                </div>
                <div className="p-3 bg-white/70 rounded-xl border border-stone-200 shadow-2xs">
                  <div className="text-xl sm:text-2xl font-black font-mono text-teal-950 flex items-center gap-1">
                    ~18 min <Clock className="w-4 h-4 text-teal-700" />
                  </div>
                  <div className="text-[11px] text-stone-500 font-medium mt-0.5 leading-snug">Average Hyper-Local Delivery Window</div>
                </div>
                <div className="p-3 bg-white/70 rounded-xl border border-stone-200 shadow-2xs">
                  <div className="text-xl sm:text-2xl font-black font-mono text-teal-950 flex items-center gap-1">
                    2°C–8°C <Snowflake className="w-4 h-4 text-sky-600" />
                  </div>
                  <div className="text-[11px] text-stone-500 font-medium mt-0.5 leading-snug">Thermal Monitored Cold-Chain Seal</div>
                </div>
              </div>

            </div>

            {/* Right Column: Live Animated Interactive Sandbox */}
            <div className="lg:col-span-6">
              <div className="bg-white rounded-2xl border border-stone-300/90 shadow-xl shadow-stone-200/60 p-5 sm:p-6 flex flex-col gap-4 relative overflow-hidden animate-border-glow">
                
                {/* Header Sandbox Controller */}
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-extrabold text-stone-900 tracking-wide uppercase">
                      Live Medicine Normalizer & Stock Sandbox
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-900 border border-teal-200 px-2 py-0.5 rounded-full">
                      Auto-Lookup Active
                    </span>
                  </div>
                </div>

                {/* Interactive Search Bar Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                      Interactive Query Simulator:
                    </label>
                    <span className="text-[10px] text-stone-400 font-mono">Click chips to switch</span>
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 text-teal-700 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={heroSearch}
                      onChange={(e) => {
                        setIsAutoTyping(false);
                        setHeroSearch(e.target.value);
                      }}
                      placeholder="e.g. Lantus 100IU, Ciproflx 500, Telma 40..."
                      className="w-full bg-stone-50 hover:bg-white focus:bg-white border border-stone-200 focus:border-teal-600 rounded-xl pl-10 pr-24 py-2.5 text-xs font-bold text-stone-900 transition focus:outline-none shadow-2xs"
                    />
                    <div className="absolute right-2 top-2 flex gap-1">
                      {['Lantus', 'Ciproflx', 'Telma 40', 'Augmentin'].map((chip) => (
                        <button
                          key={chip}
                          onClick={() => {
                            setIsAutoTyping(false);
                            setHeroSearch(chip);
                          }}
                          className="text-[10px] font-mono bg-white hover:bg-teal-50 border border-stone-200 hover:border-teal-400 text-stone-700 px-1.5 py-0.5 rounded cursor-pointer transition font-bold"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Real-time Normalizer Output Card with Dynamic Transition */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-stone-50 via-teal-50/20 to-emerald-50/30 border border-teal-200/90 space-y-3 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black text-stone-900">{normalizedPreview.brand}</h4>
                        {normalizedPreview.coldChain && (
                          <span className="text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200 px-1.5 py-0.2 rounded flex items-center gap-1">
                            <Snowflake className="w-3 h-3 text-sky-600 animate-spin" style={{ animationDuration: '6s' }} />
                            2°C–8°C Cold Pack
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-teal-900 font-mono mt-0.5 font-medium">
                        Active Salt: <strong>{normalizedPreview.salt}</strong>
                      </p>
                    </div>

                    <span className="text-[10px] font-mono font-black text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1 shadow-2xs">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {normalizedPreview.confidence}% Confidence
                    </span>
                  </div>

                  {/* Jan Aushadhi Affordable Generic Comparison */}
                  <div className="p-3 bg-white rounded-xl border border-stone-200 flex items-center justify-between text-xs shadow-2xs hover:border-teal-300 transition-colors">
                    <div>
                      <span className="text-[10px] text-stone-500 font-medium block">Jan Aushadhi Generic Substitute:</span>
                      <strong className="text-stone-900 font-bold">{normalizedPreview.generic}</strong>
                    </div>
                    <div className="text-right">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[10px] line-through text-stone-400 font-mono">₹{normalizedPreview.brandPrice}</span>
                        <span className="text-sm font-black text-emerald-700 font-mono">₹{normalizedPreview.genericPrice}</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 inline-block">
                        Save {normalizedPreview.savings}%
                      </span>
                    </div>
                  </div>

                  {/* Proximity Chemist Status */}
                  <div className="pt-2 border-t border-teal-200/60 flex items-center justify-between text-[11px] text-stone-600">
                    <span className="flex items-center gap-1.5 truncate max-w-[280px]">
                      <Store className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      Nearest Stock: <strong>{normalizedPreview.bestChemist}</strong>
                    </span>
                    <span className="font-mono text-teal-900 font-bold shrink-0">
                      {normalizedPreview.pharmacyCount} Stores Available
                    </span>
                  </div>
                </div>

                {/* Direct Launch CTA inside Card */}
                <Link
                  href="/patient"
                  className="w-full bg-[#042f2e] hover:bg-[#0f766e] text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                  <span>Test this medicine in Live Patient Ordering App</span>
                  <ArrowRight className="w-3.5 h-3.5 text-teal-300" />
                </Link>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 3. PROBLEM SECTION ──────────────────────────────────────────────── */}
      <section id="problem" className="py-20 md:py-28 border-b border-stone-200/80 bg-stone-100/50">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8">
          
          <div className="max-w-2xl mb-14">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2.5">
              The Reality of Fragmented Medicine Access
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#09090b] tracking-tight leading-tight">
              The problem isn&apos;t always availability. <br />It&apos;s access.
            </h2>
            <p className="text-base text-stone-600 mt-4 leading-relaxed font-normal">
              A medicine may exist in a verified distributor invoice just 1.5 kilometres away, yet reaching it can still mean calling multiple retail pharmacies, travelling across congested city roads, or making repeated visits.
            </p>
          </div>

          {/* Progressive Journey Grid with Animated Hover Lift */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {[
              { num: '01', title: 'Prescription', desc: 'Doctor writes handwritten acute/chronic prescription.', icon: FileText, color: 'text-stone-600' },
              { num: '02', title: 'Call Pharmacy', desc: 'Manual phone calls to 2–3 nearby chemists during rush hour.', icon: PhoneCall, color: 'text-amber-600' },
              { num: '03', title: 'No Stock', desc: 'Chemist has only 1 out of 3 medicines in physical storefront.', icon: AlertTriangle, color: 'text-red-600' },
              { num: '04', title: 'Travel 5–8 km', desc: 'Patient or family member travels across town to search again.', icon: Navigation, color: 'text-stone-600' },
              { num: '05', title: 'Search Again', desc: 'Incomplete partial stock split across fragmented retail stores.', icon: Search, color: 'text-amber-600' },
              { num: '06', title: 'Dosage Delayed', desc: 'Critical dosages delayed by 24–48 hours due to logistical friction.', icon: Clock, color: 'text-red-600' },
            ].map((step, idx) => {
              const IconComp = step.icon;
              return (
                <div 
                  key={idx}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col justify-between h-full hover:border-teal-400 hover:-translate-y-1 transition-all duration-200"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-mono font-black text-stone-400">
                        PHASE {step.num}
                      </span>
                      <IconComp className={`w-4 h-4 ${step.color}`} />
                    </div>
                    <h3 className="text-sm font-bold text-stone-900 mb-1.5">
                      {step.title}
                    </h3>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                  {idx < 5 && (
                    <div className="mt-4 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px] text-stone-400 font-medium">
                      <span>Friction Escalates</span>
                      <span>→</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ─── 4. "ONE MEDICINE, MULTIPLE SEARCHES" RADAR ──────────────────────── */}
      <section className="py-20 md:py-28 border-b border-stone-200/80 bg-white">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Radar Map Visual with Rotating Scan Beam */}
            <div className="lg:col-span-7">
              <div className="bg-stone-50/90 rounded-2xl border border-stone-300/90 p-6 sm:p-8 relative overflow-hidden shadow-xs">
                
                {/* Center Prescribed Node with Radar Ping Rings */}
                <div className="flex flex-col items-center justify-center my-4 relative">
                  <div className="absolute w-32 h-32 rounded-full border border-teal-500/30 animate-pulse-ring pointer-events-none" />
                  <div className="absolute w-48 h-48 rounded-full border border-teal-500/15 pointer-events-none" />

                  <div className="bg-[#042f2e] text-white px-6 py-3.5 rounded-2xl shadow-lg border border-teal-800 z-10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-teal-800 flex items-center justify-center text-teal-300">
                      <Pill className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-mono text-teal-300 font-bold">Prescribed Request</div>
                      <div className="text-sm font-extrabold tracking-tight">Ciprofloxacin 500mg (20 Strips)</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono mt-2 font-medium">
                    Proximity Radar • Real Local Pharmacy Invoices
                  </span>
                </div>

                {/* 4 Connected Nearby Pharmacy Nodes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-6">
                  {[
                    { id: 0, name: 'Pharmacy 01 (Station Rd)', dist: '1.8 km', status: 'UNAVAILABLE', tag: '✕ Sold Out', desc: 'No distributor invoice recorded in last 30 days.' },
                    { id: 1, name: 'Pharmacy 02 (Main Market)', dist: '2.4 km', status: 'UNRESPONSIVE', tag: '? Phone Line Busy', desc: 'Manual records, no verified digital stock stream.' },
                    { id: 2, name: 'Pharmacy 03 (Jan Aushadhi Kendra)', dist: '1.1 km', status: 'AVAILABLE', tag: '✓ 120 Strips in Stock', desc: 'Fresh Invoice: BPPI Certified PMBJP Batch #JA-CIP-26.' },
                    { id: 3, name: 'Pharmacy 04 (Civil Hospital Gate)', dist: '3.0 km', status: 'PARTIAL', tag: '✕ 2 Strips Only', desc: 'Insufficient quantity for full 5-day course.' },
                  ].map((pharm) => {
                    const isSelected = selectedPharmacyRadar === pharm.id;
                    const isAvailable = pharm.status === 'AVAILABLE';
                    return (
                      <div 
                        key={pharm.id}
                        onClick={() => setSelectedPharmacyRadar(pharm.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          isAvailable
                            ? 'bg-teal-50/90 border-teal-500 ring-2 ring-teal-500/20 shadow-sm'
                            : isSelected
                            ? 'bg-white border-stone-400 ring-1 ring-stone-300'
                            : 'bg-white border-stone-200/90 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-xs font-bold text-stone-900 truncate">{pharm.name}</h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            isAvailable
                              ? 'bg-teal-200/70 text-teal-950 font-mono'
                              : 'bg-stone-100 text-stone-600 font-mono'
                          }`}>
                            {pharm.tag}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[11px] text-stone-500">
                          <span>📍 {pharm.dist} away</span>
                          {isAvailable && <span className="text-teal-800 font-bold text-[10px]">Optimal Match →</span>}
                        </div>
                        <p className="text-[11px] text-stone-500 mt-1.5 leading-snug">{pharm.desc}</p>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

            {/* Right Narrative */}
            <div className="lg:col-span-5">
              <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block mb-3">
                Zero Friction Discovery
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#09090b] tracking-tight leading-tight mb-5">
                MediRush searches the network, not the patient.
              </h2>
              <p className="text-stone-600 text-sm leading-relaxed mb-6 font-normal">
                Instead of requiring patients or caregivers to manually cross-examine multiple retail storefronts, MediRush indexes distributor invoices to model local pharmacies as a unified, collaborative supply cloud.
              </p>

              <div className="space-y-3.5 text-xs">
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-900 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <strong className="text-stone-900 block font-bold text-xs">Decentralized Invoice Indexing</strong>
                    <span className="text-stone-500 leading-relaxed">Paper invoices photographed by pharmacists automatically populate shadow stock with batch numbers and freshness decay.</span>
                  </div>
                </div>

                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-900 font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <strong className="text-stone-900 block font-bold text-xs">Dynamic Proximity Routing</strong>
                    <span className="text-stone-500 leading-relaxed">Haversine GPS distances pair patient coordinates directly with the nearest verified fulfillment node.</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 5. SET COVER OPTIMIZATION ENGINE (MULTI-STORE SOLVER) ───────────── */}
      <section id="set-cover" className="py-20 md:py-28 border-b border-stone-200/80 bg-gradient-to-b from-[#fafaf9] to-stone-100/70">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block mb-2">
              Algorithmic Core • Weighted Set Cover
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#09090b] tracking-tight">
              Cooperative fulfillment when one store isn&apos;t enough.
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-3 font-normal">
              When no single pharmacy has all prescribed medicines, MediRush solves the optimal combination to achieve 100% coverage with minimum combined distance and shortest ETA.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Interactive Prescription Multi-Select */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-stone-300/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <span className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                  Prescribed Medicine Basket
                </span>
                <span className="text-[10px] font-mono text-stone-500">Toggle to recalculate</span>
              </div>

              <div className="space-y-2">
                {[
                  { name: 'Lantus Insulin (Cold Storage 2-8°C)', key: 'Lantus Insulin', category: 'Chemist 1 Specialist', cold: true },
                  { name: 'Telma 40mg (Telmisartan)', key: 'Telma 40', category: 'Chemist 1 & 2 Stock', cold: false },
                  { name: 'Ciprofloxacin 500mg (PMBJP Generic)', key: 'Ciprofloxacin', category: 'Chemist 3 Jan Aushadhi', cold: false },
                ].map((med) => {
                  const isChecked = selectedMeds.includes(med.key);
                  return (
                    <div 
                      key={med.key}
                      onClick={() => {
                        setSelectedMeds(prev => 
                          isChecked ? prev.filter(m => m !== med.key) : [...prev, med.key]
                        );
                      }}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        isChecked 
                          ? 'bg-teal-50/80 border-teal-400 shadow-2xs' 
                          : 'bg-stone-50/60 border-stone-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded-md flex items-center justify-center border text-[10px] font-bold ${
                          isChecked ? 'bg-teal-700 border-teal-700 text-white' : 'border-stone-300 bg-white'
                        }`}>
                          {isChecked && '✓'}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-stone-900 block">{med.name}</span>
                          <span className="text-[10px] text-stone-500">{med.category}</span>
                        </div>
                      </div>
                      {med.cold && (
                        <span className="text-[9px] font-bold bg-sky-100 text-sky-800 border border-sky-200 px-1.5 py-0.2 rounded">
                          Cold Chain
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 space-y-1">
                <div className="flex justify-between font-mono text-[11px]">
                  <span>Total Items Selected:</span>
                  <strong>{selectedMeds.length} Medicines</strong>
                </div>
                <div className="flex justify-between font-mono text-[11px] text-teal-800">
                  <span>Optimal Combination:</span>
                  <strong>Cooperative 2-Node Split</strong>
                </div>
              </div>
            </div>

            {/* Right Solver Solution Card with Progress Counter */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-stone-300/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-extrabold text-stone-900 uppercase tracking-wide">
                    Multi-Node Cooperative Solver Result
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full font-mono">
                  100% Prescription Covered
                </span>
              </div>

              {/* Node Split Breakdown */}
              <div className="space-y-3">
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2 hover:border-teal-300 transition-colors">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <strong className="text-stone-900 font-bold block">Node #1: Gupta Medicos & Cold Chain Hub</strong>
                      <span className="text-[10px] text-stone-500 font-mono">📍 1.2 km away • Cold-Chain Certified 2-8°C</span>
                    </div>
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                      Fulfills 2 Items
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[11px] bg-white border border-stone-200 text-stone-800 px-2 py-1 rounded-lg font-medium">
                      ✓ Lantus Insulin (Batch #LAN26B04)
                    </span>
                    <span className="text-[11px] bg-white border border-stone-200 text-stone-800 px-2 py-1 rounded-lg font-medium">
                      ✓ Telma 40 (Batch #TEL26H01)
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2 hover:border-teal-300 transition-colors">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <strong className="text-stone-900 font-bold block">Node #2: Jan Aushadhi Kendra (PMBJP)</strong>
                      <span className="text-[10px] text-stone-500 font-mono">📍 1.9 km away • High Affordable Generic Stock</span>
                    </div>
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                      Fulfills 1 Item
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[11px] bg-white border border-stone-200 text-stone-800 px-2 py-1 rounded-lg font-medium">
                      ✓ Ciprofloxacin 500mg (Batch #JA-CIP-26)
                    </span>
                  </div>
                </div>
              </div>

              {/* Combined Telemetry */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-4 text-stone-600 font-mono">
                  <span>Total Distance: <strong>3.1 km</strong></span>
                  <span>•</span>
                  <span>Estimated ETA: <strong>19 Mins</strong></span>
                </div>
                <Link
                  href="/patient"
                  className="text-xs font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1"
                >
                  <span>Order this split in App</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ─── 6. SHADOW INVENTORY & INVOICE OCR STUDIO ─────────────────────────── */}
      <section id="shadow-inventory" className="py-20 md:py-28 border-b border-stone-200/80 bg-white relative">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8">
          
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block mb-2">
              Under The Hood • Core Innovation
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#09090b] tracking-tight">
              Built for the pharmacies that already exist.
            </h2>
            <p className="text-stone-600 text-sm mt-3 leading-relaxed font-normal">
              Many Tier-2 and Tier-3 pharmacies don&apos;t have sophisticated digital inventory software. MediRush doesn&apos;t require them to replace their workflow. It builds a digital intelligence layer around the paper invoices they already receive daily.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { num: '01', title: 'Paper Distributor Slip', desc: 'Pharmacist captures photo of physical distributor trade invoice.' },
              { num: '02', title: 'OCR & Canonicalization', desc: 'Optical model extracts drug name, strength, batch #, and expiry date.' },
              { num: '03', title: 'Shadow Inventory', desc: 'Items indexed into local shadow inventory with timestamped freshness.' },
              { num: '04', title: 'Doorstep Delivery', desc: 'Available for instant patient matching and WhatsApp order dispatch.' },
            ].map((card, idx) => (
              <div key={idx} className="p-5 bg-stone-50 rounded-2xl border border-stone-200 hover:border-teal-400 transition-colors">
                <span className="text-xs font-mono font-bold text-teal-800 block mb-2">{card.num}</span>
                <h4 className="text-xs font-bold text-stone-900 mb-1">{card.title}</h4>
                <p className="text-[11px] text-stone-500 leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>

          {/* Realistic Distributor Invoice Extraction Card with Animated Scanning Beam */}
          <div className="bg-[#fafaf9] rounded-2xl border border-stone-300/90 p-6 max-w-2xl mx-auto shadow-sm relative overflow-hidden">
            
            {/* Animated Laser Scanning Line */}
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-teal-500 to-transparent animate-scan pointer-events-none z-10" />

            <div className="flex items-center justify-between pb-3 border-b border-stone-200 text-xs">
              <div>
                <span className="font-extrabold text-stone-900 block">Sun Pharma Regional C&F Depo • Invoice #SP/IND/2026/8892</span>
                <span className="text-[10px] text-stone-400 font-mono">Captured 2 days ago • High OCR Confidence (97%)</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full font-mono">
                FRESH BATCH
              </span>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-stone-200 shadow-2xs hover:border-teal-300 transition-colors">
                <div>
                  <strong className="text-stone-900 font-bold block">Lantus Solostar 100IU/ml Pen</strong>
                  <span className="text-[10px] text-stone-500 font-mono">Batch: LAN26B04 • Expiry: Aug 2027 • Qty: 14 Pens</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                  ❄️ Cold Chain 2-8°C
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-white rounded-xl border border-stone-200 shadow-2xs hover:border-teal-300 transition-colors">
                <div>
                  <strong className="text-stone-900 font-bold block">Augmentin 625 Duo Tablet</strong>
                  <span className="text-[10px] text-stone-500 font-mono">Batch: AUG26E12 • Expiry: Nov 2027 • Qty: 45 Strips</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-stone-700 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded">
                  Standard Room Temp
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-200 flex items-start gap-2 text-[10px] text-stone-500 leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong>Transparent Disclaimer:</strong> Inventory estimates are derived from the latest available pharmacy distributor invoice and may become stale as medicines are sold over the counter.
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ─── 7. OFFLINE-FIRST SECTION (DARK CONTRAST) ────────────────────────── */}
      <section id="offline-first" className="py-20 md:py-28 bg-[#090d16] text-white border-b border-stone-800 relative">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950 border border-teal-800/80 text-teal-300 text-[11px] font-bold tracking-wider uppercase mb-5">
                <WifiOff className="w-3.5 h-3.5 text-teal-400" />
                <span>Zero Downtime Resilience</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight mb-5">
                What if the internet disappears?
              </h2>
              <p className="text-stone-400 text-sm sm:text-base leading-relaxed mb-8 font-normal">
                The pharmacy shouldn&apos;t stop working. In Tier-2 and Tier-3 towns, cellular internet drops are frequent. MediRush runs on a local SQLite and IndexedDB architecture so medicine queries, invoices, and dispense logs operate uninterrupted.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => handleSimulateOfflineAction('DISCONNECT')}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition flex items-center justify-between cursor-pointer ${
                    offlineState === 'OFFLINE'
                      ? 'bg-amber-950/80 border-amber-500 text-amber-200'
                      : 'bg-[#121826] border-stone-800 text-stone-300 hover:bg-[#182030]'
                  }`}
                >
                  <span>1. Disconnect Net</span>
                  <WifiOff className="w-4 h-4 text-amber-400" />
                </button>

                <button
                  onClick={() => handleSimulateOfflineAction('SEARCH_OFFLINE')}
                  className="p-3 rounded-xl bg-[#121826] hover:bg-[#182030] border border-stone-800 text-xs font-bold text-stone-300 text-left transition flex items-center justify-between cursor-pointer"
                >
                  <span>2. Run Offline Search</span>
                  <Search className="w-4 h-4 text-teal-400" />
                </button>

                <button
                  onClick={() => handleSimulateOfflineAction('QUEUE_ORDER')}
                  className="p-3 rounded-xl bg-[#121826] hover:bg-[#182030] border border-stone-800 text-xs font-bold text-stone-300 text-left transition flex items-center justify-between cursor-pointer"
                >
                  <span>3. Queue Dispense</span>
                  <Database className="w-4 h-4 text-sky-400" />
                </button>

                <button
                  onClick={() => handleSimulateOfflineAction('RECONNECT')}
                  className="p-3 rounded-xl bg-teal-900/80 hover:bg-teal-900 border border-teal-700 text-xs font-bold text-teal-100 text-left transition flex items-center justify-between cursor-pointer"
                >
                  <span>4. Reconnect & Sync</span>
                  <RefreshCw className="w-4 h-4 text-teal-300" />
                </button>
              </div>
            </div>

            {/* Simulated Live Terminal */}
            <div className="lg:col-span-6">
              <div className="bg-[#0c121e] border border-stone-800 rounded-2xl p-5 shadow-2xl font-mono text-xs">
                
                <div className="flex items-center justify-between pb-3 border-b border-stone-800/80">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-teal-400" />
                    <span className="font-bold text-stone-300 text-[11px]">MediRush Edge Runtime Diagnostics</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    offlineState === 'ONLINE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                    offlineState === 'OFFLINE' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  }`}>
                    ● {offlineState}
                  </span>
                </div>

                <div className="mt-4 space-y-2 h-44 overflow-y-auto text-[11px] leading-relaxed text-stone-400">
                  {terminalLogs.map((log, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-teal-500 shrink-0">❯</span>
                      <span className="text-stone-300">{log}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between text-[10px] text-stone-500">
                  <span>SQLite Cache: 1,480 Medicines (0.3ms)</span>
                  <span>IndexedDB Queue: Active</span>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 8. SYSTEM ARCHITECTURE STACK ──────────────────────────────────── */}
      <section id="technology" className="py-20 md:py-28 border-b border-stone-200/80 bg-white">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">
              Production Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#09090b] tracking-tight">
              A transparent, production-grade stack.
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-2 font-normal">
              Zero fake AI buzzwords. Every layer is built on verifiable deterministic protocols.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-2.5">
            {[
              { layer: '01', name: 'Prescription Extraction Layer', tech: 'Gemini 3.8 Flash Vision OCR', desc: 'Parses doctor handwriting, drug strengths, dosage intervals, and Schedule H compliance.' },
              { layer: '02', name: 'Deterministic Medicine Normalizer', tech: 'Fuzzy Salt Matching & Canonical DB', desc: 'Maps trade brand names into universal chemical salts with drug interaction safety audits.' },
              { layer: '03', name: 'Local Shadow Inventory Store', tech: 'Distributor Invoice OCR Parser', desc: 'Tracks batch numbers, expiry dates, and freshness degradation across local pharmacies.' },
              { layer: '04', name: 'Chemist Proximity Grid Engine', tech: 'OpenStreetMap Overpass API & GPS', desc: 'Haversine distance calculation and capability filtering (cold-chain, chronic specialist).' },
              { layer: '05', name: 'Multi-Node Cooperative Solver', tech: 'Weighted Set Cover & Thermal SLA', desc: 'Discovers single or multi-store combinations maximizing prescription coverage (100%).' },
              { layer: '06', name: 'Real-Time Messaging Bus', tech: 'Twilio WhatsApp API & SSE Bus', desc: 'Instant WhatsApp broadcast to chemists and cross-tab synchronization.' },
            ].map((item, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-xl border border-stone-200/90 bg-[#fafaf9] hover:bg-teal-50/40 hover:border-teal-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-stone-400">{item.layer}</span>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">{item.name}</h4>
                    <p className="text-[11px] text-stone-500">{item.desc}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-teal-900 bg-teal-100 border border-teal-200 px-2 py-0.5 rounded shrink-0 self-start sm:self-auto">
                  {item.tech}
                </span>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── 9. FINAL CTA ───────────────────────────────────────────────────── */}
      <section className="py-20 md:py-24 bg-[#042f2e] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-400/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 text-center relative z-10">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight mb-4">
              Medicine access should feel simple.
            </h2>
            <p className="text-sm sm:text-base text-teal-200/90 leading-relaxed font-normal mb-8">
              MediRush connects the patient, the nearby pharmacy, and the medicine supply into one intelligent fulfillment network.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 flex-wrap">
              <Link
                href="/patient"
                className="px-6 py-3.5 rounded-xl bg-white text-[#042f2e] hover:bg-teal-50 text-xs font-extrabold transition flex items-center gap-2 shadow-lg shadow-teal-950/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Launch Patient Web App</span>
                <ArrowRight className="w-4 h-4 text-[#042f2e]" />
              </Link>

              <Link
                href="/chemist"
                target="_blank"
                className="px-6 py-3.5 rounded-xl bg-teal-900/80 hover:bg-teal-900 text-teal-100 border border-teal-700/80 text-xs font-extrabold transition flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Chemist Merchant Terminal</span>
                <ExternalLink className="w-3.5 h-3.5 text-teal-300" />
              </Link>

              <Link
                href="/rider"
                target="_blank"
                className="px-6 py-3.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 border border-cyan-700/80 text-xs font-extrabold transition flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Bike className="w-4 h-4 text-cyan-400" />
                <span>Rider Delivery Portal</span>
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 10. FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="py-10 bg-white border-t border-stone-200 text-xs text-stone-500">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-[#042f2e] text-white flex items-center justify-center font-black text-xs">
              M
            </div>
            <span className="font-bold text-stone-900">MediRush</span>
            <span className="text-stone-400">•</span>
            <span>Medicine access, connected.</span>
          </div>

          <div className="flex items-center gap-6 text-stone-600 font-medium">
            <a href="#problem" className="hover:text-stone-900 transition">Problem</a>
            <a href="#how-it-works" className="hover:text-stone-900 transition">How it Works</a>
            <a href="#shadow-inventory" className="hover:text-stone-900 transition">Shadow Inventory</a>
            <a href="#technology" className="hover:text-stone-900 transition">Technology</a>
            <Link href="/patient" className="font-bold text-teal-800 hover:text-teal-950 transition">Launch App →</Link>
          </div>

        </div>
      </footer>

    </div>
  );
}
