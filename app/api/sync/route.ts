import { NextResponse } from 'next/server';
import { commitInvoiceToShadowInventory, InvoiceRecord } from '@/lib/inventory-engine';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const item = await req.json();
    const { operation, entityType, payload } = item;

    if (operation === 'ADD_INVOICE' && payload?.invoice && payload?.items) {
      commitInvoiceToShadowInventory(payload.invoice, payload.items);
    }

    return NextResponse.json({
      status: 'SUCCESS',
      syncedId: item.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'API_ERROR', error: error.message },
      { status: 500 }
    );
  }
}
