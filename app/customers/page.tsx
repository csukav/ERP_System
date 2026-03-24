'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SearchInput from '@/components/SearchInput';
import CustomerForm from '@/components/CustomerForm';
import ConfirmDialog from '@/components/ConfirmDialog';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useApp } from '@/context/AppContext';
import { formatDate } from '@/lib/utils-erp';
import { createCustomer, updateCustomer, deleteCustomer } from '@/lib/api';
import { Customer } from '@/lib/types';

export default function CustomersPage() {
  const { state, refreshCustomers } = useApp();
  const { customers, loading } = state;
  const isLoading = loading.customers;

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    refreshCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const handleCreate = async (data: Omit<Customer, 'id' | 'createdAt'>) => {
    await createCustomer(data);
    await refreshCustomers();
    toast.success('Ügyfél létrehozva');
  };

  const handleUpdate = async (data: Omit<Customer, 'id' | 'createdAt'>) => {
    if (!editing) return;
    await updateCustomer(editing.id, data);
    await refreshCustomers();
    toast.success('Ügyfél frissítve');
    setEditing(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCustomer(deleteTarget.id);
      await refreshCustomers();
      toast.success('Ügyfél törölve');
    } catch {
      toast.error('Hiba a törlés során');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ügyfelek</h1>
          <p className="text-muted-foreground mt-1">{filtered.length} ügyfél</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Új ügyfél
        </Button>
      </div>

      <SearchInput value={search} onChange={setSearch} placeholder="Keresés név, email, telefon alapján..." />

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Név</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead className="hidden md:table-cell">Cím</TableHead>
                <TableHead className="hidden lg:table-cell">Regisztrált</TableHead>
                <TableHead className="text-right">Műveletek</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    Nincs találat
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground truncate max-w-[200px]">
                      {customer.address}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {formatDate(customer.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/customers/${customer.id}`}>
                          <Button variant="ghost" size="icon" title="Részletek">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Szerkesztés"
                          onClick={() => setEditing(customer)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Törlés"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(customer)}
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

      {/* Create form */}
      <CustomerForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        title="Új ügyfél"
      />

      {/* Edit form */}
      {editing && (
        <CustomerForm
          open={!!editing}
          onOpenChange={(o) => { if (!o) setEditing(null); }}
          initial={editing}
          onSubmit={handleUpdate}
          title="Ügyfél szerkesztése"
        />
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}
        description={`Biztosan törlöd "${deleteTarget?.name}" ügyfelet?`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
