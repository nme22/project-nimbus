import type { Priority, ProjectStatus, Store } from '@/types/project';
import { priorityOf, statusOf, storeOf } from '@/lib/options';

export const inputClass =
  'w-full rounded-xl border border-foreground/10 bg-background px-4 py-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50';

export const primaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-primary-hover disabled:opacity-50';

export const ghostButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-foreground/60 transition-colors hover:bg-foreground/5';

export function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}

const pill = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap';

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const s = statusOf(status);
  return <span className={`${pill} ${s.className}`}>{s.label}</span>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const p = priorityOf(priority);
  return <span className={`${pill} ${p.className}`}>{p.label}</span>;
}

export function StoreBadge({ store }: { store: Store }) {
  const s = storeOf(store);
  return <span className={`${pill} ${s.className}`}>{s.label}</span>;
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const pct = Math.round(Math.min(Math.max(value, 0), 1) * 100);
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-light-gold/60"
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function ErrorBanner({ message, onDismiss }: { message: string | null; onDismiss: () => void }) {
  if (!message) return null;
  return (
    <div role="alert" className="mb-4 flex items-start gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss} className="font-semibold hover:underline">
        Dismiss
      </button>
    </div>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className="grid size-11 shrink-0 place-items-center -m-2"
    >
      <span
        className={`grid size-6 place-items-center rounded-lg border-2 transition-colors ${
          checked ? 'border-primary bg-primary text-white' : 'border-foreground/20 bg-cloud-white'
        }`}
      >
        {checked && (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 8.5l3 3 7-7" />
          </svg>
        )}
      </span>
    </button>
  );
}
