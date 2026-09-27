// ─── Dynamic Chemist Ranking Engine ───────────────────────────────────────────
// Transparent weighted scoring model for ranking pharmacies.
// Returns both the total score AND a per-factor breakdown so the UI
// can explain WHY each chemist was ranked at their position.
//
// This replaces the old rankChemistsForOrder function with:
// 1. Exponential decay distance scoring (not linear)
// 2. Factor breakdown transparency
// 3. Configurable weights
// 4. Cold-chain capability scoring

import { ChemistNode } from './chemists';
import { RankingResult, RankingBreakdown, RankingConfig } from './types';

// ─── Default Configuration ────────────────────────────────────────────────────
// Weights must sum to 1.0

export const DEFAULT_RANKING_CONFIG: RankingConfig = {
  weightMedicineMatch: 0.35,
  weightDistance: 0.25,
  weightResponseEfficiency: 0.20,
  weightCapability: 0.20,
  distanceLambda: 0.5,       // Exponential decay rate for distance
  maxResponseSeconds: 180,    // 3 minutes = worst acceptable response time
};

// ─── Ranking Engine ───────────────────────────────────────────────────────────

export interface RankingInput {
  /** Whether this order requires cold-chain storage */
  requiresColdChain: boolean;
  /** City to filter chemists (only rank chemists in the same city) */
  city: string;
  /** Medicine match scores per chemist (0.0 - 1.0). If not provided, uses chronic_stock_rating */
  medicineMatchOverrides?: Record<string, number>;
}

/**
 * Rank chemists for a given order using a transparent weighted scoring model.
 *
 * Score = W_med * medicineMatch
 *       + W_dist * distanceScore
 *       + W_resp * responseEfficiency
 *       + W_cap * capabilityScore
 *
 * Where:
 * - distanceScore = exp(-lambda * distance_km)  [exponential decay]
 * - responseEfficiency = max(0, (MAX - avg) / MAX)
 * - capabilityScore = cold chain match + stock certification
 *
 * All factors are normalized to [0, 1].
 */
export function rankChemists(
  chemists: ChemistNode[],
  input: RankingInput,
  config: RankingConfig = DEFAULT_RANKING_CONFIG,
): RankingResult[] {
  // Filter by city
  const cityChemists = chemists.filter(
    (c) => c.city.toLowerCase() === (input.city || 'ratlam').toLowerCase()
  );
  const pool = cityChemists.length > 0 ? cityChemists : chemists;

  const results: RankingResult[] = pool.map((chemist) => {
    const breakdown = computeBreakdown(chemist, input, config);

    const score = Math.round(
      (config.weightMedicineMatch * breakdown.medicineMatch +
        config.weightDistance * breakdown.distanceScore +
        config.weightResponseEfficiency * breakdown.responseEfficiency +
        config.weightCapability * breakdown.capabilityScore) *
        100
    );

    return {
      chemistId: chemist.id,
      chemistName: chemist.name,
      score: Math.min(100, Math.max(0, score)), // Clamp to [0, 100]
      breakdown,
    };
  });

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results;
}

/**
 * Compute the per-factor breakdown for a single chemist.
 * All values are in [0, 1] range.
 */
function computeBreakdown(
  chemist: ChemistNode,
  input: RankingInput,
  config: RankingConfig,
): RankingBreakdown {
  // 1. Medicine Match Score
  // Use override if provided, otherwise fall back to chronic_stock_rating
  const medicineMatch =
    input.medicineMatchOverrides?.[chemist.id] ?? chemist.chronic_stock_rating;

  // 2. Distance Score — exponential decay
  // exp(-lambda * d) gives 1.0 at d=0 and decays smoothly
  const distanceScore = Math.exp(-config.distanceLambda * chemist.distance_km);

  // 3. Response Efficiency
  // Linear: max(0, (MAX - actual) / MAX)
  const responseEfficiency = Math.max(
    0,
    (config.maxResponseSeconds - chemist.avg_response_time_sec) / config.maxResponseSeconds
  );

  // 4. Capability Score
  // Cold chain: if order requires it and chemist has it = 1.0
  //             if order requires it and chemist doesn't = 0.1 (heavily penalized)
  //             if order doesn't need it = 1.0 (neutral)
  let capabilityScore: number;
  if (input.requiresColdChain) {
    capabilityScore = chemist.cold_storage_certified ? 1.0 : 0.1;
  } else {
    // Without cold chain requirement, base on general capability
    capabilityScore = chemist.cold_storage_certified ? 1.0 : 0.8;
  }

  return {
    medicineMatch: round4(medicineMatch),
    distanceScore: round4(distanceScore),
    responseEfficiency: round4(responseEfficiency),
    capabilityScore: round4(capabilityScore),
  };
}

/**
 * Get a human-readable explanation of why a chemist was ranked at their position.
 */
export function explainRanking(result: RankingResult, config: RankingConfig = DEFAULT_RANKING_CONFIG): string {
  const { breakdown } = result;
  const parts: string[] = [];

  parts.push(`Medicine Match: ${(breakdown.medicineMatch * 100).toFixed(0)}% (weight: ${config.weightMedicineMatch})`);
  parts.push(`Distance: ${(breakdown.distanceScore * 100).toFixed(0)}% (weight: ${config.weightDistance})`);
  parts.push(`Response SLA: ${(breakdown.responseEfficiency * 100).toFixed(0)}% (weight: ${config.weightResponseEfficiency})`);
  parts.push(`Capability: ${(breakdown.capabilityScore * 100).toFixed(0)}% (weight: ${config.weightCapability})`);
  parts.push(`Final Score: ${result.score}/100`);

  return parts.join(' | ');
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
