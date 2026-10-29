'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';

const navItems = [
  {
    href: '/',
    label: 'Projects',
    match: (p: string) => p === '/' || p.startsWith('/projects'),
    icon: (
      <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5z" />
    ),
  },
  {
    href: '/shopping',
    label: 'Shopping',
    match: (p: string) => p.startsWith('/shopping'),
    icon: (
      <>
        <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20 8H6.2" />
        <circle cx="9" cy="20" r="1.25" />
        <circle cx="17" cy="20" r="1.25" />
      </>
    ),
  },
];

function NimbusMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 40 28" fill="none" aria-hidden="true">
      <ellipse cx="20" cy="18" rx="18" ry="8" fill="#FCEABB" />
      <ellipse cx="14" cy="15" rx="10" ry="7" fill="white" stroke="#F5A623" strokeOpacity="0.25" />
      <ellipse cx="26" cy="15" rx="10" ry="7" fill="white" stroke="#F5A623" strokeOpacity="0.25" />
      <ellipse cx="20" cy="13" rx="14" ry="8" fill="white" />
    </svg>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-primary/10 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 sm:h-16 max-w-5xl items-center gap-6 px-4">
          <Link href="/" className="flex items-center gap-2">
            <NimbusMark />
            <span className="text-xl font-bold tracking-tight">
              Project <span className="text-primary">Nimbus</span>
            </span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1" aria-label="Main">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  item.match(pathname) ? 'bg-light-gold text-foreground' : 'text-foreground/60 hover:bg-light-gold/50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto">
            <UserButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-5 sm:pt-8 pb-28 sm:pb-12">{children}</main>

      <nav
        className="sm:hidden fixed inset-x-0 bottom-0 z-30 border-t border-primary/10 bg-cloud-white/95 backdrop-blur-md pb-safe"
        aria-label="Main"
      >
        <div className="grid grid-cols-2">
          {navItems.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${
                  active ? 'text-primary' : 'text-foreground/50'
                }`}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  {item.icon}
                </svg>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
