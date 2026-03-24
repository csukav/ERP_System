import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { Customer } from '@/lib/types';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const coll = await getCollection<Customer>('customers');
    const customer = await coll.findOne({ id: params.id }, { projection: { _id: 0 } });
    if (!customer) return NextResponse.json({ error: 'Nem található' }, { status: 404 });
    return NextResponse.json(customer);
  } catch {
    return NextResponse.json({ error: 'Hiba az adatok olvasásakor' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const coll = await getCollection<Customer>('customers');
    const result = await coll.findOneAndUpdate(
      { id: params.id },
      { $set: { ...body, id: params.id } },
      { returnDocument: 'after', projection: { _id: 0 } }
    );
    if (!result) return NextResponse.json({ error: 'Nem található' }, { status: 404 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Hiba a frissítésnél' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const coll = await getCollection<Customer>('customers');
    await coll.deleteOne({ id: params.id });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Hiba a törlésnél' }, { status: 500 });
  }
}
