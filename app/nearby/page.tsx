'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  MapPin, 
  ArrowLeft, 
  Phone, 
  Clock, 
  Store, 
  ShieldCheck, 
  Truck, 
  Zap, 
  Search, 
  Star,
  Activity,
  AlertTriangle,
  Pill
} from 'lucide-react';
import { mockHealthcarePlaces, type HealthcarePlace } from '@/lib/data/mockHealthcarePlaces';
import { cn } from '@/lib/utils';

export default function NearbyHealthcarePage() {
  const [filterType, setFilterType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePlace, setActivePlace] = useState<HealthcarePlace | null>(mockHealthcarePlaces[0]);

  const filteredPlaces = mockHealthcarePlaces.filter(p => {
    const matchesType = filterType === 'All' || p.type === filterType;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F5F9FF] font-sans flex flex-col justify-between">
      <Navbar />

      <main className="pt-24 pb-20 max-w-6xl mx-auto px-4 sm:px-6 w-full flex-1">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 max-w-2xl">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-200 hover:text-white mb-3 transition-colors">
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shadow-md">
                <MapPin size={24} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Nearby 24/7 Healthcare Network</h1>
            </div>
            
            <p className="text-purple-100 text-xs sm:text-sm font-medium leading-relaxed">
              Find verified open pharmacies, government Jan Aushadhi Kendras, regional blood banks, and trauma hospitals in your geographic grid.
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm mb-8 space-y-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pharmacy, hospital or location..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs sm:text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
            <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {['All', 'Pharmacy', 'Hospital', 'Clinic', 'Blood Bank'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer",
                  filterType === type
                    ? "bg-purple-700 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of Healthcare Centers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaces.map((place) => (
            <div
              key={place.id}
              className="bg-white rounded-2xl border border-slate-200/80 hover:border-purple-300 shadow-sm hover:shadow-lg transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-3">
                  <span className={cn(
                    "text-[10px] font-black uppercase px-2.5 py-1 rounded-full",
                    place.type === 'Hospital' ? "bg-red-50 text-red-700 border border-red-200" :
                    place.type === 'Pharmacy' ? "bg-blue-50 text-blue-700 border border-blue-200" :
                    place.type === 'Blood Bank' ? "bg-rose-50 text-rose-700 border border-rose-200" :
                    "bg-teal-50 text-teal-700 border border-teal-200"
                  )}>
                    {place.type}
                  </span>

                  <div className="flex items-center gap-1 text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                    <Star size={12} fill="currentColor" />
                    <span>{place.rating}</span>
                  </div>
                </div>

                <h3 className="text-base font-black text-slate-900 leading-snug mb-1.5">
                  {place.name}
                </h3>
                
                <p className="text-xs text-slate-500 font-medium flex items-start gap-1.5">
                  <MapPin size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>{place.address}</span>
                </p>
              </div>

              {/* Status Tags */}
              <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                  {place.isOpen ? (
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span> Open Now
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">Closed</span>
                  )}
                  {place.is24x7 && (
                    <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md font-extrabold">
                      24x7 Emergency
                    </span>
                  )}
                  {place.deliveryAvailable && (
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">
                      10-Min Dispatch Available
                    </span>
                  )}
                </div>

                {/* Call & Dispatch Actions */}
                <div className="flex gap-2">
                  <a
                    href={`tel:${place.phone.replace(/[^0-9+]/g, '')}`}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone size={13} className="text-purple-600" />
                    Call Chemist
                  </a>

                  {place.deliveryAvailable && (
                    <Link
                      href="/patient"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <Pill size={13} />
                      Order Meds
                    </Link>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>

      </main>

      <Footer />
    </div>
  );
}
