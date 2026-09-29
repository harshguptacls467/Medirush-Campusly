'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { Activity, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { checkAndCreateProfile } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (data?.session?.user) {
          await checkAndCreateProfile(data.session.user);
          const role = data.session.user.user_metadata?.role || 'user';
          if (role === 'pharmacy') {
            router.push('/chemist');
          } else {
            router.push('/patient');
          }
        } else {
          // If no session found yet, wait for hash exchange
          const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
              await checkAndCreateProfile(session.user);
              const role = session.user.user_metadata?.role || 'user';
              if (role === 'pharmacy') {
                router.push('/chemist');
              } else {
                router.push('/patient');
              }
            }
          });
          return () => {
            authListener.subscription.unsubscribe();
          };
        }
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Authentication failed. Please try logging in again.');
      }
    };

    handleAuthCallback();
  }, [router, checkAndCreateProfile]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F9FF] p-6 font-sans">
      <div className="max-w-md w-full p-8 bg-white border border-slate-200 rounded-3xl shadow-xl text-center space-y-4">
        {error ? (
          <>
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-900">Authentication Error</h2>
            <p className="text-xs text-slate-500 font-medium">{error}</p>
            <button
              onClick={() => router.push('/login')}
              className="mt-4 px-6 py-3 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
            >
              Return to Login
            </button>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto animate-pulse">
              <Activity size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-900">Verifying Credentials...</h2>
            <p className="text-xs text-slate-500 font-medium">Connecting securely to MediRush cloud network.</p>
          </>
        )}
      </div>
    </div>
  );
}
