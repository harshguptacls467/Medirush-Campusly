'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { pharmacyService } from '@/lib/services/pharmacyService';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string | null;
  role?: string;
  verified?: boolean;
}

interface PharmacyProfile {
  id: string;
  owner_id: string;
  pharmacy_name: string;
  license_number: string;
  phone?: string;
  email?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  verification_status?: string;
  verified?: boolean;
  is_open?: boolean;
}

interface AuthContextType {
  user: any;
  userProfile: UserProfile | null;
  pharmacyProfile: PharmacyProfile | null;
  loading: boolean;
  loginAsDemo: () => void;
  loginAsDemoPharmacy: () => void;
  loginAsDemoRider: () => void;
  logout: () => Promise<void>;
  logoutAllDevices: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithApple: () => Promise<void>;
  sendPhoneOtp: (phone: string) => Promise<any>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<any>;
  resendSignupOtp: (email: string) => Promise<void>;
  verifySignupOtp: (email: string, token: string) => Promise<any>;
  checkAndCreateProfile: (sessionUser: any) => Promise<void>;
  fetchPharmacyProfile: (ownerId: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [pharmacyProfile, setPharmacyProfile] = useState<PharmacyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load associated pharmacy record if role is pharmacy
  const fetchPharmacyProfile = async (ownerId: string) => {
    if (!ownerId) return null;
    try {
      const { data } = await pharmacyService.getPharmacyProfileByOwner(ownerId);
      if (data) {
        setPharmacyProfile(data);
      } else {
        setPharmacyProfile(null);
      }
      return data;
    } catch {
      setPharmacyProfile(null);
      return null;
    }
  };

  // Self-healing database profile synchronization
  const checkAndCreateProfile = async (sessionUser: any) => {
    if (!sessionUser) {
      setUserProfile(null);
      setPharmacyProfile(null);
      return;
    }
    try {
      // Check if profile exists in 'users' table
      const { data: existingProfile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', sessionUser.id)
        .maybeSingle();

      if (fetchError) {
        console.warn('Notice fetching user profile from database:', fetchError.message);
      }

      let currentProfile = existingProfile;

      // If profile does not exist, insert it using auth metadata
      if (!existingProfile) {
        const metadata = sessionUser.user_metadata || {};
        const name = metadata.name || metadata.full_name || sessionUser.email?.split('@')[0] || 'MediRush User';
        const email = sessionUser.email || `${sessionUser.phone || sessionUser.id}@medirush.app`;
        const phone = sessionUser.phone || metadata.phone || '';
        const role = metadata.role || 'user';

        const { data: insertedProfile, error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: sessionUser.id,
              name,
              email,
              phone,
              role,
              verified: sessionUser.email_confirmed_at ? true : false
            }
          ])
          .select()
          .single();

        if (insertError) {
          console.warn('Fallback profile created locally:', insertError.message);
          currentProfile = {
            id: sessionUser.id,
            name,
            email,
            phone,
            role,
            verified: false
          };
        } else {
          currentProfile = insertedProfile;
        }
      }

      setUserProfile(currentProfile);

      // If user is a pharmacy partner, fetch their pharmacy profile
      if (currentProfile?.role === 'pharmacy' || sessionUser.user_metadata?.role === 'pharmacy') {
        await fetchPharmacyProfile(sessionUser.id);
      } else {
        setPharmacyProfile(null);
      }
    } catch (err) {
      console.warn('Profile sync fallback active:', err);
    }
  };

  const loginAsDemo = () => {
    const demoUser = { 
      id: 'demo-123', 
      email: 'customer.demo@medirush.app', 
      user_metadata: { name: 'Demo Customer (Harsh)', role: 'user' } 
    };
    const demoProf: UserProfile = { 
      id: 'demo-123', 
      name: 'Demo Customer (Harsh)', 
      email: 'customer.demo@medirush.app', 
      role: 'user', 
      verified: true 
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('demo_user', JSON.stringify(demoUser));
    }
    setUser(demoUser);
    setUserProfile(demoProf);
    setPharmacyProfile(null);
  };

  const loginAsDemoPharmacy = () => {
    const demoPharmUser = { 
      id: 'demo-pharmacy-123', 
      email: 'pharmacy@medirush.app', 
      user_metadata: { name: 'Apollo Pharmacy Admin', role: 'pharmacy' } 
    };
    const demoProf: UserProfile = { 
      id: 'demo-pharmacy-123', 
      name: 'Apollo Pharmacy Admin', 
      email: 'pharmacy@medirush.app', 
      role: 'pharmacy', 
      verified: true 
    };
    const demoPharm: PharmacyProfile = {
      id: 'pharmacy-demo-uuid-123',
      owner_id: 'demo-pharmacy-123',
      pharmacy_name: 'Gupta Medicos & Cold Chain Hub',
      license_number: 'DL-IND-2026-APOLLO99',
      phone: '+919340429618',
      email: 'pharmacy@medirush.app',
      address: 'Plot 42, Health Avenue, MG Road, Connaught Place, New Delhi',
      latitude: 28.6139,
      longitude: 77.2090,
      verification_status: 'approved',
      verified: true,
      is_open: true
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('demo_user', JSON.stringify(demoPharmUser));
    }
    setUser(demoPharmUser);
    setUserProfile(demoProf);
    setPharmacyProfile(demoPharm);
  };

  const loginAsDemoRider = () => {
    const demoRiderUser = { 
      id: 'demo-rider-123', 
      email: 'rider@medirush.app', 
      user_metadata: { name: 'Rahul Sharma (Rider)', role: 'rider' } 
    };
    const demoProf: UserProfile = { 
      id: 'demo-rider-123', 
      name: 'Rahul Sharma (Rider)', 
      email: 'rider@medirush.app', 
      role: 'rider', 
      verified: true 
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('demo_user', JSON.stringify(demoRiderUser));
    }
    setUser(demoRiderUser);
    setUserProfile(demoProf);
    setPharmacyProfile(null);
  };

  const logout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('demo_user');
      localStorage.removeItem('sandbox_active');
    }
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Signout note:', e);
    }
    setUser(null);
    setUserProfile(null);
    setPharmacyProfile(null);
  };

  const logoutAllDevices = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('demo_user');
      localStorage.removeItem('sandbox_active');
    }
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (e) {
      console.warn('Signout global note:', e);
    }
    setUser(null);
    setUserProfile(null);
    setPharmacyProfile(null);
  };

  const loginWithGoogle = async () => {
    if (typeof window === 'undefined') return;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) throw error;
  };

  const loginWithApple = async () => {
    if (typeof window === 'undefined') return;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) throw error;
  };

  const sendPhoneOtp = async (phone: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
    });
    if (error) throw error;
    return data;
  };

  const verifyPhoneOtp = async (phone: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });
    if (error) throw error;
    
    if (data.user) {
      await checkAndCreateProfile(data.user);
    }
    return data;
  };

  const resendSignupOtp = async (email: string) => {
    if (typeof window === 'undefined') return;
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) throw error;
  };

  const verifySignupOtp = async (email: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup'
    });
    if (error) throw error;
    
    if (data.user) {
      await checkAndCreateProfile(data.user);
    }
    return data;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedDemo = localStorage.getItem('demo_user');
    if (storedDemo) {
      try {
        const parsedDemo = JSON.parse(storedDemo);
        setUser(parsedDemo);
        
        const role = parsedDemo.user_metadata?.role || 'user';
        setUserProfile({
          id: parsedDemo.id,
          name: parsedDemo.user_metadata?.name || 'Demo User',
          email: parsedDemo.email,
          role: role,
          verified: true
        });

        if (role === 'pharmacy') {
          setPharmacyProfile({
            id: 'pharmacy-demo-uuid-123',
            owner_id: parsedDemo.id,
            pharmacy_name: 'Gupta Medicos & Cold Chain Hub',
            license_number: 'DL-IND-2026-APOLLO99',
            phone: '+919340429618',
            email: parsedDemo.email,
            address: 'Plot 42, Health Avenue, MG Road, Connaught Place, New Delhi',
            latitude: 28.6139,
            longitude: 77.2090,
            verification_status: 'approved',
            verified: true,
            is_open: true
          });
        }

        setLoading(false);
      } catch {
        localStorage.removeItem('demo_user');
      }
      return;
    }

    // Check for an active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        checkAndCreateProfile(session.user);
      } else {
        setUser(null);
        setUserProfile(null);
        setPharmacyProfile(null);
      }
      setLoading(false);
    });

    // Listen for auth events (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          checkAndCreateProfile(session.user);
        }
      } else if (event === 'SIGNED_OUT') {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('demo_user');
        }
        setUser(null);
        setUserProfile(null);
        setPharmacyProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user,
      userProfile,
      pharmacyProfile,
      loading, 
      loginAsDemo,
      loginAsDemoPharmacy,
      loginAsDemoRider,
      logout,
      logoutAllDevices,
      loginWithGoogle,
      loginWithApple,
      sendPhoneOtp,
      verifyPhoneOtp,
      resendSignupOtp,
      verifySignupOtp,
      checkAndCreateProfile,
      fetchPharmacyProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
