'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  X,
  Snowflake,
  Pill,
  MapPin,
  Clock,
  AlertTriangle,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderData {
  id: string;
  patient_name: string;
  area: string;
  city: string;
  is_cold_chain: boolean;
  cold_chain_reason: string;
  schedule_h_warning?: boolean;
  medicines: any[];
  total_amount: number;
  status: string;
  pack_type: string;
  created_at: number;
  doctor_reg?: string;
}

// ─── Inner content component (uses useSearchParams — must be inside Suspense) ─

function OrderStatusContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const token = searchParams.get('token');

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [finalStatus, setFinalStatus] = useState<'ACCEPTED' | 'REJECTED' | null>(null);

  useEffect(() => {
    if (!orderId) {
      setFetchError('No order ID found in this link. Make sure you tapped the full link from the WhatsApp message.');
      setLoading(false);
      return;
    }

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/order-action?orderId=${encodeURIComponent(orderId!)}`);
        const data = await res.json();
        if (!res.ok) {
          setFetchError(data.error || 'Failed to load the order. It may have expired.');
        } else {
          setOrder(data);
          if (data.status === 'ACCEPTED') setFinalStatus('ACCEPTED');
          if (data.status === 'REJECTED') setFinalStatus('REJECTED');
        }
      } catch {
        setFetchError('Network error. Could not reach the MediRush server. Check your internet connection.');
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  const handleAction = async (action: 'ACCEPT' | 'REJECT') => {
    if (!orderId || !token) {
      setActionError('Missing order ID or token. Please use the original link from WhatsApp.');
      return;
    }
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await fetch('/api/order-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, token, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || 'Action failed. Please try again.');
      } else {
        setFinalStatus(action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED');
        setOrder((prev) => (prev ? { ...prev, status: action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED' } : prev));
      }
    } catch {
      setActionError('Network error. Please check your connection and try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  // ── Fetch error ──────────────────────────────────────────────────────────────
  if (fetchError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 border border-red-200 shadow-md max-w-md w-full">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <h2 className="font-bold text-slate-900">Could Not Load Order</h2>
          </div>
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3 leading-relaxed">
            {fetchError}
          </p>
          <p className="text-xs text-slate-400 mt-3">
            Order ID: {orderId || '(not provided)'}
          </p>
        </div>
      </div>
    );
  }

  // ── Already finalized before this page loaded ────────────────────────────────
  if (order && !finalStatus && (order.status === 'ACCEPTED' || order.status === 'REJECTED')) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md max-w-md w-full text-center">
          <h2 className="font-bold text-slate-900 text-lg mb-2">
            Order Already {order.status}
          </h2>
          <p className="text-sm text-slate-500">
            Order #{orderId} was already processed. No further action needed.
          </p>
        </div>
      </div>
    );
  }

  // ── Accepted confirmation ────────────────────────────────────────────────────
  if (finalStatus === 'ACCEPTED') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 border-2 border-emerald-500 shadow-lg max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9 text-emerald-600" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-1">Order Accepted! ✅</h2>
          <p className="text-sm text-slate-500 mb-4 font-mono">#{orderId}</p>

          {order?.is_cold_chain && (
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 flex items-center gap-2 text-left mb-4">
              <Snowflake className="w-4 h-4 text-sky-600 shrink-0" />
              <p className="text-xs text-sky-800 font-semibold">
                Cold chain required. Package with 2°C–8°C ice gel pouch before dispatch.
              </p>
            </div>
          )}

          <p className="text-xs text-slate-500 leading-relaxed">
            The patient has been notified. Please prepare and dispatch this order promptly.
          </p>
        </div>
      </div>
    );
  }

  // ── Rejected confirmation ────────────────────────────────────────────────────
  if (finalStatus === 'REJECTED') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-md max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <X className="w-9 h-9 text-red-500" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-1">Order Rejected</h2>
          <p className="text-sm text-slate-500">Order #{orderId} has been marked as rejected.</p>
        </div>
      </div>
    );
  }

  // ── Main: Order detail + action buttons ─────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 p-4 flex flex-col items-center justify-start pt-8 pb-12">
      <div className="max-w-md w-full space-y-4">

        {/* Header */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-emerald-600/25">
            M
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 text-base leading-tight">MediRush — New Order</h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">#{orderId}</p>
          </div>
        </div>

        {order && (
          <>
            {/* Doctor & Schedule H */}
            {(order.doctor_reg || order.schedule_h_warning) && (
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  {order.doctor_reg && (
                    <p className="text-xs font-bold text-slate-800">{order.doctor_reg}</p>
                  )}
                  {order.schedule_h_warning && (
                    <p className="text-[11px] text-amber-700 font-medium mt-0.5">
                      ⚠️ Schedule H medicine — valid prescription required
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Delivery Location */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-800">Delivery Location</h3>
              </div>
              <p className="text-sm text-slate-700 font-medium">
                {order.area}, {order.city}
              </p>
            </div>

            {/* Cold Chain Warning */}
            {order.is_cold_chain && (
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex items-start gap-3">
                <Snowflake className="w-5 h-5 text-sky-600 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <p className="text-sm font-bold text-sky-900">⚠️ Cold Chain Required</p>
                  <p className="text-xs text-sky-700 mt-0.5 leading-relaxed">
                    {order.cold_chain_reason || 'Temperature-sensitive medicines. Maintain 2°C–8°C with insulated pouch.'}
                  </p>
                </div>
              </div>
            )}

            {/* Medicine List */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Pill className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  Required Medicines ({order.medicines.length})
                </h3>
              </div>
              <div className="space-y-2">
                {order.medicines.map((med: any, i: number) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-900">{med.brand_name}</p>
                          {med.is_cold_chain && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 bg-sky-100 text-sky-800 border border-sky-200 rounded">
                              2-8°C
                            </span>
                          )}
                        </div>
                        {med.chemical_salt && (
                          <p className="text-[11px] text-indigo-600 font-mono mt-0.5">{med.chemical_salt}</p>
                        )}
                        {med.dosage && (
                          <p className="text-[10px] text-slate-500 mt-0.5">{med.dosage}</p>
                        )}
                        {med.generic_substitute && (
                          <p className="text-[10px] text-emerald-700 font-medium mt-1">
                            → {med.generic_substitute}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-emerald-700 font-mono">
                          ₹{med.generic_price_inr ?? med.generic_price ?? '—'}
                        </p>
                        {(med.brand_price_inr ?? med.brand_price) ? (
                          <p className="text-[10px] text-slate-400 line-through font-mono">
                            ₹{med.brand_price_inr ?? med.brand_price}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payout + Timestamp */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Chemist Payout</p>
                <p className="text-2xl font-black text-slate-900 font-mono">₹{order.total_amount}</p>
                <p className="text-[10px] text-slate-400">Collect at delivery</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {new Date(order.created_at).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            {/* Action Error */}
            {actionError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 leading-relaxed">{actionError}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                id="reject-order-btn"
                onClick={() => handleAction('REJECT')}
                disabled={actionLoading}
                className="flex items-center justify-center gap-2 py-4 px-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-700 font-bold text-sm hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <X className="w-4 h-4 text-red-500" />
                )}
                Reject
              </button>
              <button
                id="accept-order-btn"
                onClick={() => handleAction('ACCEPT')}
                disabled={actionLoading}
                className="flex items-center justify-center gap-2 py-4 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Accept Order
              </button>
            </div>

            <p className="text-center text-[11px] text-slate-400 pb-2">
              By accepting, you confirm you can dispatch this order within 30 minutes.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Page Export (with Suspense boundary for useSearchParams) ─────────────────

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
    </div>
  );
}

export default function OrderStatusPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OrderStatusContent />
    </Suspense>
  );
}
