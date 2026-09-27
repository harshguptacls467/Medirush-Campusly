// ─── Reusable Indian Pharmacopeia Medicine Normalization Layer ─────────────────
// Resolves brand names, abbreviations, typos, and strength variations
// to canonical generic representations (e.g., "Cipro 500" → "Ciprofloxacin | 500mg").

export interface NormalizedMedicine {
  /** Canonical generic description e.g. "Ciprofloxacin 500mg Tablet" */
  canonicalName: string;
  /** Active generic salt name e.g. "ciprofloxacin" */
  salt: string;
  /** Extracted strength e.g. "500mg", "625mg", "40mg" */
  strength: string;
  /** Dosage form e.g. "Tablet", "Capsule", "Syrup", "Injection", "Gel" */
  dosageForm: string;
  /** Therapeutic category */
  category: string;
  /** Whether this is a fixed-dose combination */
  isCombination: boolean;
  /** Individual active ingredients */
  components: string[];
  /** Normalization confidence score (0.0 to 1.0) */
  confidence: number;
  /** Original input query */
  rawInput: string;
}

export interface MedicineCatalogEntry {
  id: string;
  brandNames: string[];
  genericSalt: string;
  defaultStrength: string;
  strengths: string[];
  dosageForm: string;
  category: string;
  aliases: string[];
  requiresColdChain?: boolean;
}

export const INDIAN_MEDICINE_CATALOG: MedicineCatalogEntry[] = [
  // ── Antibiotics ─────────────────────────────────────────────────────────────
  {
    id: 'med-cipro',
    brandNames: ['Cifran', 'Ciplox', 'Ciprobid', 'Cipro', 'Ciprolet'],
    genericSalt: 'ciprofloxacin',
    defaultStrength: '500mg',
    strengths: ['250mg', '500mg', '750mg'],
    dosageForm: 'Tablet',
    category: 'Fluoroquinolone Antibiotic',
    aliases: ['cipro', 'ciproflox', 'ciprofloxacin', 'cifran 500', 'ciplox 500', 'cipro 500'],
  },
  {
    id: 'med-augmentin',
    brandNames: ['Augmentin', 'Moxikind-CV', 'Clavam', 'Sensiclav', 'Advent'],
    genericSalt: 'amoxicillin + clavulanate',
    defaultStrength: '625mg',
    strengths: ['375mg', '625mg', '1000mg', '1.2g'],
    dosageForm: 'Tablet',
    category: 'Penicillin Antibiotic',
    aliases: ['aug 625', 'augmentin 625', 'clavam 625', 'moxikind cv', 'amox-clav', 'amoxyclav'],
  },
  {
    id: 'med-azithral',
    brandNames: ['Azithral', 'Azee', 'Zithrox', 'Azicip', 'Zady'],
    genericSalt: 'azithromycin',
    defaultStrength: '500mg',
    strengths: ['250mg', '500mg'],
    dosageForm: 'Tablet',
    category: 'Macrolide Antibiotic',
    aliases: ['azith', 'azithral 500', 'azee 500', 'azithromycin 500', 'azithro'],
  },
  {
    id: 'med-levoflox',
    brandNames: ['Levomac', 'L-Cin', 'Glevo', 'Levoflox', 'Tavanic'],
    genericSalt: 'levofloxacin',
    defaultStrength: '500mg',
    strengths: ['250mg', '500mg', '750mg'],
    dosageForm: 'Tablet',
    category: 'Fluoroquinolone Antibiotic',
    aliases: ['levo', 'levomac 500', 'l-cin 500', 'levofloxacin'],
  },
  {
    id: 'med-monocef',
    brandNames: ['Monocef', 'Taxim-O', 'Cefakind', 'Oframax'],
    genericSalt: 'ceftriaxone',
    defaultStrength: '1g',
    strengths: ['250mg', '500mg', '1g', '2g'],
    dosageForm: 'Injection',
    category: 'Cephalosporin Antibiotic',
    aliases: ['monocef 1g', 'ceftriaxone', 'ceftriaxone 1gm', 'monocef inj'],
  },
  {
    id: 'med-oflox-oz',
    brandNames: ['O2', 'Oflox-OZ', 'Zenflox-OZ', 'Ornof'],
    genericSalt: 'ofloxacin + ornidazole',
    defaultStrength: '200mg/500mg',
    strengths: ['200mg/500mg'],
    dosageForm: 'Tablet',
    category: 'Antidiarrheal / Antibacterial',
    aliases: ['o2', 'o2 tab', 'oflox oz', 'zenflox oz', 'ofloxacin ornidazole'],
  },
  {
    id: 'med-doxycycline',
    brandNames: ['Dox-T', 'Doxy-1', 'Microdox-LBX', 'Doxt-SL'],
    genericSalt: 'doxycycline',
    defaultStrength: '100mg',
    strengths: ['100mg'],
    dosageForm: 'Capsule',
    category: 'Tetracycline Antibiotic',
    aliases: ['doxy', 'doxy 100', 'doxycycline 100mg', 'doxt'],
  },

  // ── Pain & Anti-inflammatory ────────────────────────────────────────────────
  {
    id: 'med-paracetamol',
    brandNames: ['Dolo 650', 'Calpol', 'Crocin', 'Pacimol', 'P-650'],
    genericSalt: 'paracetamol',
    defaultStrength: '650mg',
    strengths: ['500mg', '650mg', '1000mg', '120mg/5ml', '250mg/5ml'],
    dosageForm: 'Tablet',
    category: 'Antipyretic / Analgesic',
    aliases: ['dolo', 'dolo 650', 'calpol 650', 'calpol 500', 'crocin 650', 'pcm 650', 'paracetamol 650'],
  },
  {
    id: 'med-zerodol-sp',
    brandNames: ['Zerodol-SP', 'Hifenac-D', 'Aceclo-Plus', 'Dolokind-AA'],
    genericSalt: 'aceclofenac + paracetamol + serratiopeptidase',
    defaultStrength: '100mg/325mg/15mg',
    strengths: ['100mg/325mg/15mg'],
    dosageForm: 'Tablet',
    category: 'NSAID / Anti-inflammatory',
    aliases: ['zerodol sp', 'zerodol-p', 'hifenac sp', 'aceclo serratio', 'zerodol'],
  },
  {
    id: 'med-combiflam',
    brandNames: ['Combiflam', 'Ibugesic-Plus', 'Brufen-Plus', 'Flexon'],
    genericSalt: 'ibuprofen + paracetamol',
    defaultStrength: '400mg/325mg',
    strengths: ['400mg/325mg'],
    dosageForm: 'Tablet',
    category: 'NSAID Combination',
    aliases: ['combiflam', 'ibugesic plus', 'flexon', 'ibuprofen paracetamol'],
  },
  {
    id: 'med-voveran',
    brandNames: ['Voveran SR', 'Dynapar AQ', 'Diclogel', 'Volini'],
    genericSalt: 'diclofenac',
    defaultStrength: '75mg',
    strengths: ['50mg', '75mg', '100mg'],
    dosageForm: 'Tablet',
    category: 'NSAID',
    aliases: ['voveran 75', 'voveran sr', 'diclofenac 50', 'dynapar aq'],
  },

  // ── GI & Antacids ───────────────────────────────────────────────────────────
  {
    id: 'med-pantoprazole',
    brandNames: ['Pantocid', 'Pan 40', 'Pantop', 'Pantodac', 'Pan-D'],
    genericSalt: 'pantoprazole',
    defaultStrength: '40mg',
    strengths: ['20mg', '40mg'],
    dosageForm: 'Tablet',
    category: 'Proton Pump Inhibitor (PPI)',
    aliases: ['panto 40', 'pan 40', 'pantocid 40', 'pantop 40', 'pantoprazole 40mg', 'pan d'],
  },
  {
    id: 'med-pantop-dsr',
    brandNames: ['Pan-D', 'Pantocid-DSR', 'Pantosec-DSR', 'Dompan'],
    genericSalt: 'pantoprazole + domperidone',
    defaultStrength: '40mg/30mg',
    strengths: ['40mg/30mg'],
    dosageForm: 'Capsule',
    category: 'PPI + Antiemetic',
    aliases: ['pan d', 'pantocid dsr', 'panto dsr', 'pantoprazole domperidone'],
  },
  {
    id: 'med-omeprazole',
    brandNames: ['Omez', 'Omee', 'Omecip', 'Ocid'],
    genericSalt: 'omeprazole',
    defaultStrength: '20mg',
    strengths: ['10mg', '20mg', '40mg'],
    dosageForm: 'Capsule',
    category: 'Proton Pump Inhibitor (PPI)',
    aliases: ['omez 20', 'omeprazole 20mg', 'omee', 'ocid 20'],
  },
  {
    id: 'med-ondansetron',
    brandNames: ['Emeset', 'Ondem', 'Vomikind', 'Zofran'],
    genericSalt: 'ondansetron',
    defaultStrength: '4mg',
    strengths: ['2mg/5ml', '4mg', '8mg'],
    dosageForm: 'Tablet',
    category: 'Antiemetic',
    aliases: ['emeset 4', 'ondem 4', 'vomikind', 'ondansetron 4mg'],
  },

  // ── Diabetes ────────────────────────────────────────────────────────────────
  {
    id: 'med-metformin',
    brandNames: ['Glycomet', 'Glyciphage', 'Cetapin', 'Glucophage', 'Obimet'],
    genericSalt: 'metformin',
    defaultStrength: '500mg',
    strengths: ['250mg', '500mg', '850mg', '1000mg', '500mg SR'],
    dosageForm: 'Tablet',
    category: 'Biguanide Antidiabetic',
    aliases: ['glycomet 500', 'glycomet sr 500', 'metformin 500', 'glyciphage 500', 'met 500'],
  },
  {
    id: 'med-glimepiride',
    brandNames: ['Amaryl', 'Glimisave', 'Zoryl', 'Gemer'],
    genericSalt: 'glimepiride',
    defaultStrength: '2mg',
    strengths: ['1mg', '2mg', '3mg', '4mg'],
    dosageForm: 'Tablet',
    category: 'Sulfonylurea Antidiabetic',
    aliases: ['amaryl 2', 'glimisave 2', 'zoryl 2', 'glimepiride 2mg', 'glimepiride 1mg'],
  },
  {
    id: 'med-lantus',
    brandNames: ['Lantus Solostar', 'Basalog', 'Glaritus', 'Basaglar'],
    genericSalt: 'insulin glargine',
    defaultStrength: '100 IU/ml',
    strengths: ['100 IU/ml (3ml cartridge)', '100 IU/ml (10ml vial)'],
    dosageForm: 'Cartridge / Injection',
    category: 'Long-acting Insulin',
    requiresColdChain: true,
    aliases: ['lantus', 'lantus cartridge', 'basalog', 'insulin glargine', 'lantus solostar'],
  },
  {
    id: 'med-humalog',
    brandNames: ['Humalog Kwikpen', 'Novorapid', 'Apidra'],
    genericSalt: 'insulin lispro',
    defaultStrength: '100 IU/ml',
    strengths: ['100 IU/ml (3ml pen)'],
    dosageForm: 'Injection Pen',
    category: 'Rapid-acting Insulin',
    requiresColdChain: true,
    aliases: ['humalog', 'novorapid', 'insulin lispro', 'rapid insulin'],
  },
  {
    id: 'med-januvia',
    brandNames: ['Januvia', 'Istavel', 'Janumet'],
    genericSalt: 'sitagliptin',
    defaultStrength: '100mg',
    strengths: ['50mg', '100mg'],
    dosageForm: 'Tablet',
    category: 'DPP-4 Inhibitor',
    aliases: ['januvia 100', 'sitagliptin 100mg', 'istavel 100'],
  },
  {
    id: 'med-forxiga',
    brandNames: ['Forxiga', 'Oxra', 'Dapavel'],
    genericSalt: 'dapagliflozin',
    defaultStrength: '10mg',
    strengths: ['5mg', '10mg'],
    dosageForm: 'Tablet',
    category: 'SGLT2 Inhibitor',
    aliases: ['forxiga 10', 'dapagliflozin 10mg', 'oxra 10'],
  },

  // ── Cardiovascular & Hypertension ───────────────────────────────────────────
  {
    id: 'med-telmisartan',
    brandNames: ['Telma', 'Telmikind', 'Telpres', 'Telsartan', 'Telma-H'],
    genericSalt: 'telmisartan',
    defaultStrength: '40mg',
    strengths: ['20mg', '40mg', '80mg'],
    dosageForm: 'Tablet',
    category: 'Angiotensin Receptor Blocker (ARB)',
    aliases: ['telma 40', 'telma h', 'telmikind 40', 'telmisartan 40mg', 'telma 20'],
  },
  {
    id: 'med-amlodipine',
    brandNames: ['Amlokind', 'Amlopress', 'Stamlo', 'Norvasc'],
    genericSalt: 'amlodipine',
    defaultStrength: '5mg',
    strengths: ['2.5mg', '5mg', '10mg'],
    dosageForm: 'Tablet',
    category: 'Calcium Channel Blocker',
    aliases: ['amlokind 5', 'amlopress 5', 'amlodipine 5mg', 'stamlo 5'],
  },
  {
    id: 'med-atorvastatin',
    brandNames: ['Atorva', 'Lipitor', 'Storvas', 'Atocor', 'Tonact'],
    genericSalt: 'atorvastatin',
    defaultStrength: '10mg',
    strengths: ['10mg', '20mg', '40mg', '80mg'],
    dosageForm: 'Tablet',
    category: 'Statin / Lipid Lowering',
    aliases: ['atorva 10', 'atorva 20', 'atorvastatin 10mg', 'atorvastatin 20mg', 'lipitor'],
  },
  {
    id: 'med-rosuvastatin',
    brandNames: ['Rosave', 'Crestor', 'Rozavel', 'Rosuvas'],
    genericSalt: 'rosuvastatin',
    defaultStrength: '10mg',
    strengths: ['5mg', '10mg', '20mg'],
    dosageForm: 'Tablet',
    category: 'Statin / Lipid Lowering',
    aliases: ['rosave 10', 'crestor 10', 'rosuvastatin 10mg', 'rozavel 10'],
  },
  {
    id: 'med-ecosprin',
    brandNames: ['Ecosprin', 'Disprin', 'Loprin', 'Delisprin'],
    genericSalt: 'aspirin',
    defaultStrength: '75mg',
    strengths: ['75mg', '150mg', '325mg'],
    dosageForm: 'Tablet (Enteric Coated)',
    category: 'Antiplatelet',
    aliases: ['ecosprin 75', 'ecosprin 150', 'aspirin 75mg', 'aspirin 150mg', 'ecosprin-av'],
  },
  {
    id: 'med-clopidogrel',
    brandNames: ['Clopitab', 'Plavix', 'Deplatt', 'Clavix'],
    genericSalt: 'clopidogrel',
    defaultStrength: '75mg',
    strengths: ['75mg', '150mg'],
    dosageForm: 'Tablet',
    category: 'Antiplatelet',
    aliases: ['clopitab 75', 'plavix 75', 'deplatt 75', 'clopidogrel 75mg'],
  },
  {
    id: 'med-metoprolol',
    brandNames: ['Metolar', 'Betaloc', 'Seloken', 'Met-XL'],
    genericSalt: 'metoprolol',
    defaultStrength: '50mg',
    strengths: ['25mg', '50mg', '100mg'],
    dosageForm: 'Tablet (Extended Release)',
    category: 'Beta Blocker',
    aliases: ['metolar 50', 'met-xl 25', 'betaloc 50', 'metoprolol succinate'],
  },

  // ── Respiratory & Allergy ───────────────────────────────────────────────────
  {
    id: 'med-montair-lc',
    brandNames: ['Montair-LC', 'Montek-LC', 'Telekast-L', 'Monticope', 'Levocet-M'],
    genericSalt: 'montelukast + levocetirizine',
    defaultStrength: '10mg/5mg',
    strengths: ['10mg/5mg'],
    dosageForm: 'Tablet',
    category: 'Antihistamine / Antiallergic',
    aliases: ['montair lc', 'montek lc', 'telekast l', 'montelukast levocetirizine'],
  },
  {
    id: 'med-cetirizine',
    brandNames: ['Cetzine', 'Alerid', 'Okacet', 'Zyrtec'],
    genericSalt: 'cetirizine',
    defaultStrength: '10mg',
    strengths: ['5mg/5ml', '10mg'],
    dosageForm: 'Tablet',
    category: 'Antihistamine',
    aliases: ['cetzine 10', 'alerid 10', 'okacet 10', 'cetirizine 10mg'],
  },
  {
    id: 'med-asthalin',
    brandNames: ['Asthalin Inhaler', 'Ventorlin', 'Salbair'],
    genericSalt: 'salbutamol',
    defaultStrength: '100mcg/puff',
    strengths: ['100mcg/puff (200 doses)', '2mg', '4mg'],
    dosageForm: 'Inhaler / MDI',
    category: 'Short-Acting Bronchodilator',
    aliases: ['asthalin', 'asthalin inhaler', 'salbutamol inhaler', 'ventolin'],
  },
  {
    id: 'med-budecort',
    brandNames: ['Budecort Inhaler', 'Pulmicort', 'Budate'],
    genericSalt: 'budesonide',
    defaultStrength: '200mcg',
    strengths: ['100mcg', '200mcg', '400mcg', '0.5mg respules'],
    dosageForm: 'Inhaler / Respule',
    category: 'Inhaled Corticosteroid',
    aliases: ['budecort', 'budecort 200', 'budesonide inhaler', 'pulmicort'],
  },

  // ── Thyroid & Hormonal ──────────────────────────────────────────────────────
  {
    id: 'med-thyronorm',
    brandNames: ['Thyronorm', 'Eltroxin', 'Thyrox', 'Synthroid'],
    genericSalt: 'levothyroxine',
    defaultStrength: '50mcg',
    strengths: ['25mcg', '50mcg', '75mcg', '88mcg', '100mcg', '125mcg'],
    dosageForm: 'Tablet',
    category: 'Thyroid Hormone',
    aliases: ['thyronorm 50', 'thyronorm 100', 'eltroxin 50', 'levothyroxine 50mcg', 'thyrox 50'],
  },

  // ── Supplements & Vitamins ──────────────────────────────────────────────────
  {
    id: 'med-shelcal',
    brandNames: ['Shelcal 500', 'Calcimax 500', 'Gemcal', 'Cipcal 500'],
    genericSalt: 'calcium + vitamin d3',
    defaultStrength: '500mg/250 IU',
    strengths: ['500mg/250 IU'],
    dosageForm: 'Tablet',
    category: 'Nutritional Supplement',
    aliases: ['shelcal 500', 'calcimax', 'calcium d3', 'shelcal-hd', 'gemcal'],
  },
  {
    id: 'med-becosules',
    brandNames: ['Becosules', 'Cobadex-Z', 'Surbex-T', 'Neurobion Forte'],
    genericSalt: 'b-complex + vitamin c + zinc',
    defaultStrength: 'Standard Therapeutic',
    strengths: ['Standard Therapeutic'],
    dosageForm: 'Capsule',
    category: 'B-Complex Multivitamin',
    aliases: ['becosules', 'becosule', 'b-complex', 'neurobion forte', 'cobadex'],
  },
];

/**
 * Calculates simple Levenshtein distance between two strings
 */
function levenshtein(a: string, b: string): number {
  const an = a.length;
  const bn = b.length;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix = Array.from({ length: bn + 1 }, (_, i) => [i]);
  for (let j = 0; j <= an; j++) matrix[0][j] = j;

  for (let i = 1; i <= bn; i++) {
    for (let j = 1; j <= an; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[bn][an];
}

/**
 * Normalizes any free-form medicine input (e.g. "Cipro 500", "panto 40", "dolo 650", "Augmentin-625")
 * into a structured, validated generic object.
 */
export function normalizeMedicineName(raw: string): NormalizedMedicine {
  if (!raw || typeof raw !== 'string') {
    return {
      canonicalName: 'Unknown Medicine',
      salt: 'unknown',
      strength: 'N/A',
      dosageForm: 'Tablet',
      category: 'Unclassified',
      isCombination: false,
      components: ['unknown'],
      confidence: 0.1,
      rawInput: raw || '',
    };
  }

  const cleanRaw = raw.trim();
  const lower = cleanRaw.toLowerCase();

  // 1. Extract explicit strength if present (e.g. "500mg", "625 mg", "40mg", "100 iu/ml")
  const strengthMatch = lower.match(/(\d+(?:\.\d+)?\s*(?:mg|mcg|µg|iu(?:\/ml)?|g|gm|ml|units?|puff))\b/i);
  const rawNumberMatch = lower.match(/\b(\d{2,4})\b/);
  const detectedStrength = strengthMatch ? strengthMatch[1].replace(/\s+/g, '') : rawNumberMatch ? `${rawNumberMatch[1]}mg` : '';

  // 2. Extract dosage form if present
  let detectedForm = 'Tablet';
  if (/capsule|cap\b/i.test(lower)) detectedForm = 'Capsule';
  else if (/injection|inj\b|vial|ampoule/i.test(lower)) detectedForm = 'Injection';
  else if (/syrup|suspension|liquid|drops/i.test(lower)) detectedForm = 'Syrup';
  else if (/inhaler|mdi|respule|puff/i.test(lower)) detectedForm = 'Inhaler';
  else if (/ointment|gel|cream/i.test(lower)) detectedForm = 'Gel/Ointment';

  // 3. Search catalog for exact or alias match
  let bestEntry: MedicineCatalogEntry | null = null;
  let bestScore = 0; // 0 to 1

  // Clean tokens for matching
  const cleanedSearch = lower
    .replace(/\b(tablet|tab|capsule|cap|injection|inj|syrup|mg|mcg|iu|ml)\b/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  for (const entry of INDIAN_MEDICINE_CATALOG) {
    // Exact generic salt match
    if (entry.genericSalt.toLowerCase() === cleanedSearch) {
      bestEntry = entry;
      bestScore = 1.0;
      break;
    }

    // Check alias list
    for (const alias of entry.aliases) {
      if (lower.includes(alias) || cleanedSearch === alias) {
        const score = 0.95;
        if (score > bestScore) {
          bestScore = score;
          bestEntry = entry;
        }
      }
    }

    // Check brand names
    for (const brand of entry.brandNames) {
      const bLower = brand.toLowerCase();
      if (lower.includes(bLower)) {
        const score = 0.92;
        if (score > bestScore) {
          bestScore = score;
          bestEntry = entry;
        }
      }
    }

    // Fuzzy Levenshtein check on words if no strong match
    if (bestScore < 0.85) {
      const searchWords = cleanedSearch.split(' ');
      for (const alias of entry.aliases) {
        const aliasFirst = alias.split(' ')[0];
        for (const word of searchWords) {
          if (word.length >= 4 && aliasFirst.length >= 4) {
            const dist = levenshtein(word, aliasFirst);
            if (dist <= 1) {
              const fuzzyScore = 0.82;
              if (fuzzyScore > bestScore) {
                bestScore = fuzzyScore;
                bestEntry = entry;
              }
            } else if (dist === 2 && word.length >= 6) {
              const fuzzyScore = 0.70;
              if (fuzzyScore > bestScore) {
                bestScore = fuzzyScore;
                bestEntry = entry;
              }
            }
          }
        }
      }
    }
  }

  // Build normalized representation
  if (bestEntry) {
    const finalStrength = detectedStrength || bestEntry.defaultStrength;
    const finalForm = detectedForm !== 'Tablet' ? detectedForm : bestEntry.dosageForm;
    const isCombo = bestEntry.genericSalt.includes('+');
    const components = bestEntry.genericSalt.split('+').map((s) => s.trim());

    // Capitalize canonical words
    const capitalizedSalt = bestEntry.genericSalt
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    return {
      canonicalName: `${capitalizedSalt} ${finalStrength} ${finalForm}`.trim(),
      salt: bestEntry.genericSalt,
      strength: finalStrength,
      dosageForm: finalForm,
      category: bestEntry.category,
      isCombination: isCombo,
      components,
      confidence: Math.min(1.0, bestScore),
      rawInput: cleanRaw,
    };
  }

  // Fallback if not directly in catalog
  const fallbackSalt = cleanedSearch || lower;
  const isCombo = fallbackSalt.includes('+');
  const components = fallbackSalt.split('+').map((s) => s.trim());

  return {
    canonicalName: `${cleanRaw.charAt(0).toUpperCase() + cleanRaw.slice(1)} ${detectedStrength}`.trim(),
    salt: fallbackSalt,
    strength: detectedStrength || 'Standard',
    dosageForm: detectedForm,
    category: 'Unverified Retail Medicine',
    isCombination: isCombo,
    components,
    confidence: cleanRaw.length >= 3 ? 0.55 : 0.2,
    rawInput: cleanRaw,
  };
}
