import type { TodoPriority } from '@/types/todo';

const priorityConfig: Record<TodoPriority, { label: string; className: string }> = {
  low: { label: 'Low', className: 'bg-priority-low/20 text-priority-low' },
  medium: { label: 'Medium', className: 'bg-priority-medium/20 text-priority-medium' },
  high: { label: 'High', className: 'bg-priority-high/20 text-priority-high' },
};

export default function PriorityBadge({ priority }: { priority: TodoPriority }) {
  const config = priorityConfig[priority];
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  );
}
