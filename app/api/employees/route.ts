import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { Employee } from '@/lib/types';

export async function GET() {
  try {
    const coll = await getCollection<Employee>('employees');
    const employees = await coll.find({}, { projection: { _id: 0 } }).toArray();
    return NextResponse.json(employees);
  } catch {
    return NextResponse.json({ error: 'Hiba az adatok olvasásakor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const coll = await getCollection<Employee>('employees');
    const newEmployee: Employee = {
      id: `emp-${Date.now()}`,
      name: body.name,
      position: body.position,
      department: body.department,
      salary: Number(body.salary),
      startDate: body.startDate,
      email: body.email,
      phone: body.phone,
    };
    await coll.insertOne({ ...newEmployee } as never);
    return NextResponse.json(newEmployee, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Hiba az alkalmazott létrehozásakor' }, { status: 500 });
  }
}
