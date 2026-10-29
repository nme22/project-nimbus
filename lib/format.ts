import type { ShoppingItem, Store } from '@/types/project';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function formatCurrency(value: number | null | undefined): string {
  return value == null ? '—' : currency.format(value);
}

/** Formats a `YYYY-MM-DD` date column without shifting it into the local timezone. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '';
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Whole days from today until a `YYYY-MM-DD` date (negative when overdue). */
export function daysUntil(value: string): number {
  const [y, m, d] = value.split('-').map(Number);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((new Date(y, m - 1, d).getTime() - today.getTime()) / 86_400_000);
}

export function lineTotal(item: Pick<ShoppingItem, 'unit_price' | 'quantity'>): number {
  return (item.unit_price ?? 0) * item.quantity;
}

export function sumItems(items: Pick<ShoppingItem, 'unit_price' | 'quantity'>[]): number {
  return items.reduce((sum, item) => sum + lineTotal(item), 0);
}

export function storeSearchUrl(store: Exclude<Store, 'other'>, query: string): string {
  const q = encodeURIComponent(query.trim());
  return store === 'home_depot'
    ? `https://www.homedepot.com/s/${q}`
    : `https://www.lowes.com/search?searchTerm=${q}`;
}
