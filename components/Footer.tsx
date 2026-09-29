'use client';

import React from 'react';
import Link from 'next/link';
import { Activity, Heart, Shield, PhoneCall, MapPin, Pill, Stethoscope, FileText, Bell, Leaf } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
                <Activity size={20} />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">MediRush</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed font-normal">
              Sub-10-minute emergency medicine dispatch, thermal cold-chain assurance, and AI-driven clinical support when every second counts.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-full w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              99.8% Sub-10 Min SLA Guarantee
            </div>
          </div>

          {/* Patient Services */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 mb-4">Patient Services</h4>
            <ul className="space-y-2.5 text-sm text-slate-400 font-medium">
              <li>
                <Link href="/home" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <Pill size={14} className="text-blue-400" />
                  Shop Medicines & Discounts
                </Link>
              </li>
              <li>
                <Link href="/patient" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <Pill size={14} className="text-blue-500" />
                  Scan Prescription (Live Dispatch)
                </Link>
              </li>
              <li>
                <Link href="/symptom-checker" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <Stethoscope size={14} className="text-teal-500" />
                  AI Symptom Triage
                </Link>
              </li>
              <li>
                <Link href="/report-simplifier" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <FileText size={14} className="text-indigo-400" />
                  Medical Report Simplifier
                </Link>
              </li>
              <li>
                <Link href="/remedies" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <Leaf size={14} className="text-emerald-400" />
                  Ayurvedic & Home Remedies
                </Link>
              </li>
              <li>
                <Link href="/reminders" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <Bell size={14} className="text-amber-400" />
                  Dose Reminders & Scheduler
                </Link>
              </li>
            </ul>
          </div>

          {/* Network & Directory */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 mb-4">Care Network</h4>
            <ul className="space-y-2.5 text-sm text-slate-400 font-medium">
              <li>
                <Link href="/nearby" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <MapPin size={14} className="text-purple-400" />
                  Nearby 24/7 Pharmacies
                </Link>
              </li>
              <li>
                <Link href="/chemist" className="hover:text-blue-400 transition-colors">
                  Chemist Inventory Terminal
                </Link>
              </li>
              <li>
                <Link href="/rider" className="hover:text-blue-400 transition-colors">
                  Rider Cold-Chain Dispatch
                </Link>
              </li>
              <li>
                <Link href="/emergency" className="text-red-400 hover:text-red-300 font-bold transition-colors flex items-center gap-1.5">
                  <PhoneCall size={14} />
                  Emergency SOS Hotlines (108/112)
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Certifications */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-300 mb-4">Safety & Trust</h4>
            <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Shield className="text-blue-400" size={16} />
                Schedule-H Drug Compliance
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Every prescription is digitally verified against registered medical council databases before dispatch.
              </p>
            </div>
            <div className="text-[11px] text-slate-400">
              Thermal sensor calibrated (2°C - 8°C cold gel packs).
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium">
          <p>© {new Date().getFullYear()} MediRush Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Built for rapid emergency medical response</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
