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

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const salaries = readData();
    const idx = salaries.findIndex((s) => s.id === params.id);
    if (idx === -1) return NextResponse.json({ error: 'Nem található' }, { status: 404 });
    salaries[idx] = { ...salaries[idx], ...body, id: params.id };
    writeData(salaries);
    return NextResponse.json(salaries[idx]);
  } catch {
    return NextResponse.json({ error: 'Hiba a frissítésnél' }, { status: 500 });
  }
}
