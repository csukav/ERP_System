'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import EmployeeForm from '@/components/EmployeeForm';
import ConfirmDialog from '@/components/ConfirmDialog';
import LoadingSpinner from '@/components/LoadingSpinner';
import SearchInput from '@/components/SearchInput';
import { useApp } from '@/context/AppContext';
import { createEmployee, updateEmployee, deleteEmployee, updateSalary, createSalary } from '@/lib/api';
import { formatHUF, formatDate, formatMonthYear, salaryStatusLabel } from '@/lib/utils-erp';
import { Employee, Salary } from '@/lib/types';

export default function HRPage() {
  const { state, refreshEmployees, refreshSalaries } = useApp();
  const { employees, salaries, loading } = state;
  const isLoading = loading.employees || loading.salaries;

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'employees' | 'salaries'>('employees');
  const [salaryFilter, setSalaryFilter] = useState<'all' | 'pending' | 'paid'>('all');

  useEffect(() => {
    refreshEmployees();
    refreshSalaries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredEmployees = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.position.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSalaries = salaries.filter(
    (s) => salaryFilter === 'all' || s.status === salaryFilter
  );

  const handleCreate = async (data: Omit<Employee, 'id'>) => {
    const newEmp = await createEmployee(data);
    await refreshEmployees();
    toast.success('Alkalmazott létrehozva');
    // Auto-generate current month salary
    const now = new Date();
    await createSalary({
      employeeId: newEmp.id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      amount: data.salary,
      status: 'pending',
      paidAt: null,
    });
    await refreshSalaries();
  };

  const handleUpdate = async (data: Omit<Employee, 'id'>) => {
    if (!editing) return;
    await updateEmployee(editing.id, data);
    await refreshEmployees();
    toast.success('Alkalmazott frissítve');
    setEditing(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteEmployee(deleteTarget.id);
      await refreshEmployees();
      toast.success('Alkalmazott törölve');
    } catch {
      toast.error('Hiba a törlés során');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleMarkPaid = async (sal: Salary) => {
    try {
      await updateSalary(sal.id, { status: 'paid', paidAt: new Date().toISOString() });
      await refreshSalaries();
      toast.success('Bér kifizetve');
    } catch {
      toast.error('Hiba a bér kifizetésekor');
    }
  };

  const getEmployeeName = (id: string) => employees.find((e) => e.id === id)?.name ?? id;

  const pendingTotal = salaries
    .filter((s) => s.status === 'pending')
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">HR & Bérek</h1>
        <p className="text-muted-foreground mt-1">
          {employees.length} alkalmazott · {salaries.filter((s) => s.status === 'pending').length} függő bérkifizetés
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Alkalmazottak</p>
            <p className="text-2xl font-bold mt-1">{employees.length} fő</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Havi bérköltség</p>
            <p className="text-2xl font-bold mt-1">
              {formatHUF(employees.reduce((s, e) => s + e.salary, 0))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Kifizetésre vár</p>
            <p className="text-2xl font-bold mt-1 text-yellow-600 dark:text-yellow-400">
              {formatHUF(pendingTotal)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'employees'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Alkalmazottak
        </button>
        <button
          onClick={() => setActiveTab('salaries')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'salaries'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Bérnyilvántartás
        </button>
      </div>

      {/* Employees tab */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <SearchInput value={search} onChange={setSearch} placeholder="Keresés név, beosztás, részleg..." />
            <Button onClick={() => setFormOpen(true)} className="ml-3 shrink-0">
              <Plus className="w-4 h-4 mr-2" />
              Új alkalmazott
            </Button>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Név</TableHead>
                    <TableHead>Beosztás</TableHead>
                    <TableHead className="hidden sm:table-cell">Részleg</TableHead>
                    <TableHead>Fizetés</TableHead>
                    <TableHead className="hidden lg:table-cell">Email</TableHead>
                    <TableHead className="hidden lg:table-cell">Belépés</TableHead>
                    <TableHead className="text-right">Műveletek</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                        Nincs találat
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <TableRow key={emp.id}>
                        <TableCell className="font-medium">{emp.name}</TableCell>
                        <TableCell>{emp.position}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="secondary">{emp.department}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">{formatHUF(emp.salary)}</TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">{emp.email}</TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {formatDate(emp.startDate)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Szerkesztés"
                              onClick={() => setEditing(emp)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Törlés"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteTarget(emp)}
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
        </div>
      )}

      {/* Salaries tab */}
      {activeTab === 'salaries' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Szűrő:</span>
            <Select value={salaryFilter} onValueChange={(v) => setSalaryFilter(v as 'all' | 'pending' | 'paid')}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Összes</SelectItem>
                <SelectItem value="pending">Függőben</SelectItem>
                <SelectItem value="paid">Kifizetve</SelectItem>
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
                    <TableHead>Alkalmazott</TableHead>
                    <TableHead>Időszak</TableHead>
                    <TableHead>Összeg</TableHead>
                    <TableHead>Állapot</TableHead>
                    <TableHead className="hidden md:table-cell">Kifizetési dátum</TableHead>
                    <TableHead className="text-right">Műveletek</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSalaries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                        Nincs találat
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSalaries.map((sal) => (
                      <TableRow key={sal.id}>
                        <TableCell className="font-medium">{getEmployeeName(sal.employeeId)}</TableCell>
                        <TableCell>{formatMonthYear(sal.month, sal.year)}</TableCell>
                        <TableCell className="font-semibold">{formatHUF(sal.amount)}</TableCell>
                        <TableCell>
                          <Badge variant={sal.status === 'paid' ? 'default' : 'secondary'}>
                            {sal.status === 'paid' ? (
                              <><CheckCircle2 className="w-3 h-3 mr-1 inline" />{salaryStatusLabel(sal.status)}</>
                            ) : (
                              <><Clock className="w-3 h-3 mr-1 inline" />{salaryStatusLabel(sal.status)}</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {sal.paidAt ? formatDate(sal.paidAt) : '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end">
                            {sal.status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMarkPaid(sal)}
                              >
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Kifizetés
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      <EmployeeForm open={formOpen} onOpenChange={setFormOpen} onSubmit={handleCreate} title="Új alkalmazott" />

      {editing && (
        <EmployeeForm
          open={!!editing}
          onOpenChange={(o) => { if (!o) setEditing(null); }}
          initial={editing}
          onSubmit={handleUpdate}
          title="Alkalmazott szerkesztése"
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}
        description={`Biztosan törlöd "${deleteTarget?.name}" alkalmazottat?`}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
