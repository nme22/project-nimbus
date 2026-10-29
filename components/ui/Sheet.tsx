'use client';

import { useEffect, useRef } from 'react';

interface SheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  /** Wider panel on desktop for content like search results. */
  wide?: boolean;
}

/**
 * Bottom sheet on phones, centered dialog on larger screens.
 * Closes on Escape or backdrop tap and locks page scroll while open.
 */
export default function Sheet({ open, title, onClose, children, wide }: SheetProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCloseRef.current();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-foreground/30 animate-fade-in" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={`relative w-full ${wide ? 'sm:max-w-2xl' : 'sm:max-w-lg'} max-h-[92dvh] flex flex-col bg-cloud-white rounded-t-3xl sm:rounded-3xl shadow-cloud outline-none animate-sheet-up sm:animate-fade-in`}
      >
        <div className="sm:hidden mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-foreground/15" aria-hidden="true" />
        <div className="flex items-center justify-between gap-3 px-5 pt-3 sm:pt-5 pb-3 border-b border-foreground/5">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="-mr-2 grid size-10 place-items-center rounded-full text-foreground/50 hover:bg-foreground/5"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain px-5 py-4 pb-safe">{children}</div>
      </div>
    </div>
  );
}
