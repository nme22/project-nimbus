import type { Todo, TodoStatus } from '@/types/todo';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

const priorityBorderColor: Record<string, string> = {
  low: 'border-l-priority-low',
  medium: 'border-l-priority-medium',
  high: 'border-l-priority-high',
};

const nextStatus: Record<TodoStatus, TodoStatus> = {
  pending: 'in_progress',
  in_progress: 'completed',
  completed: 'pending',
};

interface TodoCardProps {
  todo: Todo;
  onStatusCycle: (id: string, status: TodoStatus) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

export default function TodoCard({ todo, onStatusCycle, onEdit, onDelete }: TodoCardProps) {
  return (
    <div
      className={`bg-cloud-white rounded-2xl p-5 border-l-4 ${priorityBorderColor[todo.priority]} transition-all hover:-translate-y-0.5`}
      style={{ boxShadow: '0 4px 20px rgba(245,166,35,0.15)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-lg ${todo.status === 'completed' ? 'line-through text-foreground/40' : ''}`}>
            {todo.title}
          </h3>
          {todo.description && (
            <p className="text-sm text-foreground/60 mt-1">{todo.description}</p>
          )}
          {todo.estimated_cost != null && (
            <p className="text-sm font-medium text-primary mt-1">
              ${todo.estimated_cost.toFixed(2)}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <StatusBadge status={todo.status} />
            <PriorityBadge priority={todo.priority} />
            <span className="text-xs text-foreground/40 bg-foreground/5 rounded-full px-3 py-1">
              {todo.category}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 shrink-0">
          <button
            onClick={() => onStatusCycle(todo.id, nextStatus[todo.status])}
            title="Cycle status"
            className="rounded-lg p-2 text-foreground/40 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 8a7 7 0 0 1 12.45-4.35M15 8a7 7 0 0 1-12.45 4.35" />
              <path d="M13.5 1v3h-3M2.5 15v-3h3" />
            </svg>
          </button>
          <button
            onClick={() => onEdit(todo)}
            title="Edit"
            className="rounded-lg p-2 text-foreground/40 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M11.5 1.5l3 3L5 14H2v-3L11.5 1.5z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(todo.id)}
            title="Delete"
            className="rounded-lg p-2 text-foreground/40 hover:bg-red-100 hover:text-red-500 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 4h12M5.33 4V2.67a1.33 1.33 0 0 1 1.34-1.34h2.66a1.33 1.33 0 0 1 1.34 1.34V4M12.67 4v9.33a1.33 1.33 0 0 1-1.34 1.34H4.67a1.33 1.33 0 0 1-1.34-1.34V4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
