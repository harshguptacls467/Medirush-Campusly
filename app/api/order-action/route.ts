import { NextResponse } from 'next/server';
import { globalOrders, persistOrder, validateAcceptToken, broadcastEvent } from '@/lib/store';

// ─── GET /api/order-action?orderId=MR-1234 ────────────────────────────────────
// Returns the current order (without the token hash) for client polling.

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json(
      { error: 'orderId query parameter is required.' },
      { status: 400 },
    );
  }

  const order = globalOrders.get(orderId);
  if (!order) {
    return NextResponse.json(
      { error: `Order "${orderId}" not found. It may have been created on a different server instance.` },
      { status: 404 },
    );
  }

  // Strip the token hash before returning to client
  const { accept_token_hash: _, ...safeOrder } = order;
  return NextResponse.json(safeOrder);
}

// ─── POST /api/order-action ────────────────────────────────────────────────────
// Body: { orderId: string, token: string, action: 'ACCEPT' | 'REJECT' }
// Called by the /order-status page when the chemist taps Accept/Reject.

export async function POST(req: Request) {
  let body: { orderId?: string; token?: string; action?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { orderId, token, action } = body;

  // Validate inputs
  if (!orderId || typeof orderId !== 'string') {
    return NextResponse.json({ error: 'orderId is required.' }, { status: 400 });
  }
  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'token is required.' }, { status: 400 });
  }
  if (action !== 'ACCEPT' && action !== 'REJECT') {
    return NextResponse.json(
      { error: 'action must be either "ACCEPT" or "REJECT".' },
      { status: 400 },
    );
  }

  const order = globalOrders.get(orderId);
  if (!order) {
    return NextResponse.json(
      { error: `Order "${orderId}" not found.` },
      { status: 404 },
    );
  }

  // Idempotency guards
  if (order.status === 'ACCEPTED') {
    return NextResponse.json(
      { error: 'This order has already been accepted and cannot be modified.' },
      { status: 409 },
    );
  }
  if (order.status === 'REJECTED') {
    return NextResponse.json(
      { error: 'This order has already been rejected.' },
      { status: 409 },
    );
  }

  // Token validation
  if (!order.accept_token_hash) {
    return NextResponse.json(
      { error: 'This order does not have a secure accept token. It may have been created without the WhatsApp dispatch.' },
      { status: 403 },
    );
  }

  const tokenValid = validateAcceptToken(token, order.accept_token_hash);
  if (!tokenValid) {
    return NextResponse.json(
      { error: 'Invalid or expired accept token. Use the original link from the WhatsApp message.' },
      { status: 403 },
    );
  }

  // Process the action
  if (action === 'ACCEPT') {
    order.status = 'ACCEPTED';
    order.accepted_at = Date.now();
    // The assigned chemist is the one tapping the link.
    // In a production system this would come from a chemist session/auth.
    // For the hackathon demo, we use the top-ranked chemist name.
    order.assigned_chemist = order.assigned_chemist || 'Gupta Medicos (Station Road)';
    order.eta_minutes = order.is_cold_chain ? 25 : 20;
    persistOrder(order);

    // Notify patient via SSE
    broadcastEvent('ORDER_CONFIRMED', {
      orderId: order.id,
      status: 'ACCEPTED',
      chemist_name: order.assigned_chemist,
      // rider info would come from a real dispatch system; we note this clearly
      rider: 'Rider being assigned — you will receive an SMS shortly.',
      eta_minutes: order.eta_minutes,
      is_cold_chain: order.is_cold_chain,
    });

    const { accept_token_hash: _, ...safeOrder } = order;
    return NextResponse.json({ success: true, status: 'ACCEPTED', order: safeOrder });
  } else {
    order.status = 'REJECTED';
    persistOrder(order);

    broadcastEvent('ORDER_REJECTED', { orderId: order.id });

    const { accept_token_hash: _, ...safeOrder } = order;
    return NextResponse.json({ success: true, status: 'REJECTED', order: safeOrder });
  }
}
