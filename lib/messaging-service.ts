// ─── Messaging Service Abstraction ────────────────────────────────────────────
// Wraps Twilio WhatsApp Business API.
// If credentials are not configured, returns a clear CONFIGURATION_ERROR.
// NEVER silently pretends that a message was sent.

import { MessageResult } from './types';

interface ChemistContact {
  name: string;
  phone: string;
}

interface OrderMessage {
  orderId: string;
  patientArea: string;
  city: string;
  medicines: { brand_name?: string; chemical_salt?: string; dosage?: string }[];
  totalAmount: number;
  isColdChain: boolean;
  coldChainReason?: string;
  acceptUrl: string;
}

/**
 * Send an order notification to a chemist via WhatsApp.
 *
 * If Twilio credentials are configured: sends a real WhatsApp message.
 * If credentials are missing: returns CONFIGURATION_ERROR with details.
 */
export async function sendChemistOrder(
  chemist: ChemistContact,
  order: OrderMessage,
): Promise<MessageResult> {
  const {
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_WHATSAPP_FROM,
    CHEMIST_WHATSAPP_TO,
  } = process.env;

  // Check all required env vars
  const missingVars: string[] = [];
  if (!TWILIO_ACCOUNT_SID) missingVars.push('TWILIO_ACCOUNT_SID');
  if (!TWILIO_AUTH_TOKEN) missingVars.push('TWILIO_AUTH_TOKEN');
  if (!TWILIO_WHATSAPP_FROM) missingVars.push('TWILIO_WHATSAPP_FROM');
  if (!CHEMIST_WHATSAPP_TO) missingVars.push('CHEMIST_WHATSAPP_TO');

  if (missingVars.length > 0) {
    return {
      status: 'CONFIGURATION_ERROR',
      error: `Missing Twilio environment variables: ${missingVars.join(', ')}. Add them to .env.local and restart the server.`,
      provider: 'TWILIO_WHATSAPP',
    };
  }

  // Build message body
  const medicineLines = order.medicines
    .map(
      (m) =>
        `• ${m.brand_name || '(unknown)'}${m.chemical_salt ? ` (${m.chemical_salt})` : ''}${m.dosage ? ` — ${m.dosage}` : ''}`,
    )
    .join('\n');

  const coldChainBlock = order.isColdChain
    ? '\n⚠️ CRITICAL: COLD CHAIN REQUIRED (2°C – 8°C)\nUse insulated thermal pouch with ice gel pack.\n'
    : '';

  const messageBody = [
    `🚨 NEW MEDIRUSH ORDER #${order.orderId}`,
    ``,
    `📍 Location: ${order.patientArea}, ${order.city}`,
    ``,
    `💊 Required Medicines:`,
    medicineLines,
    coldChainBlock,
    `💰 Chemist Payout: ₹${order.totalAmount}`,
    ``,
    `✅ ACCEPT ORDER (tap link):`,
    order.acceptUrl,
  ]
    .join('\n')
    .trim();

  // Send via Twilio
  try {
    const sanitizeWhatsApp = (num: string) => {
      const trimmed = (num || '').trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('whatsapp:')) return trimmed;
      const withPlus = trimmed.startsWith('+') ? trimmed : `+${trimmed}`;
      return `whatsapp:${withPlus}`;
    };

    const fromNumber = sanitizeWhatsApp(TWILIO_WHATSAPP_FROM!);
    const toNumber = sanitizeWhatsApp(CHEMIST_WHATSAPP_TO!);

    // Dynamic import to avoid loading twilio on every request
    const twilio = (await import('twilio')).default;
    const client = twilio(TWILIO_ACCOUNT_SID!, TWILIO_AUTH_TOKEN!);

    const message = await client.messages.create({
      from: fromNumber,
      to: toNumber,
      body: messageBody,
    });

    console.log(`[MediRush Messaging] WhatsApp sent to ${chemist.name}. SID: ${message.sid}`);

    return {
      status: 'SENT',
      messageId: message.sid,
      provider: 'TWILIO_WHATSAPP',
      sentAt: new Date().toISOString(),
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`[MediRush Messaging] Twilio error: ${errorMessage}`);

    return {
      status: 'FAILED',
      error: `Twilio WhatsApp failed: ${errorMessage}. If using a Trial account, the recipient phone must join the Twilio Sandbox by sending your join-code to +14155238886.`,
      provider: 'TWILIO_WHATSAPP',
    };
  }
}
