import type { TodoStatus } from '@/types/todo';

const statusConfig: Record<TodoStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-status-pending/20 text-status-pending' },
  in_progress: { label: 'In Progress', className: 'bg-status-in-progress/20 text-status-in-progress' },
  completed: { label: 'Completed', className: 'bg-status-completed/20 text-status-completed' },
};

export default function StatusBadge({ status }: { status: TodoStatus }) {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}
