// ─── Inventory Freshness Engine ───────────────────────────────────────────────
// Computes stock confidence and freshness status based on time elapsed since
// distributor invoice observation.
// Disclaimer: This is an empirical estimation heuristic, not a guaranteed live stock sensor.

export type FreshnessStatus = 'FRESH' | 'AGING' | 'STALE' | 'UNKNOWN';

export interface FreshnessConfig {
  /** Maximum days to consider inventory FRESH (default: 7 days) */
  freshDaysThreshold: number;
  /** Maximum days before inventory is considered STALE (default: 30 days) */
  agingDaysThreshold: number;
  /** Weight for freshness score decay (0-1) */
  freshnessWeight: number;
}

export const DEFAULT_FRESHNESS_CONFIG: FreshnessConfig = {
  freshDaysThreshold: 7,
  agingDaysThreshold: 30,
  freshnessWeight: 0.20,
};

export interface FreshnessResult {
  status: FreshnessStatus;
  daysSinceInvoice: number;
  freshnessScore: number; // 0 to 100
  confidenceLabel: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  observedText: string;
  disclaimer: string;
}

/**
 * Calculates freshness metrics from an invoice date or observed_at ISO timestamp.
 */
export function calculateInventoryFreshness(
  observedAtOrInvoiceDate: string | Date | undefined | null,
  config: FreshnessConfig = DEFAULT_FRESHNESS_CONFIG
): FreshnessResult {
  if (!observedAtOrInvoiceDate) {
    return {
      status: 'UNKNOWN',
      daysSinceInvoice: 999,
      freshnessScore: 20,
      confidenceLabel: 'UNKNOWN',
      observedText: 'No invoice date recorded',
      disclaimer: 'Estimated stock based on unverified source',
    };
  }

  const invoiceTime = new Date(observedAtOrInvoiceDate).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - invoiceTime);
  const daysSinceInvoice = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let status: FreshnessStatus;
  let freshnessScore: number;
  let confidenceLabel: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

  if (daysSinceInvoice <= config.freshDaysThreshold) {
    status = 'FRESH';
    // Score linearly decays from 100 down to 80 over fresh threshold
    freshnessScore = Math.round(100 - (daysSinceInvoice / config.freshDaysThreshold) * 20);
    confidenceLabel = 'HIGH';
  } else if (daysSinceInvoice <= config.agingDaysThreshold) {
    status = 'AGING';
    // Score decays from 79 down to 45 over aging window
    const progress = (daysSinceInvoice - config.freshDaysThreshold) / (config.agingDaysThreshold - config.freshDaysThreshold);
    freshnessScore = Math.round(79 - progress * 34);
    confidenceLabel = 'MEDIUM';
  } else {
    status = 'STALE';
    // Score decays asymptotically down to 10
    freshnessScore = Math.max(10, Math.round(44 - Math.min(34, (daysSinceInvoice - config.agingDaysThreshold) * 0.5)));
    confidenceLabel = 'LOW';
  }

  const observedText = daysSinceInvoice === 0 
    ? 'Observed today (Latest Invoice)' 
    : daysSinceInvoice === 1 
      ? 'Observed 1 day ago (Distributor Invoice)' 
      : `Observed ${daysSinceInvoice} days ago (Distributor Invoice)`;

  return {
    status,
    daysSinceInvoice,
    freshnessScore,
    confidenceLabel,
    observedText,
    disclaimer: 'Estimated stock based on latest invoice — not a live POS audit',
  };
}
