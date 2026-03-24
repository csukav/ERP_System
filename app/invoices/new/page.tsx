'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useApp } from '@/context/AppContext';
import { createInvoice } from '@/lib/api';
import { formatHUF } from '@/lib/utils-erp';
import { InvoiceItem } from '@/lib/types';

interface LineItem extends InvoiceItem {
  _key: number;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const { state, refreshCustomers, refreshProducts } = useApp();
  const { customers, products } = state;

  useEffect(() => {
    refreshCustomers();
    refreshProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [customerId, setCustomerId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<'draft' | 'sent'>('draft');
  const [items, setItems] = useState<LineItem[]>([
    { _key: Date.now(), productId: '', name: '', quantity: 1, unitPrice: 0 },
  ]);
  const [saving, setSaving] = useState(false);

  const addLine = () =>
    setItems((prev) => [
      ...prev,
      { _key: Date.now(), productId: '', name: '', quantity: 1, unitPrice: 0 },
    ]);

  const removeLine = (key: number) =>
    setItems((prev) => prev.filter((i) => i._key !== key));

  const updateLine = (key: number, field: keyof LineItem, value: string | number) =>
    setItems((prev) =>
      prev.map((i) => {
        if (i._key !== key) return i;
        const updated = { ...i, [field]: value };
        if (field === 'productId') {
          const product = products.find((p) => p.id === value);
          if (product) {
            updated.name = product.name;
            updated.unitPrice = product.price;
          }
        }
        return updated;
      })
    );

  const totalAmount = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) { toast.error('Válasszon ügyfelet'); return; }
    if (!dueDate) { toast.error('Adja meg a fizetési határidőt'); return; }
    if (items.some((i) => !i.name || i.unitPrice <= 0)) {
      toast.error('Minden tétel neve és ára kötelező');
      return;
    }
    setSaving(true);
    try {
      await createInvoice({
        customerId,
        items: items.map(({ _key, ...rest }) => rest),
        totalAmount,
        status,
        dueDate: new Date(dueDate).toISOString(),
      });
      toast.success('Számla létrehozva');
      router.push('/invoices');
    } catch {
      toast.error('Hiba a számla mentésekor');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/invoices">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Új számla</h1>
          <p className="text-muted-foreground text-sm">Számla kiállítása ügyfeleknek</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader><CardTitle className="text-base">Alapadatok</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1 sm:col-span-1">
              <Label>Ügyfél *</Label>
              <Select value={customerId} onValueChange={(v) => { if (v) setCustomerId(v); }}>
                <SelectTrigger>
                  <SelectValue placeholder="Válasszon ügyfelet..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Fizetési határidő *</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label>Állapot</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as 'draft' | 'sent')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Tervezet</SelectItem>
                  <SelectItem value="sent">Kiküldve</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Line items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Tételek</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addLine}>
              <Plus className="w-3 h-3 mr-1" />
              Tétel hozzáadása
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Header row */}
            <div className="hidden sm:grid grid-cols-12 gap-2 text-xs text-muted-foreground px-1">
              <div className="col-span-4">Termék / Megnevezés</div>
              <div className="col-span-3">Egységár (Ft)</div>
              <div className="col-span-2">Mennyiség</div>
              <div className="col-span-2 text-right">Összesen</div>
              <div className="col-span-1" />
            </div>
            {items.map((item) => (
              <div key={item._key} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-12 sm:col-span-4">
                  <Select
                    value={item.productId}
                    onValueChange={(v) => { if (v) updateLine(item._key, 'productId', v); }}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Válasszon terméket..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_custom">Egyéni tétel</SelectItem>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(item.productId === '_custom' || !item.productId) && (
                    <Input
                      className="mt-1 text-sm"
                      placeholder="Megnevezés *"
                      value={item.name}
                      onChange={(e) => updateLine(item._key, 'name', e.target.value)}
                    />
                  )}
                </div>
                <div className="col-span-5 sm:col-span-3">
                  <Input
                    type="number"
                    min={0}
                    className="text-sm"
                    placeholder="Egységár"
                    value={item.unitPrice || ''}
                    onChange={(e) => updateLine(item._key, 'unitPrice', Number(e.target.value))}
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <Input
                    type="number"
                    min={1}
                    className="text-sm"
                    value={item.quantity}
                    onChange={(e) => updateLine(item._key, 'quantity', Number(e.target.value))}
                  />
                </div>
                <div className="col-span-2 sm:col-span-2 text-right text-sm font-medium">
                  {formatHUF(item.quantity * item.unitPrice)}
                </div>
                <div className="col-span-1 flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeLine(item._key)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Separator />
            <div className="flex justify-end">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Végösszeg</p>
                <p className="text-2xl font-bold">{formatHUF(totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Link href="/invoices">
            <Button type="button" variant="outline">Mégse</Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? 'Mentés...' : 'Számla mentése'}
          </Button>
        </div>
      </form>
    </div>
  );
}
