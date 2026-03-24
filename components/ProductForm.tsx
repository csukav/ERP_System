'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Product } from '@/lib/types';

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Partial<Product>;
  onSubmit: (data: Omit<Product, 'id'>) => Promise<void>;
  title: string;
}

export default function ProductForm({
  open,
  onOpenChange,
  initial = {},
  onSubmit,
  title,
}: ProductFormProps) {
  const [form, setForm] = useState({
    name: initial.name ?? '',
    sku: initial.sku ?? '',
    category: initial.category ?? '',
    price: String(initial.price ?? ''),
    stockQuantity: String(initial.stockQuantity ?? ''),
    minStockLevel: String(initial.minStockLevel ?? ''),
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        name: form.name,
        sku: form.sku,
        category: form.category,
        price: Number(form.price),
        stockQuantity: Number(form.stockQuantity),
        minStockLevel: Number(form.minStockLevel),
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1">
            <Label htmlFor="pname">Termék neve *</Label>
            <Input id="pname" value={form.name} onChange={handleChange('name')} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="sku">SKU *</Label>
              <Input id="sku" value={form.sku} onChange={handleChange('sku')} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="category">Kategória</Label>
              <Input id="category" value={form.category} onChange={handleChange('category')} />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="price">Ár (Ft) *</Label>
            <Input id="price" type="number" min={0} value={form.price} onChange={handleChange('price')} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="stockQuantity">Készlet *</Label>
              <Input id="stockQuantity" type="number" min={0} value={form.stockQuantity} onChange={handleChange('stockQuantity')} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="minStock">Min. készlet *</Label>
              <Input id="minStock" type="number" min={0} value={form.minStockLevel} onChange={handleChange('minStockLevel')} required />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Mégse
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Mentés...' : 'Mentés'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
