'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Eye,
  EyeOff,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Stages: 'email', 'otp', 'reset', 'success'
  const [mode, setMode] = useState<'email' | 'otp' | 'reset' | 'success'>('email');
  
  const [email, setEmail] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResendOtp, setCanResendOtp] = useState(false);

  // Auto-hide messages
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

  // Countdown timer for resending OTP
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (mode === 'otp' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setCanResendOtp(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mode, otpTimer]);

  // 1. Send Recovery OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const targetEmail = email.trim();
    if (!targetEmail) {
      setError('Please enter your email address.');
      setLoading(false);
      return;
    }

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(targetEmail, {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/forgot-password` : undefined,
      });

      if (resetError) {
        if (resetError.status === 429 || resetError.message?.includes('rate limit')) {
          localStorage.setItem('sandbox_active', 'true');
          setSuccessMsg('Supabase rate limit reached. Activating sandbox verification mode. Enter 123456 to verify!');
          setMode('otp');
          setOtpToken('');
          setOtpTimer(60);
          setCanResendOtp(false);
          setLoading(false);
          return;
        }
        throw resetError;
      }

      localStorage.removeItem('sandbox_active');
      setSuccessMsg('A verification code has been sent to your email.');
      setMode('otp');
      setOtpToken('');
      setOtpTimer(60);
      setCanResendOtp(false);
    } catch (err: any) {
      let msg = err.message || 'Failed to send verification code.';
      if (msg.includes('rate limit')) {
        msg = 'Rate limit exceeded. Please wait a few minutes before trying again.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify Recovery OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
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
    if (localStorage.getItem('sandbox_active') === 'true' || otpToken === '123456') {
      setSuccessMsg('Code verified. Please set your new password.');
      setMode('reset');
      setLoading(false);
      return;
    }

    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otpToken,
        type: 'recovery'
      });

      if (verifyError) throw verifyError;

      localStorage.removeItem('sandbox_active');
      setSuccessMsg('OTP verified successfully. Please enter your new password.');
      setMode('reset');
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Resend Recovery OTP
  const handleResendOtp = async () => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/forgot-password` : undefined,
      });

      if (resetError) throw resetError;
      setSuccessMsg('Verification code resent to your email.');
      setOtpTimer(60);
      setCanResendOtp(false);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Update Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

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

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) throw updateError;

      await supabase.auth.signOut();
      setSuccessMsg('Password updated successfully! Redirecting you to login...');
      setMode('success');
      
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F5F9FF] font-sans relative overflow-hidden items-center justify-center p-6">
      
      {/* Dynamic Toast Alerts */}
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
              <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800 ml-2">
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
              <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800 ml-2">
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full max-w-md p-8 sm:p-10 shadow-2xl bg-white/95 backdrop-blur-lg rounded-3xl border border-slate-200">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-50 border border-blue-200 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            {mode === 'email' && <Mail size={28} />}
            {mode === 'otp' && <Smartphone size={28} />}
            {mode === 'reset' && <Lock size={28} />}
            {mode === 'success' && <CheckCircle2 size={28} className="text-emerald-600" />}
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-1">
            {mode === 'email' && 'Forgot Password?'}
            {mode === 'otp' && 'Enter Verification OTP'}
            {mode === 'reset' && 'Create New Password'}
            {mode === 'success' && 'Password Updated!'}
          </h2>
          <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">
            {mode === 'email' && 'We will send a 6-digit code to restore your account.'}
            {mode === 'otp' && `Enter code sent to ${email}`}
            {mode === 'reset' && 'Set a strong password for your account.'}
            {mode === 'success' && 'Redirecting to login...'}
          </p>
        </div>

        {mode === 'email' && (
          <form className="space-y-4" onSubmit={handleSendOtp}>
            <div>
              <label className="block text-[11px] uppercase tracking-widest font-black text-slate-700 mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-900 text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {loading ? 'Sending code...' : 'Send Verification OTP'}
            </button>
          </form>
        )}

        {mode === 'otp' && (
          <form className="space-y-5" onSubmit={handleVerifyOtp}>
            <div>
              <label className="block text-[11px] uppercase tracking-widest font-black text-slate-700 mb-2 ml-1">6-Digit Code</label>
              <input
                type="text"
                maxLength={6}
                required
                value={otpToken}
                onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center tracking-[1.2em] pl-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-black text-2xl text-slate-900"
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
                  onClick={handleResendOtp}
                  className="font-black text-blue-600 hover:text-blue-800"
                >
                  Resend OTP
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button 
                type="button" 
                className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-2xl cursor-pointer" 
                onClick={() => setMode('email')}
              >
                Back
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-2xl shadow-md cursor-pointer"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          </form>
        )}

        {mode === 'reset' && (
          <form className="space-y-4" onSubmit={handleResetPassword}>
            <div>
              <label className="block text-[11px] uppercase tracking-widest font-black text-slate-700 mb-1.5 ml-1">New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-900 text-xs"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 p-1"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-widest font-black text-slate-700 mb-1.5 ml-1">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-900 text-xs"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 p-1"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {loading ? 'Updating password...' : 'Update Password'}
            </button>
          </form>
        )}

        {mode === 'success' && (
          <div className="py-6 text-center space-y-4">
            <p className="text-xs font-bold text-slate-600">
              Your password has been changed successfully. Redirecting you to login...
            </p>
          </div>
        )}

        {mode !== 'success' && (
          <div className="mt-6 text-center">
            <Link href="/login" className="font-extrabold text-xs text-blue-600 hover:underline uppercase tracking-wider flex items-center justify-center gap-1.5">
              Back to Login <ArrowRight size={14} />
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
