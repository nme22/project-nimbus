'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { ShoppingItemUpdate, ShoppingItemWithProject } from '@/types/project';
import { deleteShoppingItem, listShoppingItems, updateShoppingItem } from '@/lib/db';
import { roomOf, storeOptions } from '@/lib/options';
import { formatCurrency, sumItems } from '@/lib/format';
import Sheet from '@/components/ui/Sheet';
import { ErrorBanner } from '@/components/ui/primitives';
import ShoppingItemForm from './ShoppingItemForm';
import ShoppingItemRow from './ShoppingItemRow';

type GroupBy = 'store' | 'project';

/** Every shopping item across projects, grouped for a trip to the store. */
export default function ShoppingOverview() {
  const [items, setItems] = useState<ShoppingItemWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<GroupBy>('store');
  const [showBought, setShowBought] = useState(false);
  const [editing, setEditing] = useState<ShoppingItemWithProject | null>(null);

  useEffect(() => {
    let cancelled = false;
    listShoppingItems()
      .then((rows) => !cancelled && setItems(rows))
      .catch((e: Error) => !cancelled && setError(`Couldn't load shopping list: ${e.message}`))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  function togglePurchased(item: ShoppingItemWithProject) {
    const purchased = !item.purchased;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, purchased } : i)));
    updateShoppingItem(item.id, { purchased }).catch((e: Error) => {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, purchased: !purchased } : i)));
      setError(`Couldn't update item: ${e.message}`);
    });
  }

  async function saveItem(item: ShoppingItemWithProject, data: ShoppingItemUpdate) {
    try {
      const updated = await updateShoppingItem(item.id, data);
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...updated, project: i.project } : i)));
      setEditing(null);
    } catch (e) {
      setError(`Couldn't save item: ${(e as Error).message}`);
    }
  }

  function removeItem(item: ShoppingItemWithProject) {
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    setEditing(null);
    deleteShoppingItem(item.id).catch((e: Error) => setError(`Couldn't delete item: ${e.message}`));
  }

  const toBuy = items.filter((i) => !i.purchased);
  const visible = showBought ? items : toBuy;

  const groups = useMemo(() => {
    if (groupBy === 'store') {
      return storeOptions
        .map((s) => ({ key: s.value, label: s.label, href: null, items: visible.filter((i) => i.store === s.value) }))
        .filter((g) => g.items.length > 0);
    }
    const byProject = new Map<string, { key: string; label: string; href: string | null; items: ShoppingItemWithProject[] }>();
    for (const item of visible) {
      const key = item.project_id;
      if (!byProject.has(key)) {
        const label = item.project ? `${roomOf(item.project.room).icon} ${item.project.title}` : 'Unknown project';
        byProject.set(key, { key, label, href: `/projects/${key}`, items: [] });
      }
      byProject.get(key)!.items.push(item);
    }
    return [...byProject.values()];
  }, [visible, groupBy]);

  if (loading) {
    return <div className="py-16 text-center text-foreground/40 animate-pulse">Loading shopping list…</div>;
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold">Shopping list</h1>
        <p className="text-sm text-foreground/60">
          {toBuy.length} item{toBuy.length === 1 ? '' : 's'} to buy · {formatCurrency(sumItems(toBuy))} estimated
        </p>
      </div>

      <ErrorBanner message={error} onDismiss={() => setError(null)} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl bg-cloud-white p-1 ring-1 ring-foreground/10" role="group" aria-label="Group by">
          {(['store', 'project'] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGroupBy(g)}
              aria-pressed={groupBy === g}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${
                groupBy === g ? 'bg-primary text-white' : 'text-foreground/60'
              }`}
            >
              By {g}
            </button>
          ))}
        </div>
        <label className="ml-auto flex items-center gap-2 py-2 text-sm text-foreground/60">
          <input type="checkbox" checked={showBought} onChange={(e) => setShowBought(e.target.checked)} className="size-4 accent-primary" />
          Show bought
        </label>
      </div>

      {groups.length === 0 ? (
        <div className="py-16 text-center text-foreground/50">
          <p className="mb-2 text-3xl">🛒</p>
          <p>{items.length === 0 ? 'No items yet. Add materials from a project.' : 'Everything is bought. Nice!'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <section key={group.key} className="rounded-3xl bg-cloud-white p-4 sm:p-5 shadow-cloud">
              <h2 className="flex items-center justify-between gap-3 font-semibold">
                {group.href ? (
                  <Link href={group.href} className="hover:underline">
                    {group.label}
                  </Link>
                ) : (
                  <span>{group.label}</span>
                )}
                <span className="text-sm text-foreground/50">{formatCurrency(sumItems(group.items))}</span>
              </h2>
              <ul className="divide-y divide-foreground/5">
                {group.items.map((item) => (
                  <ShoppingItemRow
                    key={item.id}
                    item={item}
                    context={groupBy === 'store' ? item.project?.title : null}
                    showStore={groupBy === 'project'}
                    onTogglePurchased={() => togglePurchased(item)}
                    onEdit={() => setEditing(item)}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <Sheet open={editing !== null} title="Edit item" onClose={() => setEditing(null)}>
        {editing && (
          <>
            <ShoppingItemForm
              key={editing.id}
              item={editing}
              tasks={[]}
              onSubmit={(data) => saveItem(editing, data)}
              onCancel={() => setEditing(null)}
            />
            <button
              onClick={() => removeItem(editing)}
              className="mt-4 w-full rounded-xl py-3 text-sm font-medium text-red-500 hover:bg-red-50"
            >
              Remove from list
            </button>
          </>
        )}
      </Sheet>
    </div>
  );
}
