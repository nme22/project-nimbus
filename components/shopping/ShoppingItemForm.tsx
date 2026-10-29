'use client';

import { useState } from 'react';
import type { ShoppingItem, ShoppingItemUpdate, Store, Task } from '@/types/project';
import { storeOptions } from '@/lib/options';
import { parseProductLink } from '@/lib/productLinks';
import { Field, ghostButtonClass, inputClass, primaryButtonClass } from '@/components/ui/primitives';

interface ShoppingItemFormProps {
  item?: ShoppingItem;
  tasks: Pick<Task, 'id' | 'title'>[];
  defaultTaskId?: string | null;
  submitLabel?: string;
  onSubmit: (data: ShoppingItemUpdate & { name: string }) => Promise<void>;
  onCancel?: () => void;
}

/** Add or edit a shopping item by hand. Pasting a Home Depot / Lowe's link fills in the name and store. */
export default function ShoppingItemForm({
  item,
  tasks,
  defaultTaskId = null,
  submitLabel,
  onSubmit,
  onCancel,
}: ShoppingItemFormProps) {
  const [url, setUrl] = useState(item?.url ?? '');
  const [name, setName] = useState(item?.name ?? '');
  const [store, setStore] = useState<Store>(item?.store ?? 'other');
  const [productId, setProductId] = useState(item?.product_id ?? null);
  const [price, setPrice] = useState(item?.unit_price?.toString() ?? '');
  const [quantity, setQuantity] = useState(item?.quantity?.toString() ?? '1');
  const [taskId, setTaskId] = useState(item?.task_id ?? defaultTaskId ?? '');
  const [saving, setSaving] = useState(false);

  function handleUrlChange(value: string) {
    setUrl(value);
    const parsed = parseProductLink(value);
    if (!parsed) return;
    setStore(parsed.store);
    if (parsed.productId) setProductId(parsed.productId);
    if (parsed.name && !name.trim()) setName(parsed.name);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        url: url.trim() || null,
        store,
        product_id: productId,
        unit_price: price.trim() ? parseFloat(price) : null,
        quantity: Math.max(1, parseInt(quantity, 10) || 1),
        task_id: taskId || null,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Product link (optional)" htmlFor="item-url">
        <input
          id="item-url"
          type="url"
          inputMode="url"
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="Paste a homedepot.com or lowes.com link"
          className={inputClass}
        />
      </Field>
      <Field label="Item *" htmlFor="item-name">
        <input
          id="item-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. 2x4x8 stud"
          required
          className={inputClass}
        />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Store" htmlFor="item-store">
          <select id="item-store" value={store} onChange={(e) => setStore(e.target.value as Store)} className={inputClass}>
            {storeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Price" htmlFor="item-price">
          <input
            id="item-price"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            className={inputClass}
          />
        </Field>
        <Field label="Qty" htmlFor="item-qty">
          <input
            id="item-qty"
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>
      {tasks.length > 0 && (
        <Field label="For task" htmlFor="item-task">
          <select id="item-task" value={taskId} onChange={(e) => setTaskId(e.target.value)} className={inputClass}>
            <option value="">Whole project</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </Field>
      )}
      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={saving} className={`${primaryButtonClass} flex-1 sm:flex-none`}>
          {saving ? 'Saving…' : submitLabel ?? (item ? 'Save item' : 'Add item')}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={ghostButtonClass}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
