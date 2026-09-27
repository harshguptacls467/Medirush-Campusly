import { NextResponse } from 'next/server';
import { findNearbyPharmacies } from '@/lib/pharmacy-locator';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { lat, lng, city, radiusMeters } = body;

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json(
        { status: 'VALIDATION_ERROR', error: 'Valid latitude and longitude numbers are required.' },
        { status: 400 }
      );
    }

    const pharmacies = await findNearbyPharmacies({ lat, lng, city, radiusMeters });

    return NextResponse.json({
      status: 'SUCCESS',
      count: pharmacies.length,
      pharmacies,
      userCoordinates: { lat, lng },
      city: city || 'Live GPS Location',
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'API_ERROR', error: error.message || 'Failed to locate nearby pharmacies' },
      { status: 500 }
    );
  }
}
