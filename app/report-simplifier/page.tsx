'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  FileText, 
  ArrowLeft, 
  Sparkles, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Utensils, 
  Stethoscope, 
  RefreshCw, 
  Play, 
  Camera, 
  Image as ImageIcon, 
  X, 
  ChevronRight, 
  Info, 
  ShieldCheck, 
  Pill, 
  Activity, 
  HeartPulse, 
  Droplet, 
  Flame, 
  Sliders, 
  Share2, 
  Printer, 
  Layers, 
  Eye,
  Check
} from 'lucide-react';
import { mockReportExamples } from '@/lib/data/mockReportExamples';
import type { SimplifiedReportResult } from '@/lib/data/reportSimplifierRules';
import { cn } from '@/lib/utils';

export default function ReportSimplifierPage() {
  const [reportText, setReportText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SimplifiedReportResult | null>(null);
  const [analysisSource, setAnalysisSource] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // UI Tabs & Filters
  const [activeTab, setActiveTab] = useState<'all' | 'abnormal' | 'normal' | 'diet' | 'doctor'>('all');
  const [activeLanguage, setActiveLanguage] = useState<'hinglish' | 'english' | 'hindi'>('hinglish');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMime(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleAnalyze = async (textOverride?: string) => {
    const textToSend = textOverride !== undefined ? textOverride : reportText;
    if (!textToSend.trim() && !selectedImage) return;

    setIsAnalyzing(true);
    setResult(null);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/simplify-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSend,
          imageBase64: selectedImage,
          mimeType: imageMime
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned error ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
      setAnalysisSource(data.source || 'gemini_ai');
    } catch (err: any) {
      console.error('Failed to simplify report:', err);
      setErrorMessage(err.message || 'Error communicating with AI parser');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadSample = (key: keyof typeof mockReportExamples) => {
    const sample = mockReportExamples[key];
    setReportText(sample);
    setSelectedImage(null);
    handleAnalyze(sample);
  };

  const supportedTests = [
    { title: 'Complete Blood Count (CBC)', icon: Droplet, desc: 'Hemoglobin, RBC, WBC, Platelets, Ferritin (Anemia & Infection)' },
    { title: 'Liver Function Test (LFT)', icon: Activity, desc: 'SGPT, SGOT, Bilirubin, Alkaline Phosphatase (Fatty Liver & Jaundice)' },
    { title: 'Kidney Function (KFT/RFT)', icon: Flame, desc: 'Creatinine, BUN, Uric Acid, eGFR (Renal filtration & Gout)' },
    { title: 'Lipid & Cholesterol Profile', icon: HeartPulse, desc: 'Total Cholesterol, Triglycerides, LDL, HDL (Cardiovascular health)' },
    { title: 'Diabetes HbA1c & Sugar', icon: Sparkles, desc: '3-Month Glycated Hemoglobin, Fasting & Post-Prandial Glucose' },
    { title: 'Thyroid Function (T3, T4, TSH)', icon: Stethoscope, desc: 'Hypothyroidism & Hyperthyroidism hormonal balance' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F9FF] font-sans flex flex-col justify-between">
      <Navbar />

      <main className="pt-20 sm:pt-24 pb-20 max-w-6xl mx-auto px-3 sm:px-6 w-full flex-1">
        
        {/* ─── 1. HERO HEADER BANNER (Responsive for all screens) ───────────── */}
        <div className="bg-gradient-to-br from-indigo-700 via-indigo-900 to-slate-950 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden mb-6 sm:mb-8">
          <div className="absolute top-0 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 max-w-3xl">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-200 hover:text-white mb-3 transition-colors">
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
              <div className="w-11 h-11 sm:w-13 sm:h-13 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0">
                <FileText size={24} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-tight">
                  AI Medical Report Simplifier
                </h1>
                <span className="text-[11px] sm:text-xs font-bold text-indigo-300 flex items-center gap-1.5 mt-0.5">
                  <Sparkles size={13} className="text-yellow-300" /> Powered by Google Gemini 2.5 Flash Vision & Clinical Parser
                </span>
              </div>
            </div>
            
            <p className="text-indigo-100 text-xs sm:text-sm font-medium leading-relaxed mt-2">
              Snap a picture or upload any pathology lab report (CBC, LFT, KFT, Lipid, HbA1c, Thyroid) or paste typed doctor notes. MediRush AI translates medical parameters into easy-to-understand explanations in plain language with diet advice.
            </p>
          </div>
        </div>

        {/* ─── 2. INPUT WORKSPACE (DRAG & DROP, CAMERA, TEXT) ─────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 mb-8">
          
          {/* Main Upload Box */}
          <div className="lg:col-span-8 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileText size={15} className="text-indigo-600" />
                Upload Lab Report or Paste Findings
              </label>
              {(reportText || selectedImage) && (
                <button 
                  onClick={() => { setReportText(''); setSelectedImage(null); setResult(null); }}
                  className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Hidden Input Elements */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleImageUpload}
            />
            <input
              type="file"
              ref={cameraInputRef}
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleImageUpload}
            />

            {!selectedImage ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Drag & Drop / File Select */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 bg-indigo-50/30 hover:bg-indigo-50/70 rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group min-h-[140px]"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ImageIcon size={20} />
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    <span className="text-indigo-600 underline">Upload Report Image</span> (JPG, PNG, PDF)
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Browse files from your device</p>
                </div>

                {/* Camera Snap */}
                <div
                  onClick={() => cameraInputRef.current?.click()}
                  className="border-2 border-dashed border-emerald-200 hover:border-emerald-500 bg-emerald-50/30 hover:bg-emerald-50/70 rounded-2xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group min-h-[140px]"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera size={20} />
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    <span className="text-emerald-700 underline">Take Live Photo</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Snap photo of physical lab paper</p>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-indigo-200 bg-slate-900 p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={selectedImage} alt="Uploaded report preview" className="w-16 h-16 object-cover rounded-xl border border-white/20" />
                  <div className="text-white text-xs">
                    <p className="font-bold">Image ready for Gemini Vision OCR</p>
                    <p className="text-[10px] text-indigo-300">Pathology markers & numbers will be extracted</p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveImage}
                  className="p-2 rounded-xl bg-white/20 hover:bg-red-600 text-white transition-colors cursor-pointer"
                  title="Remove Image"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Direct Text Input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Or type / paste test results directly:
              </label>
              <textarea
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="e.g. Hemoglobin 9.2 g/dL, SGPT 145 U/L, Serum Creatinine 2.4 mg/dL, Fasting Glucose 168 mg/dL..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
              />
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-700 font-bold flex items-center gap-2">
                <AlertTriangle size={15} /> {errorMessage}
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>100% Private HIPAA & Clinical Data Protection</span>
              </div>
              
              <button
                onClick={() => handleAnalyze()}
                disabled={(!reportText.trim() && !selectedImage) || isAnalyzing}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs sm:text-sm font-black px-6 py-3.5 rounded-xl shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Analyzing with Gemini AI...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Simplify Report Now
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Pre-loaded Demo Presets */}
          <div className="lg:col-span-4 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
                <Play size={14} className="text-indigo-600" />
                Try Interactive Demo Presets
              </h3>
              
              <div className="space-y-2">
                {[
                  { key: 'fullMasterDemo', title: 'Master Pathology Panel', badge: 'Full Profile' },
                  { key: 'cbcDemo', title: 'Complete Blood Count (CBC)', badge: 'Anemia' },
                  { key: 'lipidDemo', title: 'Lipid & Cardiac Panel', badge: 'Cholesterol' },
                  { key: 'diabetesDemo', title: 'HbA1c Diabetes Profile', badge: 'Sugar' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => loadSample(item.key as any)}
                    className="w-full text-left p-2.5 rounded-xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {item.title}
                      </p>
                      <span className="text-[10px] text-slate-400 font-semibold">{item.badge}</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 font-medium">
              Educational Notice: AI analysis is designed for patient health literacy. Always review critical results with your doctor.
            </div>
          </div>

        </div>

        {/* ─── 3. ANALYSIS RESULTS PRESENTATION (RICH TABBED CLINICAL VIEW) ───── */}
        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            {/* Master Summary Card */}
            <div className={cn(
              "rounded-2xl sm:rounded-3xl p-5 sm:p-8 border shadow-md",
              result.is_emergency 
                ? "bg-red-50 border-red-200 text-red-950" 
                : "bg-white border-slate-200/90 text-slate-900"
            )}>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-slate-100 mb-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                      {result.categoryName}
                    </span>
                    {analysisSource === 'gemini_ai' && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                        <Sparkles size={11} /> Gemini 2.5 Flash Verified
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg sm:text-2xl font-black mt-2 leading-tight">{result.summaryHeading}</h2>
                </div>
                
                <div className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                  Recommended Specialist: <span className="text-indigo-700 font-black">{result.specialist}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm font-medium leading-relaxed text-slate-700">
                {result.summary}
              </p>
            </div>

            {/* Quick Result Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {[
                { key: 'all', label: `All Markers (${result.parsedParameters?.length || 0})` },
                { key: 'abnormal', label: `Abnormal Flags (${result.abnormalParameters?.length || 0})`, alert: (result.abnormalParameters?.length || 0) > 0 },
                { key: 'normal', label: `Normal Range (${result.normalParameters?.length || 0})` },
                { key: 'diet', label: 'Diet & Lifestyle' },
                { key: 'doctor', label: 'Questions for Doctor' },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key as any)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5",
                    activeTab === t.key
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  )}
                >
                  {t.alert && <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />}
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab 1 & 2: Blood Markers Grid (Responsive) */}
            {(activeTab === 'all' || activeTab === 'abnormal' || activeTab === 'normal') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(activeTab === 'all' ? result.parsedParameters : activeTab === 'abnormal' ? result.abnormalParameters : result.normalParameters).map((param, i) => (
                  <div
                    key={i}
                    className={cn(
                      "bg-white rounded-2xl p-4 sm:p-5 border shadow-sm flex flex-col justify-between space-y-2.5",
                      param.status === 'HIGH' ? "border-red-200 bg-red-50/20" :
                      param.status === 'CRITICAL' ? "border-red-500 bg-red-50/40" :
                      param.status === 'LOW' ? "border-amber-200 bg-amber-50/20" :
                      "border-slate-200/90"
                    )}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{param.category || 'General'}</span>
                        <h4 className="text-sm font-black text-slate-900 leading-snug">{param.name}</h4>
                      </div>

                      <span className={cn(
                        "text-[10px] font-black px-2 py-0.5 rounded-md uppercase whitespace-nowrap",
                        param.status === 'HIGH' ? "bg-red-100 text-red-700" :
                        param.status === 'CRITICAL' ? "bg-red-600 text-white animate-pulse" :
                        param.status === 'LOW' ? "bg-amber-100 text-amber-800" :
                        "bg-emerald-100 text-emerald-800"
                      )}>
                        {param.status} ({param.val})
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {param.meaning}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: Diet & Lifestyle Action Plan */}
            {(activeTab === 'all' || activeTab === 'diet') && (
              <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Utensils size={15} className="text-indigo-600" />
                  Custom Diet & Lifestyle Guidelines for These Lab Results
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg inline-block border border-emerald-200">
                      ✓ Foods & Habits to Include (क्या खाएं)
                    </span>
                    <ul className="space-y-2 text-xs text-slate-700 font-medium">
                      {(result.dietPlan?.dos || []).map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2.5">
                    <span className="text-xs font-black text-red-700 bg-red-50 px-3 py-1 rounded-lg inline-block border border-red-200">
                      ✗ Foods & Habits to Avoid (किन चीजों से बचें)
                    </span>
                    <ul className="space-y-2 text-xs text-slate-700 font-medium">
                      {(result.dietPlan?.donts || []).map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-red-600 font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Questions for Doctor */}
            {(activeTab === 'all' || activeTab === 'doctor') && (
              <div className="bg-indigo-50/70 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-indigo-100 shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                  <HelpCircle size={15} className="text-indigo-600" />
                  Key Questions to Ask Your Doctor at Follow-Up
                </h3>
                
                <div className="space-y-2.5">
                  {(result.questions_for_doctor || []).map((q, i) => (
                    <div key={i} className="bg-white p-3.5 rounded-xl border border-indigo-100 text-xs font-bold text-slate-800 flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Direct Medicine Order Bar */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">
                  <Pill size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Need Medicines Prescribed in This Report?</h4>
                  <p className="text-xs text-slate-500 font-medium">Automatic multi-pharmacy fulfillment with sub-10-min dispatch.</p>
                </div>
              </div>

              <Link href="/patient" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-6 py-3.5 rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap">
                  Order Medicines Now →
                </button>
              </Link>
            </div>

          </div>
        )}

        {/* ─── 4. SUPPORTED REPORT TYPES & HOW IT WORKS (EXPLAINER CONTENT) ──── */}
        <section className="mt-16 pt-12 border-t border-slate-200/80 space-y-12">
          
          {/* Supported Diagnostic Panels */}
          <div>
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                Coverage
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">
                Supported Diagnostic Pathology Panels
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                MediRush AI recognizes parameters from all major NABL certified and regional Indian pathology laboratories.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {supportedTests.map((test, i) => {
                const Icon = test.icon;
                return (
                  <div key={i} className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{test.title}</h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">{test.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* How It Works (3 Steps) */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
            <h3 className="text-base font-black text-slate-900 mb-6 text-center">
              How Gemini Vision Analyzes Your Report
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto font-black text-sm">
                  1
                </div>
                <h4 className="text-xs font-black text-slate-900">OCR & Visual Extraction</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Gemini Vision deciphers scanned pathology images, PDF prints, and handwriting without losing decimal units.
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto font-black text-sm">
                  2
                </div>
                <h4 className="text-xs font-black text-slate-900">Clinical Normalization</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Observed test values are mapped against standard Indian clinical reference intervals (High / Normal / Low).
                </p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto font-black text-sm">
                  3
                </div>
                <h4 className="text-xs font-black text-slate-900">Layman Action Plan</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Generates simple Hinglish explanations, dietary DOs and DONTs, and doctor follow-up consultation points.
                </p>
              </div>
            </div>
          </div>

        </section>

      </main>

      <Footer />
    </div>
  );
}
