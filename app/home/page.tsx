'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { 
  Search, 
  Pill, 
  ShieldCheck, 
  Zap, 
  Clock, 
  TrendingDown, 
  Upload, 
  FileText, 
  Heart, 
  Activity, 
  Stethoscope, 
  Leaf, 
  Bell, 
  MapPin, 
  AlertTriangle, 
  ChevronRight, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Snowflake, 
  ShoppingCart, 
  BadgePercent, 
  Check, 
  Copy,
  Navigation,
  Phone,
  Store,
  Compass,
  ArrowUpRight,
  Shield,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Health Subcategories (Apollo & Tata 1mg style)
const CATEGORIES = [
  { id: 'all', name: 'All Medicines', icon: Pill, color: 'text-blue-600 bg-blue-50 border-blue-100' },
  { id: 'diabetes', name: 'Diabetes Care', icon: Activity, color: 'text-purple-600 bg-purple-50 border-purple-100' },
  { id: 'cardiac', name: 'Cardiac & BP', icon: Heart, color: 'text-rose-600 bg-rose-50 border-rose-100' },
  { id: 'fever', name: 'Fever & Pain', icon: Zap, color: 'text-amber-600 bg-amber-50 border-amber-100' },
  { id: 'antibiotics', name: 'Antibiotics', icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  { id: 'digestion', name: 'Stomach & Gut', icon: Stethoscope, color: 'text-teal-600 bg-teal-50 border-teal-100' },
  { id: 'vitamins', name: 'Immunity & Vitamins', icon: Sparkles, color: 'text-orange-600 bg-orange-50 border-orange-100' },
  { id: 'ayurveda', name: 'Ayurveda & Kadhas', icon: Leaf, color: 'text-green-600 bg-green-50 border-green-100' },
];

// Rich Product Catalog with Truemeds-style PMBJP Generic Substitutes
const MEDICINE_CATALOG = [
  {
    id: 'med-1',
    brandName: 'Lantus 100IU/ml Solostar Pen',
    salt: 'Insulin Glargine 100 IU/ml',
    category: 'diabetes',
    brandPrice: 680,
    genericSubstitute: 'Basalog PMBJP Cartridge (Jan Aushadhi)',
    genericPrice: 410,
    savingsPercent: 40,
    isColdChain: true,
    prescriptionRequired: true,
    rating: 4.8,
    stockCount: 14,
    pharmacyNode: 'Gupta Medicos & Cold Chain Hub (0.8 km)',
    tags: ['Cold Chain 2-8°C', 'Specialist Stock']
  },
  {
    id: 'med-2',
    brandName: 'Glycomet-SR 500 Tablet',
    salt: 'Metformin Hydrochloride 500mg (SR)',
    category: 'diabetes',
    brandPrice: 65,
    genericSubstitute: 'Metformin PMBJP Prolonged Release 500mg',
    genericPrice: 12,
    savingsPercent: 81,
    isColdChain: false,
    prescriptionRequired: true,
    rating: 4.9,
    stockCount: 85,
    pharmacyNode: 'Jan Aushadhi Kendra #10 (1.1 km)',
    tags: ['High Savings', 'Jan Aushadhi']
  },
  {
    id: 'med-3',
    brandName: 'Telma 40mg Tablet',
    salt: 'Telmisartan IP 40mg',
    category: 'cardiac',
    brandPrice: 145,
    genericSubstitute: 'Telmisartan PMBJP Tablets 40mg',
    genericPrice: 28,
    savingsPercent: 81,
    isColdChain: false,
    prescriptionRequired: true,
    rating: 4.7,
    stockCount: 42,
    pharmacyNode: 'Apollo Pharmacy MedPlus (0.4 km)',
    tags: ['Chronic BP Care', 'Top Seller']
  },
  {
    id: 'med-4',
    brandName: 'Augmentin 625 Duo Tablet',
    salt: 'Amoxicillin 500mg + Clavulanic Acid 125mg',
    category: 'antibiotics',
    brandPrice: 215,
    genericSubstitute: 'Amoxy-Clav PMBJP 625mg',
    genericPrice: 68,
    savingsPercent: 68,
    isColdChain: false,
    prescriptionRequired: true,
    rating: 4.9,
    stockCount: 30,
    pharmacyNode: 'Civil Lines Medicos (0.9 km)',
    tags: ['Antibiotic', 'Schedule H']
  },
  {
    id: 'med-5',
    brandName: 'Ciproflx 500 Tablet',
    salt: 'Ciprofloxacin Hydrochloride 500mg',
    category: 'antibiotics',
    brandPrice: 78,
    genericSubstitute: 'PMBJP Ciprofloxacin 500 (BPPI Batch #JA-26)',
    genericPrice: 18,
    savingsPercent: 77,
    isColdChain: false,
    prescriptionRequired: true,
    rating: 4.6,
    stockCount: 120,
    pharmacyNode: 'Jan Aushadhi Kendra (0.8 km)',
    tags: ['Jan Aushadhi', 'Verified Batch']
  },
  {
    id: 'med-6',
    brandName: 'Dolo 650 Tablet',
    salt: 'Paracetamol IP 650mg',
    category: 'fever',
    brandPrice: 32,
    genericSubstitute: 'Paracetamol PMBJP 650mg Tablet',
    genericPrice: 9,
    savingsPercent: 72,
    isColdChain: false,
    prescriptionRequired: false,
    rating: 4.9,
    stockCount: 150,
    pharmacyNode: '24/7 LifeLine Chemist (0.3 km)',
    tags: ['OTC', 'Fever & Pain']
  },
  {
    id: 'med-7',
    brandName: 'Pantocid 40mg Tablet',
    salt: 'Pantoprazole Sodium 40mg',
    category: 'digestion',
    brandPrice: 162,
    genericSubstitute: 'Pantoprazole PMBJP Gastro-Resistant 40mg',
    genericPrice: 31,
    savingsPercent: 81,
    isColdChain: false,
    prescriptionRequired: true,
    rating: 4.8,
    stockCount: 65,
    pharmacyNode: 'Shree Ram Medical (0.5 km)',
    tags: ['Acidity', 'Daily Routine']
  },
  {
    id: 'med-8',
    brandName: 'Limcee 500mg Chewable Vitamin C',
    salt: 'Ascorbic Acid + Sodium Ascorbate 500mg',
    category: 'vitamins',
    brandPrice: 28,
    genericSubstitute: 'Vitamin C PMBJP Chewable 500mg',
    genericPrice: 11,
    savingsPercent: 61,
    isColdChain: false,
    prescriptionRequired: false,
    rating: 4.9,
    stockCount: 90,
    pharmacyNode: 'Jan Aushadhi Kendra (0.8 km)',
    tags: ['OTC Immunity', 'Top Value']
  },
  {
    id: 'med-9',
    brandName: 'Dabur Chyawanprash Awaleha 1kg',
    salt: 'Amla, Ashwagandha, Pippali, Dashmool Ayurvedic Blend',
    category: 'ayurveda',
    brandPrice: 410,
    genericSubstitute: 'Jan Aushadhi Ayush Kwath / Chyawanprash',
    genericPrice: 220,
    savingsPercent: 46,
    isColdChain: false,
    prescriptionRequired: false,
    rating: 4.9,
    stockCount: 25,
    pharmacyNode: 'Patanjali & Ayurvedic Store (0.6 km)',
    tags: ['Ayurvedic Immunity', 'Natural']
  },
  {
    id: 'med-10',
    brandName: 'Atorva 10mg (Atorvastatin)',
    salt: 'Atorvastatin Calcium 10mg',
    category: 'cardiac',
    brandPrice: 115,
    genericSubstitute: 'Atorvastatin PMBJP 10mg Tablets',
    genericPrice: 22,
    savingsPercent: 81,
    isColdChain: false,
    prescriptionRequired: true,
    rating: 4.7,
    stockCount: 38,
    pharmacyNode: 'Apollo Pharmacy (0.4 km)',
    tags: ['Cholesterol & Heart', 'Doctor Recommended']
  }
];

// Promotional Coupons
const PROMO_COUPONS = [
  { code: 'FIRSTMED', discount: 'Flat 25% OFF', desc: 'On first prescription delivery + Zero Delivery Fee' },
  { code: 'GENERIC80', discount: 'Save Up to 85%', desc: 'Instant switch to Jan Aushadhi PMBJP substitutes' },
  { code: 'COLDCHAIN', discount: 'Free Thermal Bag', desc: 'Monitored 2-8°C ice-gel box for all insulin pens' }
];

// Nearby Verified Pharmacy Grid Nodes
const NEARBY_PHARMACIES = [
  { name: 'Gupta Medicos & Cold Chain Hub', distance: '0.8 km', status: 'Open Now', coldChain: true, stockMatch: '98%' },
  { name: 'Jan Aushadhi Kendra #10 (PMBJP)', distance: '1.1 km', status: 'Open Now', coldChain: false, stockMatch: '95%' },
  { name: 'Apollo Pharmacy MedPlus 24/7', distance: '0.4 km', status: 'Open 24/7', coldChain: true, stockMatch: '99%' }
];

export default function ConsumerHomePage() {
  const router = useRouter();
  const { user, userProfile } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  // Filtered medicines
  const filteredMedicines = useMemo(() => {
    return MEDICINE_CATALOG.filter((med) => {
      const matchCat = selectedCategory === 'all' || med.category === selectedCategory;
      const matchSearch = 
        med.brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.salt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.genericSubstitute.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#FAFBFD] font-sans text-slate-900 pb-24 selection:bg-blue-600 selection:text-white antialiased">
      <Navbar />

      {/* ─── 1. TOP HEADER & SEARCH HERO ─────────────────────────────────────── */}
      <section className="relative bg-[#0B132B] pt-28 pb-16 text-white overflow-hidden shadow-sm">
        {/* Soft Ambient Depth & Lighting */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/10 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-60" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/[0.07] backdrop-blur-md border border-white/15 text-xs font-semibold px-3.5 py-1 rounded-full text-blue-200 mb-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Hyper-Local Pharmacy Grid • Live 10-18 Min Fulfillment</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
                Welcome back, {userProfile?.name?.split(' ')[0] || user?.user_metadata?.name?.split(' ')[0] || 'Patient'} 👋
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm font-normal mt-1 max-w-xl leading-relaxed">
                Order verified medicines from nearby pharmacies or save up to 85% with Jan Aushadhi generic substitutes.
              </p>
            </div>

            {/* Direct Prescription Scan CTA */}
            <Link href="/patient">
              <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 cursor-pointer transition-all duration-200 hover:translate-y-[-1px] active:translate-y-[1px]">
                <Upload size={16} />
                <span>Quick Prescription Scan</span>
                <ArrowRight size={14} />
              </button>
            </Link>
          </div>

          {/* Search Box with Realtime Salt Normalizer */}
          <div className="relative max-w-3xl">
            <div className="relative flex items-center">
              <Search className="absolute left-4 text-slate-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by brand (e.g. Lantus, Telma, Augmentin) or active salt (Metformin, Ciprofloxacin)..."
                className="w-full pl-11 pr-28 py-3.5 bg-white text-slate-900 font-medium text-sm rounded-2xl shadow-xl outline-none focus:ring-3 focus:ring-blue-500/30 placeholder:text-slate-400 border border-slate-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-20 text-xs font-semibold text-slate-400 hover:text-slate-600 p-1"
                >
                  Clear
                </button>
              )}
              <Link href="/patient" className="absolute right-2">
                <button className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-xs cursor-pointer">
                  Search
                </button>
              </Link>
            </div>

            {/* Live Search Suggestions Dropdown */}
            {searchQuery && filteredMedicines.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 text-slate-900 max-h-80 overflow-y-auto">
                <div className="p-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Matching Medicines in Local Invoices ({filteredMedicines.length})
                </div>
                {filteredMedicines.map((item) => (
                  <Link
                    key={item.id}
                    href={`/patient?query=${encodeURIComponent(item.brandName)}`}
                    className="flex justify-between items-center p-3 hover:bg-blue-50/70 rounded-xl transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{item.brandName}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{item.salt}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900">₹{item.brandPrice}</div>
                      <div className="text-[10px] font-semibold text-emerald-700">
                        Generic: ₹{item.genericPrice} (-{item.savingsPercent}%)
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ─── 2. ACTIVE ORDER STATUS BAR (COMPACT & SMART) ────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5 relative z-20">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
              <Navigation size={18} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Live Order #MR-9842</span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Rider Dispatched
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-normal">
                Lantus 100IU + Telma 40 • Gupta Medicos (1.2 km) • Estimated Delivery in <span className="font-semibold text-slate-800">14 Mins</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
            <div className="hidden sm:block text-right">
              <span className="text-[10px] text-slate-400 font-medium block">Thermal Cold-Chain</span>
              <span className="text-xs font-semibold text-cyan-700">❄️ 2°C–8°C Monitored</span>
            </div>
            <Link href="/patient">
              <button className="text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer">
                <span>View Route Map</span>
                <ArrowRight size={13} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 3. PROMOTIONAL OFFERS & COUPONS ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PROMO_COUPONS.map((coupon) => (
            <div 
              key={coupon.code}
              className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-bold flex-shrink-0">
                  <BadgePercent size={20} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{coupon.discount}</span>
                  <span className="text-[11px] text-slate-500 font-normal block leading-tight">{coupon.desc}</span>
                </div>
              </div>
              <button
                onClick={() => handleCopyCoupon(coupon.code)}
                className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer flex-shrink-0 transition-colors"
              >
                {copiedCoupon === coupon.code ? (
                  <>
                    <Check size={12} className="text-emerald-600" /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={12} /> {coupon.code}
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 4. HEALTH SERVICES & CLINICAL TOOLS ─────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">MediRush Health Suite</h2>
            <p className="text-xs text-slate-500 font-normal">Diagnostic, clinical triage, and prescription management tools</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {[
            { href: '/patient', label: 'Order Medicines', desc: '10-Min Dispatch', icon: Pill, color: 'text-blue-600 bg-blue-50 border-blue-100' },
            { href: '/report-simplifier', label: 'Report Simplifier', desc: 'AI Lab OCR', icon: FileText, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
            { href: '/remedies', label: 'Ayurveda AI', desc: 'Herbal Kadhas', icon: Leaf, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
            { href: '/reminders', label: 'Dose Reminders', desc: 'Pill Alarms', icon: Bell, color: 'text-amber-600 bg-amber-50 border-amber-100' },
            { href: '/symptom-checker', label: 'Symptom Triage', desc: 'Clinical AI', icon: Stethoscope, color: 'text-teal-600 bg-teal-50 border-teal-100' },
            { href: '/emergency', label: 'Emergency SOS', desc: '108 Hotlines', icon: AlertTriangle, color: 'text-red-600 bg-red-50 border-red-100' }
          ].map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.href} href={tool.href} className="group">
                <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between h-full space-y-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${tool.color} group-hover:scale-105 transition-transform`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {tool.label}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-normal leading-tight mt-0.5">{tool.desc}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── 5. TRUEMEDS-STYLE GENERIC SUBSTITUTE BANNER ─────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col lg:flex-row items-center justify-between gap-6 border border-emerald-600/30">
          <div className="space-y-2 max-w-xl text-left">
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-400/30">
              <TrendingDown size={13} />
              <span>Save up to 85% with Jan Aushadhi PMBJP</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Why pay ₹250 when the exact chemical salt is ₹35?
            </h2>
            <p className="text-emerald-100/90 text-xs sm:text-sm font-normal leading-relaxed">
              MediRush automatically verifies BPPI-certified Indian Government Jan Aushadhi generic substitutes for every prescribed brand with identical chemical bio-equivalence.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Link href="/patient" className="w-full sm:w-auto">
              <button className="w-full bg-white text-emerald-950 hover:bg-emerald-50 font-semibold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-md cursor-pointer transition-all hover:translate-y-[-1px]">
                Find Generic for My Prescription →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 6. CATEGORIES / SUBCATEGORIES HORIZONTAL RAIL ──────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Shop by Health Condition</h2>
            <p className="text-xs text-slate-500 font-normal">Find specific acute, chronic, and wellness medications</p>
          </div>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all flex-shrink-0 cursor-pointer border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <Icon size={14} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ─── 7. COMPACT, INFORMATION-DENSE MEDICINE CARDS ───────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Showing {filteredMedicines.length} Verified Medicines in Stock
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMedicines.map((med) => (
            <div
              key={med.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                    {med.category}
                  </span>
                  {med.isColdChain && (
                    <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100 flex items-center gap-1">
                      <Snowflake size={11} /> 2°C–8°C
                    </span>
                  )}
                </div>

                {/* Brand Name & Salt */}
                <h3 className="text-base font-bold text-slate-900 leading-snug">{med.brandName}</h3>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  Salt: <span className="text-slate-800 font-medium">{med.salt}</span>
                </p>

                {/* Local Verified Pharmacy Node */}
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 mt-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <MapPin size={12} className="text-blue-600 flex-shrink-0" />
                  <span className="truncate">{med.pharmacyNode}</span>
                </div>

                {/* Generic Alternative Box (Truemeds Style) */}
                <div className="mt-3 p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                      <Sparkles size={11} /> Jan Aushadhi Substitute
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                      Save {med.savingsPercent}%
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 leading-tight">{med.genericSubstitute}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="line-through text-slate-400 text-xs font-medium">₹{med.brandPrice}</span>
                    <span className="text-emerald-700 font-bold text-sm">₹{med.genericPrice}</span>
                  </div>
                </div>
              </div>

              {/* Order / Add Action */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">MRP Branded</span>
                  <span className="text-base font-bold text-slate-900">₹{med.brandPrice}</span>
                </div>

                <Link href={`/patient?query=${encodeURIComponent(med.brandName)}`}>
                  <button className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-transform hover:translate-y-[-1px]">
                    <ShoppingCart size={13} />
                    <span>Order Now</span>
                  </button>
                </Link>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* ─── 8. NEARBY VERIFIED PHARMACY NODES ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Connected Local Pharmacy Nodes</h2>
            <p className="text-xs text-slate-500 font-normal">Real-time invoice feeds and stock availability in your radius</p>
          </div>
          <Link href="/nearby">
            <span className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer">
              Explore Live Map →
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {NEARBY_PHARMACIES.map((pharmacy) => (
            <div key={pharmacy.name} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Store size={14} className="text-blue-600" />
                  <h4 className="text-xs font-bold text-slate-900">{pharmacy.name}</h4>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  📍 {pharmacy.distance} away • <span className="text-emerald-700 font-semibold">{pharmacy.status}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-600 pt-1">
                  <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">Stock Match: {pharmacy.stockMatch}</span>
                  {pharmacy.coldChain && (
                    <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded font-semibold">❄️ Cold-Chain</span>
                  )}
                </div>
              </div>

              <Link href="/patient">
                <button className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded-lg cursor-pointer transition-colors">
                  Order
                </button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 9. EMERGENCY SOS STRIP ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <div className="bg-red-50/80 border border-red-200/80 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-red-600 text-white flex items-center justify-center animate-pulse flex-shrink-0 shadow-sm">
              <AlertTriangle size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Immediate Life-Saving Emergency?</h3>
              <p className="text-xs text-slate-600 font-normal mt-0.5">
                Need acute cardiac, asthma, or emergency antivenom dispatch? Connect directly with regional ambulance & 24/7 ERs.
              </p>
            </div>
          </div>

          <Link href="/emergency">
            <button className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-md flex items-center gap-2 cursor-pointer transition-transform hover:translate-y-[-1px] flex-shrink-0">
              <AlertTriangle size={15} />
              <span>Open Emergency SOS Hub</span>
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
