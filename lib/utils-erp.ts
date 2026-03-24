/**
 * Format number as Hungarian Forint currency
 * e.g. 125000 => "125 000 Ft"
 */
export function formatHUF(amount: number): string {
  return (
    new Intl.NumberFormat('hu-HU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' Ft'
  );
}

/**
 * Format ISO date string to Hungarian format: YYYY. MM. DD.
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}. ${m}. ${d}.`;
}

/**
 * Hungarian month names
 */
const MONTHS_HU = [
  'Január', 'Február', 'Március', 'Április', 'Május', 'Június',
  'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December',
];

/**
 * Format month/year as "2025. Március"
 */
export function formatMonthYear(month: number, year: number): string {
  return `${year}. ${MONTHS_HU[month - 1]}`;
}

/**
 * Generate a simple unique ID
 */
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Invoice status label in Hungarian
 */
export function invoiceStatusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: 'Tervezet',
    sent: 'Kiküldve',
    paid: 'Fizetve',
    overdue: 'Lejárt',
  };
  return map[status] ?? status;
}

/**
 * Salary status label in Hungarian
 */
export function salaryStatusLabel(status: string): string {
  return status === 'paid' ? 'Kifizetve' : 'Függőben';
}
