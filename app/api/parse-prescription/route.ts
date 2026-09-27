import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { runSafetyAudit } from '@/lib/safety-engine';
import { normalizeSaltName } from '@/lib/drug-normalizer';

// ─── Zod Schema for Gemini Output Validation ─────────────────────────────────

const GeminiMedicineSchema = z.object({
  brand_name: z.string().default(''),
  chemical_salt: z.string().default(''),
  dosage: z.string().default(''),
  generic_substitute: z.string().default(''),
  brand_price_inr: z.number().default(0),
  generic_price_inr: z.number().default(0),
  savings_percent: z.number().default(0),
  is_cold_chain: z.boolean().default(false),
  fractional_strip_available: z.boolean().default(false),
  confidence: z.number().min(0).max(1).optional(),
});

const GeminiResponseSchema = z.object({
  doctor_name: z.string().nullable().default(null),
  doctor_reg: z.string().nullable().default(null),
  prescription_date: z.string().nullable().default(null),
  is_cold_chain: z.boolean().default(false),
  cold_chain_reason: z.string().default(''),
  schedule_h_warning: z.boolean().default(false),
  medicines: z.array(GeminiMedicineSchema).min(1, 'At least one medicine must be extracted'),
});

// ─── System Prompt ─────────────────────────────────────────────────────────────

const PHARMACOLOGIST_PROMPT = `You are a Senior Clinical Pharmacologist and Licensed Retail Pharmacist operating in Tier-2/3 India (Madhya Pradesh – Ratlam / Gwalior context).

Analyze the provided prescription image carefully.

Your tasks:
1. HANDWRITING DECIPHERING: Read both handwritten and printed text. Extract medicine names, dosages, strengths, and frequencies as accurately as possible.
2. CHEMICAL SALT RESOLUTION: Resolve each brand/trade name to its exact active ingredient / chemical salt (e.g., "Crocin" → "Paracetamol 500mg", "Lantus" → "Insulin Glargine 100 IU/ml").
3. JAN AUSHADHI GENERIC MAPPING: Suggest the most affordable verified Indian generic or Jan Aushadhi equivalent. Use realistic INR market prices (integers only).
4. COLD-CHAIN DETECTION: Flag temperature-sensitive medicines (insulin, biologics, eye drops requiring refrigeration, vaccines, monoclonal antibodies). These need 2°C–8°C storage.
5. SCHEDULE H/H1 AUDIT: Identify if any medicine is a Schedule H or H1 drug (requires valid prescription in India).
6. DOCTOR VERIFICATION: Extract doctor name, registration number, and prescription date exactly as written.
7. CONFIDENCE SCORING: For each medicine, provide a confidence score (0.0 to 1.0) indicating how confident you are in the extraction accuracy.

STRICT RULES — FOLLOW ALL:
- Return ONLY a single valid JSON object. No markdown. No code fences. No explanation text.
- If ANY field cannot be reliably read from the image, use null or empty string "". Do NOT invent or guess.
- Do NOT fabricate medicines not visible in the image.
- Prices must reflect actual Indian market prices in INR for the specific medicine you identified. If uncertain about price, use 0.
- savings_percent must be calculated as: round(((brand_price_inr - generic_price_inr) / brand_price_inr) * 100). If brand_price_inr is 0, use 0.
- fractional_strip_available: true only for tablet/capsule strips that can realistically be sold as partial 10-day packs.
- confidence: 0.0 = completely unreadable, 0.5 = partially readable/uncertain, 1.0 = clearly readable and identified.

Return this exact JSON schema:
{
  "doctor_name": "string or null",
  "doctor_reg": "string or null",
  "prescription_date": "string or null",
  "is_cold_chain": boolean,
  "cold_chain_reason": "string (empty string if not applicable)",
  "schedule_h_warning": boolean,
  "medicines": [
    {
      "brand_name": "string",
      "chemical_salt": "string",
      "dosage": "string",
      "generic_substitute": "string",
      "brand_price_inr": number,
      "generic_price_inr": number,
      "savings_percent": number,
      "is_cold_chain": boolean,
      "fractional_strip_available": boolean,
      "confidence": number
    }
  ]
}`;

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  // 1. API key check
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      {
        status: 'CONFIGURATION_ERROR',
        error:
          'GEMINI_API_KEY is not configured on the server. ' +
          'Add it to .env.local and restart the dev server.',
      },
      { status: 500 },
    );
  }

  // 2. Parse body
  let imageBase64: string;
  let mimeType = 'image/jpeg';
  try {
    const body = await req.json();
    imageBase64 = body.imageBase64;
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return NextResponse.json(
        { status: 'VALIDATION_ERROR', error: 'Request body must contain { imageBase64: string }.' },
        { status: 400 },
      );
    }
  } catch {
    return NextResponse.json(
      { status: 'VALIDATION_ERROR', error: 'Invalid JSON body.' },
      { status: 400 },
    );
  }

  // 3. Extract MIME type and strip data URL prefix
  const dataUrlMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
  if (dataUrlMatch) {
    mimeType = dataUrlMatch[1];
    imageBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  }

  const cleanBase64 = imageBase64.trim();
  if (!cleanBase64) {
    return NextResponse.json(
      { status: 'VALIDATION_ERROR', error: 'imageBase64 is empty after stripping the data URL prefix.' },
      { status: 400 },
    );
  }

  // 4. Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return NextResponse.json(
      { status: 'VALIDATION_ERROR', error: `Unsupported image type: ${mimeType}. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}` },
      { status: 400 },
    );
  }

  // 5. Validate size (rough check on base64 length)
  const estimatedBytes = (cleanBase64.length * 3) / 4;
  if (estimatedBytes > MAX_IMAGE_SIZE_BYTES) {
    return NextResponse.json(
      { status: 'VALIDATION_ERROR', error: `Image too large (~${Math.round(estimatedBytes / 1024 / 1024)}MB). Maximum: 10MB.` },
      { status: 400 },
    );
  }

  // 6. Call Real Gemini 3.8 Flash Vision API
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const CANDIDATE_MODELS = ['gemini-3.8-flash', 'gemini-3.1-pro-preview'];

  let rawText: string | undefined;
  let lastError: string | null = null;

  // Try primary model with automatic retry on transient spikes
  for (let attempt = 1; attempt <= 3; attempt++) {
    for (const modelName of CANDIDATE_MODELS) {
      try {
        console.log(`[MediRush] Calling Gemini model ${modelName} (attempt ${attempt})...`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType as 'image/jpeg',
                    data: cleanBase64,
                  },
                },
                { text: PHARMACOLOGIST_PROMPT },
              ],
            },
          ],
          config: {
            responseMimeType: 'application/json',
          },
        });
        if (response.text && response.text.trim().length > 0) {
          rawText = response.text;
          break;
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`[MediRush] Model ${modelName} error: ${msg}`);
        lastError = msg;
      }
    }
    if (rawText) break;
    // Wait 1.2s before retry if temporary 503 spike
    if (attempt < 3) {
      await new Promise((r) => setTimeout(r, 1200));
    }
  }

  if (!rawText || rawText.trim() === '') {
    return NextResponse.json(
      {
        status: 'API_ERROR',
        error: `Gemini API call failed: ${lastError || 'No response from model. Please try again with a clearer image.'}`,
      },
      { status: 500 },
    );
  }

  // 7. Parse Gemini JSON (extract from codeblock or raw JSON)
  let rawParsed: unknown;
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : rawText;
    rawParsed = JSON.parse(jsonStr);
  } catch {
    return NextResponse.json(
      {
        status: 'API_ERROR',
        error: `Gemini did not return valid JSON. First 500 chars: ${rawText.slice(0, 500)}`,
      },
      { status: 502 },
    );
  }

  // 8. Validate against Zod schema
  const parsed = GeminiResponseSchema.safeParse(rawParsed);
  if (!parsed.success) {
    return NextResponse.json(
      {
        status: 'VALIDATION_ERROR',
        error: `Gemini output failed schema validation: ${parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')}`,
      },
      { status: 502 },
    );
  }

  const geminiData = parsed.data;

  // 9. Normalize and enrich medicines
  const medicines = geminiData.medicines.map((med, i: number) => {
    const brandPrice = Number(med.brand_price_inr) || 0;
    const genericPrice = Number(med.generic_price_inr) || 0;
    const savingsPct =
      brandPrice > 0 ? Math.round(((brandPrice - genericPrice) / brandPrice) * 100) : 0;
    const normalizedSalt = normalizeSaltName(med.chemical_salt);

    return {
      id: `med-${i + 1}`,
      brand_name: med.brand_name ?? '',
      dosage: med.dosage ?? '',
      chemical_salt: med.chemical_salt ?? '',
      normalized_salt: normalizedSalt,
      generic_substitute: med.generic_substitute ?? '',
      brand_price: brandPrice,
      generic_price: genericPrice,
      brand_price_inr: brandPrice,
      generic_price_inr: genericPrice,
      savings_percent: savingsPct,
      is_cold_chain: Boolean(med.is_cold_chain),
      fractional_available: Boolean(med.fractional_strip_available),
      fractional_strip_available: Boolean(med.fractional_strip_available),
      confidence: med.confidence ?? null,
    };
  });

  // 10. Run deterministic safety engine
  const safetyAudit = runSafetyAudit(
    medicines.map((m) => ({
      brand_name: m.brand_name,
      chemical_salt: m.chemical_salt,
      dosage: m.dosage,
      confidence: m.confidence ?? undefined,
    }))
  );

  // 11. Calculate totals
  const totalBrand = medicines.reduce((acc: number, m) => acc + m.brand_price, 0);
  const totalGeneric = medicines.reduce((acc: number, m) => acc + m.generic_price, 0);
  const totalSavingsPct =
    totalBrand > 0 ? Math.round(((totalBrand - totalGeneric) / totalBrand) * 100) : 0;

  // 12. Return structured response
  return NextResponse.json({
    status: 'SUCCESS',
    // Existing frontend fields (backwards compatible)
    doctor_reg:
      [geminiData.doctor_name, geminiData.doctor_reg].filter(Boolean).join(' — ') ||
      geminiData.doctor_reg ||
      '',
    prescription_date: geminiData.prescription_date ?? '',
    is_cold_chain: Boolean(geminiData.is_cold_chain),
    cold_chain_reason: geminiData.cold_chain_reason ?? '',
    schedule_h_verified: !geminiData.schedule_h_warning,
    schedule_h_warning: Boolean(geminiData.schedule_h_warning),
    total_brand_total: totalBrand,
    total_generic_total: totalGeneric,
    total_savings_percent: totalSavingsPct,
    medicines,
    // New: Safety audit results
    safety_audit: safetyAudit,
    // Extra fields
    doctor_name: geminiData.doctor_name ?? null,
  });
}
