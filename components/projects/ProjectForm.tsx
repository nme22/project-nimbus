'use client';

import { useState } from 'react';
import type { Category, Priority, Project, ProjectInsert, ProjectStatus, Room } from '@/types/project';
import { categoryOptions, priorityOptions, roomOptions, statusOptions } from '@/lib/options';
import { projectTemplates, type ProjectTemplate } from '@/lib/templates';
import { Field, ghostButtonClass, inputClass, primaryButtonClass } from '@/components/ui/primitives';

interface ProjectFormProps {
  project?: Project;
  onSubmit: (data: ProjectInsert, template: ProjectTemplate | null) => Promise<void>;
  onCancel: () => void;
}

export default function ProjectForm({ project, onSubmit, onCancel }: ProjectFormProps) {
  const isEditing = !!project;
  // New projects start on the template picker; editing goes straight to the form.
  const [step, setStep] = useState<'template' | 'details'>(isEditing ? 'details' : 'template');
  const [template, setTemplate] = useState<ProjectTemplate | null>(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState(project?.title ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [room, setRoom] = useState<Room>(project?.room ?? 'whole_house');
  const [category, setCategory] = useState<Category>(project?.category ?? 'general');
  const [priority, setPriority] = useState<Priority>(project?.priority ?? 'medium');
  const [status, setStatus] = useState<ProjectStatus>(project?.status ?? 'planning');
  const [budget, setBudget] = useState(project?.budget?.toString() ?? '');
  const [targetDate, setTargetDate] = useState(project?.target_date ?? '');

  function pickTemplate(t: ProjectTemplate | null) {
    setTemplate(t);
    if (t) {
      setTitle(t.title);
      setDescription(t.description);
      setRoom(t.room);
      setCategory(t.category);
    }
    setStep('details');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSubmit(
        {
          title: title.trim(),
          description: description.trim() || null,
          room,
          category,
          priority,
          status,
          budget: budget.trim() ? parseFloat(budget) : null,
          target_date: targetDate || null,
        },
        template,
      );
    } finally {
      setSaving(false);
    }
  }

  if (step === 'template') {
    return (
      <div>
        <p className="mb-4 text-sm text-foreground/60">
          Start from a template to get a task checklist and materials list, or start blank.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => pickTemplate(null)}
            className="flex flex-col items-start gap-1 rounded-2xl border-2 border-dashed border-primary/30 p-4 text-left hover:bg-light-gold/30"
          >
            <span className="text-2xl">＋</span>
            <span className="font-semibold">Blank project</span>
            <span className="text-xs text-foreground/50">Add your own tasks</span>
          </button>
          {projectTemplates.map((t) => (
            <button
              key={t.id}
              onClick={() => pickTemplate(t)}
              className="flex flex-col items-start gap-1 rounded-2xl bg-background p-4 text-left ring-1 ring-foreground/5 hover:bg-light-gold/30"
            >
              <span className="text-2xl" aria-hidden="true">{t.icon}</span>
              <span className="font-semibold leading-tight">{t.title}</span>
              <span className="text-xs text-foreground/50">
                {t.tasks.length} tasks · {t.materials.length} items
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {template && (
        <div className="flex items-center justify-between rounded-xl bg-light-gold/40 px-4 py-2.5 text-sm">
          <span>
            {template.icon} Includes {template.tasks.length} tasks and {template.materials.length} shopping items
          </span>
          <button type="button" onClick={() => setStep('template')} className="font-semibold text-primary-hover">
            Change
          </button>
        </div>
      )}

      <Field label="Project name *" htmlFor="title">
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Refresh the guest bathroom"
          required
          autoFocus={!template}
          className={inputClass}
        />
      </Field>

      <Field label="Notes" htmlFor="description">
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Measurements, ideas, contractor notes..."
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Room / area" htmlFor="room">
          <select id="room" value={room} onChange={(e) => setRoom(e.target.value as Room)} className={inputClass}>
            {roomOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.icon} {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Type of work" htmlFor="category">
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value as Category)} className={inputClass}>
            {categoryOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Priority" htmlFor="priority">
          <select id="priority" value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className={inputClass}>
            {priorityOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status" htmlFor="status">
          <select id="status" value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)} className={inputClass}>
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Budget" htmlFor="budget">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-foreground/40">$</span>
            <input
              id="budget"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="0.00"
              className={`${inputClass} pl-8`}
            />
          </div>
        </Field>
        <Field label="Target date" htmlFor="targetDate">
          <input
            id="targetDate"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className={`${primaryButtonClass} flex-1 sm:flex-none`}>
          {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Create project'}
        </button>
        <button type="button" onClick={onCancel} className={ghostButtonClass}>
          Cancel
        </button>
      </div>
    </form>
  );
}
