import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { simplifyReport as ruleBasedSimplify } from '@/lib/data/reportSimplifierRules';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, imageBase64, mimeType } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    // Fallback if no API key
    if (!apiKey) {
      const fallbackResult = ruleBasedSimplify(text || '');
      return NextResponse.json({
        ...fallbackResult,
        source: 'local_rules',
        note: 'Generated via local medical rule-base engine (GEMINI_API_KEY not detected).'
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const PROMPT = `You are a Senior Clinical Pathologist and Patient Health Educator.
Analyze the provided medical diagnostic report (text or image).

TASK:
1. Identify the report category (e.g. Complete Blood Count / CBC, Liver Function Test / LFT, Kidney Function Test / KFT, Lipid Profile, Thyroid, Diabetes HbA1c, Cardiac Markers, Urine Test, etc.).
2. Extract all test parameters with observed value, reference range, status (NORMAL, HIGH, LOW, CRITICAL), and simple layman explanation of what that parameter does.
3. Provide a clear, empathetic summary explaining what the results mean in simple conversational language (Hindi & English mix / Hinglish).
4. Identify if there are any immediate emergency life-threatening markers (e.g., Acute Troponin elevation, severe kidney failure, critical platelet drops).
5. Provide actionable Diet & Lifestyle DOs and DONTs specifically customized to these test results.
6. List 3-4 smart questions the patient should ask their treating doctor at their follow-up visit.
7. Recommend the appropriate medical specialist (e.g., Cardiologist, Gastroenterologist, Endocrinologist, Nephrologist).

RETURN ONLY A VALID JSON OBJECT with this exact structure:
{
  "categoryName": "string",
  "summaryHeading": "string",
  "summary": "string in clear layman Hinglish/English explaining the condition and findings",
  "specialist": "string",
  "is_emergency": boolean,
  "parsedParameters": [
    {
      "name": "Parameter Name (e.g. Hemoglobin / Hb)",
      "val": "Observed value with units (e.g. 9.2 g/dL)",
      "status": "HIGH | LOW | NORMAL | CRITICAL",
      "meaning": "Simple 1-sentence explanation of what this test measures",
      "category": "string"
    }
  ],
  "dietPlan": {
    "dos": ["Array of recommended foods or lifestyle habits"],
    "donts": ["Array of foods or habits to avoid"]
  },
  "questions_for_doctor": [
    "Array of specific questions to ask doctor"
  ]
}`;

    let contents: any[] = [];

    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');
      contents = [
        {
          role: 'user',
          parts: [
            { text: PROMPT },
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType || 'image/jpeg'
              }
            }
          ]
        }
      ];
    } else {
      contents = [
        {
          role: 'user',
          parts: [
            { text: `${PROMPT}\n\nPATIENT REPORT TEXT:\n${text}` }
          ]
        }
      ];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const responseText = response.text || '';
    const parsedJson = JSON.parse(responseText);

    const abnormalParameters = (parsedJson.parsedParameters || []).filter(
      (p: any) => p.status === 'HIGH' || p.status === 'LOW' || p.status === 'CRITICAL'
    );
    const normalParameters = (parsedJson.parsedParameters || []).filter(
      (p: any) => p.status === 'NORMAL'
    );

    return NextResponse.json({
      categoryName: parsedJson.categoryName || 'Diagnostic Report',
      summaryHeading: parsedJson.summaryHeading || 'Medical Lab Analysis',
      summary: parsedJson.summary || '',
      specialist: parsedJson.specialist || 'General Physician',
      is_emergency: !!parsedJson.is_emergency,
      parsedParameters: parsedJson.parsedParameters || [],
      abnormalParameters,
      normalParameters,
      dietPlan: parsedJson.dietPlan || { dos: [], donts: [] },
      questions_for_doctor: parsedJson.questions_for_doctor || [],
      source: 'gemini_ai'
    });

  } catch (error: any) {
    console.error('Gemini Report Simplifier Error:', error);
    // Fallback to rule engine
    try {
      const fallbackResult = ruleBasedSimplify('');
      return NextResponse.json({
        ...fallbackResult,
        source: 'local_fallback',
        error: error.message
      });
    } catch {
      return NextResponse.json(
        { error: 'Failed to analyze report', details: error.message },
        { status: 500 }
      );
    }
  }
}
