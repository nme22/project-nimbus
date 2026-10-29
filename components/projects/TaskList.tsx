'use client';

import { useState } from 'react';
import type { ShoppingItem, Task } from '@/types/project';
import { daysUntil, formatDate } from '@/lib/format';
import { Checkbox, inputClass, primaryButtonClass } from '@/components/ui/primitives';

interface TaskListProps {
  tasks: Task[];
  items: ShoppingItem[];
  onAdd: (title: string) => Promise<void>;
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
  onShopFor: (task: Task) => void;
}

export default function TaskList({ tasks, items, onAdd, onToggle, onDelete, onShopFor }: TaskListProps) {
  const [title, setTitle] = useState('');
  const [showDone, setShowDone] = useState(false);

  const open = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const value = title.trim();
    if (!value) return;
    setTitle('');
    await onAdd(value);
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="mb-2 flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a step…"
          aria-label="New task"
          enterKeyHint="done"
          className={inputClass}
        />
        <button type="submit" className={primaryButtonClass} disabled={!title.trim()}>
          Add
        </button>
      </form>

      {tasks.length === 0 && <p className="py-6 text-center text-sm text-foreground/50">No tasks yet. Break the project into steps.</p>}

      <ul className="divide-y divide-foreground/5">
        {open.map((task) => (
          <TaskRow key={task.id} task={task} items={items} onToggle={onToggle} onDelete={onDelete} onShopFor={onShopFor} />
        ))}
      </ul>

      {done.length > 0 && (
        <div className="mt-2">
          <button onClick={() => setShowDone((v) => !v)} className="py-2 text-sm font-medium text-foreground/50">
            {showDone ? '▾' : '▸'} Completed ({done.length})
          </button>
          {showDone && (
            <ul className="divide-y divide-foreground/5">
              {done.map((task) => (
                <TaskRow key={task.id} task={task} items={items} onToggle={onToggle} onDelete={onDelete} onShopFor={onShopFor} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function TaskRow({
  task,
  items,
  onToggle,
  onDelete,
  onShopFor,
}: {
  task: Task;
  items: ShoppingItem[];
  onToggle: (task: Task) => void;
  onDelete: (task: Task) => void;
  onShopFor: (task: Task) => void;
}) {
  const linked = items.filter((i) => i.task_id === task.id);
  const toBuy = linked.filter((i) => !i.purchased).length;
  const overdue = task.due_date && !task.done && daysUntil(task.due_date) < 0;

  return (
    <li className="flex items-center gap-3 py-2.5">
      <Checkbox checked={task.done} onChange={() => onToggle(task)} label={`Mark ${task.title} done`} />
      <div className="min-w-0 flex-1">
        <p className={`text-sm leading-snug ${task.done ? 'line-through text-foreground/40' : ''}`}>{task.title}</p>
        {(linked.length > 0 || task.due_date) && (
          <p className="mt-0.5 flex gap-2 text-xs text-foreground/50">
            {linked.length > 0 && <span>🛒 {toBuy > 0 ? `${toBuy} to buy` : `${linked.length} bought`}</span>}
            {task.due_date && <span className={overdue ? 'text-red-600' : ''}>Due {formatDate(task.due_date)}</span>}
          </p>
        )}
      </div>
      <button
        onClick={() => onShopFor(task)}
        className="grid size-10 shrink-0 place-items-center rounded-lg text-foreground/40 hover:bg-primary/10 hover:text-primary"
        aria-label={`Add materials for ${task.title}`}
        title="Add materials"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20 8H6.2" />
          <circle cx="9" cy="20" r="1.25" />
          <circle cx="17" cy="20" r="1.25" />
        </svg>
      </button>
      <button
        onClick={() => onDelete(task)}
        className="grid size-10 shrink-0 place-items-center rounded-lg text-foreground/30 hover:bg-red-100 hover:text-red-500"
        aria-label={`Delete ${task.title}`}
        title="Delete"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 4h12M5.33 4V2.67a1.33 1.33 0 0 1 1.34-1.34h2.66a1.33 1.33 0 0 1 1.34 1.34V4M12.67 4v9.33a1.33 1.33 0 0 1-1.34 1.34H4.67a1.33 1.33 0 0 1-1.34-1.34V4" />
        </svg>
      </button>
    </li>
  );
}
