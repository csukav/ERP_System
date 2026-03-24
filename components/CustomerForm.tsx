'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Customer } from '@/lib/types';

interface CustomerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Partial<Customer>;
  onSubmit: (data: Omit<Customer, 'id' | 'createdAt'>) => Promise<void>;
  title: string;
}

export default function CustomerForm({
  open,
  onOpenChange,
  initial = {},
  onSubmit,
  title,
}: CustomerFormProps) {
  const [form, setForm] = useState({
    name: initial.name ?? '',
    email: initial.email ?? '',
    phone: initial.phone ?? '',
    address: initial.address ?? '',
    notes: initial.notes ?? '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(form);
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
            <Label htmlFor="name">Név *</Label>
            <Input id="name" value={form.name} onChange={handleChange('name')} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" value={form.email} onChange={handleChange('email')} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone">Telefon</Label>
            <Input id="phone" value={form.phone} onChange={handleChange('phone')} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="address">Cím</Label>
            <Input id="address" value={form.address} onChange={handleChange('address')} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="notes">Megjegyzés</Label>
            <Textarea id="notes" value={form.notes} onChange={handleChange('notes')} rows={3} />
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
