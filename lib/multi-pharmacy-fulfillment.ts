// ─── Optimal Multi-Pharmacy Fulfillment Combination Engine ────────────────────
// Finds the optimal single or cooperative multi-pharmacy fulfillment combination
// that maximizes prescription coverage (aiming for 100%) while minimizing
// total travel distance and delivery ETA.

import { CHEMIST_REGISTRY, ChemistNode } from './chemists';
import { getShadowInventory, matchMedicineInInventory, ShadowInventoryItem } from './inventory-engine';
import { calculateInventoryFreshness, FreshnessResult } from './inventory-freshness';

export interface FulfillmentMedItem {
  name: string;
  normalized_salt: string;
  dosage: string;
}

export interface PharmacyCoverageNode {
  chemistId: string;
  chemistName: string;
  area: string;
  city: string;
  distanceKm: number;
  phone: string;
  fulfilledMedicines: Array<{
    medicineName: string;
    productName: string;
    batchNo: string;
    confidence: number;
    matchType: string;
    freshness?: FreshnessResult;
  }>;
  missingMedicines: string[];
  coveragePercent: number; // 0 to 100
  distanceScore: number;   // 0 to 100
  freshnessScore: number;  // 0 to 100
  responseScore: number;   // 0 to 100
  totalNodeScore: number;  // 0 to 100
}

export interface MultiFulfillmentPlan {
  planType: 'SINGLE_NODE' | 'MULTI_NODE_SPLIT' | 'UNFULFILLABLE';
  overallCoverage: number; // 0 to 100
  totalNodes: number;
  primaryNode?: PharmacyCoverageNode;
  nodes: PharmacyCoverageNode[];
  allMedicinesCovered: boolean;
  scoringWeights: {
    coverage: number;
    distance: number;
    freshness: number;
    response: number;
  };
  totalEstimatedDistanceKm: number;
  estimatedDeliveryEtaMinutes: number;
  explanation: string;
}

/**
 * Calculates haversine distance in km between two GPS coordinates
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Optimal Multi-Pharmacy Fulfillment Solver
 * Searches combinations (1-node, 2-node, 3-node) to find the minimum distance & ETA route.
 */
export function calculateFulfillmentPlan(
  requestedMedicines: Array<{ name: string; dosage?: string }>,
  userLocation?: { lat: number; lng: number; city?: string },
  candidateChemists: ChemistNode[] = CHEMIST_REGISTRY
): MultiFulfillmentPlan {
  const weights = {
    coverage: 0.35,
    distance: 0.25,
    freshness: 0.20,
    response: 0.20,
  };

  if (!requestedMedicines || requestedMedicines.length === 0) {
    return {
      planType: 'UNFULFILLABLE',
      overallCoverage: 0,
      totalNodes: 0,
      nodes: [],
      allMedicinesCovered: false,
      scoringWeights: weights,
      totalEstimatedDistanceKm: 0,
      estimatedDeliveryEtaMinutes: 0,
      explanation: 'No medicines were provided for fulfillment analysis.',
    };
  }

  // 1. Analyze coverage for each registered/nearby pharmacy
  const pharmacyNodes: PharmacyCoverageNode[] = candidateChemists.map((chem) => {
    let distKm = chem.distance_km;
    if (userLocation && typeof userLocation.lat === 'number' && typeof userLocation.lng === 'number') {
      distKm = calculateHaversineDistance(
        userLocation.lat,
        userLocation.lng,
        chem.lat,
        chem.lng
      );
    }

    const fulfilled: PharmacyCoverageNode['fulfilledMedicines'] = [];
    const missing: string[] = [];
    let totalFreshnessSum = 0;

    for (const med of requestedMedicines) {
      const match = matchMedicineInInventory(med.name, chem.id);
      if (match.matched && match.item) {
        fulfilled.push({
          medicineName: med.name,
          productName: match.item.product_name,
          batchNo: match.item.batch_no,
          confidence: Math.round(match.confidence * 100),
          matchType: match.matchType,
          freshness: match.freshness,
        });
        totalFreshnessSum += match.freshness?.freshnessScore || 85;
      } else {
        missing.push(med.name);
      }
    }

    const coveragePct = Math.round((fulfilled.length / requestedMedicines.length) * 100);
    const avgFreshness = fulfilled.length > 0 ? Math.round(totalFreshnessSum / fulfilled.length) : 0;
    const distanceScore = Math.max(10, Math.min(100, Math.round(Math.exp(-0.35 * distKm) * 100)));
    const responseScore = Math.max(10, Math.min(100, Math.round(((120 - chem.avg_response_time_sec) / 120) * 100)));

    const totalNodeScore = Math.round(
      coveragePct * weights.coverage +
      distanceScore * weights.distance +
      avgFreshness * weights.freshness +
      responseScore * weights.response
    );

    return {
      chemistId: chem.id,
      chemistName: chem.name,
      area: chem.area,
      city: chem.city,
      distanceKm: distKm,
      phone: chem.phone,
      fulfilledMedicines: fulfilled,
      missingMedicines: missing,
      coveragePercent: coveragePct,
      distanceScore,
      freshnessScore: avgFreshness,
      responseScore,
      totalNodeScore,
    };
  });

  // Sort candidate nodes by total score descending
  pharmacyNodes.sort((a, b) => b.totalNodeScore - a.totalNodeScore);

  // 2. Check for Single-Node 100% fulfillers
  const completeSingleFulfillers = pharmacyNodes.filter((p) => p.coveragePercent === 100);
  if (completeSingleFulfillers.length > 0) {
    // Pick the closest single fulfiller
    completeSingleFulfillers.sort((a, b) => a.distanceKm - b.distanceKm);
    const bestSingle = completeSingleFulfillers[0];
    const eta = Math.round(12 + bestSingle.distanceKm * 4);

    return {
      planType: 'SINGLE_NODE',
      overallCoverage: 100,
      totalNodes: 1,
      primaryNode: bestSingle,
      nodes: [bestSingle],
      allMedicinesCovered: true,
      scoringWeights: weights,
      totalEstimatedDistanceKm: bestSingle.distanceKm,
      estimatedDeliveryEtaMinutes: eta,
      explanation: `Optimal 1-Node Fulfillment: ${bestSingle.chemistName} (${bestSingle.distanceKm} km away) has 100% of your prescribed medicines in shadow inventory. Estimated delivery in ${eta} mins.`,
    };
  }

  // 3. Find Optimal Multi-Node Combination (Best 2-node or 3-node set cover with minimum distance)
  const totalMedCount = requestedMedicines.length;
  let bestCombination: PharmacyCoverageNode[] = [];
  let maxCoveredCount = 0;
  let minCostScore = Infinity; // cost = totalDistance + (nodeCount * 0.8)

  // Eligible nodes that cover at least 1 medicine
  const eligible = pharmacyNodes.filter((p) => p.fulfilledMedicines.length > 0);

  // Evaluate all pairs (2-node combinations)
  for (let i = 0; i < eligible.length; i++) {
    for (let j = i + 1; j < eligible.length; j++) {
      const nodeA = eligible[i];
      const nodeB = eligible[j];

      const coveredMeds = new Set([
        ...nodeA.fulfilledMedicines.map((m) => m.medicineName),
        ...nodeB.fulfilledMedicines.map((m) => m.medicineName),
      ]);

      const count = coveredMeds.size;
      const combinedDistance = nodeA.distanceKm + nodeB.distanceKm;
      const cost = combinedDistance * 1.5 + (count === totalMedCount ? 0 : 50);

      if (count > maxCoveredCount || (count === maxCoveredCount && cost < minCostScore)) {
        maxCoveredCount = count;
        minCostScore = cost;

        // Partition medicines cleanly between the two nodes
        const nodeAFulfill = nodeA.fulfilledMedicines;
        const nodeASet = new Set(nodeAFulfill.map((m) => m.medicineName));
        const nodeBFulfill = nodeB.fulfilledMedicines.filter((m) => !nodeASet.has(m.medicineName));

        bestCombination = [
          { ...nodeA, fulfilledMedicines: nodeAFulfill },
          { ...nodeB, fulfilledMedicines: nodeBFulfill },
        ];
      }
    }
  }

  // If 2-node didn't achieve 100%, evaluate 3-node combinations
  if (maxCoveredCount < totalMedCount && eligible.length >= 3) {
    for (let i = 0; i < eligible.length; i++) {
      for (let j = i + 1; j < eligible.length; j++) {
        for (let k = j + 1; k < eligible.length; k++) {
          const nodeA = eligible[i];
          const nodeB = eligible[j];
          const nodeC = eligible[k];

          const coveredMeds = new Set([
            ...nodeA.fulfilledMedicines.map((m) => m.medicineName),
            ...nodeB.fulfilledMedicines.map((m) => m.medicineName),
            ...nodeC.fulfilledMedicines.map((m) => m.medicineName),
          ]);

          const count = coveredMeds.size;
          const combinedDistance = nodeA.distanceKm + nodeB.distanceKm + nodeC.distanceKm;
          const cost = combinedDistance * 2.0;

          if (count > maxCoveredCount || (count === maxCoveredCount && cost < minCostScore)) {
            maxCoveredCount = count;
            minCostScore = cost;

            const nodeAFulfill = nodeA.fulfilledMedicines;
            const setA = new Set(nodeAFulfill.map((m) => m.medicineName));

            const nodeBFulfill = nodeB.fulfilledMedicines.filter((m) => !setA.has(m.medicineName));
            const setB = new Set([...setA, ...nodeBFulfill.map((m) => m.medicineName)]);

            const nodeCFulfill = nodeC.fulfilledMedicines.filter((m) => !setB.has(m.medicineName));

            bestCombination = [
              { ...nodeA, fulfilledMedicines: nodeAFulfill },
              { ...nodeB, fulfilledMedicines: nodeBFulfill },
              { ...nodeC, fulfilledMedicines: nodeCFulfill },
            ].filter((n) => n.fulfilledMedicines.length > 0);
          }
        }
      }
    }
  }

  // Fallback to best single if no combination found
  if (bestCombination.length === 0 && eligible.length > 0) {
    bestCombination = [eligible[0]];
    maxCoveredCount = eligible[0].fulfilledMedicines.length;
  }

  const overallCoveragePct = Math.round((maxCoveredCount / totalMedCount) * 100);
  const totalDistance = bestCombination.reduce((acc, n) => acc + n.distanceKm, 0);
  const maxSingleDistance = Math.max(...bestCombination.map((n) => n.distanceKm), 1);
  const estimatedEta = Math.round(15 + maxSingleDistance * 4 + (bestCombination.length - 1) * 5);

  const planType = bestCombination.length > 1 ? 'MULTI_NODE_SPLIT' : bestCombination.length === 1 ? 'SINGLE_NODE' : 'UNFULFILLABLE';

  const explanation = bestCombination.length > 1
    ? `Optimal Multi-Node Split: Prescription is fulfilled cooperatively across ${bestCombination.length} nearby pharmacies (${bestCombination.map((n) => `${n.chemistName.split(' ')[0]} [${n.fulfilledMedicines.length} med${n.fulfilledMedicines.length > 1 ? 's' : ''}]`).join(' + ')}), achieving ${overallCoveragePct}% full coverage in ~${estimatedEta} mins.`
    : bestCombination.length === 1
    ? `Single-Node Match: ${bestCombination[0].chemistName} fulfills ${overallCoveragePct}% of your prescription.`
    : 'No nearby pharmacy currently has matching shadow inventory for these medicines.';

  return {
    planType,
    overallCoverage: overallCoveragePct,
    totalNodes: bestCombination.length,
    primaryNode: bestCombination[0],
    nodes: bestCombination,
    allMedicinesCovered: maxCoveredCount === totalMedCount,
    scoringWeights: weights,
    totalEstimatedDistanceKm: Math.round(totalDistance * 10) / 10,
    estimatedDeliveryEtaMinutes: estimatedEta,
    explanation,
  };
}
