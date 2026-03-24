'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Phone, MapPin, CalendarDays, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import InvoiceStatusBadge from '@/components/InvoiceStatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Customer, Invoice } from '@/lib/types';
import { formatDate, formatHUF } from '@/lib/utils-erp';

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [custRes, invRes] = await Promise.all([
          fetch(`/api/customers/${id}`),
          fetch('/api/invoices'),
        ]);
        if (!custRes.ok) { router.push('/customers'); return; }
        const cust: Customer = await custRes.json();
        const allInvoices: Invoice[] = await invRes.json();
        setCustomer(cust);
        setInvoices(allInvoices.filter((inv) => inv.customerId === id));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router]);

  if (loading) return <LoadingSpinner />;
  if (!customer) return null;

  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/customers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{customer.name}</h1>
          <p className="text-muted-foreground text-sm">Ügyfél részletek</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Kapcsolati adatok</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm">{customer.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Telefon</p>
                <p className="text-sm">{customer.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Cím</p>
                <p className="text-sm">{customer.address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CalendarDays className="w-4 h-4 mt-0.5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Regisztrált</p>
                <p className="text-sm">{formatDate(customer.createdAt)}</p>
              </div>
            </div>
            {customer.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Megjegyzés</p>
                  <p className="text-sm text-muted-foreground">{customer.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Invoice history */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">Összes számla</p>
                <p className="text-2xl font-bold mt-1">{invoices.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">Befizetett</p>
                <p className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">{formatHUF(totalPaid)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">Lejárt</p>
                <p className="text-2xl font-bold mt-1 text-red-500">
                  {invoices.filter((i) => i.status === 'overdue').length}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2 pb-3">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-base">Számlák</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {invoices.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nincs számla</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Azonosító</TableHead>
                      <TableHead>Összeg</TableHead>
                      <TableHead>Állapot</TableHead>
                      <TableHead>Kiállítva</TableHead>
                      <TableHead>Határidő</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-mono text-sm">{inv.id}</TableCell>
                        <TableCell className="font-medium">{formatHUF(inv.totalAmount)}</TableCell>
                        <TableCell><InvoiceStatusBadge status={inv.status} /></TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(inv.createdAt)}</TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(inv.dueDate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
