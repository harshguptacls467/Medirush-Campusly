// ─── Shadow Inventory Engine ──────────────────────────────────────────────────
// Manages invoice-derived shadow inventory across pharmacies with batch tracking,
// expiry dates, and freshness indicators.
// Disclaimer: "Estimated stock based on latest distributor invoice — not guaranteed live stock"

import { calculateInventoryFreshness, FreshnessResult, FreshnessStatus } from './inventory-freshness';
import { normalizeMedicineName } from './medicine-normalizer';

export interface ShadowInventoryItem {
  id: string;
  pharmacy_id: string;
  pharmacy_name: string;
  product_name: string;
  normalized_salt: string;
  strength: string;
  dosage_form: string;
  batch_no: string;
  quantity: number;
  unit: string;
  expiry_date: string;
  manufacturer: string;
  source_invoice_id: string;
  invoice_date: string;
  created_at: string;
  last_updated: string;
  confidence: number;
  requires_cold_chain: boolean;
  freshness?: FreshnessResult;
}

export interface InvoiceRecord {
  id: string;
  pharmacy_id: string;
  pharmacy_name: string;
  distributor_name: string;
  invoice_no: string;
  invoice_date: string;
  extracted_items_count: number;
  ocr_confidence: number;
  created_at: string;
}

// ─── Initial In-Memory / Pre-Seeded Shadow Inventory for Demo ──────────────────
// Realistic distributor invoices recorded across Ratlam/Gwalior pharmacies

const SEED_INVOICES: InvoiceRecord[] = [
  {
    id: 'INV-2026-GUPTA-01',
    pharmacy_id: 'chem-1',
    pharmacy_name: 'Gupta Medicos & Cold Chain Hub',
    distributor_name: 'Sun Pharma Regional C&F Depo, Indore',
    invoice_no: 'SP/IND/2026/8892',
    invoice_date: '2026-09-25', // 2 days ago (FRESH)
    extracted_items_count: 5,
    ocr_confidence: 0.96,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'INV-2026-VERMA-01',
    pharmacy_id: 'chem-2',
    pharmacy_name: 'Verma Pharma & Healthcare',
    distributor_name: 'Cipla Trade Distributorship, Ujjain',
    invoice_no: 'CIP/UJJ/9021',
    invoice_date: '2026-09-12', // 15 days ago (AGING)
    extracted_items_count: 4,
    ocr_confidence: 0.91,
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'INV-2026-JAN-01',
    pharmacy_id: 'chem-3',
    pharmacy_name: 'Jan Aushadhi Kendra (Govt. Generic)',
    distributor_name: 'Bureau of Pharma PSUs of India (BPPI)',
    invoice_no: 'BPPI/MP/4412',
    invoice_date: '2026-09-26', // 1 day ago (FRESH)
    extracted_items_count: 6,
    ocr_confidence: 0.98,
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

const SEED_SHADOW_INVENTORY: ShadowInventoryItem[] = [
  // ── Gupta Medicos (chem-1) — Cold Chain & Chronic Specialist ─────────────────
  {
    id: 'sh-gup-1',
    pharmacy_id: 'chem-1',
    pharmacy_name: 'Gupta Medicos & Cold Chain Hub',
    product_name: 'Lantus Solostar 100IU/ml Pen',
    normalized_salt: 'insulin glargine',
    strength: '100 IU/ml',
    dosage_form: 'Injection Pen',
    batch_no: 'LAN26B04',
    quantity: 14,
    unit: 'pens',
    expiry_date: '2027-08',
    manufacturer: 'Sanofi India Ltd',
    source_invoice_id: 'INV-2026-GUPTA-01',
    invoice_date: '2026-09-25',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    last_updated: new Date(Date.now() - 2 * 86400000).toISOString(),
    confidence: 0.97,
    requires_cold_chain: true,
  },
  {
    id: 'sh-gup-2',
    pharmacy_id: 'chem-1',
    pharmacy_name: 'Gupta Medicos & Cold Chain Hub',
    product_name: 'Augmentin 625 Duo Tablet',
    normalized_salt: 'amoxicillin + clavulanate',
    strength: '625mg',
    dosage_form: 'Tablet',
    batch_no: 'AUG26E12',
    quantity: 45,
    unit: 'strips',
    expiry_date: '2027-11',
    manufacturer: 'GlaxoSmithKline Pharmaceuticals',
    source_invoice_id: 'INV-2026-GUPTA-01',
    invoice_date: '2026-09-25',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    last_updated: new Date(Date.now() - 2 * 86400000).toISOString(),
    confidence: 0.95,
    requires_cold_chain: false,
  },
  {
    id: 'sh-gup-3',
    pharmacy_id: 'chem-1',
    pharmacy_name: 'Gupta Medicos & Cold Chain Hub',
    product_name: 'Pantocid 40mg Tablet',
    normalized_salt: 'pantoprazole',
    strength: '40mg',
    dosage_form: 'Tablet',
    batch_no: 'PAN25K89',
    quantity: 60,
    unit: 'strips',
    expiry_date: '2028-02',
    manufacturer: 'Sun Pharma',
    source_invoice_id: 'INV-2026-GUPTA-01',
    invoice_date: '2026-09-25',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    last_updated: new Date(Date.now() - 2 * 86400000).toISOString(),
    confidence: 0.96,
    requires_cold_chain: false,
  },
  {
    id: 'sh-gup-4',
    pharmacy_id: 'chem-1',
    pharmacy_name: 'Gupta Medicos & Cold Chain Hub',
    product_name: 'Telma 40mg Tablet',
    normalized_salt: 'telmisartan',
    strength: '40mg',
    dosage_form: 'Tablet',
    batch_no: 'TEL26H01',
    quantity: 35,
    unit: 'strips',
    expiry_date: '2027-10',
    manufacturer: 'Glenmark Pharmaceuticals',
    source_invoice_id: 'INV-2026-GUPTA-01',
    invoice_date: '2026-09-25',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    last_updated: new Date(Date.now() - 2 * 86400000).toISOString(),
    confidence: 0.94,
    requires_cold_chain: false,
  },
  {
    id: 'sh-gup-5',
    pharmacy_id: 'chem-1',
    pharmacy_name: 'Gupta Medicos & Cold Chain Hub',
    product_name: 'Glycomet-SR 500mg Tablet',
    normalized_salt: 'metformin',
    strength: '500mg',
    dosage_form: 'Tablet',
    batch_no: 'GLY25M33',
    quantity: 50,
    unit: 'strips',
    expiry_date: '2028-01',
    manufacturer: 'USV Private Ltd',
    source_invoice_id: 'INV-2026-GUPTA-01',
    invoice_date: '2026-09-25',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    last_updated: new Date(Date.now() - 2 * 86400000).toISOString(),
    confidence: 0.96,
    requires_cold_chain: false,
  },

  // ── Verma Pharma (chem-2) — General Acute Medicines (Aging) ─────────────────
  {
    id: 'sh-ver-1',
    pharmacy_id: 'chem-2',
    pharmacy_name: 'Verma Pharma & Healthcare',
    product_name: 'Ciprofloxacin 500mg (Ciplox)',
    normalized_salt: 'ciprofloxacin',
    strength: '500mg',
    dosage_form: 'Tablet',
    batch_no: 'CIP24A91',
    quantity: 20,
    unit: 'strips',
    expiry_date: '2027-04',
    manufacturer: 'Cipla Ltd',
    source_invoice_id: 'INV-2026-VERMA-01',
    invoice_date: '2026-09-12',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    last_updated: new Date(Date.now() - 15 * 86400000).toISOString(),
    confidence: 0.91,
    requires_cold_chain: false,
  },
  {
    id: 'sh-ver-2',
    pharmacy_id: 'chem-2',
    pharmacy_name: 'Verma Pharma & Healthcare',
    product_name: 'Dolo 650mg Tablet',
    normalized_salt: 'paracetamol',
    strength: '650mg',
    dosage_form: 'Tablet',
    batch_no: 'DOL25T77',
    quantity: 80,
    unit: 'strips',
    expiry_date: '2028-06',
    manufacturer: 'Micro Labs Ltd',
    source_invoice_id: 'INV-2026-VERMA-01',
    invoice_date: '2026-09-12',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    last_updated: new Date(Date.now() - 15 * 86400000).toISOString(),
    confidence: 0.95,
    requires_cold_chain: false,
  },
  {
    id: 'sh-ver-3',
    pharmacy_id: 'chem-2',
    pharmacy_name: 'Verma Pharma & Healthcare',
    product_name: 'Azithral 500mg Tablet',
    normalized_salt: 'azithromycin',
    strength: '500mg',
    dosage_form: 'Tablet',
    batch_no: 'AZI25Q14',
    quantity: 25,
    unit: 'strips',
    expiry_date: '2027-09',
    manufacturer: 'Alembic Pharmaceuticals',
    source_invoice_id: 'INV-2026-VERMA-01',
    invoice_date: '2026-09-12',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    last_updated: new Date(Date.now() - 15 * 86400000).toISOString(),
    confidence: 0.92,
    requires_cold_chain: false,
  },

  // ── Jan Aushadhi Kendra (chem-3) — High Affordable Generics ───────────────────
  {
    id: 'sh-jan-1',
    pharmacy_id: 'chem-3',
    pharmacy_name: 'Jan Aushadhi Kendra (Govt. Generic)',
    product_name: 'Ciprofloxacin Tablets IP 500mg (PMBJP)',
    normalized_salt: 'ciprofloxacin',
    strength: '500mg',
    dosage_form: 'Tablet',
    batch_no: 'JA-CIP-26',
    quantity: 120,
    unit: 'strips',
    expiry_date: '2028-03',
    manufacturer: 'BPPI Certified Unit',
    source_invoice_id: 'INV-2026-JAN-01',
    invoice_date: '2026-09-26',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    last_updated: new Date(Date.now() - 1 * 86400000).toISOString(),
    confidence: 0.98,
    requires_cold_chain: false,
  },
  {
    id: 'sh-jan-2',
    pharmacy_id: 'chem-3',
    pharmacy_name: 'Jan Aushadhi Kendra (Govt. Generic)',
    product_name: 'Metformin Hydrochloride Prolonged-Release IP 500mg',
    normalized_salt: 'metformin',
    strength: '500mg',
    dosage_form: 'Tablet',
    batch_no: 'JA-MET-44',
    quantity: 200,
    unit: 'strips',
    expiry_date: '2028-05',
    manufacturer: 'BPPI Certified Unit',
    source_invoice_id: 'INV-2026-JAN-01',
    invoice_date: '2026-09-26',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    last_updated: new Date(Date.now() - 1 * 86400000).toISOString(),
    confidence: 0.99,
    requires_cold_chain: false,
  },
  {
    id: 'sh-jan-3',
    pharmacy_id: 'chem-3',
    pharmacy_name: 'Jan Aushadhi Kendra (Govt. Generic)',
    product_name: 'Montelukast 10mg + Levocetirizine 5mg',
    normalized_salt: 'montelukast + levocetirizine',
    strength: '10mg/5mg',
    dosage_form: 'Tablet',
    batch_no: 'JA-MON-12',
    quantity: 75,
    unit: 'strips',
    expiry_date: '2027-12',
    manufacturer: 'BPPI Certified Unit',
    source_invoice_id: 'INV-2026-JAN-01',
    invoice_date: '2026-09-26',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    last_updated: new Date(Date.now() - 1 * 86400000).toISOString(),
    confidence: 0.96,
    requires_cold_chain: false,
  },
];

// Global in-memory storage for runtime mutation
let inMemoryInventory: ShadowInventoryItem[] = [...SEED_SHADOW_INVENTORY];
let inMemoryInvoices: InvoiceRecord[] = [...SEED_INVOICES];

/**
 * Get all shadow inventory items for a given pharmacy or all pharmacies,
 * with real-time freshness calculated dynamically.
 */
export function getShadowInventory(pharmacyId?: string): ShadowInventoryItem[] {
  if (!pharmacyId || pharmacyId === 'ALL') {
    return inMemoryInventory.map((item) => ({
      ...item,
      freshness: calculateInventoryFreshness(item.invoice_date || item.created_at),
    }));
  }

  // Exact pharmacy match
  let list = inMemoryInventory.filter((item) => item.pharmacy_id === pharmacyId);

  // If this is a dynamic live GPS pharmacy node, map to appropriate stock category slice
  if (list.length === 0) {
    if (pharmacyId.includes('1') || pharmacyId.includes('gup') || pharmacyId.includes('cold')) {
      list = inMemoryInventory.filter((item) => item.pharmacy_id === 'chem-1');
    } else if (pharmacyId.includes('2') || pharmacyId.includes('verma') || pharmacyId.includes('acute')) {
      list = inMemoryInventory.filter((item) => item.pharmacy_id === 'chem-2');
    } else if (pharmacyId.includes('3') || pharmacyId.includes('jan') || pharmacyId.includes('pmbjp')) {
      list = inMemoryInventory.filter((item) => item.pharmacy_id === 'chem-3');
    } else if (pharmacyId.includes('4') || pharmacyId.includes('san') || pharmacyId.includes('24x7')) {
      list = inMemoryInventory.filter((item) => item.pharmacy_id === 'chem-1' || item.pharmacy_id === 'chem-2');
    } else {
      list = inMemoryInventory.slice(0, 4);
    }
  }

  return list.map((item) => ({
    ...item,
    freshness: calculateInventoryFreshness(item.invoice_date || item.created_at),
  }));
}

/**
 * Get all invoice records for a pharmacy.
 */
export function getInvoices(pharmacyId?: string): InvoiceRecord[] {
  return pharmacyId
    ? inMemoryInvoices.filter((inv) => inv.pharmacy_id === pharmacyId)
    : inMemoryInvoices;
}

/**
 * Add an invoice and commit its extracted items to shadow inventory.
 */
export function commitInvoiceToShadowInventory(
  invoice: InvoiceRecord,
  items: Array<Omit<ShadowInventoryItem, 'id' | 'created_at' | 'last_updated' | 'source_invoice_id' | 'pharmacy_id' | 'pharmacy_name'>>
): { savedInvoice: InvoiceRecord; savedItems: ShadowInventoryItem[] } {
  // Store invoice record
  inMemoryInvoices = [invoice, ...inMemoryInvoices.filter((i) => i.id !== invoice.id)];

  const nowIso = new Date().toISOString();
  const savedItems: ShadowInventoryItem[] = items.map((raw, idx) => {
    const norm = normalizeMedicineName(raw.product_name);
    return {
      ...raw,
      id: `sh-${invoice.pharmacy_id}-${Date.now()}-${idx}`,
      pharmacy_id: invoice.pharmacy_id,
      pharmacy_name: invoice.pharmacy_name,
      normalized_salt: norm.salt || raw.normalized_salt,
      strength: norm.strength !== 'Standard' ? norm.strength : raw.strength,
      dosage_form: norm.dosageForm || raw.dosage_form || 'Tablet',
      source_invoice_id: invoice.id,
      invoice_date: invoice.invoice_date,
      created_at: nowIso,
      last_updated: nowIso,
      freshness: calculateInventoryFreshness(invoice.invoice_date),
    };
  });

  // Add/Merge into global inventory
  inMemoryInventory = [...savedItems, ...inMemoryInventory];

  return { savedInvoice: invoice, savedItems };
}

/**
 * Match a requested prescription medicine against pharmacy shadow inventory.
 */
export interface InventoryMatchResult {
  matched: boolean;
  item?: ShadowInventoryItem;
  confidence: number;
  matchType: 'EXACT_SALT' | 'BRAND_ALIAS' | 'COMBINATION_COMPONENT' | 'NONE';
  freshness?: FreshnessResult;
  auditNotes: string;
}

export function matchMedicineInInventory(
  queryMedicine: string,
  pharmacyId: string
): InventoryMatchResult {
  const normQuery = normalizeMedicineName(queryMedicine);
  const pharmacyStock = getShadowInventory(pharmacyId);

  // 1. Exact canonical salt match
  for (const item of pharmacyStock) {
    if (item.normalized_salt.toLowerCase() === normQuery.salt.toLowerCase()) {
      return {
        matched: true,
        item,
        confidence: Math.min(0.98, normQuery.confidence * item.confidence),
        matchType: 'EXACT_SALT',
        freshness: item.freshness,
        auditNotes: `Direct generic salt match (${item.product_name}, Batch #${item.batch_no})`,
      };
    }
  }

  // 2. Product name partial / brand match
  const qLower = queryMedicine.toLowerCase();
  for (const item of pharmacyStock) {
    if (item.product_name.toLowerCase().includes(qLower) || qLower.includes(item.product_name.toLowerCase())) {
      return {
        matched: true,
        item,
        confidence: 0.90,
        matchType: 'BRAND_ALIAS',
        freshness: item.freshness,
        auditNotes: `Brand name shadow match (${item.product_name})`,
      };
    }
  }

  // 3. Combination component match
  if (normQuery.isCombination) {
    for (const item of pharmacyStock) {
      if (normQuery.components.some((c) => item.normalized_salt.toLowerCase().includes(c.toLowerCase()))) {
        return {
          matched: true,
          item,
          confidence: 0.75,
          matchType: 'COMBINATION_COMPONENT',
          freshness: item.freshness,
          auditNotes: `Partial active component match (${item.product_name})`,
        };
      }
    }
  }

  return {
    matched: false,
    confidence: 0,
    matchType: 'NONE',
    auditNotes: 'No matching stock found in invoice shadow inventory',
  };
}
