import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { InventoryMovement } from '@/lib/types';

const DATA_FILE = path.join(process.cwd(), 'data', 'inventory.json');

function readData(): InventoryMovement[] {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}
function writeData(data: InventoryMovement[]): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  try {
    return NextResponse.json(readData());
  } catch {
    return NextResponse.json({ error: 'Hiba az adatok olvasásakor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const movements = readData();
    const newMovement: InventoryMovement = {
      id: `mov-${Date.now()}`,
      productId: body.productId,
      type: body.type,
      quantity: Number(body.quantity),
      note: body.note ?? '',
      createdAt: new Date().toISOString(),
    };
    movements.push(newMovement);
    writeData(movements);
    return NextResponse.json(newMovement, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Hiba a mozgás rögzítésekor' }, { status: 500 });
  }
}
