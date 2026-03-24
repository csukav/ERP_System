'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Employee } from '@/lib/types';

interface EmployeeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial?: Partial<Employee>;
  onSubmit: (data: Omit<Employee, 'id'>) => Promise<void>;
  title: string;
}

export default function EmployeeForm({
  open,
  onOpenChange,
  initial = {},
  onSubmit,
  title,
}: EmployeeFormProps) {
  const [form, setForm] = useState({
    name: initial.name ?? '',
    position: initial.position ?? '',
    department: initial.department ?? '',
    salary: String(initial.salary ?? ''),
    startDate: initial.startDate ?? '',
    email: initial.email ?? '',
    phone: initial.phone ?? '',
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
        position: form.position,
        department: form.department,
        salary: Number(form.salary),
        startDate: form.startDate,
        email: form.email,
        phone: form.phone,
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
            <Label htmlFor="ename">Teljes név *</Label>
            <Input id="ename" value={form.name} onChange={handleChange('name')} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="position">Beosztás *</Label>
              <Input id="position" value={form.position} onChange={handleChange('position')} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="department">Részleg</Label>
              <Input id="department" value={form.department} onChange={handleChange('department')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="salary">Fizetés (Ft) *</Label>
              <Input id="salary" type="number" min={0} value={form.salary} onChange={handleChange('salary')} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="startDate">Belépés dátuma *</Label>
              <Input id="startDate" type="date" value={form.startDate} onChange={handleChange('startDate')} required />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="eemail">Email *</Label>
            <Input id="eemail" type="email" value={form.email} onChange={handleChange('email')} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ephone">Telefon</Label>
            <Input id="ephone" value={form.phone} onChange={handleChange('phone')} />
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
