import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

const customers = [
  { id: 'cust-001', name: 'Kovács Építőipari Kft.', email: 'info@kovacs-epito.hu', phone: '+36 30 123 4567', address: '1051 Budapest, Vörösmarty tér 1.', createdAt: '2024-01-15T08:00:00.000Z', notes: 'Rendszeres megrendelő, évi 2-3 nagy projekt' },
  { id: 'cust-002', name: 'Nagy Kereskedelmi Zrt.', email: 'kapcsolat@nagy-ker.hu', phone: '+36 1 234 5678', address: '4025 Debrecen, Piac utca 26.', createdAt: '2024-02-20T09:30:00.000Z', notes: 'Fizetési határidő: 30 nap' },
  { id: 'cust-003', name: 'Szabó és Társai Bt.', email: 'szabo.bt@gmail.com', phone: '+36 70 987 6543', address: '7621 Pécs, Király utca 44.', createdAt: '2024-03-10T11:00:00.000Z', notes: 'Kis vállalkozás, azonnali fizetés' },
  { id: 'cust-004', name: 'Horváth Logisztika Kft.', email: 'horvath@logisztika.hu', phone: '+36 20 555 7890', address: '9021 Győr, Baross Gábor út 15.', createdAt: '2024-04-05T14:00:00.000Z', notes: 'Havi rendszeres megrendelések' },
  { id: 'cust-005', name: 'Varga Informatika Kft.', email: 'varga.it@vargait.hu', phone: '+36 30 444 2222', address: '6720 Szeged, Dugonics tér 12.', createdAt: '2024-05-18T10:15:00.000Z', notes: 'IT szolgáltatások viszonteladója' },
];

const products = [
  { id: 'prod-001', name: 'Irodai szék (ergonómikus)', sku: 'SZEK-ERG-001', category: 'Bútor', price: 45900, stockQuantity: 12, minStockLevel: 5 },
  { id: 'prod-002', name: 'Íróasztal (140x70 cm)', sku: 'ASZTAL-140-001', category: 'Bútor', price: 89900, stockQuantity: 7, minStockLevel: 3 },
  { id: 'prod-003', name: 'Monitor (27", 4K)', sku: 'MON-27-4K-001', category: 'Elektronika', price: 129000, stockQuantity: 3, minStockLevel: 5 },
  { id: 'prod-004', name: 'Laptop (Business, i7)', sku: 'LAPTOP-BUS-001', category: 'Elektronika', price: 389000, stockQuantity: 5, minStockLevel: 3 },
  { id: 'prod-005', name: 'Nyomtató (A4, lézer)', sku: 'NYOM-A4-LEZ-001', category: 'Elektronika', price: 54900, stockQuantity: 8, minStockLevel: 4 },
  { id: 'prod-006', name: 'Irodai papír (A4, 500 lap)', sku: 'PAP-A4-500-001', category: 'Irodaszer', price: 1290, stockQuantity: 150, minStockLevel: 50 },
  { id: 'prod-007', name: 'Toner fekete (nagy kapacitású)', sku: 'TON-FEK-NK-001', category: 'Irodaszer', price: 12900, stockQuantity: 2, minStockLevel: 5 },
  { id: 'prod-008', name: 'Szoftver licenc (1 év)', sku: 'SZOFT-LIC-001', category: 'Szoftver', price: 24900, stockQuantity: 20, minStockLevel: 5 },
  { id: 'prod-009', name: 'Webkamera (1080p, USB)', sku: 'WEBKAM-1080-001', category: 'Elektronika', price: 15900, stockQuantity: 11, minStockLevel: 5 },
  { id: 'prod-010', name: 'Headset (vezetékes, zajszűrős)', sku: 'HEAD-VEZ-001', category: 'Elektronika', price: 18900, stockQuantity: 4, minStockLevel: 5 },
];

const invoices = [
  { id: 'inv-001', customerId: 'cust-001', items: [{ productId: 'prod-004', name: 'Laptop (Business, i7)', quantity: 3, unitPrice: 389000 }, { productId: 'prod-003', name: 'Monitor (27", 4K)', quantity: 3, unitPrice: 129000 }], totalAmount: 1554000, status: 'paid', createdAt: '2024-06-01T09:00:00.000Z', dueDate: '2024-07-01T00:00:00.000Z' },
  { id: 'inv-002', customerId: 'cust-002', items: [{ productId: 'prod-001', name: 'Irodai szék (ergonómikus)', quantity: 10, unitPrice: 45900 }, { productId: 'prod-002', name: 'Íróasztal (140x70 cm)', quantity: 5, unitPrice: 89900 }], totalAmount: 908500, status: 'sent', createdAt: '2024-08-15T10:00:00.000Z', dueDate: '2024-09-15T00:00:00.000Z' },
  { id: 'inv-003', customerId: 'cust-003', items: [{ productId: 'prod-005', name: 'Nyomtató (A4, lézer)', quantity: 1, unitPrice: 54900 }, { productId: 'prod-006', name: 'Irodai papír (A4, 500 lap)', quantity: 10, unitPrice: 1290 }], totalAmount: 67800, status: 'paid', createdAt: '2024-09-01T08:30:00.000Z', dueDate: '2024-09-08T00:00:00.000Z' },
  { id: 'inv-004', customerId: 'cust-004', items: [{ productId: 'prod-008', name: 'Szoftver licenc (1 év)', quantity: 5, unitPrice: 24900 }, { productId: 'prod-009', name: 'Webkamera (1080p, USB)', quantity: 5, unitPrice: 15900 }], totalAmount: 204000, status: 'overdue', createdAt: '2024-10-01T12:00:00.000Z', dueDate: '2024-10-31T00:00:00.000Z' },
  { id: 'inv-005', customerId: 'cust-005', items: [{ productId: 'prod-004', name: 'Laptop (Business, i7)', quantity: 2, unitPrice: 389000 }, { productId: 'prod-010', name: 'Headset (vezetékes, zajszűrős)', quantity: 2, unitPrice: 18900 }], totalAmount: 815800, status: 'draft', createdAt: '2025-01-10T14:00:00.000Z', dueDate: '2025-02-10T00:00:00.000Z' },
];

const employees = [
  { id: 'emp-001', name: 'Tóth Gábor', position: 'Fejlesztési vezető', department: 'IT', salary: 850000, startDate: '2020-03-01', email: 'toth.gabor@erpsystem.hu', phone: '+36 30 111 2222' },
  { id: 'emp-002', name: 'Kiss Éva', position: 'Értékesítési menedzser', department: 'Értékesítés', salary: 620000, startDate: '2021-07-15', email: 'kiss.eva@erpsystem.hu', phone: '+36 20 333 4444' },
  { id: 'emp-003', name: 'Fekete Péter', position: 'Könyvelő', department: 'Pénzügy', salary: 550000, startDate: '2019-01-10', email: 'fekete.peter@erpsystem.hu', phone: '+36 70 555 6666' },
  { id: 'emp-004', name: 'Molnár Andrea', position: 'HR generális', department: 'HR', salary: 480000, startDate: '2022-04-01', email: 'molnar.andrea@erpsystem.hu', phone: '+36 30 777 8888' },
  { id: 'emp-005', name: 'Balogh Zoltán', position: 'Raktáros', department: 'Logisztika', salary: 380000, startDate: '2023-09-01', email: 'balogh.zoltan@erpsystem.hu', phone: '+36 20 999 0000' },
];

const salaries = [
  { id: 'sal-001', employeeId: 'emp-001', month: 1, year: 2025, amount: 850000, status: 'paid', paidAt: '2025-01-31T10:00:00.000Z' },
  { id: 'sal-002', employeeId: 'emp-002', month: 1, year: 2025, amount: 620000, status: 'paid', paidAt: '2025-01-31T10:00:00.000Z' },
  { id: 'sal-003', employeeId: 'emp-003', month: 1, year: 2025, amount: 550000, status: 'paid', paidAt: '2025-01-31T10:00:00.000Z' },
  { id: 'sal-004', employeeId: 'emp-004', month: 1, year: 2025, amount: 480000, status: 'paid', paidAt: '2025-01-31T10:00:00.000Z' },
  { id: 'sal-005', employeeId: 'emp-005', month: 1, year: 2025, amount: 380000, status: 'paid', paidAt: '2025-01-31T10:00:00.000Z' },
  { id: 'sal-006', employeeId: 'emp-001', month: 2, year: 2025, amount: 850000, status: 'paid', paidAt: '2025-02-28T10:00:00.000Z' },
  { id: 'sal-007', employeeId: 'emp-002', month: 2, year: 2025, amount: 620000, status: 'paid', paidAt: '2025-02-28T10:00:00.000Z' },
  { id: 'sal-008', employeeId: 'emp-003', month: 2, year: 2025, amount: 550000, status: 'paid', paidAt: '2025-02-28T10:00:00.000Z' },
  { id: 'sal-009', employeeId: 'emp-004', month: 2, year: 2025, amount: 480000, status: 'paid', paidAt: '2025-02-28T10:00:00.000Z' },
  { id: 'sal-010', employeeId: 'emp-005', month: 2, year: 2025, amount: 380000, status: 'paid', paidAt: '2025-02-28T10:00:00.000Z' },
  { id: 'sal-011', employeeId: 'emp-001', month: 3, year: 2025, amount: 850000, status: 'pending', paidAt: null },
  { id: 'sal-012', employeeId: 'emp-002', month: 3, year: 2025, amount: 620000, status: 'pending', paidAt: null },
  { id: 'sal-013', employeeId: 'emp-003', month: 3, year: 2025, amount: 550000, status: 'pending', paidAt: null },
  { id: 'sal-014', employeeId: 'emp-004', month: 3, year: 2025, amount: 480000, status: 'pending', paidAt: null },
  { id: 'sal-015', employeeId: 'emp-005', month: 3, year: 2025, amount: 380000, status: 'pending', paidAt: null },
];

const inventory = [
  { id: 'mov-001', productId: 'prod-001', type: 'in', quantity: 15, note: 'Kezdeti készlet felvétel', createdAt: '2024-01-01T08:00:00.000Z' },
  { id: 'mov-002', productId: 'prod-001', type: 'out', quantity: 3, note: 'Kiszállítás - Kovács Kft.', createdAt: '2024-06-10T10:00:00.000Z' },
  { id: 'mov-003', productId: 'prod-003', type: 'in', quantity: 10, note: 'Kezdeti készlet felvétel', createdAt: '2024-01-01T08:00:00.000Z' },
  { id: 'mov-004', productId: 'prod-003', type: 'out', quantity: 7, note: 'Kiszállítás - Nagy Zrt.', createdAt: '2024-08-20T14:00:00.000Z' },
  { id: 'mov-005', productId: 'prod-007', type: 'in', quantity: 10, note: 'Készlet feltöltés', createdAt: '2024-09-01T09:00:00.000Z' },
  { id: 'mov-006', productId: 'prod-007', type: 'out', quantity: 8, note: 'Belső felhasználás', createdAt: '2024-12-15T11:00:00.000Z' },
];

export async function GET() {
  // Only allow seeding in non-production or with a secret key
  if (process.env.NODE_ENV === 'production' && process.env.SEED_SECRET !== 'allow') {
    return NextResponse.json({ error: 'Nem engedélyezett' }, { status: 403 });
  }

  try {
    const db = await getDb();

    const collections = [
      { name: 'customers', data: customers },
      { name: 'products', data: products },
      { name: 'invoices', data: invoices },
      { name: 'employees', data: employees },
      { name: 'salaries', data: salaries },
      { name: 'inventory_movements', data: inventory },
    ];

    const results: Record<string, number> = {};

    for (const { name, data } of collections) {
      const coll = db.collection(name);
      const count = await coll.countDocuments();
      if (count === 0) {
        await coll.insertMany(data);
        results[name] = data.length;
      } else {
        results[name] = 0;
      }
    }

    return NextResponse.json({ ok: true, inserted: results });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Seed hiba' }, { status: 500 });
  }
}
