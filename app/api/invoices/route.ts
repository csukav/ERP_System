import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { Invoice } from '@/lib/types';

export async function GET() {
  try {
    const coll = await getCollection<Invoice>('invoices');
    const invoices = await coll.find({}, { projection: { _id: 0 } }).toArray();
    return NextResponse.json(invoices);
  } catch {
    return NextResponse.json({ error: 'Hiba az adatok olvasásakor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const coll = await getCollection<Invoice>('invoices');
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      customerId: body.customerId,
      items: body.items,
      totalAmount: Number(body.totalAmount),
      status: body.status ?? 'draft',
      createdAt: new Date().toISOString(),
      dueDate: body.dueDate,
    };
    await coll.insertOne({ ...newInvoice } as never);
    return NextResponse.json(newInvoice, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Hiba a számla létrehozásakor' }, { status: 500 });
  }
}
