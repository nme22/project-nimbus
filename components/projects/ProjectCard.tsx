import Link from 'next/link';
import type { ProjectSummary } from '@/types/project';
import { priorityOf, roomOf } from '@/lib/options';
import { daysUntil, formatCurrency, formatDate, sumItems } from '@/lib/format';
import { PriorityBadge, ProgressBar, StatusBadge } from '@/components/ui/primitives';

export default function ProjectCard({ project }: { project: ProjectSummary }) {
  const room = roomOf(project.room);
  const doneCount = project.tasks.filter((t) => t.done).length;
  const taskCount = project.tasks.length;
  const toBuy = project.shopping_items.filter((i) => !i.purchased).length;
  const estimated = sumItems(project.shopping_items);
  const overBudget = project.budget != null && estimated > project.budget;
  const days = project.target_date ? daysUntil(project.target_date) : null;
  const overdue = days != null && days < 0 && project.status !== 'completed';

  return (
    <Link
      href={`/projects/${project.id}`}
      className={`block rounded-2xl border-l-4 ${priorityOf(project.priority).border} bg-cloud-white p-4 sm:p-5 shadow-cloud transition-all hover:-translate-y-0.5 active:scale-[0.99]`}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-light-gold/50 text-xl" aria-hidden="true">
          {room.icon}
        </span>
        <div className="min-w-0 flex-1">
          <h3
            className={`font-semibold text-base sm:text-lg leading-snug ${
              project.status === 'completed' ? 'line-through text-foreground/40' : ''
            }`}
          >
            {project.title}
          </h3>
          <p className="text-xs text-foreground/50">{room.label}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <StatusBadge status={project.status} />
        <PriorityBadge priority={project.priority} />
        {project.target_date && (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              overdue ? 'bg-red-100 text-red-600' : 'bg-foreground/5 text-foreground/60'
            }`}
          >
            {overdue ? 'Overdue · ' : 'Due '}
            {formatDate(project.target_date)}
          </span>
        )}
      </div>

      {taskCount > 0 && (
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-xs text-foreground/60">
            <span>Tasks</span>
            <span>
              {doneCount}/{taskCount}
            </span>
          </div>
          <ProgressBar value={doneCount / taskCount} label={`${doneCount} of ${taskCount} tasks done`} />
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="text-foreground/60">
          🛒 {toBuy > 0 ? `${toBuy} to buy` : project.shopping_items.length > 0 ? 'All bought' : 'No items'}
        </span>
        <span className={overBudget ? 'font-semibold text-red-600' : 'text-foreground/60'}>
          {formatCurrency(estimated)}
          {project.budget != null && <> / {formatCurrency(project.budget)}</>}
        </span>
      </div>
    </Link>
  );
}
