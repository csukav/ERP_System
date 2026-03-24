import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { Customer } from '@/lib/types';

export async function GET() {
  try {
    const coll = await getCollection<Customer>('customers');
    const customers = await coll.find({}, { projection: { _id: 0 } }).toArray();
    return NextResponse.json(customers);
  } catch {
    return NextResponse.json({ error: 'Hiba az adatok olvasásakor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const coll = await getCollection<Customer>('customers');
    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name: body.name,
      email: body.email,
      phone: body.phone,
      address: body.address,
      notes: body.notes ?? '',
      createdAt: new Date().toISOString(),
    };
    await coll.insertOne({ ...newCustomer } as never);
    return NextResponse.json(newCustomer, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Hiba az ügyfél létrehozásakor' }, { status: 500 });
  }
}
