import type { ShoppingItem } from '@/types/project';
import { formatCurrency, lineTotal, storeSearchUrl } from '@/lib/format';
import { Checkbox, StoreBadge } from '@/components/ui/primitives';

interface ShoppingItemRowProps {
  item: ShoppingItem;
  /** Secondary label, e.g. the task or project the item is for. */
  context?: string | null;
  onTogglePurchased: () => void;
  onEdit: () => void;
  /** Look up a store product for an item that has no link yet. */
  onFind?: () => void;
  /** Show the store badge; off when the list is already grouped by store. */
  showStore?: boolean;
}

export default function ShoppingItemRow({ item, context, onTogglePurchased, onEdit, onFind, showStore }: ShoppingItemRowProps) {
  const needsProduct = !item.url;

  return (
    <li className="flex items-center gap-3 py-3">
      <Checkbox checked={item.purchased} onChange={onTogglePurchased} label={`Mark ${item.name} as bought`} />

      {item.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image_url} alt="" className="size-12 shrink-0 rounded-lg bg-white object-contain ring-1 ring-foreground/5" loading="lazy" />
      ) : null}

      <button onClick={onEdit} className="min-w-0 flex-1 text-left">
        <span
          className={`line-clamp-2 text-sm font-medium leading-snug ${item.purchased ? 'line-through text-foreground/40' : ''}`}
        >
          {item.name}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-foreground/50">
          {showStore && item.store !== 'other' && <StoreBadge store={item.store} />}
          {context && <span className="truncate">{context}</span>}
          {item.unit_price != null && item.quantity > 1 && (
            <span>
              {item.quantity} × {formatCurrency(item.unit_price)}
            </span>
          )}
          {item.unit_price == null && item.quantity > 1 && <span>Qty {item.quantity}</span>}
        </span>
      </button>

      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="text-sm font-semibold">{item.unit_price != null ? formatCurrency(lineTotal(item)) : ''}</span>
        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-primary-hover hover:underline"
          >
            View ↗
          </a>
        ) : needsProduct && onFind ? (
          <button onClick={onFind} className="rounded-lg bg-light-gold px-3 py-1.5 text-xs font-semibold hover:bg-primary hover:text-white">
            Find
          </button>
        ) : (
          <a
            href={storeSearchUrl(item.store === 'lowes' ? 'lowes' : 'home_depot', item.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-primary-hover hover:underline"
          >
            Search ↗
          </a>
        )}
      </div>
    </li>
  );
}
