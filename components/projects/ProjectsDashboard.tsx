'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import type { ProjectInsert, ProjectSummary, Room } from '@/types/project';
import type { ProjectTemplate } from '@/lib/templates';
import { createProject, createShoppingItems, createTasks, listProjects } from '@/lib/db';
import { roomOf } from '@/lib/options';
import { formatCurrency, sumItems } from '@/lib/format';
import Sheet from '@/components/ui/Sheet';
import { ErrorBanner, inputClass, primaryButtonClass } from '@/components/ui/primitives';
import EmptyState from '@/components/EmptyState';
import ProjectCard from './ProjectCard';
import ProjectForm from './ProjectForm';

type StatusFilter = 'active' | 'completed' | 'all';

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Done' },
  { value: 'all', label: 'All' },
];

const priorityRank = { high: 0, medium: 1, low: 2 } as const;

export default function ProjectsDashboard() {
  const router = useRouter();
  const { user } = useUser();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const [roomFilter, setRoomFilter] = useState<Room | 'all'>('all');

  useEffect(() => {
    let cancelled = false;
    listProjects()
      .then((rows) => !cancelled && setProjects(rows))
      .catch((e: Error) => !cancelled && setError(`Couldn't load projects: ${e.message}`))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreate(data: ProjectInsert, template: ProjectTemplate | null) {
    try {
      const project = await createProject({ ...data, user_id: user?.id ?? null });
      if (template) {
        await Promise.all([
          createTasks(template.tasks.map((title, position) => ({ project_id: project.id, title, position }))),
          createShoppingItems(template.materials.map((name) => ({ project_id: project.id, name }))),
        ]);
      }
      router.push(`/projects/${project.id}`);
    } catch (e) {
      setError(`Couldn't create project: ${(e as Error).message}`);
      setIsAdding(false);
    }
  }

  const roomsInUse = useMemo(() => [...new Set(projects.map((p) => p.room))], [projects]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects
      .filter((p) =>
        statusFilter === 'all' ? true : statusFilter === 'completed' ? p.status === 'completed' : p.status !== 'completed',
      )
      .filter((p) => roomFilter === 'all' || p.room === roomFilter)
      .filter((p) => !q || p.title.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q))
      .sort((a, b) => {
        // In-progress first, then by priority, then soonest target date.
        const inProgress = Number(b.status === 'in_progress') - Number(a.status === 'in_progress');
        if (inProgress) return inProgress;
        const prio = priorityRank[a.priority] - priorityRank[b.priority];
        if (prio) return prio;
        return (a.target_date ?? '9999').localeCompare(b.target_date ?? '9999');
      });
  }, [projects, query, statusFilter, roomFilter]);

  const stats = useMemo(() => {
    const active = projects.filter((p) => p.status !== 'completed');
    return {
      active: active.length,
      openTasks: active.reduce((n, p) => n + p.tasks.filter((t) => !t.done).length, 0),
      toBuy: active.reduce((n, p) => n + p.shopping_items.filter((i) => !i.purchased).length, 0),
      planned: sumItems(active.flatMap((p) => p.shopping_items)),
    };
  }, [projects]);

  if (loading) {
    return <div className="py-16 text-center text-foreground/40 animate-pulse">Loading projects…</div>;
  }

  return (
    <div>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Projects</h1>
          <p className="text-sm text-foreground/60">Your household projects, riding on a cloud</p>
        </div>
        <button onClick={() => setIsAdding(true)} className={`${primaryButtonClass} hidden sm:inline-flex`}>
          + New project
        </button>
      </div>

      <ErrorBanner message={error} onDismiss={() => setError(null)} />

      {projects.length > 0 && (
        <div className="mb-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Active projects" value={stats.active} />
          <Stat label="Open tasks" value={stats.openTasks} />
          <Stat label="Items to buy" value={stats.toBuy} />
          <Stat label="Planned spend" value={formatCurrency(stats.planned)} />
        </div>
      )}

      {projects.length > 0 && (
        <div className="mb-5 space-y-3">
          <div className="flex gap-2">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects"
              aria-label="Search projects"
              className={`${inputClass} bg-cloud-white`}
            />
            <div className="flex shrink-0 rounded-xl bg-cloud-white p-1 ring-1 ring-foreground/10" role="group" aria-label="Status">
              {statusFilters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  aria-pressed={statusFilter === f.value}
                  className={`rounded-lg px-3 text-sm font-medium transition-colors ${
                    statusFilter === f.value ? 'bg-primary text-white' : 'text-foreground/60'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {roomsInUse.length > 1 && (
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
              <RoomChip active={roomFilter === 'all'} onClick={() => setRoomFilter('all')}>
                All rooms
              </RoomChip>
              {roomsInUse.map((r) => (
                <RoomChip key={r} active={roomFilter === r} onClick={() => setRoomFilter(r)}>
                  {roomOf(r).icon} {roomOf(r).label}
                </RoomChip>
              ))}
            </div>
          )}
        </div>
      )}

      {projects.length === 0 ? (
        <EmptyState onCreate={() => setIsAdding(true)} />
      ) : visible.length === 0 ? (
        <p className="py-12 text-center text-foreground/50">No projects match these filters.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {visible.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}

      {/* Floating add button on phones, above the bottom nav. */}
      <button
        onClick={() => setIsAdding(true)}
        aria-label="New project"
        className="sm:hidden fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-20 grid size-14 place-items-center rounded-full bg-primary text-3xl text-white shadow-lg active:scale-95"
      >
        +
      </button>

      <Sheet open={isAdding} title="New project" onClose={() => setIsAdding(false)}>
        <ProjectForm onSubmit={handleCreate} onCancel={() => setIsAdding(false)} />
      </Sheet>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-cloud-white px-4 py-3 shadow-cloud">
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs text-foreground/50">{label}</div>
    </div>
  );
}

function RoomChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        active ? 'bg-primary text-white shadow-md' : 'bg-cloud-white text-foreground/70 hover:bg-light-gold/50'
      }`}
    >
      {children}
    </button>
  );
}
