import { NextResponse } from 'next/server';
import { CHEMIST_REGISTRY } from '@/lib/chemists';
import { rankChemists, DEFAULT_RANKING_CONFIG } from '@/lib/chemist-ranking';
import { calculateThermalSLA } from '@/lib/thermal-sla';
import { fetchWeather } from '@/lib/weather-service';
import { calculateFulfillmentPlan } from '@/lib/multi-pharmacy-fulfillment';
import { findNearbyPharmacies } from '@/lib/pharmacy-locator';

export async function POST(req: Request) {
  let body: {
    city?: string;
    userLocation?: { lat: number; lng: number };
    requiresColdChain?: boolean;
    estimatedDeliveryMinutes?: number;
    medicines?: Array<{ name: string; dosage?: string }>;
    medicineMatchOverrides?: Record<string, number>;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { status: 'VALIDATION_ERROR', error: 'Invalid JSON body.' },
      { status: 400 },
    );
  }

  const city = body.city || 'Ratlam';
  const requiresColdChain = Boolean(body.requiresColdChain);
  const estimatedDeliveryMinutes = Number(body.estimatedDeliveryMinutes) || 22;
  const userLocation = body.userLocation;
  const medicines = body.medicines || [];

  // Find nearby pharmacies dynamically based on user's live GPS coordinates or default registry
  let activeChemists = CHEMIST_REGISTRY;
  if (userLocation && typeof userLocation.lat === 'number' && typeof userLocation.lng === 'number') {
    activeChemists = await findNearbyPharmacies({
      lat: userLocation.lat,
      lng: userLocation.lng,
      city,
    });
  }

  // 1. Calculate Multi-Node & Single Node Fulfillment Plan using active/live pharmacies
  const fulfillmentPlan = calculateFulfillmentPlan(medicines, userLocation, activeChemists);

  // 2. Rank chemists with transparent scoring
  const rankings = rankChemists(
    activeChemists,
    {
      city: userLocation ? 'Live GPS Location' : city,
      requiresColdChain,
      medicineMatchOverrides: body.medicineMatchOverrides,
    },
    DEFAULT_RANKING_CONFIG,
  );

  // 3. Fetch real weather (non-blocking)
  const weather = await fetchWeather(city);

  // 4. Calculate thermal SLA
  const thermalSLA = calculateThermalSLA({
    ambientTemperature: weather.source === 'LIVE_API' ? weather.temperatureCelsius : null,
    requiresColdChain,
    estimatedDeliveryMinutes,
    coolingMethod: requiresColdChain ? 'ICE_GEL_POUCH' : 'NONE',
  });

  // 5. Merge ranking results with chemist details for frontend
  const rankedChemists = rankings.map((r) => {
    const chemist = activeChemists.find((c) => c.id === r.chemistId);
    return {
      ...chemist,
      score: r.score,
      ranking_breakdown: r.breakdown,
    };
  });

  return NextResponse.json({
    status: 'SUCCESS',
    rankings,
    rankedChemists,
    fulfillmentPlan,
    rankingConfig: DEFAULT_RANKING_CONFIG,
    weather: {
      temperatureCelsius: weather.source === 'LIVE_API' ? weather.temperatureCelsius : null,
      humidity: weather.source === 'LIVE_API' ? weather.humidity : null,
      description: weather.description,
      source: weather.source,
      city: weather.city,
    },
    thermalSLA,
  });
}
