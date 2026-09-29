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
  Tag, 
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
  Percent, 
  Snowflake, 
  ShoppingCart, 
  BadgePercent, 
  Plus, 
  Check, 
  Filter, 
  Layers,
  Copy,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Health Subcategories (Apollo & 1mg style)
const CATEGORIES = [
  { id: 'all', name: 'All Medicines', icon: Pill, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'diabetes', name: 'Diabetes Care', icon: Activity, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { id: 'cardiac', name: 'Cardiac & BP', icon: Heart, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  { id: 'fever', name: 'Fever & Pain', icon: Zap, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 'antibiotics', name: 'Antibiotics', icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { id: 'digestion', name: 'Stomach & Gut', icon: Stethoscope, color: 'text-teal-600 bg-teal-50 border-teal-200' },
  { id: 'vitamins', name: 'Immunity & Vitamins', icon: Sparkles, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { id: 'ayurveda', name: 'Ayurveda & Kadhas', icon: Leaf, color: 'text-green-600 bg-green-50 border-green-200' },
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

export default function ConsumerHomePage() {
  const router = useRouter();
  const { user, userProfile } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showGenericModal, setShowGenericModal] = useState<any>(null);
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
    <div className="min-h-screen bg-[#F5F9FF] font-sans text-slate-900 pb-20">
      <Navbar />

      {/* ─── 1. TOP HERO & SEARCH BAR (TATA 1MG / APOLLO STYLE) ──────────────── */}
      <section className="relative bg-gradient-to-br from-[#1565C0] via-[#0D47A1] to-slate-950 pt-28 pb-16 text-white overflow-hidden shadow-xl">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-[90px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <div className="inline-flex items-center bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider text-yellow-300 mb-2">
                <Zap size={13} className="mr-1 animate-pulse" />
                Hyper-Local Pharmacy Grid • Live 10-18 Min Fulfillment
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Welcome back, {userProfile?.name?.split(' ')[0] || user?.user_metadata?.name?.split(' ')[0] || 'Patient'} 👋
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm font-medium mt-1">
                Order verified medicines from nearby pharmacies or save up to 85% with Jan Aushadhi generic substitutes.
              </p>
            </div>

            {/* Direct Prescription Scan CTA */}
            <Link href="/patient">
              <button className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 cursor-pointer transition-transform hover:scale-105">
                <Upload size={16} />
                Quick Prescription Scan
                <ArrowRight size={14} />
              </button>
            </Link>
          </div>

          {/* Search Box with Realtime Salt Normalizer */}
          <div className="relative max-w-3xl">
            <div className="relative flex items-center">
              <Search className="absolute left-4 text-slate-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by brand (e.g. Lantus, Telma, Augmentin) or active salt (Metformin, Ciprofloxacin)..."
                className="w-full pl-12 pr-28 py-4 bg-white text-slate-900 font-bold text-sm rounded-2xl shadow-2xl outline-none focus:ring-4 focus:ring-blue-400/50 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-20 text-xs font-bold text-slate-400 hover:text-slate-600 p-1"
                >
                  Clear
                </button>
              )}
              <Link href="/patient" className="absolute right-2">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md cursor-pointer">
                  Search
                </button>
              </Link>
            </div>

            {/* Live Search Suggestions Dropdown */}
            {searchQuery && filteredMedicines.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 text-slate-900 max-h-80 overflow-y-auto">
                <div className="p-2 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
                  Matching Medicines in Local Invoices ({filteredMedicines.length})
                </div>
                {filteredMedicines.map((item) => (
                  <Link
                    key={item.id}
                    href={`/patient?query=${encodeURIComponent(item.brandName)}`}
                    className="flex justify-between items-center p-3 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-black text-slate-900">{item.brandName}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{item.salt}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-slate-900">₹{item.brandPrice}</div>
                      <div className="text-[10px] font-bold text-emerald-700">
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

      {/* ─── 2. QUICK PROMO BANNER CAROUSEL & COUPONS ────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PROMO_COUPONS.map((coupon) => (
            <div 
              key={coupon.code}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-md flex items-center justify-between gap-3 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black flex-shrink-0">
                  <BadgePercent size={20} />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 block">{coupon.discount}</span>
                  <span className="text-[11px] text-slate-500 font-medium block leading-tight">{coupon.desc}</span>
                </div>
              </div>
              <button
                onClick={() => handleCopyCoupon(coupon.code)}
                className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer flex-shrink-0"
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

      {/* ─── 3. SUPER-TOOLS SHORTCUT HUB (1-CLICK HEALTH ACCESS) ─────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">MediRush Health Suite</h2>
            <p className="text-xs text-slate-500 font-medium">1-Click AI diagnostic and prescription management tools</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {[
            { href: '/patient', label: 'Order Medicines', desc: '10-Min Dispatch', icon: Pill, color: 'text-blue-600 bg-blue-50' },
            { href: '/report-simplifier', label: 'Report Simplifier', desc: 'AI Lab OCR', icon: FileText, color: 'text-indigo-600 bg-indigo-50' },
            { href: '/remedies', label: 'Ayurveda AI', desc: 'Herbal Kadhas', icon: Leaf, color: 'text-emerald-600 bg-emerald-50' },
            { href: '/reminders', label: 'Dose Reminders', desc: 'Pill Alarms', icon: Bell, color: 'text-amber-600 bg-amber-50' },
            { href: '/symptom-checker', label: 'Symptom Triage', desc: 'Clinical AI', icon: Stethoscope, color: 'text-teal-600 bg-teal-50' },
            { href: '/emergency', label: 'Emergency SOS', desc: '108 Hotlines', icon: AlertTriangle, color: 'text-red-600 bg-red-50' }
          ].map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.href} href={tool.href} className="group">
                <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between h-full space-y-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tool.color} group-hover:scale-110 transition-transform`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                      {tool.label}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium leading-tight">{tool.desc}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── 4. TRUEMEDS-STYLE SMART GENERIC SUBSTITUTE FINDER BANNER ─────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6 border border-emerald-500/40">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-emerald-400/30">
              <TrendingDown size={13} className="mr-1" />
              Save up to 85% with Jan Aushadhi PMBJP
            </div>
            <h2 className="text-2xl sm:text-3xl font-black">
              Why pay ₹250 when the exact chemical salt is ₹35?
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm font-medium leading-relaxed">
              MediRush automatically verifies BPPI-certified Indian Government Jan Aushadhi generic substitutes for every prescribed brand with identical efficacy.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Link href="/patient" className="w-full sm:w-auto">
              <button className="w-full bg-white text-emerald-900 hover:bg-emerald-50 font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg cursor-pointer transition-all">
                Find Generic for My Prescription →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── 5. CATEGORIES / SUBCATEGORIES FILTER CHIPS ──────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">Shop by Health Condition</h2>
            <p className="text-xs text-slate-500 font-medium">Find specific acute, chronic, and wellness medications</p>
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
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex-shrink-0 cursor-pointer border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Icon size={14} />
                {cat.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* ─── 6. ESSENTIAL MEDICINE CATALOG CARDS (WITH TRUEMEDS GENERIC SWITCH) ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">
            Showing {filteredMedicines.length} Verified Medicines in Stock
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMedicines.map((med) => (
            <div
              key={med.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-md hover:shadow-xl hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                    {med.category}
                  </span>
                  {med.isColdChain && (
                    <span className="text-[10px] font-black text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200 flex items-center gap-1">
                      <Snowflake size={11} /> 2°C–8°C
                    </span>
                  )}
                </div>

                {/* Brand Name & Salt */}
                <h3 className="text-base font-black text-slate-900 leading-snug">{med.brandName}</h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">
                  Salt: <span className="text-slate-700 font-semibold">{med.salt}</span>
                </p>

                {/* Local Verified Pharmacy Node */}
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 mt-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <MapPin size={12} className="text-blue-600 flex-shrink-0" />
                  <span className="truncate">{med.pharmacyNode}</span>
                </div>

                {/* Generic Alternative Box (Truemeds Style) */}
                <div className="mt-3 p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wide flex items-center gap-1">
                      <Sparkles size={11} /> Jan Aushadhi Substitute
                    </span>
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-200/80 px-1.5 py-0.5 rounded">
                      Save {med.savingsPercent}%
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">{med.genericSubstitute}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="line-through text-slate-400 text-xs font-bold">₹{med.brandPrice}</span>
                    <span className="text-emerald-700 font-black text-sm">₹{med.genericPrice}</span>
                  </div>
                </div>
              </div>

              {/* Order / Add Action */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold">MRP Branded</span>
                  <span className="text-base font-black text-slate-900">₹{med.brandPrice}</span>
                </div>

                <Link href={`/patient?query=${encodeURIComponent(med.brandName)}`}>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105">
                    <ShoppingCart size={13} />
                    Order Now
                  </button>
                </Link>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* ─── 7. EMERGENCY SOS FLOATING CALLOUT ───────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center animate-pulse flex-shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Immediate Life-Saving Emergency?</h3>
              <p className="text-xs text-slate-600 font-medium">
                Need acute cardiac, asthma, or emergency antivenom dispatch? Connect directly with regional ambulance & 24/7 ERs.
              </p>
            </div>
          </div>

          <Link href="/emergency">
            <button className="bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-red-500/30 flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 flex-shrink-0">
              <AlertTriangle size={16} />
              Open Emergency SOS Hub
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
