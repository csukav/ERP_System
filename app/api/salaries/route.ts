import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Salary } from '@/lib/types';

const DATA_FILE = path.join(process.cwd(), 'data', 'salaries.json');

function readData(): Salary[] {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}
function writeData(data: Salary[]): void {
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
    const salaries = readData();
    const newSalary: Salary = {
      id: `sal-${Date.now()}`,
      employeeId: body.employeeId,
      month: Number(body.month),
      year: Number(body.year),
      amount: Number(body.amount),
      status: body.status ?? 'pending',
      paidAt: body.paidAt ?? null,
    };
    salaries.push(newSalary);
    writeData(salaries);
    return NextResponse.json(newSalary, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Hiba a bérrekord létrehozásakor' }, { status: 500 });
  }
}
