'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  Package,
  UserSquare2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Irányítópult', icon: LayoutDashboard },
  { href: '/customers', label: 'Ügyfeleim', icon: Users },
  { href: '/invoices', label: 'Számlák', icon: FileText },
  { href: '/inventory', label: 'Készlet', icon: Package },
  { href: '/hr', label: 'HR & Bér', icon: UserSquare2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'relative flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
          ERP
        </div>
        {!collapsed && (
          <span className="font-semibold text-sidebar-foreground text-sm truncate">
            ERP Rendszer
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
              title={collapsed ? label : undefined}
            >
              <Icon className="flex-shrink-0 w-5 h-5" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center shadow-sm hover:bg-accent transition-colors z-10"
        aria-label={collapsed ? 'Kibontás' : 'Összecsukás'}
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </aside>
  );
}
