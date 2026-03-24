import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Employee } from '@/lib/types';

const DATA_FILE = path.join(process.cwd(), 'data', 'employees.json');

function readData(): Employee[] {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}
function writeData(data: Employee[]): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const employees = readData();
  const employee = employees.find((e) => e.id === params.id);
  if (!employee) return NextResponse.json({ error: 'Nem található' }, { status: 404 });
  return NextResponse.json(employee);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const employees = readData();
    const idx = employees.findIndex((e) => e.id === params.id);
    if (idx === -1) return NextResponse.json({ error: 'Nem található' }, { status: 404 });
    employees[idx] = {
      ...employees[idx],
      ...body,
      salary: Number(body.salary ?? employees[idx].salary),
      id: params.id,
    };
    writeData(employees);
    return NextResponse.json(employees[idx]);
  } catch {
    return NextResponse.json({ error: 'Hiba a frissítésnél' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const employees = readData();
    writeData(employees.filter((e) => e.id !== params.id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Hiba a törlésnél' }, { status: 500 });
  }
}
