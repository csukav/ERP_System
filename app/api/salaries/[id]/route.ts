import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { Salary } from '@/lib/types';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const coll = await getCollection<Salary>('salaries');
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
