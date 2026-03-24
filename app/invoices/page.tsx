'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import InvoiceStatusBadge from '@/components/InvoiceStatusBadge';
import ConfirmDialog from '@/components/ConfirmDialog';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useApp } from '@/context/AppContext';
import { formatDate, formatHUF, invoiceStatusLabel } from '@/lib/utils-erp';
import { deleteInvoice, updateInvoice } from '@/lib/api';
import { Invoice, InvoiceStatus } from '@/lib/types';

const STATUSES: (InvoiceStatus | 'all')[] = ['all', 'draft', 'sent', 'paid', 'overdue'] as const;

export default function InvoicesPage() {
  const { state, refreshInvoices, refreshCustomers } = useApp();
  const { invoices, customers, loading } = state;
  const isLoading = loading.invoices;

  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    refreshInvoices();
    refreshCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = invoices.filter(
    (inv) => statusFilter === 'all' || inv.status === statusFilter
  );

  const getCustomerName = (id: string) =>
    customers.find((c) => c.id === id)?.name ?? id;

  const handleStatusChange = async (inv: Invoice, status: InvoiceStatus) => {
    try {
      await updateInvoice(inv.id, { status });
      await refreshInvoices();
      toast.success('Állapot frissítve');
    } catch {
      toast.error('Hiba az állapot változtatásakor');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteInvoice(deleteTarget.id);
      await refreshInvoices();
      toast.success('Számla törölve');
    } catch {
      toast.error('Hiba a törlés során');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  // Summary stats
  const totalRevenue = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.totalAmount, 0);
  const unpaid = invoices.filter((i) => i.status === 'sent').length;
  const overdue = invoices.filter((i) => i.status === 'overdue').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Számlák</h1>
          <p className="text-muted-foreground mt-1">{filtered.length} számla</p>
        </div>
        <Link href="/invoices/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Új számla
          </Button>
        </Link>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground">Bevétel (fizetve)</p>
          <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">{formatHUF(totalRevenue)}</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground">Kifizetetlen</p>
          <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{unpaid} db</p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground">Lejárt</p>
          <p className="text-xl font-bold text-red-500 mt-1">{overdue} db</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Szűrő:</span>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as InvoiceStatus | 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s === 'all' ? 'Összes' : invoiceStatusLabel(s as InvoiceStatus)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Azonosító</TableHead>
                <TableHead>Ügyfél</TableHead>
                <TableHead>Összeg</TableHead>
                <TableHead>Állapot</TableHead>
                <TableHead className="hidden md:table-cell">Kiállítva</TableHead>
                <TableHead className="hidden md:table-cell">Határidő</TableHead>
                <TableHead className="text-right">Műveletek</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                    Nincs találat
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono text-sm">{inv.id}</TableCell>
                    <TableCell className="font-medium">{getCustomerName(inv.customerId)}</TableCell>
                    <TableCell className="font-semibold">{formatHUF(inv.totalAmount)}</TableCell>
                    <TableCell>
                      <Select
                        value={inv.status}
                        onValueChange={(v) => handleStatusChange(inv, v as InvoiceStatus)}
                      >
                        <SelectTrigger className="w-32 h-7 text-xs">
                          <SelectValue>
                            <InvoiceStatusBadge status={inv.status} />
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {(['draft', 'sent', 'paid', 'overdue'] as InvoiceStatus[]).map((s) => (
                            <SelectItem key={s} value={s}>{invoiceStatusLabel(s)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{formatDate(inv.createdAt)}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">{formatDate(inv.dueDate)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Törlés"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(inv)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}
        description={`Biztosan törlöd a(z) ${deleteTarget?.id} számú számlát?`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
