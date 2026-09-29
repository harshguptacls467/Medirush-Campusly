'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Stethoscope, 
  ArrowLeft, 
  Sparkles, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  ShieldAlert, 
  Pill, 
  HeartPulse,
  Activity,
  Bot
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

interface DiagnosisResult {
  disease: string;
  probability: number;
  severity: 'Mild' | 'Moderate' | 'Severe';
  precautions: string[];
  recommendedSpecialist: string;
  isEmergency: boolean;
}

export default function SymptomCheckerPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: 'Hello, I am MediRush AI Triage Assistant. Please tell me what symptoms you or your family member are experiencing (e.g., high fever, dry cough, severe stomach acidity, joint pain).',
      timestamp: 'Just now'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userText = inputVal.trim();
    const newMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, newMsg]);
    setInputVal('');
    setIsTyping(true);

    // AI Analysis simulation with medical heuristics
    setTimeout(() => {
      const lower = userText.toLowerCase();
      let res: DiagnosisResult;

      if (lower.includes('chest pain') || lower.includes('breathing') || lower.includes('heart') || lower.includes('unconscious')) {
        res = {
          disease: 'Acute Cardiopulmonary or Emergency Respiratory Distress',
          probability: 92,
          severity: 'Severe',
          precautions: [
            'Do not exert physically; sit in a semi-upright resting posture',
            'Loosen tight clothing around neck and chest',
            'Immediately contact Emergency Ambulance (108/112) or reach nearest ER'
          ],
          recommendedSpecialist: 'Emergency Cardiology / Hospital Trauma ER',
          isEmergency: true
        };
      } else if (lower.includes('cough') || lower.includes('fever') || lower.includes('cold') || lower.includes('throat') || lower.includes('khasi')) {
        res = {
          disease: 'Upper Respiratory Tract Viral Infection (Acute Rhinopharyngitis)',
          probability: 88,
          severity: 'Mild',
          precautions: [
            'Drink warm honey-ginger water and perform salt water gargles twice daily',
            'Stay well-hydrated with warm fluids and take proper bed rest',
            'Monitor body temperature using a digital thermometer'
          ],
          recommendedSpecialist: 'General Physician / ENT Specialist',
          isEmergency: false
        };
      } else if (lower.includes('acidity') || lower.includes('gas') || lower.includes('stomach') || lower.includes('pet dard') || lower.includes('burning')) {
        res = {
          disease: 'Gastroesophageal Reflux (GERD) & Acid Dyspepsia',
          probability: 85,
          severity: 'Mild',
          precautions: [
            'Avoid spicy, fried, and citrus foods for 48 hours',
            'Drink cold buttermilk (Chaas) with roasted cumin powder',
            'Do not lie down flat immediately after meals'
          ],
          recommendedSpecialist: 'Gastroenterologist / General Physician',
          isEmergency: false
        };
      } else {
        res = {
          disease: 'General Fatigue & Mild Systemic Viral Reaction',
          probability: 76,
          severity: 'Moderate',
          precautions: [
            'Maintain adequate electrolyte intake (ORS / Coconut water)',
            'Take 8 hours of uninterrupted rest',
            'Consult a doctor if symptoms persist past 48 hours'
          ],
          recommendedSpecialist: 'General Physician',
          isEmergency: false
        };
      }

      setDiagnosis(res);
      setIsTyping(false);

      setMessages(prev => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: `I have completed the preliminary diagnostic triage. Potential match: ${res.disease} (${res.probability}% probability). Please review the clinical breakdown below.`,
          timestamp: 'Just now'
        }
      ]);
    }, 1200);
  };

  const handleRestart = () => {
    setMessages([
      {
        id: 'm1',
        sender: 'bot',
        text: 'Hello, I am MediRush AI Triage Assistant. Please tell me what symptoms you or your family member are experiencing.',
        timestamp: 'Just now'
      }
    ]);
    setDiagnosis(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F9FF] font-sans flex flex-col justify-between">
      <Navbar />

      <main className="pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6 w-full flex-1">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden mb-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 max-w-2xl">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-200 hover:text-white mb-3 transition-colors">
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shadow-md">
                <Stethoscope size={24} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">AI Symptom Diagnostic Checker</h1>
            </div>
            
            <p className="text-teal-100 text-xs sm:text-sm font-medium leading-relaxed">
              Describe how you are feeling in English or Hindi. MediRush AI performs clinical risk stratification and directs you to appropriate care.
            </p>
          </div>
        </div>

        {/* Chatbot Interface */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md overflow-hidden flex flex-col h-[480px] mb-6">
          
          {/* Chat Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900">MediRush Triage Engine</h3>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Online & Ready
                </span>
              </div>
            </div>

            <button
              onClick={handleRestart}
              className="text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors"
            >
              <RefreshCw size={12} /> Reset Chat
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-3.5 bg-slate-50/40">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex gap-2.5 max-w-[85%]",
                  m.sender === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5",
                  m.sender === 'user' ? "bg-blue-600 text-white" : "bg-teal-100 text-teal-800"
                )}>
                  {m.sender === 'user' ? 'You' : <Bot size={14} />}
                </div>

                <div className={cn(
                  "p-3.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed shadow-sm",
                  m.sender === 'user'
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-none"
                )}>
                  {m.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-400 font-bold italic pl-9">
                <RefreshCw size={12} className="animate-spin" /> MediRush AI is analyzing symptom patterns...
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Describe your symptoms (e.g., I have fever and sore throat since yesterday)..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs sm:text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              disabled={!inputVal.trim() || isTyping}
              className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white p-3 rounded-xl shadow-md transition-all cursor-pointer flex-shrink-0"
            >
              <Send size={16} />
            </button>
          </form>

        </div>

        {/* Diagnosis Report Card */}
        {diagnosis && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className={cn(
              "rounded-2xl p-6 border shadow-md",
              diagnosis.isEmergency ? "bg-red-50 border-red-200 text-red-950" : "bg-white border-slate-200/80 text-slate-900"
            )}>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-4 border-b border-slate-100 mb-4">
                <div>
                  <span className={cn(
                    "text-[10px] font-black uppercase px-2.5 py-1 rounded-full",
                    diagnosis.isEmergency ? "bg-red-600 text-white animate-pulse" : "bg-teal-50 text-teal-700 border border-teal-200"
                  )}>
                    Severity: {diagnosis.severity} ({diagnosis.probability}% Match)
                  </span>
                  <h3 className="text-xl font-black mt-2">{diagnosis.disease}</h3>
                </div>

                <div className="text-xs font-bold text-slate-500">
                  Recommended Specialist: <span className="text-teal-700 font-black">{diagnosis.recommendedSpecialist}</span>
                </div>
              </div>

              {/* Precautions */}
              <div className="space-y-2 mb-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Immediate Precautions</h4>
                <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                  {diagnosis.precautions.map((p, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-teal-600 font-bold">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-100">
                {diagnosis.isEmergency ? (
                  <Link href="/emergency" className="flex-1">
                    <button className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer">
                      <AlertTriangle size={15} /> Open Emergency SOS Hotline
                    </button>
                  </Link>
                ) : (
                  <Link href="/patient" className="flex-1">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer">
                      <Pill size={15} /> Order Prescribed Medicines (10-Min Dispatch)
                    </button>
                  </Link>
                )}
                <Link href="/remedies" className="flex-1">
                  <button className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer">
                    View Ayurvedic Home Remedies
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
