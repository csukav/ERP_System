import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { InventoryMovement } from '@/lib/types';

export async function GET() {
  try {
    const coll = await getCollection<InventoryMovement>('inventory_movements');
    const movements = await coll.find({}, { projection: { _id: 0 } }).toArray();
    return NextResponse.json(movements);
  } catch {
    return NextResponse.json({ error: 'Hiba az adatok olvasásakor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const coll = await getCollection<InventoryMovement>('inventory_movements');
    const newMovement: InventoryMovement = {
      id: `mov-${Date.now()}`,
      productId: body.productId,
      type: body.type,
      quantity: Number(body.quantity),
      note: body.note ?? '',
      createdAt: new Date().toISOString(),
    };
    await coll.insertOne({ ...newMovement } as never);
    return NextResponse.json(newMovement, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Hiba a mozgás rögzítésekor' }, { status: 500 });
  }
}
