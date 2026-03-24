import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Customer } from '@/lib/types';

const DATA_FILE = path.join(process.cwd(), 'data', 'customers.json');

function readData(): Customer[] {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}
function writeData(data: Customer[]): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const customers = readData();
  const customer = customers.find((c) => c.id === params.id);
  if (!customer) return NextResponse.json({ error: 'Nem található' }, { status: 404 });
  return NextResponse.json(customer);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const customers = readData();
    const idx = customers.findIndex((c) => c.id === params.id);
    if (idx === -1) return NextResponse.json({ error: 'Nem található' }, { status: 404 });
    customers[idx] = { ...customers[idx], ...body, id: params.id };
    writeData(customers);
    return NextResponse.json(customers[idx]);
  } catch {
    return NextResponse.json({ error: 'Hiba a frissítésnél' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const customers = readData();
    const filtered = customers.filter((c) => c.id !== params.id);
    writeData(filtered);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Hiba a törlésnél' }, { status: 500 });
  }
}
