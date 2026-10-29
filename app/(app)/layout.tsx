import AppShell from '@/components/AppShell';
import CloudBackground from '@/components/CloudBackground';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh relative">
      <CloudBackground />
      <AppShell>{children}</AppShell>
    </div>
  );
}
