// ─── Local Medicine Offline Search Engine ─────────────────────────────────────
// Fast, offline-capable local search engine for pharmacy devices.
// Runs purely client-side or server-side without external network roundtrips.

import { normalizeMedicineName, INDIAN_MEDICINE_CATALOG, MedicineCatalogEntry } from './medicine-normalizer';
import { ShadowInventoryItem } from './inventory-engine';

export interface SearchResultItem {
  type: 'INVENTORY_STOCK' | 'CATALOG_GENERIC';
  id: string;
  title: string;
  subtitle: string;
  genericSalt: string;
  strength: string;
  dosageForm: string;
  category: string;
  matchScore: number; // 0 to 100
  confidenceLabel: 'EXACT' | 'HIGH' | 'MEDIUM' | 'LOW';
  inventoryItem?: ShadowInventoryItem;
  catalogEntry?: MedicineCatalogEntry;
  batchNo?: string;
  quantity?: number;
  unit?: string;
  observedText?: string;
  freshnessStatus?: string;
  requiresColdChain?: boolean;
}

/**
 * Perform offline local search across shadow inventory and the national medicine catalog.
 */
export function searchLocalMedicines(
  query: string,
  localInventory: ShadowInventoryItem[] = []
): SearchResultItem[] {
  if (!query || typeof query !== 'string') return [];
  const cleanQ = query.trim().toLowerCase();
  if (cleanQ.length === 0) return [];

  const results: SearchResultItem[] = [];
  const normQuery = normalizeMedicineName(cleanQ);

  // 1. Search Local Shadow Inventory first (highest priority)
  for (const item of localInventory) {
    let score = 0;
    const pName = item.product_name.toLowerCase();
    const salt = item.normalized_salt.toLowerCase();
    const batch = item.batch_no.toLowerCase();

    if (pName === cleanQ || salt === cleanQ) {
      score = 100;
    } else if (pName.startsWith(cleanQ) || salt.startsWith(cleanQ)) {
      score = 92;
    } else if (pName.includes(cleanQ) || salt.includes(cleanQ)) {
      score = 85;
    } else if (batch === cleanQ || batch.includes(cleanQ)) {
      score = 90;
    } else if (normQuery.salt && salt.includes(normQuery.salt.toLowerCase())) {
      score = 88;
    } else {
      // Word overlap
      const qWords = cleanQ.split(' ');
      const matchCount = qWords.filter((w) => pName.includes(w) || salt.includes(w)).length;
      if (matchCount > 0) {
        score = Math.round((matchCount / qWords.length) * 75);
      }
    }

    if (score >= 40) {
      results.push({
        type: 'INVENTORY_STOCK',
        id: item.id,
        title: item.product_name,
        subtitle: `Batch: ${item.batch_no} • Qty: ${item.quantity} ${item.unit}`,
        genericSalt: item.normalized_salt,
        strength: item.strength,
        dosageForm: item.dosage_form,
        category: item.requires_cold_chain ? 'Cold-Chain (2°C–8°C)' : 'Standard Storage',
        matchScore: score,
        confidenceLabel: score >= 90 ? 'EXACT' : score >= 75 ? 'HIGH' : 'MEDIUM',
        inventoryItem: item,
        batchNo: item.batch_no,
        quantity: item.quantity,
        unit: item.unit,
        observedText: item.freshness?.observedText || 'Distributor Invoice',
        freshnessStatus: item.freshness?.status || 'FRESH',
        requiresColdChain: item.requires_cold_chain,
      });
    }
  }

  // 2. Search National Medicine Catalog (Generics & Brands)
  for (const cat of INDIAN_MEDICINE_CATALOG) {
    let score = 0;
    const salt = cat.genericSalt.toLowerCase();
    const brands = cat.brandNames.map((b) => b.toLowerCase());
    const aliases = cat.aliases.map((a) => a.toLowerCase());

    if (salt === cleanQ || aliases.includes(cleanQ)) {
      score = 95;
    } else if (brands.some((b) => b === cleanQ || b.startsWith(cleanQ))) {
      score = 90;
    } else if (salt.includes(cleanQ) || aliases.some((a) => a.includes(cleanQ))) {
      score = 80;
    } else if (brands.some((b) => b.includes(cleanQ))) {
      score = 75;
    } else if (normQuery.salt && salt.includes(normQuery.salt.toLowerCase())) {
      score = 82;
    }

    // Only add if not already represented with higher score
    if (score >= 50) {
      results.push({
        type: 'CATALOG_GENERIC',
        id: cat.id,
        title: `${cat.brandNames[0]} (${cat.genericSalt})`,
        subtitle: `Generic: ${cat.genericSalt} | Standard: ${cat.defaultStrength}`,
        genericSalt: cat.genericSalt,
        strength: cat.defaultStrength,
        dosageForm: cat.dosageForm,
        category: cat.category,
        matchScore: score,
        confidenceLabel: score >= 90 ? 'HIGH' : 'MEDIUM',
        catalogEntry: cat,
        requiresColdChain: cat.requiresColdChain,
      });
    }
  }

  // Sort descending by match score
  return results.sort((a, b) => b.matchScore - a.matchScore);
}
