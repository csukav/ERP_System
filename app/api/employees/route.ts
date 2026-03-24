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
    const employees = readData();
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
    employees.push(newEmployee);
    writeData(employees);
    return NextResponse.json(newEmployee, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Hiba az alkalmazott létrehozásakor' }, { status: 500 });
  }
}
