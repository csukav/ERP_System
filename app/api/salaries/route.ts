import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { Salary } from '@/lib/types';

export async function GET() {
  try {
    const coll = await getCollection<Salary>('salaries');
    const salaries = await coll.find({}, { projection: { _id: 0 } }).toArray();
    return NextResponse.json(salaries);
  } catch {
    return NextResponse.json({ error: 'Hiba az adatok olvasásakor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const coll = await getCollection<Salary>('salaries');
    const newSalary: Salary = {
      id: `sal-${Date.now()}`,
      employeeId: body.employeeId,
      month: Number(body.month),
      year: Number(body.year),
      amount: Number(body.amount),
      status: body.status ?? 'pending',
      paidAt: body.paidAt ?? null,
    };
    await coll.insertOne({ ...newSalary } as never);
    return NextResponse.json(newSalary, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Hiba a bérrekord létrehozásakor' }, { status: 500 });
  }
}
