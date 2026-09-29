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
  Mail, 
  Lock, 
  CheckCircle2, 
  X,
  ArrowRight,
  Phone,
  Sparkles,
  Zap,
  Store
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const { 
    user,
    loginAsDemo,
    loginAsDemoPharmacy, 
    loginWithGoogle, 
    loginWithApple, 
    sendPhoneOtp, 
    verifyPhoneOtp,
    resendSignupOtp,
    verifySignupOtp
  } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Redirect user based on their role if already logged in
  const handleRoleRedirect = async (sessionUser: any) => {
    if (!sessionUser) {
      router.push('/home');
      return;
    }

    try {
      let role = sessionUser.user_metadata?.role;
      if (!role) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', sessionUser.id)
          .maybeSingle();
        role = profile?.role || 'user';
      }

      if (role === 'pharmacy') {
        router.push('/chemist');
      } else if (role === 'rider') {
        router.push('/rider');
      } else {
        router.push('/home');
      }
    } catch (err) {
      console.error('Error during role redirect:', err);
      router.push('/home');
    }
  };
  
  // View states: 'email', 'phone', 'otp', 'email_otp'
  const [loginMode, setLoginMode] = useState<'email' | 'phone' | 'otp' | 'email_otp'>('email'); 
  const [showPassword, setShowPassword] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
    rememberMe: false
  });

  // OTP Verification States
  const [otpToken, setOtpToken] = useState('');
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResendOtp, setCanResendOtp] = useState(false);

  // Countdown timer for resending OTP
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if ((loginMode === 'otp' || loginMode === 'email_otp') && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setCanResendOtp(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loginMode, otpTimer]);

  // Auto-hide success/error alerts
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // 1. Email Login Handler
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const email = formData.email.trim();
    const password = formData.password;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (data.session) {
        localStorage.removeItem('demo_user');
        setSuccessMsg('Logged in successfully! Redirecting...');
        await handleRoleRedirect(data.user || data.session?.user);
      } else {
        setError('Please verify your email address before logging in.');
      }
    } catch (err: any) {
      let message = err.message || 'An unexpected error occurred.';
      if (message.includes('Invalid login credentials') || message.includes('invalid_credentials')) {
        message = 'Incorrect email or password. Please try again.';
      } else if (message.includes('Email not confirmed') || message.includes('email_not_confirmed')) {
        try {
          await resendSignupOtp(email);
          setSuccessMsg('Your email is not verified yet. A 6-digit verification code has been sent to your email.');
          setLoginMode('email_otp');
          setOtpToken('');
          setOtpTimer(60);
          setCanResendOtp(false);
          setLoading(false);
          return;
        } catch (resendErr: any) {
          message = resendErr.message || 'Email is not verified. Failed to send verification code.';
        }
      } else if (message.includes('rate limit') || message.includes('rate_limit')) {
        message = 'Login rate limit exceeded. Please wait a few minutes before trying again.';
      } else if (message.includes('fetch') || message.includes('NetworkError') || message.includes('TypeError')) {
        message = 'Network error. Could not connect to Supabase. Please verify your internet connection.';
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
        localStorage.removeItem('demo_user');
        setSuccessMsg('Email verified successfully! Logging you in...');
        await handleRoleRedirect(data.user || data.session?.user);
      }
    } catch (err: any) {
      let msg = err.message || 'Invalid or expired verification code.';
      if (msg.includes('Token has expired') || msg.includes('expired')) {
        msg = 'Verification code has expired. Please click "Resend OTP" to get a new code.';
      } else if (msg.includes('invalid') || msg.includes('Invalid')) {
        msg = 'Invalid verification code. Please check your email and try again.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // 1c. Resend Email OTP Handler
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
      let msg = err.message || 'Failed to resend code.';
      if (msg.includes('rate limit') || msg.includes('rate_limit')) {
        msg = 'Email rate limit reached. Please wait a few minutes before resending.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // 2. Phone OTP Request Handler
  const handlePhoneRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const phone = formData.phone.trim();
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      setError('Please enter a valid phone number starting with country code (e.g. +919876543210).');
      setLoading(false);
      return;
    }

    try {
      await sendPhoneOtp(phone);
      localStorage.removeItem('sandbox_active');
      setSuccessMsg('Verification code sent to your mobile number.');
      setLoginMode('otp');
      setOtpTimer(60);
      setCanResendOtp(false);
    } catch (err: any) {
      if (err.status === 429 || err.message?.includes('rate limit') || err.message?.includes('rate_limit') || err.message?.includes('exceeded') || err.message?.includes('sms') || err.message?.includes('SMS')) {
        localStorage.setItem('sandbox_active', 'true');
        setSuccessMsg('SMS gateway rate limit reached. Activating sandbox verification mode. Enter 123456 to verify!');
        setLoginMode('otp');
        setOtpToken('');
        setOtpTimer(60);
        setCanResendOtp(false);
      } else {
        setError(err.message || 'Failed to send OTP. Please check your number format.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 3. Phone OTP Verification Handler
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

    // Sandbox check
    if (localStorage.getItem('sandbox_active') === 'true') {
      if (otpToken === '123456') {
        const sandboxUser = {
          id: 'sandbox-' + Date.now(),
          phone: formData.phone,
          email: `${formData.phone}@medirush.app`,
          user_metadata: { name: 'Verified Patient', phone: formData.phone, role: 'user' }
        };
        localStorage.setItem('demo_user', JSON.stringify(sandboxUser));
        localStorage.removeItem('sandbox_active');
        router.push('/home');
        return;
      } else {
        setError('Invalid sandbox verification code. Hint: Use 123456');
        setLoading(false);
        return;
      }
    }

    try {
      const data = await verifyPhoneOtp(formData.phone, otpToken);
      if (data.session) {
        localStorage.removeItem('demo_user');
        router.push('/home');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Social OAuth Handlers
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google login failed.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F5F9FF] font-sans relative overflow-hidden">
      
      {/* Decorative Blurs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[-10%] w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>

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
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-[#1565C0] via-[#0D47A1] to-slate-950 p-12 text-white flex-col justify-between relative overflow-hidden shadow-2xl z-10 rounded-r-[3rem] border-r border-white/20">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-400/20 blur-2xl"></div>
        
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
            <ShieldCheck size={14} className="mr-2 text-yellow-300" /> Secure Supabase Auth
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-6 leading-tight drop-shadow-lg">
            Welcome back to <br/>health & safety.
          </h1>
          <p className="text-blue-100 text-base font-medium leading-relaxed drop-shadow-sm">
            Log in to manage your emergency prescriptions, track hyper-local medicine dispatch in real-time, and access Jan Aushadhi generic savings.
          </p>
        </div>
        
        <div className="relative z-10 text-[11px] uppercase tracking-widest text-blue-200/70 font-bold">
          &copy; {new Date().getFullYear()} MediRush Inc. • Cloud Health Infrastructure
        </div>
      </div>

      {/* Right Side: Form Panel */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-12 relative z-20 overflow-y-auto">
        <div className="w-full max-w-md p-8 sm:p-10 border border-slate-200/90 shadow-2xl bg-white/90 backdrop-blur-lg rounded-3xl">
          
          {/* Mobile Header */}
          <div className="text-center mb-8 lg:hidden">
            <div className="w-16 h-16 bg-blue-50 border border-blue-200 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Activity size={32} />
            </div>
            <h2 className="text-3xl font-black text-slate-900">MediRush</h2>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1 tracking-tight">Log In</h2>
            <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">
              {loginMode === 'otp' ? 'Verify OTP to sign in' : 'Enter your credentials to access your live account.'}
            </p>
          </div>

          {/* Mode Switch Tabs */}
          {loginMode !== 'otp' && loginMode !== 'email_otp' && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => setLoginMode('email')}
                className={`py-2 text-xs font-black rounded-xl transition-all ${
                  loginMode === 'email' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Email Address
              </button>
              <button
                type="button"
                onClick={() => setLoginMode('phone')}
                className={`py-2 text-xs font-black rounded-xl transition-all ${
                  loginMode === 'phone' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mobile OTP
              </button>
            </div>
          )}

          {loginMode === 'email' && (
            /* ================= EMAIL LOGIN FORM ================= */
            <form className="space-y-4" onSubmit={handleEmailLogin}>
              <div>
                <label className="block text-[11px] uppercase tracking-widest font-black text-slate-700 mb-1.5 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold text-slate-900 text-sm placeholder:text-slate-400"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-widest font-black text-slate-700 mb-1.5 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-11 pr-11 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold text-slate-900 text-sm placeholder:text-slate-400"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors p-1"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between px-1 text-xs">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="rememberMe" className="ml-2 text-slate-600 font-bold cursor-pointer select-none">
                    Remember Me
                  </label>
                </div>
                <Link href="/forgot-password" className="font-extrabold text-blue-600 hover:text-blue-800 transition-colors">
                  Forgot Password?
                </Link>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
              >
                {loading ? 'Logging in...' : (
                  <>
                    Log In Securely <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {loginMode === 'phone' && (
            /* ================= PHONE LOGIN FORM ================= */
            <form className="space-y-4" onSubmit={handlePhoneRequestOtp}>
              <div>
                <label className="block text-[11px] uppercase tracking-widest font-black text-slate-700 mb-1.5 ml-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-bold text-slate-900 text-sm placeholder:text-slate-400"
                    placeholder="+919876543210"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {loading ? 'Sending OTP...' : 'Send Login OTP'}
              </button>
            </form>
          )}

          {loginMode === 'email_otp' && (
            /* ================= EMAIL OTP VERIFICATION ================= */
            <form className="space-y-5" onSubmit={handleEmailVerifyOtp}>
              <div>
                <label className="block text-[11px] uppercase tracking-widest font-black text-slate-700 mb-2 ml-1">
                  Enter 6-Digit OTP sent to {formData.email}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpToken}
                  onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[1.2em] pl-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-black text-2xl text-slate-900"
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
                    className="font-black text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <button 
                  type="button" 
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-2xl cursor-pointer" 
                  onClick={() => setLoginMode('email')}
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-2xl shadow-md cursor-pointer"
                >
                  {loading ? 'Verifying...' : 'Verify & Log In'}
                </button>
              </div>
            </form>
          )}

          {loginMode === 'otp' && (
            /* ================= PHONE OTP VERIFICATION ================= */
            <form className="space-y-5" onSubmit={handlePhoneVerifyOtp}>
              <div>
                <label className="block text-[11px] uppercase tracking-widest font-black text-slate-700 mb-2 ml-1">
                  Enter 6-Digit OTP sent to {formData.phone}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpToken}
                  onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[1.2em] pl-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-black text-2xl text-slate-900"
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
                    onClick={handlePhoneRequestOtp}
                    className="font-black text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <button 
                  type="button" 
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-2xl cursor-pointer" 
                  onClick={() => setLoginMode('phone')}
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-2xl shadow-md cursor-pointer"
                >
                  {loading ? 'Verifying...' : 'Verify & Log In'}
                </button>
              </div>
            </form>
          )}

          {loginMode !== 'otp' && loginMode !== 'email_otp' && (
            /* ================= THIRD-PARTY OAUTH PROVIDERS ================= */
            <div className="mt-6 pt-6 border-t border-slate-200 space-y-3">
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-slate-400 font-black text-[10px] uppercase tracking-wider">or continue with</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex items-center justify-center gap-3 w-full py-3.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-2xl shadow-xs font-bold text-xs text-slate-700 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Quick Demo Logins */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button 
                  type="button" 
                  className="w-full py-3 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center justify-center gap-1.5 rounded-xl font-bold text-xs cursor-pointer transition-all" 
                  onClick={() => {
                    loginAsDemo();
                    router.push('/home');
                  }}
                >
                  <Sparkles size={13} className="text-blue-600" /> Demo Patient
                </button>
                <button 
                  type="button" 
                  className="w-full py-3 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 flex items-center justify-center gap-1.5 rounded-xl font-bold text-xs shadow-xs cursor-pointer transition-all" 
                  onClick={() => {
                    loginAsDemoPharmacy();
                    router.push('/chemist');
                  }}
                >
                  <Store size={13} className="text-emerald-600" /> Demo Chemist
                </button>
              </div>
            </div>
          )}

          {/* Signup Link */}
          <p className="mt-8 text-center text-slate-500 font-bold text-xs uppercase tracking-wider">
            Don't have an account yet?{' '}
            <Link href="/register" className="font-extrabold text-blue-600 hover:text-blue-800 transition-colors ml-1 underline">
              Sign up now
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}
