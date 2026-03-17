import { useState } from 'react';
import type { Todo, TodoInsert, TodoUpdate, TodoCategory, TodoPriority, TodoStatus } from '@/types/todo';

const categoryOptions: { value: TodoCategory; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'painting', label: 'Painting' },
  { value: 'carpentry', label: 'Carpentry' },
  { value: 'landscaping', label: 'Landscaping' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'other', label: 'Other' },
];

const priorityOptions: { value: TodoPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const statusOptions: { value: TodoStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

interface TodoFormProps {
  todo?: Todo;
  onSubmit: (data: TodoInsert | TodoUpdate) => void;
  onCancel: () => void;
}

export default function TodoForm({ todo, onSubmit, onCancel }: TodoFormProps) {
  const isEditing = !!todo;
  const [title, setTitle] = useState(todo?.title ?? '');
  const [description, setDescription] = useState(todo?.description ?? '');
  const [estimatedCost, setEstimatedCost] = useState(todo?.estimated_cost?.toString() ?? '');
  const [category, setCategory] = useState<TodoCategory>(todo?.category ?? 'general');
  const [priority, setPriority] = useState<TodoPriority>(todo?.priority ?? 'medium');
  const [status, setStatus] = useState<TodoStatus>(todo?.status ?? 'pending');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const cost = estimatedCost.trim() ? parseFloat(estimatedCost) : null;

    if (isEditing) {
      const update: TodoUpdate = { title: title.trim(), description: description.trim() || null, estimated_cost: cost, category, priority, status };
      onSubmit(update);
    } else {
      const insert: TodoInsert = { title: title.trim(), description: description.trim() || null, estimated_cost: cost, category, priority };
      onSubmit(insert);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-cloud-white rounded-2xl p-6 shadow-lg mb-6" style={{ boxShadow: '0 4px 20px rgba(245,166,35,0.15)' }}>
      <h2 className="text-lg font-semibold mb-4">{isEditing ? 'Edit Project' : 'New Project'}</h2>

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1">Title *</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            required
            className="w-full rounded-xl border border-foreground/10 bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details..."
            rows={3}
            className="w-full rounded-xl border border-foreground/10 bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
        </div>

        <div>
          <label htmlFor="estimatedCost" className="block text-sm font-medium mb-1">Estimated Cost</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-foreground/40">$</span>
            <input
              id="estimatedCost"
              type="number"
              min="0"
              step="0.01"
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-foreground/10 bg-background pl-8 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as TodoCategory)}
              className="w-full rounded-xl border border-foreground/10 bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium mb-1">Priority</label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TodoPriority)}
              className="w-full rounded-xl border border-foreground/10 bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {priorityOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {isEditing && (
          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-1">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TodoStatus)}
              className="w-full rounded-xl border border-foreground/10 bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="submit"
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          {isEditing ? 'Save Changes' : 'Add Project'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-6 py-2.5 text-sm font-medium text-foreground/60 hover:bg-foreground/5 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
