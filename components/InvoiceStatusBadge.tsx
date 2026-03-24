'use client';

import { Badge } from '@/components/ui/badge';
import { invoiceStatusLabel } from '@/lib/utils-erp';
import { InvoiceStatus } from '@/lib/types';

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
}

const variantMap: Record<InvoiceStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  sent: 'outline',
  paid: 'default',
  overdue: 'destructive',
};

export default function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  return <Badge variant={variantMap[status]}>{invoiceStatusLabel(status)}</Badge>;
}
