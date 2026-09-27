// ─── Deterministic Drug Safety Validation Engine ──────────────────────────────
// This is a RULE-BASED safety layer, NOT an AI-driven system.
// It checks extracted medicines against known interaction rules.
//
// IMPORTANT DISCLAIMER:
// The interaction rules below are a DEMONSTRATION subset sourced from
// publicly available drug interaction references (BNF, CDSCO schedules).
// This is NOT a complete medical interaction database.
// In production, this would be replaced by or supplemented with a verified
// pharmaceutical database API (e.g., DrugBank, RxNorm, or CDSCO's official data).

import {
  SafetyAlert,
  DuplicateAlert,
  SafetyAuditResult,
  SafetyStatus,
  MedicineConfidence,
  ConfidenceStatus,
} from './types';
import { normalizeSaltName, splitCombinationSalts, isRecognizedSalt } from './drug-normalizer';

// ─── Known Interaction Rules ──────────────────────────────────────────────────
// Each rule specifies two salts and their interaction severity.
// Source field indicates the reference for the rule.

interface InteractionRule {
  saltA: string;
  saltB: string;
  severity: 'WARNING' | 'CRITICAL';
  reason: string;
  source: string;
}

const INTERACTION_RULES: InteractionRule[] = [
  // ─── CRITICAL Interactions ────────────────────────────────────────────
  {
    saltA: 'warfarin',
    saltB: 'aspirin',
    severity: 'CRITICAL',
    reason: 'Combined use significantly increases bleeding risk. Requires close INR monitoring.',
    source: 'BNF Interaction Database',
  },
  {
    saltA: 'warfarin',
    saltB: 'clopidogrel',
    severity: 'CRITICAL',
    reason: 'Triple antithrombotic therapy risk. Major bleeding hazard.',
    source: 'BNF Interaction Database',
  },
  {
    saltA: 'metformin',
    saltB: 'insulin glargine',
    severity: 'WARNING',
    reason: 'Additive hypoglycemia risk. Blood glucose monitoring recommended.',
    source: 'CDSCO Drug Interaction Reference',
  },
  {
    saltA: 'enalapril',
    saltB: 'spironolactone',
    severity: 'CRITICAL',
    reason: 'Risk of severe hyperkalemia. Serum potassium monitoring required.',
    source: 'BNF Interaction Database',
  },
  {
    saltA: 'ramipril',
    saltB: 'spironolactone',
    severity: 'CRITICAL',
    reason: 'Risk of severe hyperkalemia. Serum potassium monitoring required.',
    source: 'BNF Interaction Database',
  },
  {
    saltA: 'losartan',
    saltB: 'spironolactone',
    severity: 'CRITICAL',
    reason: 'Risk of severe hyperkalemia with ARB + potassium-sparing diuretic.',
    source: 'BNF Interaction Database',
  },
  {
    saltA: 'telmisartan',
    saltB: 'spironolactone',
    severity: 'CRITICAL',
    reason: 'Risk of severe hyperkalemia with ARB + potassium-sparing diuretic.',
    source: 'BNF Interaction Database',
  },
  {
    saltA: 'ciprofloxacin',
    saltB: 'theophylline',
    severity: 'CRITICAL',
    reason: 'Ciprofloxacin inhibits theophylline metabolism. Risk of theophylline toxicity (seizures, arrhythmias).',
    source: 'BNF Interaction Database',
  },

  // ─── WARNING Interactions ─────────────────────────────────────────────
  {
    saltA: 'aspirin',
    saltB: 'ibuprofen',
    severity: 'WARNING',
    reason: 'Ibuprofen may reduce cardioprotective effect of aspirin. GI bleeding risk increased.',
    source: 'FDA Drug Safety Communication',
  },
  {
    saltA: 'aspirin',
    saltB: 'diclofenac',
    severity: 'WARNING',
    reason: 'Increased GI bleeding risk with dual NSAID/antiplatelet use.',
    source: 'CDSCO Drug Interaction Reference',
  },
  {
    saltA: 'aspirin',
    saltB: 'aceclofenac',
    severity: 'WARNING',
    reason: 'Increased GI bleeding risk with dual NSAID/antiplatelet use.',
    source: 'CDSCO Drug Interaction Reference',
  },
  {
    saltA: 'metoprolol',
    saltB: 'amlodipine',
    severity: 'WARNING',
    reason: 'Additive hypotension and bradycardia risk. Monitor blood pressure and heart rate.',
    source: 'BNF Interaction Database',
  },
  {
    saltA: 'atenolol',
    saltB: 'amlodipine',
    severity: 'WARNING',
    reason: 'Additive hypotension and bradycardia risk. Monitor blood pressure and heart rate.',
    source: 'BNF Interaction Database',
  },
  {
    saltA: 'bisoprolol',
    saltB: 'amlodipine',
    severity: 'WARNING',
    reason: 'Additive hypotension and bradycardia risk. Monitor blood pressure and heart rate.',
    source: 'BNF Interaction Database',
  },
  {
    saltA: 'metformin',
    saltB: 'glimepiride',
    severity: 'WARNING',
    reason: 'Additive hypoglycemia risk with dual oral hypoglycemics.',
    source: 'CDSCO Drug Interaction Reference',
  },
  {
    saltA: 'atorvastatin',
    saltB: 'azithromycin',
    severity: 'WARNING',
    reason: 'Possible increased statin exposure. Monitor for myopathy symptoms.',
    source: 'BNF Interaction Database',
  },
  {
    saltA: 'alprazolam',
    saltB: 'tramadol',
    severity: 'CRITICAL',
    reason: 'CNS depression risk. Respiratory depression possible with benzodiazepine + opioid.',
    source: 'FDA Boxed Warning',
  },
  {
    saltA: 'clonazepam',
    saltB: 'tramadol',
    severity: 'CRITICAL',
    reason: 'CNS depression risk. Respiratory depression possible with benzodiazepine + opioid.',
    source: 'FDA Boxed Warning',
  },
  {
    saltA: 'gabapentin',
    saltB: 'pregabalin',
    severity: 'WARNING',
    reason: 'Same drug class (gabapentinoids). Duplicate therapy with additive CNS depression.',
    source: 'Clinical pharmacology reference',
  },
  {
    saltA: 'omeprazole',
    saltB: 'clopidogrel',
    severity: 'WARNING',
    reason: 'Omeprazole may reduce the antiplatelet effect of clopidogrel via CYP2C19 inhibition.',
    source: 'FDA Drug Safety Communication',
  },
  {
    saltA: 'pantoprazole',
    saltB: 'clopidogrel',
    severity: 'WARNING',
    reason: 'PPIs may reduce clopidogrel efficacy. Pantoprazole has less interaction than omeprazole but caution advised.',
    source: 'FDA Drug Safety Communication',
  },
  {
    saltA: 'levothyroxine',
    saltB: 'calcium + vitamin d3',
    severity: 'WARNING',
    reason: 'Calcium reduces levothyroxine absorption. Separate administration by at least 4 hours.',
    source: 'BNF Interaction Database',
  },
  {
    saltA: 'ciprofloxacin',
    saltB: 'iron + folic acid',
    severity: 'WARNING',
    reason: 'Iron chelates fluoroquinolones, reducing antibiotic efficacy. Separate by 2+ hours.',
    source: 'BNF Interaction Database',
  },
  {
    saltA: 'levofloxacin',
    saltB: 'iron + folic acid',
    severity: 'WARNING',
    reason: 'Iron chelates fluoroquinolones, reducing antibiotic efficacy. Separate by 2+ hours.',
    source: 'BNF Interaction Database',
  },
];

// ─── Safety Engine Core ───────────────────────────────────────────────────────

/**
 * Audit a list of chemical salt names for known drug-drug interactions.
 * Returns structured alerts with severity levels and source references.
 *
 * This function ONLY reports interactions that exist in the local rule set.
 * It does NOT invent interactions or claim completeness.
 */
export function auditDrugInteractions(salts: string[]): SafetyAlert[] {
  const alerts: SafetyAlert[] = [];
  const normalizedSalts = salts.map((s) => normalizeSaltName(s));

  // Expand combination salts (e.g. "ibuprofen + paracetamol" → check each component)
  const expandedSalts: { original: string; components: string[] }[] = normalizedSalts.map(
    (salt, i) => ({
      original: salts[i],
      components: splitCombinationSalts(salt),
    })
  );

  // Check every pair of medicines for known interactions
  for (let i = 0; i < expandedSalts.length; i++) {
    for (let j = i + 1; j < expandedSalts.length; j++) {
      const medA = expandedSalts[i];
      const medB = expandedSalts[j];

      // Check all component combinations
      for (const compA of medA.components) {
        for (const compB of medB.components) {
          const matchedRule = findInteractionRule(compA, compB);
          if (matchedRule) {
            // Avoid duplicate alerts for the same pair
            const alreadyReported = alerts.some(
              (a) =>
                (a.drugA === medA.original && a.drugB === medB.original) ||
                (a.drugA === medB.original && a.drugB === medA.original)
            );
            if (!alreadyReported) {
              alerts.push({
                drugA: medA.original,
                drugB: medB.original,
                severity: matchedRule.severity,
                reason: matchedRule.reason,
                source: matchedRule.source,
              });
            }
          }
        }
      }
    }
  }

  return alerts;
}

/**
 * Detect duplicate active ingredients across medicines.
 * e.g. Two different brands containing the same salt.
 */
export function detectDuplicates(
  medicines: { name: string; salt: string }[]
): DuplicateAlert[] {
  const alerts: DuplicateAlert[] = [];
  const saltToMedicines: Map<string, string[]> = new Map();

  for (const med of medicines) {
    const normalized = normalizeSaltName(med.salt);
    const components = splitCombinationSalts(normalized);

    for (const comp of components) {
      if (!saltToMedicines.has(comp)) {
        saltToMedicines.set(comp, []);
      }
      saltToMedicines.get(comp)!.push(med.name);
    }
  }

  for (const [salt, meds] of saltToMedicines.entries()) {
    if (meds.length > 1) {
      alerts.push({
        salt,
        medicines: meds,
        severity: 'WARNING',
        reason: `Duplicate active ingredient "${salt}" found across ${meds.length} medicines: ${meds.join(', ')}. Verify this is intentional.`,
      });
    }
  }

  return alerts;
}

/**
 * Assess confidence for each medicine based on Gemini extraction quality.
 */
export function assessConfidence(
  medicines: {
    brand_name?: string;
    chemical_salt?: string;
    dosage?: string;
    confidence?: number;
  }[]
): MedicineConfidence[] {
  return medicines.map((med, index) => {
    const reasons: string[] = [];
    let status: ConfidenceStatus = 'VERIFIED';

    // Check explicit confidence score from Gemini
    if (med.confidence !== undefined && med.confidence < 0.7) {
      status = 'LOW_CONFIDENCE';
      reasons.push(`Gemini confidence score: ${(med.confidence * 100).toFixed(0)}%`);
    }

    // Check if salt is empty or unrecognized
    if (!med.chemical_salt || med.chemical_salt.trim() === '') {
      status = 'NEEDS_VERIFICATION';
      reasons.push('Chemical salt not extracted from prescription');
    } else if (!isRecognizedSalt(med.chemical_salt)) {
      status = 'NEEDS_VERIFICATION';
      reasons.push(`Salt "${med.chemical_salt}" not found in known drug database`);
    }

    // Check if brand name is empty
    if (!med.brand_name || med.brand_name.trim() === '') {
      status = status === 'VERIFIED' ? 'NEEDS_VERIFICATION' : status;
      reasons.push('Medicine name could not be read from prescription');
    }

    // Check if dosage is missing
    if (!med.dosage || med.dosage.trim() === '') {
      if (status === 'VERIFIED') status = 'NEEDS_VERIFICATION';
      reasons.push('Dosage not clearly readable');
    }

    const normalized = med.chemical_salt ? normalizeSaltName(med.chemical_salt) : '';

    return {
      index,
      normalizedSalt: normalized,
      status,
      reason: reasons.length > 0 ? reasons.join('; ') : 'All fields extracted with acceptable confidence',
    };
  });
}

/**
 * Run full safety audit on a parsed prescription.
 * Returns structured result with interactions, duplicates, and confidence assessment.
 */
export function runSafetyAudit(
  medicines: {
    brand_name?: string;
    chemical_salt?: string;
    dosage?: string;
    confidence?: number;
  }[]
): SafetyAuditResult {
  const salts = medicines.map((m) => m.chemical_salt || '');
  const interactions = auditDrugInteractions(salts);
  const duplicates = detectDuplicates(
    medicines.map((m) => ({
      name: m.brand_name || '(unknown)',
      salt: m.chemical_salt || '',
    }))
  );
  const confidenceResults = assessConfidence(medicines);
  const needsVerificationCount = confidenceResults.filter(
    (c) => c.status === 'NEEDS_VERIFICATION' || c.status === 'LOW_CONFIDENCE'
  ).length;

  // Determine overall status
  let overallStatus: SafetyStatus = 'SAFE';
  if (interactions.some((a) => a.severity === 'CRITICAL')) {
    overallStatus = 'CRITICAL';
  } else if (interactions.some((a) => a.severity === 'WARNING') || duplicates.length > 0) {
    overallStatus = 'WARNING';
  }
  if (needsVerificationCount > 0 && overallStatus === 'SAFE') {
    overallStatus = 'WARNING';
  }

  return {
    overallStatus,
    interactions,
    duplicates,
    needsVerificationCount,
    auditedAt: new Date().toISOString(),
    disclaimer:
      'Safety audit performed against a local demonstration rule set. ' +
      'This does NOT replace professional pharmacist verification. ' +
      'The interaction database covers common Indian prescriptions but is NOT comprehensive. ' +
      'Always verify with a licensed pharmacist before dispensing.',
  };
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

function findInteractionRule(saltA: string, saltB: string): InteractionRule | null {
  for (const rule of INTERACTION_RULES) {
    if (
      (rule.saltA === saltA && rule.saltB === saltB) ||
      (rule.saltA === saltB && rule.saltB === saltA)
    ) {
      return rule;
    }
  }
  return null;
}
