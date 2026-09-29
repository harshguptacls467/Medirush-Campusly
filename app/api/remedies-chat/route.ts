import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { mockHomeRemedies } from '@/lib/data/mockHomeRemedies';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Intelligent fallback using mock dataset
      const lower = (message || '').toLowerCase();
      const matched = mockHomeRemedies.find(r => 
        r.keywords.some(k => lower.includes(k.toLowerCase())) || 
        r.problem.toLowerCase().includes(lower)
      );

      if (matched) {
        return NextResponse.json({
          reply: `🌿 **${matched.problem} के लिए घरेलू आयुर्वेदिक उपचार:**\n\n` +
                 `**विधि (Preparation):**\n${matched.remedies.map((rem, i) => `${i + 1}. ${rem}`).join('\n')}\n\n` +
                 (matched.yoga_tips?.length ? `**योगाभ्यास (Yoga Tips):**\n${matched.yoga_tips.map(y => `• ${y}`).join('\n')}\n\n` : '') +
                 `⚠️ **सावधानी (When to see a doctor):** ${matched.when_to_see_doctor}`
        });
      }

      return NextResponse.json({
        reply: "नमस्ते! कृपया अपनी समस्या (जैसे खांसी, जुकाम, एसिडिटी, सिरदर्द, पेट दर्द, अनिद्रा) बताएं। मैं आपको तुलसी, अदरक, शहद, अजवाइन और हल्दी जैसे प्राकृतिक घरेलू उपचार और काढ़े की सटीक विधि बताऊंगा।"
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const SYSTEM_INSTRUCTION = `You are "MediRush Ayurvedic Vaidya & Natural Remedy AI Assistant".
Your role is to guide patients with safe, evidence-backed Ayurvedic remedies, kitchen herbal brews (Kadhas), dietary tips, and yoga pranayamas for common non-emergency ailments.

RULES:
1. Respond in a warm, polite, and empathetic tone in clear conversational Hinglish or Hindi (with English terms in brackets).
2. Give actionable step-by-step preparation recipes (e.g. how much tulsi, ginger, honey, water, and boiling time).
3. Always include 1-2 Yoga or Pranayama tips when relevant.
4. Highlight CRITICAL SAFETY / RED FLAGS (e.g., when to visit a hospital/doctor immediately).
5. If the patient mentions critical emergency symptoms (e.g., severe chest pain, breathing difficulty, sudden paralysis), immediately advise them to call 108 or activate MediRush SOS.`;

    const chatContents = [
      {
        role: 'user',
        parts: [
          {
            text: `${SYSTEM_INSTRUCTION}\n\nPATIENT QUERY: ${message}`
          }
        ]
      }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: chatContents,
      config: {
        temperature: 0.4,
        maxOutputTokens: 600
      }
    });

    const reply = response.text || 'नमस्ते! कृपया अपनी समस्या का विवरण दें।';

    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error('Remedies Chat Error:', error);
    return NextResponse.json({
      reply: 'माफ कीजिए, इस समय कनेक्शन में समस्या है। कृपया नीचे दी गई लिस्ट में से अपनी समस्या चुनकर घरेलू उपचार देखें।'
    });
  }
}
