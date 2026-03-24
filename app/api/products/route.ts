import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { Product } from '@/lib/types';

export async function GET() {
  try {
    const coll = await getCollection<Product>('products');
    const products = await coll.find({}, { projection: { _id: 0 } }).toArray();
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: 'Hiba az adatok olvasásakor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const coll = await getCollection<Product>('products');
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: body.name,
      sku: body.sku,
      category: body.category,
      price: Number(body.price),
      stockQuantity: Number(body.stockQuantity),
      minStockLevel: Number(body.minStockLevel),
    };
    await coll.insertOne({ ...newProduct } as never);
    return NextResponse.json(newProduct, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Hiba a termék létrehozásakor' }, { status: 500 });
  }
}
