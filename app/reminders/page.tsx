'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Bell, 
  Plus, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Sun, 
  Sunset, 
  Moon, 
  Trash2, 
  Pause, 
  Play, 
  Pill,
  Calendar,
  Volume2,
  Filter
} from 'lucide-react';
import { mockMedicineReminders, type MedicineReminderItem } from '@/lib/data/mockMedicineReminders';
import { cn } from '@/lib/utils';

export default function MedicineRemindersPage() {
  const [reminders, setReminders] = useState<MedicineReminderItem[]>(mockMedicineReminders);
  const [filter, setFilter] = useState<'All' | 'Morning' | 'Afternoon' | 'Night'>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form State
  const [newMedName, setNewMedName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newTime, setNewTime] = useState('08:00 AM');
  const [newPeriod, setNewPeriod] = useState<'Morning' | 'Afternoon' | 'Night'>('Morning');
  const [newFrequency, setNewFrequency] = useState('Twice daily');

  const handleToggleTaken = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, taken_today: !r.taken_today } : r));
  };

  const handleTogglePause = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, status: r.status === 'Paused' ? 'Active' : 'Paused' } : r));
  };

  const handleDelete = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    const newReminder: MedicineReminderItem = {
      id: `r-${Date.now()}`,
      medicine_name: newMedName.trim(),
      dosage: newDosage.trim() || '1 Dose',
      time: newTime,
      period: newPeriod,
      frequency: newFrequency,
      start_date: new Date().toISOString().split('T')[0],
      status: 'Active',
      taken_today: false
    };

    setReminders([newReminder, ...reminders]);
    setNewMedName('');
    setNewDosage('');
    setShowAddModal(false);
  };

  const filteredReminders = reminders.filter(r => {
    if (filter === 'All') return true;
    return r.period === filter;
  });

  const takenCount = reminders.filter(r => r.taken_today).length;
  const totalCount = reminders.length;
  const progressPercent = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F5F9FF] font-sans flex flex-col justify-between">
      <Navbar />

      <main className="pt-24 pb-20 max-w-5xl mx-auto px-4 sm:px-6 w-full flex-1">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div className="max-w-xl">
              <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-100 hover:text-white mb-3 transition-colors">
                <ArrowLeft size={14} /> Back to Dashboard
              </Link>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shadow-md">
                  <Bell size={24} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Medicine Dose Reminders</h1>
              </div>
              <p className="text-amber-100 text-xs sm:text-sm font-medium leading-relaxed">
                Stay consistent with your chronic & acute prescription schedules. Track daily morning, afternoon, and bedtime intake.
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white hover:bg-amber-50 text-amber-900 font-black text-xs px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus size={16} className="text-amber-600" />
              Add Dose Schedule
            </button>
          </div>
        </div>

        {/* Progress Bar & Filter Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Daily Dose Progress */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">Today's Adherence</span>
              <h3 className="text-2xl font-black text-slate-900">{takenCount} / {totalCount} Doses Taken</h3>
              <p className="text-[11px] text-slate-400 font-medium">
                {progressPercent === 100 ? '🎉 All scheduled doses complete!' : `${100 - progressPercent}% remaining today`}
              </p>
            </div>
            <div className="w-14 h-14 rounded-full border-4 border-amber-500 flex items-center justify-center text-xs font-black text-amber-600">
              {progressPercent}%
            </div>
          </div>

          {/* Quick Filters */}
          <div className="md:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Filter by Time Period</span>
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: 'All', label: 'All Doses' },
                { key: 'Morning', label: 'Morning 🌅', icon: Sun },
                { key: 'Afternoon', label: 'Noon ☀️', icon: Sunset },
                { key: 'Night', label: 'Night 🌙', icon: Moon },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={cn(
                    "py-2 px-2.5 rounded-xl text-xs font-black transition-all cursor-pointer text-center",
                    filter === tab.key
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Reminders List */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1 mb-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Active Prescriptions ({filteredReminders.length})
            </h3>
          </div>

          {filteredReminders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
              <Bell size={32} className="mx-auto mb-2 opacity-40 text-amber-600" />
              <p className="text-sm font-bold text-slate-600">No dose schedules in this period</p>
              <p className="text-xs text-slate-400 mt-1">Click "Add Dose Schedule" above to create one.</p>
            </div>
          ) : (
            filteredReminders.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "bg-white rounded-2xl p-5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                  item.taken_today
                    ? "border-emerald-200 bg-emerald-50/20 shadow-sm"
                    : "border-slate-200/80 hover:border-amber-300 shadow-sm"
                )}
              >
                <div className="flex items-start sm:items-center gap-4">
                  <button
                    onClick={() => handleToggleTaken(item.id)}
                    className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all cursor-pointer",
                      item.taken_today
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                        : "bg-slate-100 text-slate-400 hover:bg-emerald-100 hover:text-emerald-700"
                    )}
                  >
                    <CheckCircle2 size={20} />
                  </button>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className={cn(
                        "text-base font-black text-slate-900",
                        item.taken_today && "line-through text-slate-400"
                      )}>
                        {item.medicine_name}
                      </h4>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                        {item.dosage}
                      </span>
                      {item.status === 'Paused' && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-200 text-slate-700">
                          Paused
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-amber-600" /> {item.time} ({item.period})
                      </span>
                      <span>•</span>
                      <span>{item.frequency}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleTogglePause(item.id)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
                    title={item.status === 'Paused' ? 'Resume reminder' : 'Pause reminder'}
                  >
                    {item.status === 'Paused' ? <Play size={15} /> : <Pause size={15} />}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                    title="Delete reminder"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal for Adding New Reminder */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Bell size={18} className="text-amber-600" />
                  Add Medicine Schedule
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-xs font-bold text-slate-400 hover:text-slate-700">
                  Cancel
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">Medicine Name</label>
                  <input
                    type="text"
                    required
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    placeholder="e.g. Paracetamol 500mg, Lantus Insulin"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-700 mb-1">Dosage</label>
                    <input
                      type="text"
                      value={newDosage}
                      onChange={(e) => setNewDosage(e.target.value)}
                      placeholder="e.g. 1 Tablet / 10 Units"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-700 mb-1">Time</label>
                    <input
                      type="text"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      placeholder="08:00 AM"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-700 mb-1">Time Period</label>
                    <select
                      value={newPeriod}
                      onChange={(e) => setNewPeriod(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="Morning">Morning</option>
                      <option value="Afternoon">Afternoon</option>
                      <option value="Night">Night</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-700 mb-1">Frequency</label>
                    <select
                      value={newFrequency}
                      onChange={(e) => setNewFrequency(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      <option value="Once daily">Once daily</option>
                      <option value="Twice daily">Twice daily</option>
                      <option value="Three times daily">Three times daily</option>
                      <option value="As needed">As needed (SOS)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black text-xs py-3.5 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Save Dose Reminder
                </button>
              </form>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
