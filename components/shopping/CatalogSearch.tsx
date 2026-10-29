'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CatalogProduct, CatalogSearchResponse, ShoppingItemUpdate, Task } from '@/types/project';
import { formatCurrency, storeSearchUrl } from '@/lib/format';
import { Field, inputClass, primaryButtonClass } from '@/components/ui/primitives';
import ShoppingItemForm from './ShoppingItemForm';

type Tab = 'home_depot' | 'lowes' | 'manual';

const tabs: { value: Tab; label: string; activeClass: string }[] = [
  { value: 'home_depot', label: 'Home Depot', activeClass: 'bg-home-depot text-white' },
  { value: 'lowes', label: "Lowe's", activeClass: 'bg-lowes text-white' },
  { value: 'manual', label: 'Paste / manual', activeClass: 'bg-primary text-white' },
];

interface CatalogSearchProps {
  initialQuery?: string;
  tasks: Pick<Task, 'id' | 'title'>[];
  defaultTaskId?: string | null;
  /** Called for each product the user adds. `taskId` is the task picked in the sheet. */
  onAdd: (data: ShoppingItemUpdate & { name: string }) => Promise<void>;
  /** When replacing a placeholder item, only one product can be picked. */
  single?: boolean;
}

export default function CatalogSearch({ initialQuery = '', tasks, defaultTaskId = null, onAdd, single }: CatalogSearchProps) {
  const [tab, setTab] = useState<Tab>('home_depot');
  const [query, setQuery] = useState(initialQuery);
  const [submitted, setSubmitted] = useState(initialQuery);
  const [taskId, setTaskId] = useState(defaultTaskId ?? '');
  const [result, setResult] = useState<CatalogSearchResponse | null>(null);
  const [loading, setLoading] = useState(initialQuery.trim().length >= 2);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());

  const abortRef = useRef<AbortController | null>(null);

  // Only touches state asynchronously, so it is safe to start from an effect.
  const fetchResults = useCallback((store: 'home_depot' | 'lowes', q: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    fetch(`/api/catalog?${new URLSearchParams({ store, q: q.trim() })}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? `Search failed (${res.status})`);
        return res.json() as Promise<CatalogSearchResponse>;
      })
      .then(setResult)
      .catch((e: Error) => e.name !== 'AbortError' && setError(e.message))
      .finally(() => !controller.signal.aborted && setLoading(false));
  }, []);

  function search(store: Tab, q: string) {
    setSubmitted(q);
    if (store === 'manual' || q.trim().length < 2) return;
    setLoading(true);
    setError(null);
    fetchResults(store, q);
  }

  function switchTab(next: Tab) {
    setTab(next);
    search(next, submitted);
  }

  // Run the prefilled search on open, e.g. when looking up a template material.
  useEffect(() => {
    if (initialQuery.trim().length >= 2) fetchResults('home_depot', initialQuery);
    return () => abortRef.current?.abort();
  }, [initialQuery, fetchResults]);

  async function addProduct(p: CatalogProduct) {
    await onAdd({
      name: p.title,
      store: p.store,
      product_id: p.productId,
      model: p.model,
      url: p.url,
      image_url: p.thumbnail,
      unit_price: p.price,
      quantity: 1,
      task_id: taskId || null,
    });
    setAdded((prev) => new Set(prev).add(p.url));
  }

  const showResults = tab !== 'manual' && result && result.store === tab && result.query === submitted.trim();

  return (
    <div>
      <div className="mb-4 grid grid-cols-3 gap-1 rounded-xl bg-background p-1" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.value}
            role="tab"
            aria-selected={tab === t.value}
            onClick={() => switchTab(t.value)}
            className={`rounded-lg px-2 py-2 text-xs sm:text-sm font-semibold transition-colors ${
              tab === t.value ? t.activeClass : 'text-foreground/60'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'manual' ? (
        <ShoppingItemForm tasks={tasks} defaultTaskId={taskId || null} onSubmit={onAdd} submitLabel="Add to list" />
      ) : (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              search(tab, query);
            }}
            className="flex gap-2"
          >
            <input
              type="search"
              enterKeyHint="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search drywall screws, paint, faucets…"
              aria-label="Search products"
              autoFocus
              className={inputClass}
            />
            <button type="submit" className={primaryButtonClass}>
              Search
            </button>
          </form>

          {tasks.length > 0 && (
            <div className="mt-3">
              <Field label="Add items to" htmlFor="catalog-task">
                <select id="catalog-task" value={taskId} onChange={(e) => setTaskId(e.target.value)} className={inputClass}>
                  <option value="">Whole project</option>
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          )}

          <div className="mt-4">
            {loading && <p className="py-8 text-center text-sm text-foreground/40 animate-pulse">Searching…</p>}
            {error && <p className="py-4 text-sm text-red-600">{error}</p>}

            {!loading && showResults && !result.live && (
              <NoLiveCatalog store={tab} query={submitted} onManual={() => setTab('manual')} />
            )}

            {!loading && showResults && result.live && (
              <>
                {result.error && <p className="py-2 text-sm text-red-600">{result.error}</p>}
                {result.products.length === 0 && !result.error && (
                  <p className="py-6 text-center text-sm text-foreground/50">No products found.</p>
                )}
                <ul className="divide-y divide-foreground/5">
                  {result.products.map((p) => (
                    <ProductRow
                      key={p.url}
                      product={p}
                      added={added.has(p.url)}
                      disabled={single && added.size > 0}
                      onAdd={() => addProduct(p)}
                    />
                  ))}
                </ul>
                <a
                  href={result.searchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 block text-center text-sm font-medium text-primary-hover hover:underline"
                >
                  See all results on homedepot.com ↗
                </a>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ProductRow({
  product,
  added,
  disabled,
  onAdd,
}: {
  product: CatalogProduct;
  added: boolean;
  disabled?: boolean;
  onAdd: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <li className="flex gap-3 py-3">
      {product.thumbnail ? (
        // Remote retailer images; not worth configuring next/image domains for thumbnails.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.thumbnail} alt="" className="size-16 shrink-0 rounded-lg bg-white object-contain" loading="lazy" />
      ) : (
        <div className="size-16 shrink-0 rounded-lg bg-foreground/5" />
      )}
      <div className="min-w-0 flex-1">
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="line-clamp-2 text-sm font-medium leading-snug hover:underline"
        >
          {product.title}
        </a>
        <div className="mt-0.5 text-xs text-foreground/50">
          {[product.brand, product.model && `Model ${product.model}`].filter(Boolean).join(' · ')}
        </div>
        <div className="mt-1 flex items-center gap-2 text-sm">
          <span className="font-semibold">{formatCurrency(product.price)}</span>
          {product.rating != null && (
            <span className="text-xs text-foreground/50">
              ★ {product.rating.toFixed(1)} ({product.reviews ?? 0})
            </span>
          )}
        </div>
      </div>
      <button
        onClick={async () => {
          setBusy(true);
          try {
            await onAdd();
          } finally {
            setBusy(false);
          }
        }}
        disabled={added || busy || disabled}
        className={`self-center shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
          added ? 'bg-status-completed/15 text-[#15803D]' : 'bg-light-gold text-foreground hover:bg-primary hover:text-white disabled:opacity-40'
        }`}
      >
        {added ? 'Added' : busy ? '…' : 'Add'}
      </button>
    </li>
  );
}

function NoLiveCatalog({ store, query, onManual }: { store: 'home_depot' | 'lowes'; query: string; onManual: () => void }) {
  const isHomeDepot = store === 'home_depot';
  return (
    <div className="rounded-2xl bg-background p-4 text-sm">
      <p className="text-foreground/70">
        {isHomeDepot
          ? 'Live Home Depot results are not set up. Add a SerpApi key to show products here.'
          : "Lowe's doesn't offer a public product search, so search on their site and paste the link back here."}
      </p>
      <div className="mt-3 flex flex-col sm:flex-row gap-2">
        <a
          href={storeSearchUrl(store, query)}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white ${
            isHomeDepot ? 'bg-home-depot' : 'bg-lowes'
          }`}
        >
          Search “{query}” on {isHomeDepot ? 'homedepot.com' : 'lowes.com'} ↗
        </a>
        <button onClick={onManual} className="rounded-xl px-4 py-3 text-sm font-medium ring-1 ring-foreground/10 hover:bg-cloud-white">
          Paste a product link
        </button>
      </div>
    </div>
  );
}
