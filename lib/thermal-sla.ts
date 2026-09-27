// ─── Thermal Delivery SLA Engine ──────────────────────────────────────────────
// Estimates the safe delivery window for cold-chain medicines based on
// ambient temperature and cooling method.
//
// IMPORTANT LIMITATIONS:
// This is an ESTIMATION MODEL, NOT a medically validated pharmacokinetic model.
// The thermal window estimates are based on general passive cooling curves
// for gel ice packs and insulated containers, NOT medicine-specific stability data.
// Actual insulin/biologic stability depends on many factors not modeled here
// (initial pack temperature, pack thermal mass, wind, sunlight, container quality).
//
// In a production system, this would be calibrated against real-world
// temperature logging data from delivery runs.

import { ThermalSLAInput, ThermalSLAResult, ThermalStatus, CoolingMethod } from './types';

// ─── Thermal Window Configuration ─────────────────────────────────────────────
// Estimated safe window in minutes for each cooling method at various ambient temps.
// These are conservative estimates for maintaining 2°C–8°C range.

interface ThermalProfile {
  /** Base window at 25°C ambient in minutes */
  baseWindowMinutes: number;
  /** Reduction in minutes per degree above 25°C */
  reductionPerDegree: number;
  /** Minimum possible window in minutes */
  minimumWindowMinutes: number;
}

const THERMAL_PROFILES: Record<CoolingMethod, ThermalProfile> = {
  ICE_GEL_POUCH: {
    baseWindowMinutes: 90,        // ~90 min at 25°C
    reductionPerDegree: 3,        // Loses ~3 min per degree above 25°C
    minimumWindowMinutes: 15,     // Even at 45°C, at least 15 min
  },
  INSULATED_BOX: {
    baseWindowMinutes: 180,       // ~3 hours at 25°C
    reductionPerDegree: 4,        // Better insulation but still degrades
    minimumWindowMinutes: 30,
  },
  NONE: {
    baseWindowMinutes: 30,        // Very short without any cooling
    reductionPerDegree: 2,
    minimumWindowMinutes: 5,
  },
};

// ─── SLA Engine ───────────────────────────────────────────────────────────────

/**
 * Calculate the estimated thermal delivery window.
 *
 * If the medicine doesn't require cold chain, returns NOT_APPLICABLE.
 * If ambient temperature is unavailable (null), returns null for window calculations.
 */
export function calculateThermalSLA(input: ThermalSLAInput): ThermalSLAResult {
  const DISCLAIMER =
    'This is an estimated thermal window based on general passive cooling models. ' +
    'It does NOT predict actual medicine potency or stability. ' +
    'Always use calibrated temperature-monitoring devices for critical cold-chain deliveries.';

  // Not applicable for non-cold-chain medicines
  if (!input.requiresColdChain) {
    return {
      requiresColdChain: false,
      ambientTemperature: input.ambientTemperature,
      estimatedDeliveryMinutes: input.estimatedDeliveryMinutes,
      coolingMethod: input.coolingMethod,
      thermalStatus: 'NOT_APPLICABLE',
      remainingWindowMinutes: null,
      totalWindowMinutes: null,
      disclaimer: DISCLAIMER,
    };
  }

  // If temperature is unavailable, we can't estimate the window
  if (input.ambientTemperature === null) {
    return {
      requiresColdChain: true,
      ambientTemperature: null,
      estimatedDeliveryMinutes: input.estimatedDeliveryMinutes,
      coolingMethod: input.coolingMethod,
      thermalStatus: 'WITHIN_ESTIMATED_WINDOW', // Assume OK but flag unknown
      remainingWindowMinutes: null,
      totalWindowMinutes: null,
      disclaimer: DISCLAIMER + ' Ambient temperature unavailable — window cannot be estimated.',
    };
  }

  // Calculate estimated safe window
  const profile = THERMAL_PROFILES[input.coolingMethod];
  const degreesAboveBaseline = Math.max(0, input.ambientTemperature - 25);
  const estimatedWindow = Math.max(
    profile.minimumWindowMinutes,
    profile.baseWindowMinutes - degreesAboveBaseline * profile.reductionPerDegree
  );

  const remaining = estimatedWindow - input.estimatedDeliveryMinutes;

  // Determine status
  let thermalStatus: ThermalStatus;
  if (remaining > estimatedWindow * 0.25) {
    thermalStatus = 'WITHIN_ESTIMATED_WINDOW';
  } else if (remaining > 0) {
    thermalStatus = 'APPROACHING_LIMIT';
  } else {
    thermalStatus = 'EXCEEDS_ESTIMATED_WINDOW';
  }

  return {
    requiresColdChain: true,
    ambientTemperature: input.ambientTemperature,
    estimatedDeliveryMinutes: input.estimatedDeliveryMinutes,
    coolingMethod: input.coolingMethod,
    thermalStatus,
    remainingWindowMinutes: Math.max(0, Math.round(remaining)),
    totalWindowMinutes: Math.round(estimatedWindow),
    disclaimer: DISCLAIMER,
  };
}
