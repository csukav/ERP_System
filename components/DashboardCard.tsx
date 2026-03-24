'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'default' | 'warning' | 'danger' | 'success';
  loading?: boolean;
}

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
  loading = false,
}: DashboardCardProps) {
  const iconClass = cn('w-8 h-8 rounded-lg flex items-center justify-center', {
    'bg-primary/10 text-primary': variant === 'default',
    'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400': variant === 'warning',
    'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400': variant === 'danger',
    'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400': variant === 'success',
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={iconClass}>
          <Icon className="w-4 h-4" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-24 bg-muted animate-pulse rounded" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        {subtitle && !loading && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
