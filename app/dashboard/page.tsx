'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Users, FileText, Package, UserSquare2, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import DashboardCard from '@/components/DashboardCard';
import { useApp } from '@/context/AppContext';
import { formatHUF } from '@/lib/utils-erp';

export default function DashboardPage() {
  const { state, refreshCustomers, refreshProducts, refreshInvoices, refreshEmployees, refreshSalaries } = useApp();

  useEffect(() => {
    refreshCustomers();
    refreshProducts();
    refreshInvoices();
    refreshEmployees();
    refreshSalaries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { customers, products, invoices, employees, salaries, loading } = state;
  const isLoading = Object.values(loading).some(Boolean);

  // Compute stats
  const totalRevenue = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.totalAmount, 0);
  const unpaidInvoices = invoices.filter((i) => i.status === 'sent').length;
  const overdueInvoices = invoices.filter((i) => i.status === 'overdue').length;
  const lowStockProducts = products.filter((p) => p.stockQuantity <= p.minStockLevel).length;
  const pendingSalaries = salaries.filter((s) => s.status === 'pending').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Irányítópult</h1>
        <p className="text-muted-foreground mt-1">Üdvözöljük az ERP rendszerben</p>
      </div>

      {/* CRM Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">CRM</h2>
          <Link href="/customers" className="text-sm text-primary hover:underline">Összes ügyfél →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard title="Ügyfelek" value={customers.length} icon={Users} loading={isLoading} subtitle="Regisztrált ügyfél" />
        </div>
      </section>

      {/* Finance Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Pénzügy</h2>
          <Link href="/invoices" className="text-sm text-primary hover:underline">Összes számla →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard title="Bevétel (fizetve)" value={formatHUF(totalRevenue)} icon={TrendingUp} variant="success" loading={isLoading} />
          <DashboardCard title="Kifizetetlen" value={unpaidInvoices} icon={FileText} variant="warning" loading={isLoading} subtitle="Kiküldött számla" />
          <DashboardCard title="Lejárt" value={overdueInvoices} icon={AlertTriangle} variant="danger" loading={isLoading} subtitle="Lejárt határidő" />
          <DashboardCard title="Összes számla" value={invoices.length} icon={FileText} loading={isLoading} />
        </div>
      </section>

      {/* Inventory Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Készlet</h2>
          <Link href="/inventory" className="text-sm text-primary hover:underline">Készletkezelés →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard title="Termékek" value={products.length} icon={Package} loading={isLoading} />
          <DashboardCard
            title="Alacsony készlet"
            value={lowStockProducts}
            icon={AlertTriangle}
            variant={lowStockProducts > 0 ? 'danger' : 'default'}
            loading={isLoading}
            subtitle="Min. szint alatt"
          />
        </div>
      </section>

      {/* HR Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">HR & Bér</h2>
          <Link href="/hr" className="text-sm text-primary hover:underline">HR modul →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard title="Alkalmazottak" value={employees.length} icon={UserSquare2} loading={isLoading} />
          <DashboardCard
            title="Függő bérkifizetés"
            value={pendingSalaries}
            icon={Clock}
            variant={pendingSalaries > 0 ? 'warning' : 'default'}
            loading={isLoading}
            subtitle="Feldolgozásra vár"
          />
        </div>
      </section>
    </div>
  );
}
