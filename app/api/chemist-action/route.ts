import { NextResponse } from 'next/server';
import { globalOrders, broadcastEvent, ChemistStockResponse, persistOrder } from '@/lib/store';
import { CHEMIST_REGISTRY } from '@/lib/chemists';
import { calculateFulfillmentPlan } from '@/lib/multi-pharmacy-fulfillment';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      orderId, 
      action, 
      chemistId = 'chem-1', 
      chemistName = 'Gupta Medicos & Cold Chain Hub', 
      confirmedMedicineIds = [], 
      medicines = [],
      cooperativePlan,
      forceResolve = false
    } = body;

    let order = globalOrders.get(orderId);

    // If order not yet stored in globalOrders (e.g. simulated sample), initialize it
    if (!order && medicines.length > 0) {
      order = {
        id: orderId,
        patient_name: body.patientName || 'Rajesh Sharma',
        city: 'Ratlam',
        area: 'Shastri Nagar',
        doctor_reg: 'MP-78219 (Dr. R.K. Verma, MD)',
        prescription_date: 'Today (Live Dispatch)',
        is_cold_chain: medicines.some((m: any) => m.is_cold_chain),
        cold_chain_reason: 'Cold storage medicines detected (2°C - 8°C)',
        schedule_h_verified: true,
        medicines: medicines.map((m: any, idx: number) => ({
          id: m.id || `med-${idx + 1}`,
          brand_name: m.brand_name || m.name || `Medicine ${idx + 1}`,
          dosage: m.dosage || '1 Tab Daily',
          chemical_salt: m.chemical_salt || m.name || '',
          generic_substitute: m.generic_substitute || 'Generic Substitute',
          brand_price: m.brand_price || 150,
          generic_price: m.generic_price || 40,
          savings_percent: m.savings_percent || 60,
          is_cold_chain: !!m.is_cold_chain,
          fractional_available: true,
        })),
        pack_type: 'FULL',
        total_amount: body.totalAmount || 588,
        status: 'BROADCASTING',
        created_at: Date.now(),
        chemist_responses: [],
      };
      globalOrders.set(orderId, order);
    }

    if (action === 'ACCEPT' || action === 'CONFIRM_STOCK') {
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      const chemistInfo = CHEMIST_REGISTRY.find((c) => c.id === chemistId) || {
        id: chemistId,
        name: chemistName,
        area: 'Station Road',
        distance_km: 1.2,
      };

      // 1. Update chemist responses list for this order
      const existingResponses = order.chemist_responses || [];
      const filteredResponses = existingResponses.filter((r) => r.chemistId !== chemistId);

      const confirmedIds: string[] = confirmedMedicineIds.length > 0
        ? confirmedMedicineIds
        : order.medicines.map((m) => m.id || m.brand_name);

      const newResponse: ChemistStockResponse = {
        chemistId,
        chemistName: chemistInfo.name,
        area: chemistInfo.area,
        distanceKm: chemistInfo.distance_km,
        phone: (chemistInfo as any).phone,
        respondedAt: Date.now(),
        confirmedMedicineIds: confirmedIds,
        medicines: order.medicines
          .filter((m) => confirmedIds.includes(m.id || m.brand_name))
          .map((m) => ({
            name: m.brand_name || m.chemical_salt,
            batchNo: `BATCH-${Math.floor(1000 + Math.random() * 9000)}`,
            confidence: 96,
          })),
      };

      const updatedResponses = [...filteredResponses, newResponse];
      order.chemist_responses = updatedResponses;

      // 2. Calculate progressive coverage across ALL responding chemists
      const allConfirmedMedKeys = new Set<string>();
      const medicineCoverageMap: Record<string, { brand_name: string; confirmedBy: string[] }> = {};

      order.medicines.forEach((m) => {
        const key = m.id || m.brand_name;
        const confirmingStores: string[] = [];
        updatedResponses.forEach((resp) => {
          if (resp.confirmedMedicineIds.includes(key)) {
            confirmingStores.push(resp.chemistName);
            allConfirmedMedKeys.add(key);
          }
        });
        medicineCoverageMap[key] = {
          brand_name: m.brand_name,
          confirmedBy: confirmingStores,
        };
      });

      const totalMedsCount = order.medicines.length;
      const coveredMedsCount = allConfirmedMedKeys.size;
      const allCovered = coveredMedsCount >= totalMedsCount || forceResolve;
      const coveragePercent = Math.round((coveredMedsCount / totalMedsCount) * 100);

      const missingMedicines = order.medicines
        .filter((m) => !allConfirmedMedKeys.has(m.id || m.brand_name))
        .map((m) => m.brand_name);

      // 3. If ALL medicines are covered across the network -> Finalize Weighted Set Cover & Accept!
      if (allCovered) {
        // Run Weighted Set Cover optimization across all responding chemist nodes
        const finalPlan = cooperativePlan || calculateFulfillmentPlan(
          order.medicines.map((m) => ({ name: m.brand_name || m.chemical_salt })),
          { lat: 23.3325, lng: 75.0382 },
          CHEMIST_REGISTRY.filter((c) => updatedResponses.some((r) => r.chemistId === c.id))
        );

        const assignedChemist = finalPlan.primaryNode?.chemistName || chemistName;
        const assignedRider = "Rahul Sharma (Hero Splendor MP-43-E-2101)";
        const etaMinutes = finalPlan.estimatedDeliveryEtaMinutes || 19;

        order.status = 'ACCEPTED';
        order.assigned_chemist = assignedChemist;
        order.assigned_rider = assignedRider;
        order.eta_minutes = etaMinutes;
        order.cooperative_plan = finalPlan;
        order.accepted_at = Date.now();

        persistOrder(order);

        // Real-Time broadcast update to Patient Screen & Chemist Terminals via SSE
        broadcastEvent('ORDER_CONFIRMED', {
          orderId,
          status: 'ACCEPTED',
          chemist_name: assignedChemist,
          rider: assignedRider,
          eta_minutes: etaMinutes,
          is_cold_chain: order.is_cold_chain,
          cooperativePlan: finalPlan,
          allMedicinesCovered: true,
          coveredMedicines: medicineCoverageMap,
          respondingChemists: updatedResponses,
        });

        return NextResponse.json({
          success: true,
          status: 'ACCEPTED',
          allCovered: true,
          coveragePercent: 100,
          order,
          cooperativePlan: finalPlan,
          message: 'All prescribed medicines confirmed! Weighted Set Cover optimal cooperative dispatch route locked.',
        });
      } else {
        // Partial Coverage -> Keep order in broadcast/partial state and inform patient of live progress
        order.status = 'PARTIALLY_ACCEPTED';
        persistOrder(order);

        // Build proximity distance cascade ladder
        const sortedChemists = [...CHEMIST_REGISTRY].sort((a, b) => a.distance_km - b.distance_km);
        const distanceCascadeLadder = sortedChemists.map((c) => {
          const resp = updatedResponses.find((r) => r.chemistId === c.id);
          return {
            chemistId: c.id,
            chemistName: c.name,
            area: c.area,
            distanceKm: c.distance_km,
            status: resp 
              ? (resp.confirmedMedicineIds.length > 0 ? 'FULFILLED_PARTIAL' : 'OUT_OF_STOCK') 
              : (c.id === chemistId ? 'RESPONDED' : 'EVALUATING'),
            fulfilledCount: resp ? resp.confirmedMedicineIds.length : 0,
            medicines: resp ? resp.confirmedMedicineIds : [],
          };
        });

        // Broadcast progress update event
        broadcastEvent('ORDER_PROGRESS_UPDATE', {
          orderId,
          status: 'PARTIALLY_ACCEPTED',
          totalMedsCount,
          coveredMedsCount,
          coveragePercent,
          coveredMedicines: medicineCoverageMap,
          missingMedicines,
          respondingChemists: updatedResponses,
          lastRespondingChemist: chemistInfo.name,
          distanceCascadeLadder,
          order,
        });

        return NextResponse.json({
          success: true,
          status: 'PARTIALLY_ACCEPTED',
          allCovered: false,
          coveragePercent,
          coveredMedsCount,
          totalMedsCount,
          missingMedicines,
          coveredMedicines: medicineCoverageMap,
          distanceCascadeLadder,
          order,
          message: `Secured ${coveredMedsCount}/${totalMedsCount} medicines (${coveragePercent}%). Cascading request to next closest pharmacy for remaining items...`,
        });
      }
    } else {
      // Reject action
      if (order) {
        order.status = 'REJECTED';
        persistOrder(order);
      }

      broadcastEvent('ORDER_REJECTED', { orderId });
      return NextResponse.json({ success: true, status: 'REJECTED' });
    }
  } catch (error: any) {
    console.error('Chemist action error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
