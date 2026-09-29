'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Activity, 
  Pill, 
  Stethoscope, 
  FileText, 
  Leaf, 
  Bell, 
  MapPin, 
  AlertTriangle, 
  Menu, 
  X, 
  ChevronDown,
  Store, 
  Bike,
  Sparkles,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setToolsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const healthTools = [
    { href: '/report-simplifier', label: 'AI Report Simplifier', desc: 'Upload lab tests for plain-English analysis', icon: FileText, color: 'text-indigo-600 bg-indigo-50' },
    { href: '/remedies', label: 'Ayurvedic & Home Remedies', desc: '50+ herbal kadhas & natural remedies', icon: Leaf, color: 'text-emerald-600 bg-emerald-50' },
    { href: '/reminders', label: 'Medicine Dose Reminders', desc: 'Daily dosage schedule & pill alarms', icon: Bell, color: 'text-amber-600 bg-amber-50' },
    { href: '/symptom-checker', label: 'AI Symptom Checker', desc: 'Clinical diagnostic triage & guidance', icon: Stethoscope, color: 'text-teal-600 bg-teal-50' },
    { href: '/nearby', label: 'Nearby 24/7 Healthcare', desc: 'Find open pharmacies & blood banks', icon: MapPin, color: 'text-purple-600 bg-purple-50' },
  ];

  return (
    <>
      {/* ─── DESKTOP CLEAN STREAMLINED NAVBAR ───────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 pt-3 px-3 sm:px-6 lg:px-8 pointer-events-none">
        <div className={cn(
          "max-w-7xl mx-auto rounded-2xl transition-all duration-300 pointer-events-auto border flex items-center justify-between",
          scrolled 
            ? "bg-white/95 backdrop-blur-xl shadow-lg border-slate-200/90 py-2.5 px-6" 
            : "bg-white/80 backdrop-blur-md shadow-sm border-white/70 py-3.5 px-6"
        )}>
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-[#1565C0] to-[#0D47A1] rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <Activity size={20} />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 block leading-tight">
                MediRush
              </span>
              <span className="text-[10px] font-extrabold text-blue-700 tracking-wider uppercase block">
                Emergency Health
              </span>
            </div>
          </Link>

          {/* Center Links */}
          <div className="hidden md:flex items-center space-x-2">
            <Link
              href="/"
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-bold transition-colors",
                pathname === '/' ? "text-blue-700 font-extrabold" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              Home
            </Link>

            <a
              href="/#technology"
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <Layers size={13} className="text-blue-600" />
              Technology & SLA
            </a>

            {/* Health Tools Dropdown Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                  toolsDropdownOpen || healthTools.some(t => pathname === t.href)
                    ? "bg-blue-50 text-blue-700 font-extrabold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                <Sparkles size={13} className="text-blue-600" />
                Health Tools
                <ChevronDown size={13} className={cn("transition-transform duration-200", toolsDropdownOpen && "rotate-180")} />
              </button>

              {/* Dropdown Content */}
              {toolsDropdownOpen && (
                <div className="absolute top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Patient Diagnostic & Wellness Tools
                  </div>
                  <div className="space-y-1 mt-1">
                    {healthTools.map((tool) => {
                      const Icon = tool.icon;
                      const isActive = pathname === tool.href;
                      return (
                        <Link
                          key={tool.href}
                          href={tool.href}
                          onClick={() => setToolsDropdownOpen(false)}
                          className={cn(
                            "flex items-start gap-3 p-2.5 rounded-xl transition-all",
                            isActive ? "bg-blue-50" : "hover:bg-slate-50"
                          )}
                        >
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", tool.color)}>
                            <Icon size={16} />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">{tool.label}</div>
                            <div className="text-[10px] text-slate-500 font-medium leading-tight">{tool.desc}</div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Portals Link */}
            <Link
              href="/chemist"
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1",
                pathname === '/chemist' ? "text-blue-700 font-extrabold" : "text-slate-500 hover:text-slate-900"
              )}
            >
              <Store size={13} />
              Chemist
            </Link>

            <Link
              href="/rider"
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1",
                pathname === '/rider' ? "text-blue-700 font-extrabold" : "text-slate-500 hover:text-slate-900"
              )}
            >
              <Bike size={13} />
              Rider
            </Link>
          </div>

          {/* Right Action Callouts */}
          <div className="hidden sm:flex items-center space-x-3">
            <Link
              href="/patient"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <Pill size={14} />
              Order Medicine
            </Link>

            <Link
              href="/emergency"
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-black px-3.5 py-2.5 rounded-xl shadow-md shadow-red-500/30 flex items-center gap-1.5 animate-pulse transition-all cursor-pointer"
            >
              <AlertTriangle size={14} />
              SOS Emergency
            </Link>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/patient"
              className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
            >
              <Pill size={13} /> Order
            </Link>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
              aria-label="Open Mobile Menu"
            >
              <Menu size={20} />
            </button>
          </div>

        </div>
      </nav>

      {/* ─── MOBILE DRAWER OVERLAY ─────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex justify-end">
          <div className="w-full max-w-xs bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                    <Activity size={18} />
                  </div>
                  <div>
                    <span className="text-base font-black text-slate-900">MediRush</span>
                    <p className="text-[10px] text-blue-700 font-bold uppercase">Emergency Care</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Mobile Primary Actions */}
              <div className="space-y-2 mb-6">
                <Link
                  href="/patient"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white font-black py-3 rounded-xl shadow-md text-sm"
                >
                  <Pill size={16} /> Order Medicine (10-Min Dispatch)
                </Link>
                <Link
                  href="/emergency"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full bg-red-600 text-white font-black py-3 rounded-xl shadow-md text-sm animate-pulse"
                >
                  <AlertTriangle size={16} /> SOS Emergency Help (108)
                </Link>
              </div>

              {/* Health Tools Section */}
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Health Tools</p>
                {healthTools.map((tool) => {
                  const Icon = tool.icon;
                  const isActive = pathname === tool.href;
                  return (
                    <Link
                      key={tool.href}
                      href={tool.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all",
                        isActive ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                      )}
                    >
                      <Icon size={16} className="text-blue-600" />
                      {tool.label}
                    </Link>
                  );
                })}
              </div>

              {/* Internal Portals */}
              <div className="mt-6 pt-4 border-t border-slate-100 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Merchant & Fleet</p>
                <Link
                  href="/chemist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  <Store size={15} className="text-slate-400" />
                  Chemist Portal
                </Link>
                <Link
                  href="/rider"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  <Bike size={15} className="text-slate-400" />
                  Rider Dispatch Portal
                </Link>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-center text-[10px] text-slate-400 font-bold">
              Sub-10 Minute Medical Response SLA
            </div>
          </div>
        </div>
      )}
    </>
  );
}
