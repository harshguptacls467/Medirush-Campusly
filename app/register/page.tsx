'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Activity, 
  ShieldCheck, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  CheckCircle2, 
  X,
  ArrowRight,
  Store
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RegisterPage() {
  const router = useRouter();
  const { 
    loginWithGoogle, 
    sendPhoneOtp, 
    verifyPhoneOtp,
    resendSignupOtp,
    verifySignupOtp
  } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // View states: 'email', 'phone', 'otp', 'email_otp'
  const [signupMode, setSignupMode] = useState<'email' | 'phone' | 'otp' | 'email_otp'>('email'); 
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    agreeToTerms: false,
    agreeToPrivacy: false
  });

  // OTP Verification States
  const [otpToken, setOtpToken] = useState('');
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResendOtp, setCanResendOtp] = useState(false);

  // Helper to handle role-based navigation and pharmacy profile linking after registration
  const redirectAfterSignup = async (userId: string, role: string, name: string, email: string, phone: string) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sandbox_active');
      localStorage.removeItem('demo_user');
    }
    
    if (role === 'pharmacy') {
      try {
        await supabase.from('pharmacies').insert([
          {
            owner_id: userId,
            pharmacy_name: `${name}'s Pharmacy`,
            license_number: `DL-IND-${Date.now()}`,
            phone: phone || null,
            email: email,
            address: 'Address pending verification',
            verification_status: 'pending',
            verified: false,
            is_open: true
          }
        ]);
      } catch (pErr) {
        console.warn('Pharmacy profile notice:', pErr);
      }
      router.push('/chemist');
    } else {
      router.push('/patient');
    }
  };

  // Countdown timer for resending OTP
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if ((signupMode === 'otp' || signupMode === 'email_otp') && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setCanResendOtp(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [signupMode, otpTimer]);

  // Auto-hide alerts
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Password strength logic
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200', text: 'text-slate-400' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;

    if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500', text: 'text-red-500' };
    if (score <= 3) return { score, label: 'Medium', color: 'bg-amber-500', text: 'text-amber-500' };
    return { score, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-500' };
  };

  const strength = getPasswordStrength(formData.password);

  // 1. Email Sign Up Handler
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;
    const role = formData.role;

    if (!name || name.length < 2) {
      setError('Full Name must be at least 2 characters.');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (!formData.agreeToTerms || !formData.agreeToPrivacy) {
      setError('You must accept both the Terms & Conditions and the Privacy Policy.');
      setLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
          data: { name, phone, role }
        }
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        if (!authData.session) {
          setSuccessMsg('Account created! Please check your email for the 6-digit verification code.');
          setSignupMode('email_otp');
          setOtpToken('');
          setOtpTimer(60);
          setCanResendOtp(false);
        } else {
          await redirectAfterSignup(authData.user.id, role, name, email, phone);
        }
      }
    } catch (err: any) {
      let message = err.message || 'An unexpected error occurred.';
      if (
        message.includes('already registered') || 
        message.includes('already exists') || 
        message.includes('unique constraint') || 
        message.includes('duplicate key')
      ) {
        message = 'An account with this email already exists. Please log in.';
      } else if (message.includes('weak_password')) {
        message = 'Password is too weak. Please use at least 6 characters.';
      } else if (message.includes('rate limit')) {
        message = 'Supabase email rate limit reached. Please wait a few minutes before trying again.';
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // 1b. Real Email OTP Verification Handler
  const handleEmailVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const token = otpToken.trim();
    if (token.length < 6) {
      setError('Please enter the 6-digit verification code.');
      setLoading(false);
      return;
    }

    try {
      const data = await verifySignupOtp(formData.email, token);
      if (data.session || data.user) {
        const userId = data.user?.id || data.session?.user?.id;
        setSuccessMsg('Email verified successfully! Logging you in...');
        await redirectAfterSignup(userId, formData.role, formData.name, formData.email, formData.phone);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  // 1c. Resend Email OTP
  const handleResendEmailOtp = async () => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await resendSignupOtp(formData.email);
      setSuccessMsg('A new 6-digit verification code has been sent to your email.');
      setOtpTimer(60);
      setCanResendOtp(false);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Phone OTP Request
  const handlePhoneRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const name = formData.name.trim();
    const phone = formData.phone.trim();
    const role = formData.role;

    if (!name || name.length < 2) {
      setError('Full Name is required.');
      setLoading(false);
      return;
    }

    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      setError('Please enter a valid phone number starting with country code (e.g. +919876543210).');
      setLoading(false);
      return;
    }

    if (!formData.agreeToTerms || !formData.agreeToPrivacy) {
      setError('You must accept both the Terms & Conditions and the Privacy Policy.');
      setLoading(false);
      return;
    }

    try {
      await sendPhoneOtp(phone);
      localStorage.removeItem('sandbox_active');
      setSuccessMsg('Verification code sent to your mobile number.');
      setSignupMode('otp');
      setOtpTimer(60);
      setCanResendOtp(false);
    } catch (err: any) {
      if (err.status === 429 || err.message?.includes('rate limit') || err.message?.includes('sms') || err.message?.includes('SMS')) {
        localStorage.setItem('sandbox_active', 'true');
        setSuccessMsg('SMS rate limit reached. Activating sandbox verification mode. Enter 123456 to verify!');
        setSignupMode('otp');
        setOtpToken('');
        setOtpTimer(60);
        setCanResendOtp(false);
      } else {
        setError(err.message || 'Failed to send OTP.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 3. Phone OTP Verification
  const handlePhoneVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    if (otpToken.length < 6) {
      setError('Please enter the 6-digit verification code.');
      setLoading(false);
      return;
    }

    // Sandbox Fallback (123456)
    if (otpToken === '123456' || localStorage.getItem('sandbox_active') === 'true') {
      const demoId = 'user-' + Date.now();
      const sandboxUser = {
        id: demoId,
        phone: formData.phone,
        email: `${formData.phone}@medirush.app`,
        user_metadata: { name: formData.name, phone: formData.phone, role: formData.role }
      };
      localStorage.setItem('demo_user', JSON.stringify(sandboxUser));
      localStorage.removeItem('sandbox_active');
      
      try {
        await supabase.from('users').insert([
          {
            id: sandboxUser.id,
            name: formData.name,
            email: sandboxUser.email,
            phone: formData.phone,
            role: formData.role,
            verified: true
          }
        ]);
      } catch (dbErr) {
        console.warn('Sandbox profile insert notice:', dbErr);
      }

      await redirectAfterSignup(sandboxUser.id, formData.role, formData.name, `${formData.phone}@medirush.app`, formData.phone);
      setLoading(false);
      return;
    }

    try {
      const data = await verifyPhoneOtp(formData.phone, otpToken);
      if (data.session) {
        await supabase.from('users').insert([
          {
            id: data.user.id,
            name: formData.name,
            email: `${formData.phone}@medirush.app`,
            phone: formData.phone,
            role: formData.role,
            verified: true
          }
        ]);
        await redirectAfterSignup(data.user.id, formData.role, formData.name, `${formData.phone}@medirush.app`, formData.phone);
      }
    } catch (err: any) {
      setError('Verification code invalid or expired. Hint: Use 123456 in sandbox mode.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F5F9FF] font-sans relative overflow-hidden">
      
      {/* Decorative Blurs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-400/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[-10%] w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Floating Notifications (Toasts) */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full px-4">
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className="border border-emerald-300 p-4 shadow-xl flex items-start bg-emerald-50/95 backdrop-blur-md rounded-2xl relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>
              <CheckCircle2 className="text-emerald-600 mr-3 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <h4 className="font-extrabold text-emerald-800 text-xs uppercase tracking-wider mb-0.5">Success</h4>
                <p className="text-xs text-emerald-700 font-bold leading-relaxed">{successMsg}</p>
              </div>
              <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800 transition-colors ml-2 self-start">
                <X size={16} />
              </button>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className="border border-red-300 p-4 shadow-xl flex items-start bg-red-50/95 backdrop-blur-md rounded-2xl relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500"></div>
              <AlertCircle className="text-red-500 mr-3 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <h4 className="font-extrabold text-red-800 text-xs uppercase tracking-wider mb-0.5">Error</h4>
                <p className="text-xs text-red-700 font-bold leading-relaxed">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 transition-colors ml-2 self-start">
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Left Side: Brand Panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-950 p-12 text-white flex-col justify-between relative overflow-hidden shadow-2xl z-10 rounded-r-[3rem] border-r border-white/20">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-emerald-400/20 blur-2xl"></div>
        
        <div className="relative z-10 flex items-center">
          <Link href="/" className="flex items-center group cursor-pointer">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mr-4 group-hover:scale-105 transition-transform border border-white/30">
              <Activity className="text-white h-7 w-7 drop-shadow-md" />
            </div>
            <span className="text-3xl font-black tracking-tight drop-shadow-md">MediRush</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center bg-white/20 backdrop-blur-md border border-white/30 text-white text-[11px] uppercase tracking-widest font-black px-4 py-2 rounded-full mb-8">
            <ShieldCheck size={14} className="mr-2 text-yellow-300" /> Instant Network Registration
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-6 leading-tight drop-shadow-lg">
            Your lifeline in <br/>healthcare access.
          </h1>
          <p className="text-emerald-100 text-base font-medium leading-relaxed drop-shadow-sm">
            Create an account in seconds to ensure you and your family have immediate access to life-saving medicines with verified cold-chain protection.
          </p>
        </div>
        
        <div className="relative z-10 text-[11px] uppercase tracking-widest text-emerald-200/70 font-bold">
          &copy; {new Date().getFullYear()} MediRush Inc. • Cloud Health Infrastructure
        </div>
      </div>

      {/* Right Side: Form Panel */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-12 relative z-20 overflow-y-auto">
        <div className="w-full max-w-lg p-8 sm:p-10 border border-slate-200/90 shadow-2xl bg-white/90 backdrop-blur-lg rounded-3xl">
          
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1 tracking-tight">Create Account</h2>
            <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">
              {signupMode === 'otp' ? 'Verify OTP to complete registration' : 'Join MediRush for sub-10-min medicine access.'}
            </p>
          </div>

          {signupMode === 'email' && (
            /* ================= EMAIL REGISTRATION FORM ================= */
            <form className="space-y-4" onSubmit={handleEmailSignup}>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] uppercase tracking-widest font-black text-slate-700 mb-1.5 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-slate-900 text-xs"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-widest font-black text-slate-700 mb-1.5 ml-1">Mobile (Optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-slate-900 text-xs"
                      placeholder="+919876543210"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-widest font-black text-slate-700 mb-1.5 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-slate-900 text-xs"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] uppercase tracking-widest font-black text-slate-700 mb-1.5 ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-slate-900 text-xs"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-widest font-black text-slate-700 mb-1.5 ml-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-slate-900 text-xs"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {formData.password && (
                <div className="px-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500">Password Strength</span>
                    <span className={`text-[10px] uppercase tracking-wider font-extrabold ${strength.text}`}>{strength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                    <div className={`h-full flex-1 transition-all ${strength.score >= 1 ? strength.color : 'bg-slate-200'}`}></div>
                    <div className={`h-full flex-1 transition-all ${strength.score >= 3 ? strength.color : 'bg-slate-200'}`}></div>
                    <div className={`h-full flex-1 transition-all ${strength.score >= 5 ? strength.color : 'bg-slate-200'}`}></div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] uppercase tracking-widest font-black text-slate-700 mb-1.5 ml-1">Registering As</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-slate-900 text-xs cursor-pointer"
                >
                  <option value="user">Patient / Customer</option>
                  <option value="pharmacy">Pharmacy Partner / Chemist Merchant</option>
                </select>
              </div>

              <div className="space-y-2 px-1 text-xs">
                <div className="flex items-start">
                  <input
                    id="agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 mt-0.5 cursor-pointer"
                  />
                  <label htmlFor="agreeToTerms" className="ml-2 text-slate-600 font-bold select-none cursor-pointer">
                    I accept the Terms & Conditions and Safety Guidelines.
                  </label>
                </div>

                <div className="flex items-start">
                  <input
                    id="agreeToPrivacy"
                    name="agreeToPrivacy"
                    type="checkbox"
                    checked={formData.agreeToPrivacy}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 mt-0.5 cursor-pointer"
                  />
                  <label htmlFor="agreeToPrivacy" className="ml-2 text-slate-600 font-bold select-none cursor-pointer">
                    I accept the Medical Data Privacy Policy.
                  </label>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
              >
                {loading ? 'Creating account...' : (
                  <>
                    Create Free Account <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {signupMode === 'email_otp' && (
            /* ================= EMAIL OTP VERIFICATION ================= */
            <form className="space-y-5" onSubmit={handleEmailVerifyOtp}>
              <div>
                <label className="block text-[11px] uppercase tracking-widest font-black text-slate-700 mb-2 ml-1">
                  Enter 6-Digit Verification Code sent to {formData.email}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpToken}
                  onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[1.2em] pl-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-black text-2xl text-slate-900"
                  placeholder="000000"
                />
              </div>

              <div className="flex items-center justify-between px-1 text-xs">
                <span className="text-slate-500 font-bold">
                  {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Did not receive code?'}
                </span>
                {canResendOtp && (
                  <button
                    type="button"
                    onClick={handleResendEmailOtp}
                    className="font-black text-emerald-600 hover:text-emerald-800"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <button 
                  type="button" 
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-2xl cursor-pointer" 
                  onClick={() => setSignupMode('email')}
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-2xl shadow-md cursor-pointer"
                >
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </button>
              </div>
            </form>
          )}

          {/* Login Link */}
          <p className="mt-8 text-center text-slate-500 font-bold text-xs uppercase tracking-wider">
            Already have an account?{' '}
            <Link href="/login" className="font-extrabold text-emerald-600 hover:text-emerald-800 transition-colors ml-1 underline">
              Log in instead
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}
