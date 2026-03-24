import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Customer } from '@/lib/types';

const DATA_FILE = path.join(process.cwd(), 'data', 'customers.json');

function readData(): Customer[] {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeData(data: Customer[]): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const customers = readData();
    return NextResponse.json(customers);
  } catch {
    return NextResponse.json({ error: 'Hiba az adatok olvasásakor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const customers = readData();
    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name: body.name,
      email: body.email,
      phone: body.phone,
      address: body.address,
      notes: body.notes ?? '',
      createdAt: new Date().toISOString(),
    };
    customers.push(newCustomer);
    writeData(customers);
    return NextResponse.json(newCustomer, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Hiba az ügyfél létrehozásakor' }, { status: 500 });
  }
}
