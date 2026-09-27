// ─── Drug Name Normalizer ─────────────────────────────────────────────────────
// Normalizes brand names and chemical salt strings to canonical forms
// for deterministic safety checking. This is NOT a complete pharmacopeia —
// it handles common Indian brand→salt mappings encountered in Tier-2/3 prescriptions.

/** Known brand name → canonical salt/active ingredient mappings */
const BRAND_TO_SALT: Record<string, string> = {
  // Diabetes
  'lantus': 'insulin glargine',
  'basalog': 'insulin glargine',
  'humalog': 'insulin lispro',
  'novorapid': 'insulin aspart',
  'actrapid': 'human insulin',
  'huminsulin': 'human insulin',
  'glycomet': 'metformin',
  'glucophage': 'metformin',
  'amaryl': 'glimepiride',
  'glimisave': 'glimepiride',
  'januvia': 'sitagliptin',
  'galvus': 'vildagliptin',
  'jardiance': 'empagliflozin',
  'forxiga': 'dapagliflozin',

  // Cardiac / Hypertension
  'telma': 'telmisartan',
  'telmikind': 'telmisartan',
  'amlokind': 'amlodipine',
  'amlopress': 'amlodipine',
  'ecosprin': 'aspirin',
  'aspirin': 'aspirin',
  'clopitab': 'clopidogrel',
  'plavix': 'clopidogrel',
  'atorva': 'atorvastatin',
  'lipitor': 'atorvastatin',
  'rosave': 'rosuvastatin',
  'crestor': 'rosuvastatin',
  'concor': 'bisoprolol',
  'metolar': 'metoprolol',
  'betaloc': 'metoprolol',
  'aten': 'atenolol',
  'envas': 'enalapril',
  'ramipril': 'ramipril',
  'cardace': 'ramipril',
  'losartan': 'losartan',
  'repace': 'losartan',
  'torsemide': 'torsemide',
  'dytor': 'torsemide',
  'lasix': 'furosemide',
  'frusenex': 'furosemide',
  'aldactone': 'spironolactone',

  // Pain / Anti-inflammatory
  'crocin': 'paracetamol',
  'dolo': 'paracetamol',
  'calpol': 'paracetamol',
  'combiflam': 'ibuprofen + paracetamol',
  'brufen': 'ibuprofen',
  'voveran': 'diclofenac',
  'volini': 'diclofenac',
  'zerodol': 'aceclofenac',
  'hifenac': 'aceclofenac',
  'ultracet': 'tramadol + paracetamol',

  // Antibiotics
  'augmentin': 'amoxicillin + clavulanate',
  'moxikind': 'amoxicillin',
  'azithral': 'azithromycin',
  'zithromax': 'azithromycin',
  'cipro': 'ciprofloxacin',
  'ciplox': 'ciprofloxacin',
  'levoflox': 'levofloxacin',
  'tavanic': 'levofloxacin',
  'monocef': 'ceftriaxone',
  'taxim': 'cefotaxime',
  'o2': 'ofloxacin + ornidazole',

  // GI / Antacids
  'pan': 'pantoprazole',
  'pantop': 'pantoprazole',
  'omez': 'omeprazole',
  'ranitidine': 'ranitidine',
  'rantac': 'ranitidine',
  'domperidone': 'domperidone',
  'domstal': 'domperidone',
  'ondansetron': 'ondansetron',
  'emeset': 'ondansetron',

  // Respiratory
  'deriphyllin': 'etophylline + theophylline',
  'montelukast': 'montelukast',
  'montair': 'montelukast',
  'asthalin': 'salbutamol',
  'budecort': 'budesonide',
  'foracort': 'formoterol + budesonide',
  'seroflo': 'salmeterol + fluticasone',

  // Psychiatric / Neurological
  'alprazolam': 'alprazolam',
  'alprax': 'alprazolam',
  'clonazepam': 'clonazepam',
  'clonotril': 'clonazepam',
  'escitalopram': 'escitalopram',
  'nexito': 'escitalopram',
  'gabantin': 'gabapentin',
  'pregabalin': 'pregabalin',
  'pregalin': 'pregabalin',

  // Thyroid
  'thyronorm': 'levothyroxine',
  'eltroxin': 'levothyroxine',
  'thyrox': 'levothyroxine',

  // Steroids
  'wysolone': 'prednisolone',
  'omnacortil': 'prednisolone',
  'dexona': 'dexamethasone',
  'medrol': 'methylprednisolone',

  // Anticoagulants
  'warfarin': 'warfarin',
  'warf': 'warfarin',
  'heparin': 'heparin',
  'clexane': 'enoxaparin',
  'xarelto': 'rivaroxaban',
  'eliquis': 'apixaban',

  // Supplements
  'shelcal': 'calcium + vitamin d3',
  'calcimax': 'calcium + vitamin d3',
  'becosules': 'b-complex + vitamin c',
  'folvite': 'folic acid',
  'livogen': 'iron + folic acid',
};

/**
 * Normalize a drug/salt name to a canonical lowercase form.
 * - Strips dosage/strength suffixes (e.g. "Telmisartan 40mg" → "telmisartan")
 * - Resolves known brand names to their active salt
 * - Strips common suffixes and prefixes
 */
export function normalizeSaltName(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';

  let name = raw
    .toLowerCase()
    .trim()
    // Remove dosage suffixes: "40mg", "100 IU/ml", "500 mg", "10 units", etc.
    .replace(/\d+\s*(mg|mcg|µg|iu|ml|units?|tab|caps?|inj|vial|amp|strip|gm|g)\b/gi, '')
    // Remove common parenthetical info
    .replace(/\(.*?\)/g, '')
    // Remove "tablet", "capsule", "injection", etc.
    .replace(/\b(tablet|capsule|injection|syrup|drops|cream|ointment|gel|solution|suspension|inhaler|cartridge|pen|vial)\b/gi, '')
    // Remove trailing/leading special chars
    .replace(/[^a-z0-9\s+]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Check if it matches a known brand name
  const brandMatch = BRAND_TO_SALT[name];
  if (brandMatch) return brandMatch;

  // Try matching first word as brand name (e.g. "Telma 40" → "telma")
  const firstWord = name.split(' ')[0];
  const firstWordMatch = BRAND_TO_SALT[firstWord];
  if (firstWordMatch) return firstWordMatch;

  return name;
}

/**
 * Check if a salt name string contains a recognizable active ingredient.
 * Returns true if the name normalizes to a non-empty known or plausible salt.
 */
export function isRecognizedSalt(raw: string): boolean {
  const normalized = normalizeSaltName(raw);
  if (!normalized) return false;

  // Check against known salts (values in BRAND_TO_SALT)
  const knownSalts = new Set(Object.values(BRAND_TO_SALT));
  if (knownSalts.has(normalized)) return true;

  // If it's at least 3 chars and looks like a real name (not just numbers), consider it plausible
  return normalized.length >= 3 && /[a-z]{3,}/.test(normalized);
}

/**
 * Extract individual salts from a combination string.
 * e.g. "Amoxicillin + Clavulanate" → ["amoxicillin", "clavulanate"]
 * e.g. "Ibuprofen + Paracetamol" → ["ibuprofen", "paracetamol"]
 */
export function splitCombinationSalts(normalizedSalt: string): string[] {
  return normalizedSalt
    .split('+')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}
