'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  AlertTriangle, 
  PhoneCall, 
  ArrowLeft, 
  MapPin, 
  ShieldAlert, 
  Activity, 
  Heart, 
  Clock, 
  Zap, 
  Pill,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EmergencyPage() {
  const [sosTriggered, setSosTriggered] = useState(false);

  const emergencyContacts = [
    { title: 'National Emergency Ambulance', number: '108', desc: 'Free 24x7 Government Ambulance Dispatch' },
    { title: 'National Police & Emergency', number: '112', desc: 'Single Unified Emergency Helpline' },
    { title: 'Blood Bank Emergency Network', number: '104', desc: 'Blood Requirement & Medical Support' },
    { title: 'Poison Information Center', number: '1800-116-117', desc: 'Emergency Toxic & Chemical Ingestion Care' }
  ];

  const handleTriggerSOS = () => {
    setSosTriggered(true);
  };

  return (
    <div className="min-h-screen bg-[#F5F9FF] font-sans flex flex-col justify-between">
      <Navbar />

      <main className="pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6 w-full flex-1">
        
        {/* Main Emergency Banner */}
        <div className="bg-gradient-to-r from-red-600 via-red-700 to-rose-950 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden mb-8 border border-red-500/50">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-red-200 hover:text-white mb-4 transition-colors">
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shadow-lg animate-pulse">
                <AlertTriangle size={32} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Emergency Health Protocol (SOS)</h1>
                <span className="text-xs font-bold text-red-200 uppercase tracking-widest">Active High-Priority Dispatch</span>
              </div>
            </div>

            <p className="text-red-100 text-xs sm:text-sm font-medium leading-relaxed max-w-2xl mt-2">
              If someone is experiencing chest pain, difficulty breathing, profuse bleeding, or loss of consciousness, trigger the emergency broadcast and call the ambulance numbers below immediately.
            </p>

            {/* Big SOS Trigger Button */}
            <div className="mt-8">
              {sosTriggered ? (
                <div className="p-4 bg-white text-red-900 rounded-2xl border-2 border-red-400 font-bold flex items-center gap-3 animate-in fade-in duration-300 shadow-xl">
                  <span className="w-3 h-3 rounded-full bg-red-600 animate-ping"></span>
                  <div>
                    <h4 className="text-sm font-black">SOS Broadcast Active</h4>
                    <p className="text-xs text-red-700 font-medium">Nearest 3 chemists & emergency response network notified for priority delivery.</p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleTriggerSOS}
                  className="w-full sm:w-auto bg-white hover:bg-red-50 text-red-600 font-black text-sm px-8 py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/60 group hover:scale-[1.02]"
                >
                  <Zap size={20} className="text-red-600 group-hover:animate-bounce" />
                  Broadcast 1-Tap Emergency Medicine Alert
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Hotlines Grid */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 px-1">
            Official Emergency Hotlines (Direct Dial)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {emergencyContacts.map((c, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-sm font-black text-slate-900">{c.title}</h3>
                    <span className="text-xs font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                      Dial {c.number}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{c.desc}</p>
                </div>

                <a
                  href={`tel:${c.number}`}
                  className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-red-500/20"
                >
                  <PhoneCall size={14} /> Call {c.number}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Action Link to Medicine Ordering Flow */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Pill size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900">Need Urgent Schedule-H or Cold-Chain Drugs?</h4>
              <p className="text-xs text-slate-500 font-medium">Use our automated multi-pharmacy fulfillment engine with 10-minute dispatch.</p>
            </div>
          </div>

          <Link href="/patient" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap">
              Launch Medicine Order →
            </button>
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}
