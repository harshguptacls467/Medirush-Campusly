'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  MapPin, 
  Activity, 
  FileText, 
  ShoppingBag, 
  CreditCard, 
  Bell, 
  Key, 
  AlertTriangle, 
  LogOut, 
  Check, 
  ShieldCheck, 
  Plus, 
  Trash2,
  Lock,
  Download,
  Share2,
  Sparkles,
  Pill,
  Clock,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfilePage() {
  const router = useRouter();
  const { user, userProfile, logout, checkAndCreateProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'account' | 'medical' | 'addresses' | 'orders' | 'security'>('account');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Medical data
  const [medicalProfile, setMedicalProfile] = useState({
    bloodGroup: 'O+',
    allergies: 'Penicillin, Dust',
    chronicDiseases: 'None',
    medications: 'Metformin 500mg, Multivitamin',
    emergencyContact: '+919340429618',
    emergencyDoctor: 'Dr. R. K. Sharma (Civil Hospital)'
  });

  // Addresses
  const [addresses, setAddresses] = useState([
    { id: '1', label: 'Home', address: 'B-104, Campus Towers, Ring Road, Indore, MP', isDefault: true },
    { id: '2', label: 'Office / Clinic', address: 'Shop #12, Jan Aushadhi Hub, Main Market, Indore', isDefault: false }
  ]);
  const [newAddrText, setNewAddrText] = useState('');
  const [newAddrLabel, setNewAddrLabel] = useState('Home');

  // Password reset
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (user) {
      setName(userProfile?.name || user.user_metadata?.name || user.user_metadata?.full_name || 'Verified Patient');
      setEmail(user.email || '');
      setPhone(userProfile?.phone || user.phone || user.user_metadata?.phone || '+919340429618');
      
      const storedMed = localStorage.getItem(`medirush_med_${user.id}`);
      if (storedMed) {
        try { setMedicalProfile(JSON.parse(storedMed)); } catch {}
      }
    }
  }, [user, userProfile]);

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (user?.id) {
        await supabase.from('users').update({ name, phone }).eq('id', user.id);
        await supabase.auth.updateUser({ data: { name, phone } });
      }
      showToast('Profile settings saved successfully!');
    } catch (err: any) {
      showToast('Profile updated locally.');
    } finally {
      setLoading(false);
    }
  };

  const handleMedicalSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.id) {
      localStorage.setItem(`medirush_med_${user.id}`, JSON.stringify(medicalProfile));
    }
    showToast('Medical record & emergency info updated!');
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrText.trim()) return;
    const newA = {
      id: Date.now().toString(),
      label: newAddrLabel,
      address: newAddrText.trim(),
      isDefault: addresses.length === 0
    };
    setAddresses([...addresses, newA]);
    setNewAddrText('');
    showToast('New delivery address added!');
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter(a => a.id !== id));
    showToast('Address removed.');
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword('');
      showToast('Password updated successfully!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#F5F9FF] font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        
        {/* Toast Alert */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl font-black text-xs flex items-center gap-2"
            >
              <Check size={16} /> {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Sidebar */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-lg space-y-6">
            
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
                {name ? name[0].toUpperCase() : 'U'}
              </div>
              <div className="space-y-0.5">
                <h2 className="text-lg font-black text-slate-900">{name || 'Patient User'}</h2>
                <p className="text-xs text-slate-500 font-medium">{email || 'Authenticated Account'}</p>
                <span className="inline-block text-[10px] font-black uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 mt-1">
                  {userProfile?.role === 'pharmacy' ? 'Chemist Partner' : 'Verified Patient'}
                </span>
              </div>
            </div>

            {/* Nav Tabs */}
            <nav className="space-y-1.5 text-xs font-bold">
              {[
                { id: 'account', label: 'Account & Profile', icon: User },
                { id: 'medical', label: 'Emergency Health ID', icon: Heart },
                { id: 'addresses', label: 'Delivery Addresses', icon: MapPin },
                { id: 'orders', label: 'Prescription Orders', icon: ShoppingBag },
                { id: 'security', label: 'Security & Password', icon: Shield }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 transition-colors cursor-pointer pt-4 mt-2 border-t border-slate-100"
              >
                <LogOut size={16} />
                <span>Log Out of Session</span>
              </button>
            </nav>

          </div>

          {/* Right Content Panel */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-lg">
            
            {/* 1. Account Details */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Personal Information</h3>
                  <p className="text-xs text-slate-500 font-medium">Update your account name and registered contact number.</p>
                </div>

                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1.5">Phone Number</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1.5">Registered Email</label>
                    <input
                      type="email"
                      disabled
                      value={email}
                      className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl font-bold text-xs text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-all"
                  >
                    {loading ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* 2. Medical Health ID */}
            {activeTab === 'medical' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Emergency Health Card</h3>
                    <p className="text-xs text-slate-500 font-medium">Critical vitals and drug allergies shared during 1-Tap SOS dispatch.</p>
                  </div>
                  <span className="text-xs font-black bg-red-100 text-red-700 px-3 py-1 rounded-full">
                    SOS Active
                  </span>
                </div>

                <form onSubmit={handleMedicalSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1.5">Blood Group</label>
                      <select
                        value={medicalProfile.bloodGroup}
                        onChange={(e) => setMedicalProfile({ ...medicalProfile, bloodGroup: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs cursor-pointer"
                      >
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-700 mb-1.5">Emergency SOS Contact Phone</label>
                      <input
                        type="tel"
                        value={medicalProfile.emergencyContact}
                        onChange={(e) => setMedicalProfile({ ...medicalProfile, emergencyContact: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1.5">Known Drug Allergies</label>
                    <input
                      type="text"
                      value={medicalProfile.allergies}
                      onChange={(e) => setMedicalProfile({ ...medicalProfile, allergies: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
                      placeholder="e.g. Penicillin, Sulfa, Aspirin"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1.5">Active Routine Medicines</label>
                    <input
                      type="text"
                      value={medicalProfile.medications}
                      onChange={(e) => setMedicalProfile({ ...medicalProfile, medications: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs"
                      placeholder="e.g. Lantus Insulin 10IU, Telma 40"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-all"
                  >
                    Save Health Card
                  </button>
                </form>
              </div>
            )}

            {/* 3. Addresses */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Delivery Addresses</h3>
                  <p className="text-xs text-slate-500 font-medium">Hyper-local doorstep fulfillment locations for instant prescription dispatch.</p>
                </div>

                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900">{addr.label}</span>
                          {addr.isDefault && (
                            <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Default</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 font-medium">{addr.address}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                        title="Delete address"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new address */}
                <form onSubmit={handleAddAddress} className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Add New Address</h4>
                  <div className="flex gap-2">
                    <select
                      value={newAddrLabel}
                      onChange={(e) => setNewAddrLabel(e.target.value)}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    >
                      <option value="Home">Home</option>
                      <option value="Office">Office</option>
                      <option value="Family / Relative">Family</option>
                    </select>
                    <input
                      type="text"
                      required
                      value={newAddrText}
                      onChange={(e) => setNewAddrText(e.target.value)}
                      placeholder="Enter house no, street, landmark, city"
                      className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                    <button
                      type="submit"
                      className="px-5 py-3 bg-blue-600 text-white font-black text-xs rounded-xl shadow-sm cursor-pointer"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 4. Orders */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Recent Dispatches</h3>
                    <p className="text-xs text-slate-500 font-medium">Real-time tracking of hyper-local multi-pharmacy deliveries.</p>
                  </div>
                  <Link href="/patient">
                    <button className="px-4 py-2 bg-blue-600 text-white text-xs font-black rounded-xl shadow-xs cursor-pointer">
                      + New Order
                    </button>
                  </Link>
                </div>

                <div className="space-y-3">
                  {[
                    { id: 'MR-9842', date: 'Today, 2:15 PM', items: 'Lantus Insulin, Telma 40', status: 'Delivered (18 mins)', price: '₹438' },
                    { id: 'MR-8911', date: 'Yesterday', items: 'Ciprofloxacin 500mg PMBJP', status: 'Delivered (14 mins)', price: '₹18' }
                  ].map((ord) => (
                    <div key={ord.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-900">Order #{ord.id}</span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                            {ord.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">{ord.items}</p>
                        <span className="text-[10px] text-slate-400">{ord.date}</span>
                      </div>
                      <div className="text-right font-black text-sm text-slate-900">
                        {ord.price}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Security */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Security & Authentication</h3>
                  <p className="text-xs text-slate-500 font-medium">Change your password or manage active session tokens.</p>
                </div>

                <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1.5">New Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-all"
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}

          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
