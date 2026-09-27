import { NextResponse } from 'next/server';
import { SystemHealthCheck, IntegrationStatus } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  const geminiApi: IntegrationStatus = process.env.GEMINI_API_KEY ? 'CONFIGURED' : 'NOT_CONFIGURED';

  // Safety engine is always available (local deterministic rules)
  const safetyEngine: IntegrationStatus = 'LIVE';

  // Chemist ranking is always available (local computation)
  const chemistRanking: IntegrationStatus = 'LIVE';

  // Thermal SLA is always available (local computation)
  const thermalSla: IntegrationStatus = 'LIVE';

  // Weather is always live via Open-Meteo & OpenWeatherMap fallback
  const weatherApi: IntegrationStatus = 'LIVE';

  // Messaging depends on Twilio credentials
  const twilioVars = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_WHATSAPP_FROM', 'CHEMIST_WHATSAPP_TO'];
  const hasTwilio = twilioVars.every((v) => !!process.env[v]);
  const messagingApi: IntegrationStatus = hasTwilio ? 'CONFIGURED' : 'NOT_CONFIGURED';

  const health: SystemHealthCheck = {
    geminiApi,
    safetyEngine,
    chemistRanking,
    thermalSla,
    weatherApi,
    messagingApi,
    demoMode,
  };

  return NextResponse.json(health);
}
