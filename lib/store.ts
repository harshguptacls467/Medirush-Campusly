import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// ─── Shared Types ────────────────────────────────────────────────────────────

export interface MedicineItem {
  id?: string;
  brand_name: string;
  dosage: string;
  chemical_salt: string;
  generic_substitute: string;
  // Support both old field names (frontend) and new field names (Gemini)
  brand_price?: number;
  generic_price?: number;
  brand_price_inr?: number;
  generic_price_inr?: number;
  savings_percent: number;
  is_cold_chain: boolean;
  fractional_available?: boolean;
  fractional_strip_available?: boolean;
}

export interface ChemistStockResponse {
  chemistId: string;
  chemistName: string;
  area: string;
  distanceKm: number;
  phone?: string;
  respondedAt: number;
  confirmedMedicineIds: string[];
  medicines: Array<{
    name: string;
    productName?: string;
    batchNo?: string;
    confidence?: number;
  }>;
}

export interface Order {
  id: string;
  patient_name: string;
  city: string;
  area: string;
  doctor_name?: string;
  doctor_reg: string;
  prescription_date: string;
  is_cold_chain: boolean;
  cold_chain_reason: string;
  schedule_h_verified: boolean;
  schedule_h_warning?: boolean;
  medicines: MedicineItem[];
  pack_type: 'FULL' | 'FRACTIONAL_10_DAYS';
  total_amount: number;
  status: 'SEARCHING' | 'BROADCASTING' | 'PARTIALLY_ACCEPTED' | 'ACCEPTED' | 'REJECTED';
  assigned_chemist?: string;
  assigned_rider?: string;
  eta_minutes?: number;
  created_at: number;
  accepted_at?: number;
  chemist_responses?: ChemistStockResponse[];
  cooperative_plan?: any;
  bidding_deadline?: number;
  // Stored hashed; never returned to client
  accept_token_hash?: string;
}

import { ChemistNode, CHEMIST_REGISTRY } from './chemists';
export { type ChemistNode, CHEMIST_REGISTRY };

// ─── Chemist Ranking (delegates to ranking engine) ────────────────────────────

import { rankChemists } from './chemist-ranking';

export function rankChemistsForOrder(order: Order, city: string): ChemistNode[] {
  const results = rankChemists(
    CHEMIST_REGISTRY,
    { city: city || 'Ratlam', requiresColdChain: order.is_cold_chain },
  );

  // Map back to ChemistNode[] with score for backward compatibility
  return results.map((r) => {
    const chemist = CHEMIST_REGISTRY.find((c) => c.id === r.chemistId);
    return { ...chemist!, score: r.score };
  });
}

// ─── File-based Persistence ───────────────────────────────────────────────────
// Survives server restarts — no external DB required for hackathon.

const DATA_FILE = path.join(process.cwd(), '.medirush-orders.json');

function loadFromFile(): Map<string, Order> {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const obj: Record<string, Order> = JSON.parse(raw);
      return new Map(Object.entries(obj));
    }
  } catch (e) {
    console.warn('[MediRush Store] Could not load persisted orders:', (e as Error).message);
  }
  return new Map();
}

function flushToDisk(orders: Map<string, Order>): void {
  try {
    const obj = Object.fromEntries(orders.entries());
    fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch (e) {
    console.warn('[MediRush Store] Could not flush orders to disk:', (e as Error).message);
  }
}

// Singleton in-memory map, seeded from disk on first load
const _ordersMap: Map<string, Order> =
  (globalThis as any).__globalOrdersMap ?? loadFromFile();
(globalThis as any).__globalOrdersMap = _ordersMap;
export const globalOrders: Map<string, Order> = _ordersMap;

/** Save or update an order in memory AND flush to disk. */
export function persistOrder(order: Order): void {
  globalOrders.set(order.id, order);
  flushToDisk(globalOrders);
}

// ─── Secure Token Helpers ─────────────────────────────────────────────────────

/**
 * Generates a 64-char hex accept token and its SHA-256 hash.
 * Store the hash; send the raw token in the WhatsApp link.
 */
export function generateAcceptToken(): { token: string; tokenHash: string } {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, tokenHash };
}

/**
 * Validates a provided token against its stored SHA-256 hash.
 * Uses constant-time comparison to prevent timing attacks.
 */
export function validateAcceptToken(providedToken: string, storedHash: string): boolean {
  try {
    const hash = crypto.createHash('sha256').update(providedToken).digest('hex');
    const a = Buffer.from(hash, 'hex');
    const b = Buffer.from(storedHash, 'hex');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// ─── SSE Broadcast ────────────────────────────────────────────────────────────

type SseListener = (data: { event: string; payload: unknown }) => void;

const _sseListeners: Set<SseListener> =
  (globalThis as any).__globalSseListeners ?? new Set<SseListener>();
(globalThis as any).__globalSseListeners = _sseListeners;
export const sseListeners: Set<SseListener> = _sseListeners;

export function broadcastEvent(event: string, payload: unknown): void {
  sseListeners.forEach((listener) => {
    try {
      listener({ event, payload });
    } catch (e) {
      console.warn('[MediRush Store] SSE listener error:', e);
    }
  });
}
