import { NextResponse } from 'next/server';
import { getShadowInventory, getInvoices, commitInvoiceToShadowInventory, InvoiceRecord } from '@/lib/inventory-engine';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const pharmacyId = url.searchParams.get('pharmacyId') || undefined;

    const inventory = getShadowInventory(pharmacyId);
    const invoices = getInvoices(pharmacyId);

    return NextResponse.json({
      status: 'SUCCESS',
      pharmacyId: pharmacyId || 'ALL',
      totalItems: inventory.length,
      inventory,
      invoices,
      label: 'Invoice-Derived Shadow Inventory',
      disclaimer: 'Estimated stock based on latest distributor invoice — not guaranteed live stock',
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'API_ERROR', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pharmacyId, pharmacyName, distributorName, invoiceNo, invoiceDate, items } = body;

    const invoiceRecord: InvoiceRecord = {
      id: `INV-${Date.now()}`,
      pharmacy_id: pharmacyId || 'chem-1',
      pharmacy_name: pharmacyName || 'Gupta Medicos',
      distributor_name: distributorName || 'Manual Ledger Entry',
      invoice_no: invoiceNo || `MANUAL-${Date.now().toString().slice(-4)}`,
      invoice_date: invoiceDate || new Date().toISOString().split('T')[0],
      extracted_items_count: items?.length || 0,
      ocr_confidence: 1.0,
      created_at: new Date().toISOString(),
    };

    const { savedInvoice, savedItems } = commitInvoiceToShadowInventory(invoiceRecord, items || []);

    return NextResponse.json({
      status: 'SUCCESS',
      invoice: savedInvoice,
      items: savedItems,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'API_ERROR', error: error.message },
      { status: 500 }
    );
  }
}
