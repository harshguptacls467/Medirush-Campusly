import { NextResponse } from 'next/server';
import twilio from 'twilio';
import {
  generateAcceptToken,
  persistOrder,
  rankChemistsForOrder,
  broadcastEvent,
  Order,
} from '@/lib/store';

export async function POST(req: Request) {
  // ─── 1. Validate environment variables ────────────────────────────────────
  const {
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_WHATSAPP_FROM,
    CHEMIST_WHATSAPP_TO,
    NEXT_PUBLIC_BASE_URL,
  } = process.env;

  const missingVars: string[] = [];
  if (!TWILIO_ACCOUNT_SID) missingVars.push('TWILIO_ACCOUNT_SID');
  if (!TWILIO_AUTH_TOKEN) missingVars.push('TWILIO_AUTH_TOKEN');
  if (!TWILIO_WHATSAPP_FROM) missingVars.push('TWILIO_WHATSAPP_FROM');
  if (!CHEMIST_WHATSAPP_TO) missingVars.push('CHEMIST_WHATSAPP_TO');
  if (!NEXT_PUBLIC_BASE_URL) missingVars.push('NEXT_PUBLIC_BASE_URL');

  if (missingVars.length > 0) {
    return NextResponse.json(
      {
        error:
          `Missing required environment variables: ${missingVars.join(', ')}. ` +
          'Add them to .env.local and restart the dev server.',
      },
      { status: 500 },
    );
  }

  // ─── 2. Parse request body ────────────────────────────────────────────────
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const {
    orderId: providedOrderId,
    medicines,
    totalAmount,
    isColdChain,
    patientArea,
    prescriptionData,
  } = body;

  if (!medicines || !Array.isArray(medicines) || medicines.length === 0) {
    return NextResponse.json(
      { error: 'medicines array is required and must not be empty.' },
      { status: 400 },
    );
  }

  // ─── 3. Create order with secure token ────────────────────────────────────
  const orderId = providedOrderId || `MR-${Math.floor(1000 + Math.random() * 9000)}`;
  const { token, tokenHash } = generateAcceptToken();

  const newOrder: Order = {
    id: orderId,
    patient_name: body.patient_name || 'Patient',
    city: body.city || 'Ratlam',
    area: patientArea || body.area || 'Kothi Road',
    doctor_name: prescriptionData?.doctor_name ?? undefined,
    doctor_reg: prescriptionData?.doctor_reg || '',
    prescription_date: prescriptionData?.prescription_date || '',
    is_cold_chain: Boolean(isColdChain),
    cold_chain_reason: prescriptionData?.cold_chain_reason || '',
    schedule_h_verified: prescriptionData?.schedule_h_verified ?? true,
    schedule_h_warning: prescriptionData?.schedule_h_warning ?? false,
    medicines,
    pack_type: 'FULL',
    total_amount: Number(totalAmount) || 0,
    status: 'BROADCASTING',
    created_at: Date.now(),
    accept_token_hash: tokenHash,
  };

  persistOrder(newOrder);

  // ─── 4. Bayesian ranking + SSE broadcast ──────────────────────────────────
  const rankedChemists = rankChemistsForOrder(newOrder, newOrder.city);

  broadcastEvent('NEW_ORDER_DISPATCH', {
    order: newOrder,
    rankedChemists,
    targetChemist: rankedChemists[0] ?? null,
  });

  // ─── 5. Build WhatsApp message ────────────────────────────────────────────
  const baseUrl = NEXT_PUBLIC_BASE_URL!.replace(/\/$/, '');
  const acceptUrl = `${baseUrl}/order-status?orderId=${encodeURIComponent(orderId)}&token=${token}`;

  const medicineLines = medicines
    .map(
      (m: any) =>
        `• ${m.brand_name || '(unknown)'}${m.chemical_salt ? ` (${m.chemical_salt})` : ''}${m.dosage ? ` — ${m.dosage}` : ''}`,
    )
    .join('\n');

  const coldChainBlock = isColdChain
    ? '\n⚠️ CRITICAL: COLD CHAIN REQUIRED (2°C – 8°C)\nUse insulated thermal pouch with ice gel pack.\n'
    : '';

  const messageBody = [
    `🚨 NEW MEDIRUSH ORDER #${orderId}`,
    ``,
    `📍 Location: ${newOrder.area}, ${newOrder.city}`,
    ``,
    `💊 Required Medicines:`,
    medicineLines,
    coldChainBlock,
    `💰 Chemist Payout: ₹${newOrder.total_amount}`,
    ``,
    `✅ ACCEPT ORDER (tap link):`,
    acceptUrl,
  ]
    .join('\n')
    .trim();

    const sanitizeWhatsApp = (num: string) => {
      const trimmed = (num || '').trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('whatsapp:')) return trimmed;
      const withPlus = trimmed.startsWith('+') ? trimmed : `+${trimmed}`;
      return `whatsapp:${withPlus}`;
    };

    const fromNumber = sanitizeWhatsApp(TWILIO_WHATSAPP_FROM!);
    const toNumber = sanitizeWhatsApp(CHEMIST_WHATSAPP_TO!);

    let messageSid = `mock-msg-${Date.now()}`;
    let isRealTwilioSent = false;
    let twilioWarning: string | null = null;

    try {
      const client = twilio(TWILIO_ACCOUNT_SID!, TWILIO_AUTH_TOKEN!);
      const message = await client.messages.create({
        from: fromNumber,
        to: toNumber,
        body: messageBody,
      });

      messageSid = message.sid;
      isRealTwilioSent = true;
      console.log('[MediRush] WhatsApp dispatched via Twilio. SID:', message.sid);
    } catch (err: unknown) {
      const twilioMsg = err instanceof Error ? err.message : String(err);
      console.warn('[MediRush] Twilio Trial/Sandbox Notice:', twilioMsg);
      
      twilioWarning = `Twilio Trial Note: ${twilioMsg}. (Ensure the destination phone has joined Twilio Sandbox by texting your join-code to +14155238886). Order broadcasted live to local network.`;
    }

    // Don't expose token hash to client; strip it
    const { accept_token_hash: _, ...safeOrder } = newOrder;

    return NextResponse.json({
      success: true,
      orderId,
      messageSid,
      isRealTwilioSent,
      warning: twilioWarning,
      rankedChemists,
      order: safeOrder,
    });
}
