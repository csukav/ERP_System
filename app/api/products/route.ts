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
    const products = readData();
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: body.name,
      sku: body.sku,
      category: body.category,
      price: Number(body.price),
      stockQuantity: Number(body.stockQuantity),
      minStockLevel: Number(body.minStockLevel),
    };
    products.push(newProduct);
    writeData(products);
    return NextResponse.json(newProduct, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Hiba a termék létrehozásakor' }, { status: 500 });
  }
}
