import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Product } from '@/lib/types';

const DATA_FILE = path.join(process.cwd(), 'data', 'products.json');

function readData(): Product[] {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}
function writeData(data: Product[]): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const products = readData();
  const product = products.find((p) => p.id === params.id);
  if (!product) return NextResponse.json({ error: 'Nem található' }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const products = readData();
    const idx = products.findIndex((p) => p.id === params.id);
    if (idx === -1) return NextResponse.json({ error: 'Nem található' }, { status: 404 });
    products[idx] = {
      ...products[idx],
      ...body,
      price: Number(body.price ?? products[idx].price),
      stockQuantity: Number(body.stockQuantity ?? products[idx].stockQuantity),
      minStockLevel: Number(body.minStockLevel ?? products[idx].minStockLevel),
      id: params.id,
    };
    writeData(products);
    return NextResponse.json(products[idx]);
  } catch {
    return NextResponse.json({ error: 'Hiba a frissítésnél' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const products = readData();
    writeData(products.filter((p) => p.id !== params.id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Hiba a törlésnél' }, { status: 500 });
  }
}
