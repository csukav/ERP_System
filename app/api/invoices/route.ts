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
    const invoices = readData();
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      customerId: body.customerId,
      items: body.items,
      totalAmount: Number(body.totalAmount),
      status: body.status ?? 'draft',
      createdAt: new Date().toISOString(),
      dueDate: body.dueDate,
    };
    invoices.push(newInvoice);
    writeData(invoices);
    return NextResponse.json(newInvoice, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Hiba a számla létrehozásakor' }, { status: 500 });
  }
}
