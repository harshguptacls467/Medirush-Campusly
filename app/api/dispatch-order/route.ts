import { NextResponse } from 'next/server';
import { globalOrders, rankChemistsForOrder, broadcastEvent, Order } from '@/lib/store';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderId = `MR-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: orderId,
      patient_name: body.patient_name || "Anoop Kumar",
      city: body.city || "Ratlam",
      area: body.area || "Kothi Road",
      doctor_reg: body.doctor_reg,
      prescription_date: body.prescription_date,
      is_cold_chain: body.is_cold_chain || false,
      cold_chain_reason: body.cold_chain_reason || "",
      schedule_h_verified: body.schedule_h_verified ?? true,
      medicines: body.medicines || [],
      pack_type: body.pack_type || 'FULL',
      total_amount: body.total_amount || 0,
      status: 'BROADCASTING',
      created_at: Date.now()
    };

    // 1. Save in state
    globalOrders.set(orderId, newOrder);

    // 2. Run Bayesian Ranking
    const rankedChemists = rankChemistsForOrder(newOrder, newOrder.city);

    // 3. Real-Time Broadcast to all listening Chemist Nodes via SSE
    broadcastEvent('NEW_ORDER_DISPATCH', {
      order: newOrder,
      rankedChemists,
      targetChemist: rankedChemists[0] // Highest probability node
    });

    return NextResponse.json({
      success: true,
      orderId,
      rankedChemists,
      order: newOrder
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
