'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Leaf, 
  Search, 
  ArrowLeft, 
  Sparkles, 
  Wind, 
  Flame, 
  Zap, 
  Thermometer, 
  Activity, 
  Moon, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight,
  Pill,
  Send,
  Bot,
  RefreshCw,
  MessageSquare,
  Sparkle
} from 'lucide-react';
import { mockHomeRemedies, type HomeRemedy } from '@/lib/data/mockHomeRemedies';
import { cn } from '@/lib/utils';

interface ChatMsg {
  id: string;
  sender: 'bot' | 'user';
  text: string;
}

export default function HomeRemediesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeRemedy, setActiveRemedy] = useState<HomeRemedy | null>(mockHomeRemedies[0]);

  // AI Remedy Chat State
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: '🌿 **नमस्ते! मैं MediRush आयुर्वेदिक वैद्या AI Assistant हूँ।**\n\nआप मुझे अपनी कोई भी समस्या (जैसे खांसी, जुकाम, पेट में जलन, सिरदर्द, नींद न आना) बताइए। मैं आपको प्राकृतिक घरेलू काढ़ा, खान-पान और योग के आसान उपाय बताऊंगा।'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatTyping, setIsChatTyping] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const categories = ['All', 'Cold & Cough', 'Acidity', 'Headache', 'Fever & Pain', 'Digestive', 'Mental Wellness'];

  const quickChips = [
    'खांसी और गले की खराश का काढ़ा',
    'पेट में गैस और एसिडिटी का तुरंत इलाज',
    'माइग्रेन व तनाव से राहत',
    'हल्का बुखार और बदन दर्द',
    'रात को अच्छी नींद के घरेलू उपाय'
  ];

  const handleSendChat = async (textToSend?: string) => {
    const msg = textToSend || chatInput;
    if (!msg.trim() || isChatTyping) return;

    const userMsg: ChatMsg = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: msg.trim()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatTyping(true);

    try {
      const res = await fetch('/api/remedies-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg.trim() })
      });

      const data = await res.json();
      const botMsg: ChatMsg = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: data.reply || 'उपचार लोड करने में असमर्थ। कृपया पुनः प्रयास करें।'
      };
      setChatMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setChatMessages(prev => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: 'माफ कीजिए, नेटवर्क समस्या है। कृपया नीचे दी गई लिस्ट में से अपनी समस्या देखकर घरेलू उपचार चुनें।'
        }
      ]);
    } finally {
      setIsChatTyping(false);
    }
  };

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatTyping]);

  const filteredRemedies = useMemo(() => {
    return mockHomeRemedies.filter(item => {
      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || 
        item.problem.toLowerCase().includes(q) || 
        item.description.toLowerCase().includes(q) ||
        item.keywords.some(k => k.toLowerCase().includes(q));
      return matchesCat && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F5F9FF] font-sans flex flex-col justify-between">
      <Navbar />

      <main className="pt-20 sm:pt-24 pb-20 max-w-6xl mx-auto px-3 sm:px-6 w-full flex-1">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-950 rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 text-white shadow-xl relative overflow-hidden mb-6 sm:mb-8">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 max-w-2xl">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-200 hover:text-white mb-3 transition-colors">
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
            
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0">
                <Leaf size={24} />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight">Ayurvedic & Home Remedies</h1>
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1 mt-0.5">
                  <Sparkles size={13} className="text-yellow-300" /> AI Vaidya & Natural Herbal Directory
                </span>
              </div>
            </div>
            
            <p className="text-emerald-100 text-xs sm:text-sm font-medium leading-relaxed">
              Ask our AI Ayurvedic Assistant for customized kadhas and natural treatments, or browse 50+ evidence-guided remedies with step-by-step preparation recipes.
            </p>
          </div>
        </div>

        {/* ─── 1. AI AYURVEDIC VAIDYA CHATBOT ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-md overflow-hidden mb-10">
          <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-slate-200 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-md">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                  AI Ayurvedic Assistant (वैद्या जी)
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">Active</span>
                </h3>
                <p className="text-[10px] text-slate-500 font-bold">Ask anything about desi kadhas, kitchen spices & natural cures</p>
              </div>
            </div>

            <button
              onClick={() => setChatMessages([{
                id: 'm1',
                sender: 'bot',
                text: '🌿 **नमस्ते! मैं MediRush आयुर्वेदिक वैद्या AI Assistant हूँ।**\n\nआप मुझे अपनी कोई भी समस्या (जैसे खांसी, जुकाम, पेट में जलन, सिरदर्द, नींद न आना) बताइए। मैं आपको प्राकृतिक घरेलू काढ़ा, खान-पान और योग के आसान उपाय बताऊंगा।'
              }])}
              className="text-xs font-bold text-slate-400 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={12} /> Reset
            </button>
          </div>

          {/* Chat Messages */}
          <div className="p-4 sm:p-6 max-h-[360px] overflow-y-auto space-y-3.5 bg-slate-50/40 text-xs sm:text-sm font-medium">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2.5 max-w-[90%] sm:max-w-[80%]",
                  msg.sender === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5",
                  msg.sender === 'user' ? "bg-emerald-700 text-white" : "bg-emerald-100 text-emerald-800"
                )}>
                  {msg.sender === 'user' ? 'You' : <Leaf size={14} />}
                </div>

                <div className={cn(
                  "p-3.5 rounded-2xl leading-relaxed whitespace-pre-line shadow-sm",
                  msg.sender === 'user'
                    ? "bg-emerald-700 text-white rounded-tr-none"
                    : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-none"
                )}>
                  {msg.text}
                </div>
              </div>
            ))}

            {isChatTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-400 font-bold italic pl-9">
                <RefreshCw size={12} className="animate-spin" /> वैद्या जी प्राकृतिक उपचार तैयार कर रहे हैं...
              </div>
            )}
            <div ref={chatScrollRef} />
          </div>

          {/* Quick Question Chips */}
          <div className="px-4 py-2.5 bg-slate-50/90 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-black uppercase text-slate-400 flex-shrink-0">Quick Ask:</span>
            {quickChips.map((chip, i) => (
              <button
                key={i}
                onClick={() => handleSendChat(chip)}
                className="text-[11px] font-bold text-emerald-800 bg-white hover:bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full whitespace-nowrap transition-all shadow-xs cursor-pointer flex-shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <form onSubmit={(e) => { e.preventDefault(); handleSendChat(); }} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="अपनी समस्या यहाँ लिखें (उदा. मुझे 2 दिन से सूखी खांसी है, काढ़ा बताएं)..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs sm:text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isChatTyping}
              className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white p-3 rounded-xl shadow-md transition-all cursor-pointer flex-shrink-0"
            >
              <Send size={16} />
            </button>
          </form>
        </div>

        {/* ─── 2. SEARCHABLE HOME REMEDIES DIRECTORY ─────────────────────────── */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900">Verified Herbal Remedy Library</h2>
              <p className="text-xs text-slate-500 font-medium">Browse detailed preparation guides & medical precautions</p>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search condition (e.g. khasi, acidity, sar dard, fever, sleep, kadha)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs sm:text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer",
                    selectedCategory === cat
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Content: Left List & Right Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left List */}
            <div className="lg:col-span-5 space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                Ailments ({filteredRemedies.length})
              </h3>

              {filteredRemedies.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-slate-200">
                  <Leaf size={32} className="mx-auto mb-2 opacity-40 text-emerald-600" />
                  <p className="text-sm font-bold text-slate-600">No matching remedies found</p>
                </div>
              ) : (
                filteredRemedies.map((remedy) => {
                  const isSelected = activeRemedy?.id === remedy.id;
                  return (
                    <button
                      key={remedy.id}
                      onClick={() => setActiveRemedy(remedy)}
                      className={cn(
                        "w-full text-left p-4 rounded-2xl border transition-all cursor-pointer",
                        isSelected
                          ? "bg-emerald-50/70 border-emerald-500 shadow-md"
                          : "bg-white border-slate-200/80 hover:border-emerald-200 hover:bg-slate-50"
                      )}
                    >
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                          {remedy.category}
                        </span>
                        <ChevronRight size={14} className={isSelected ? "text-emerald-700" : "text-slate-300"} />
                      </div>
                      
                      <h4 className="text-sm font-black text-slate-900 leading-snug">
                        {remedy.problem}
                      </h4>
                      
                      <p className="text-xs text-slate-500 mt-1 font-medium line-clamp-2">
                        {remedy.description}
                      </p>
                    </button>
                  );
                })
              )}
            </div>

            {/* Right Detailed View */}
            <div className="lg:col-span-7">
              {activeRemedy ? (
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6">
                  
                  {/* Header */}
                  <div className="border-b border-slate-100 pb-5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        {activeRemedy.category}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        ID: #{activeRemedy.id}
                      </span>
                    </div>
                    
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                      {activeRemedy.problem}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                      {activeRemedy.description}
                    </p>
                  </div>

                  {/* Symptoms */}
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                      Typical Symptoms (प्रमुख लक्षण)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeRemedy.symptoms.map((s, i) => (
                        <div key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs font-semibold text-slate-700 flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preparation Steps */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-emerald-600" />
                      Natural Remedies & Kadha Preparation (घरेलू उपचार)
                    </h3>
                    <div className="space-y-2.5">
                      {activeRemedy.remedies.map((rem, i) => (
                        <div key={i} className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/80 text-xs sm:text-sm font-bold text-slate-800 flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span className="leading-relaxed">{rem}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Yoga Tips */}
                  {activeRemedy.yoga_tips && activeRemedy.yoga_tips.length > 0 && (
                    <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-100 space-y-2">
                      <h3 className="text-xs font-black uppercase tracking-wider text-teal-900">
                        Yoga Asanas & Pranayama (योगाभ्यास)
                      </h3>
                      <ul className="space-y-1 text-xs text-teal-950 font-medium">
                        {activeRemedy.yoga_tips.map((y, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-teal-600 font-bold">🧘</span>
                            <span>{y}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Warning */}
                  <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 space-y-2 text-rose-950">
                    <h4 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-rose-700">
                      <AlertTriangle size={14} /> When to Consult a Doctor
                    </h4>
                    <p className="text-xs font-medium leading-relaxed">
                      {activeRemedy.when_to_see_doctor}
                    </p>
                  </div>

                  {/* Bottom Action */}
                  <div className="pt-2 flex justify-end">
                    <Link href="/patient">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-black px-5 py-3 rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer">
                        <Pill size={14} /> Need Medical Treatment? Order Medicine →
                      </button>
                    </Link>
                  </div>

                </div>
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
                  Select a condition from the left to view remedy details.
                </div>
              )}
            </div>

          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
