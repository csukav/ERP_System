import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Invoice } from '@/lib/types';

const DATA_FILE = path.join(process.cwd(), 'data', 'invoices.json');

function readData(): Invoice[] {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}
function writeData(data: Invoice[]): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const invoices = readData();
  const invoice = invoices.find((i) => i.id === params.id);
  if (!invoice) return NextResponse.json({ error: 'Nem található' }, { status: 404 });
  return NextResponse.json(invoice);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const invoices = readData();
    const idx = invoices.findIndex((i) => i.id === params.id);
    if (idx === -1) return NextResponse.json({ error: 'Nem található' }, { status: 404 });
    invoices[idx] = { ...invoices[idx], ...body, id: params.id };
    writeData(invoices);
    return NextResponse.json(invoices[idx]);
  } catch {
    return NextResponse.json({ error: 'Hiba a frissítésnél' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const invoices = readData();
    writeData(invoices.filter((i) => i.id !== params.id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Hiba a törlésnél' }, { status: 500 });
  }
}
