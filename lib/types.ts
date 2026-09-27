// ─── Shared Types for MediRush Healthcare Logistics System ────────────────────
// All types used across safety-engine, chemist-ranking, thermal-sla, and APIs.

// ─── Safety Engine Types ──────────────────────────────────────────────────────

export type SafetySeverity = 'WARNING' | 'CRITICAL';
export type SafetyStatus = 'SAFE' | 'WARNING' | 'CRITICAL' | 'UNKNOWN' | 'NOT_IN_RULESET';
export type ConfidenceStatus = 'VERIFIED' | 'NEEDS_VERIFICATION' | 'LOW_CONFIDENCE';

export interface SafetyAlert {
  drugA: string;
  drugB: string;
  severity: SafetySeverity;
  reason: string;
  /** Source of the interaction rule — e.g. "BNF", "CDSCO", "local-ruleset" */
  source: string;
}

export interface DuplicateAlert {
  salt: string;
  medicines: string[];
  severity: SafetySeverity;
  reason: string;
}

export interface SafetyAuditResult {
  /** Overall safety status of this prescription */
  overallStatus: SafetyStatus;
  /** Drug-drug interaction alerts */
  interactions: SafetyAlert[];
  /** Duplicate active ingredient alerts */
  duplicates: DuplicateAlert[];
  /** Count of medicines that need manual verification */
  needsVerificationCount: number;
  /** Timestamp of when the audit was performed */
  auditedAt: string;
  /** Disclaimer: this is NOT a complete medical database */
  disclaimer: string;
}

export interface MedicineConfidence {
  /** Original medicine index from Gemini output */
  index: number;
  /** Normalized salt name used for safety checks */
  normalizedSalt: string;
  /** Confidence status based on Gemini's extraction quality */
  status: ConfidenceStatus;
  /** Reason for the confidence assessment */
  reason: string;
}

// ─── Chemist Ranking Types ────────────────────────────────────────────────────

export interface RankingBreakdown {
  medicineMatch: number;
  distanceScore: number;
  responseEfficiency: number;
  capabilityScore: number;
}

export interface RankingResult {
  chemistId: string;
  chemistName: string;
  score: number;
  breakdown: RankingBreakdown;
}

export interface RankingConfig {
  /** Weight for medicine availability match (0-1) */
  weightMedicineMatch: number;
  /** Weight for proximity/distance (0-1) */
  weightDistance: number;
  /** Weight for response speed (0-1) */
  weightResponseEfficiency: number;
  /** Weight for capability (cold chain, etc.) (0-1) */
  weightCapability: number;
  /** Exponential decay lambda for distance scoring */
  distanceLambda: number;
  /** Maximum expected response time in seconds */
  maxResponseSeconds: number;
}

// ─── Thermal SLA Types ────────────────────────────────────────────────────────

export type ThermalStatus =
  | 'WITHIN_ESTIMATED_WINDOW'
  | 'APPROACHING_LIMIT'
  | 'EXCEEDS_ESTIMATED_WINDOW'
  | 'NOT_APPLICABLE';

export type CoolingMethod = 'ICE_GEL_POUCH' | 'INSULATED_BOX' | 'NONE';

export interface ThermalSLAInput {
  /** Ambient temperature in Celsius. null = unavailable */
  ambientTemperature: number | null;
  /** Whether the order contains cold-chain medicines */
  requiresColdChain: boolean;
  /** Estimated delivery time in minutes */
  estimatedDeliveryMinutes: number;
  /** Cooling method being used */
  coolingMethod: CoolingMethod;
}

export interface ThermalSLAResult {
  requiresColdChain: boolean;
  ambientTemperature: number | null;
  estimatedDeliveryMinutes: number;
  coolingMethod: CoolingMethod;
  thermalStatus: ThermalStatus;
  /** Estimated remaining safe window in minutes. null if temperature unavailable */
  remainingWindowMinutes: number | null;
  /** Estimated total safe window for this cooling method. null if temperature unavailable */
  totalWindowMinutes: number | null;
  /** Important: this is an estimation, not a medically validated prediction */
  disclaimer: string;
}

// ─── Weather Service Types ────────────────────────────────────────────────────

export interface WeatherResult {
  temperatureCelsius: number;
  humidity: number;
  description: string;
  city: string;
  /** Whether this came from a real API or is unavailable */
  source: 'LIVE_API' | 'UNAVAILABLE';
  fetchedAt: string;
}

// ─── Messaging Service Types ──────────────────────────────────────────────────

export type MessageStatus = 'SENT' | 'FAILED' | 'CONFIGURATION_ERROR';

export interface MessageResult {
  status: MessageStatus;
  /** Provider message ID if sent successfully */
  messageId?: string;
  /** Error message if failed */
  error?: string;
  /** Provider used */
  provider: 'TWILIO_WHATSAPP' | 'NONE';
  sentAt?: string;
}

// ─── System Health / Dashboard Types ──────────────────────────────────────────

export type IntegrationStatus = 'LIVE' | 'CONFIGURED' | 'NOT_CONFIGURED' | 'ERROR';

export interface SystemHealthCheck {
  geminiApi: IntegrationStatus;
  safetyEngine: IntegrationStatus;
  chemistRanking: IntegrationStatus;
  thermalSla: IntegrationStatus;
  weatherApi: IntegrationStatus;
  messagingApi: IntegrationStatus;
  demoMode: boolean;
}

// ─── API Response Envelope ────────────────────────────────────────────────────

export type ApiStatus =
  | 'SUCCESS'
  | 'VALIDATION_ERROR'
  | 'API_ERROR'
  | 'SAFETY_WARNING'
  | 'CRITICAL_SAFETY_ALERT'
  | 'CONFIGURATION_ERROR'
  | 'UNKNOWN_MEDICINE'
  | 'MESSAGE_FAILED';
