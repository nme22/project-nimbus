'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type {
  ProjectInsert,
  ProjectWithChildren,
  ShoppingItem,
  ShoppingItemUpdate,
  Store,
  Task,
} from '@/types/project';
import {
  createShoppingItems,
  createTasks,
  deleteProject,
  deleteShoppingItem,
  deleteTask,
  getProject,
  updateProject,
  updateShoppingItem,
  updateTask,
} from '@/lib/db';
import { categoryOf, roomOf, storeOptions } from '@/lib/options';
import { daysUntil, formatCurrency, formatDate, sumItems } from '@/lib/format';
import Sheet from '@/components/ui/Sheet';
import { ErrorBanner, PriorityBadge, ProgressBar, StatusBadge, primaryButtonClass } from '@/components/ui/primitives';
import CatalogSearch from '@/components/shopping/CatalogSearch';
import ShoppingItemForm from '@/components/shopping/ShoppingItemForm';
import ShoppingItemRow from '@/components/shopping/ShoppingItemRow';
import ProjectForm from './ProjectForm';
import TaskList from './TaskList';

type SheetState =
  | { kind: 'edit-project' }
  | { kind: 'catalog'; task?: Task; replace?: ShoppingItem }
  | { kind: 'edit-item'; item: ShoppingItem }
  | null;

type Tab = 'tasks' | 'shopping';

export default function ProjectDetail({ id }: { id: string }) {
  const router = useRouter();
  const [project, setProject] = useState<ProjectWithChildren | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheet, setSheet] = useState<SheetState>(null);
  const [tab, setTab] = useState<Tab>('tasks');

  useEffect(() => {
    let cancelled = false;
    getProject(id)
      .then((p) => !cancelled && setProject(p))
      .catch((e: Error) => !cancelled && setError(`Couldn't load project: ${e.message}`))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <div className="py-16 text-center text-foreground/40 animate-pulse">Loading project…</div>;
  }
  if (!project) {
    return (
      <div className="py-16 text-center">
        <ErrorBanner message={error} onDismiss={() => setError(null)} />
        <p className="mb-4 text-foreground/60">This project doesn&apos;t exist anymore.</p>
        <Link href="/" className={primaryButtonClass}>
          Back to projects
        </Link>
      </div>
    );
  }

  // --- local state helpers -------------------------------------------------
  const patch = (fn: (p: ProjectWithChildren) => ProjectWithChildren) => setProject((p) => (p ? fn(p) : p));
  const fail = (action: string) => (e: Error) => setError(`Couldn't ${action}: ${e.message}`);

  // --- project -------------------------------------------------------------
  async function handleEditProject(data: ProjectInsert) {
    try {
      const updated = await updateProject(id, data);
      patch((p) => ({ ...p, ...updated }));
      setSheet(null);
    } catch (e) {
      fail('save project')(e as Error);
    }
  }

  async function handleDeleteProject() {
    if (!confirm(`Delete "${project!.title}" and its tasks and shopping list?`)) return;
    try {
      await deleteProject(id);
      router.push('/');
    } catch (e) {
      fail('delete project')(e as Error);
    }
  }

  // --- tasks ---------------------------------------------------------------
  async function addTask(title: string) {
    try {
      const position = Math.max(-1, ...project!.tasks.map((t) => t.position)) + 1;
      const [task] = await createTasks([{ project_id: id, title, position }]);
      patch((p) => ({ ...p, tasks: [...p.tasks, task] }));
    } catch (e) {
      fail('add task')(e as Error);
    }
  }

  function toggleTask(task: Task) {
    const done = !task.done;
    patch((p) => ({ ...p, tasks: p.tasks.map((t) => (t.id === task.id ? { ...t, done } : t)) }));
    updateTask(task.id, { done }).catch((e: Error) => {
      patch((p) => ({ ...p, tasks: p.tasks.map((t) => (t.id === task.id ? { ...t, done: !done } : t)) }));
      fail('update task')(e);
    });
  }

  function removeTask(task: Task) {
    patch((p) => ({
      ...p,
      tasks: p.tasks.filter((t) => t.id !== task.id),
      shopping_items: p.shopping_items.map((i) => (i.task_id === task.id ? { ...i, task_id: null } : i)),
    }));
    deleteTask(task.id).catch(fail('delete task'));
  }

  // --- shopping items ------------------------------------------------------
  async function addItem(data: ShoppingItemUpdate & { name: string }) {
    try {
      const [item] = await createShoppingItems([{ ...data, project_id: id }]);
      patch((p) => ({ ...p, shopping_items: [...p.shopping_items, item] }));
    } catch (e) {
      fail('add item')(e as Error);
      throw e;
    }
  }

  async function saveItem(itemId: string, data: ShoppingItemUpdate) {
    try {
      const updated = await updateShoppingItem(itemId, data);
      patch((p) => ({ ...p, shopping_items: p.shopping_items.map((i) => (i.id === itemId ? updated : i)) }));
    } catch (e) {
      fail('save item')(e as Error);
      throw e;
    }
  }

  function togglePurchased(item: ShoppingItem) {
    const purchased = !item.purchased;
    patch((p) => ({ ...p, shopping_items: p.shopping_items.map((i) => (i.id === item.id ? { ...i, purchased } : i)) }));
    updateShoppingItem(item.id, { purchased }).catch((e: Error) => {
      patch((p) => ({
        ...p,
        shopping_items: p.shopping_items.map((i) => (i.id === item.id ? { ...i, purchased: !purchased } : i)),
      }));
      fail('update item')(e);
    });
  }

  function removeItem(item: ShoppingItem) {
    patch((p) => ({ ...p, shopping_items: p.shopping_items.filter((i) => i.id !== item.id) }));
    deleteShoppingItem(item.id).catch(fail('delete item'));
    setSheet(null);
  }

  // --- derived -------------------------------------------------------------
  const room = roomOf(project.room);
  const items = project.shopping_items;
  const estimated = sumItems(items);
  const spent = sumItems(items.filter((i) => i.purchased));
  const doneCount = project.tasks.filter((t) => t.done).length;
  const openTasks = project.tasks.length - doneCount;
  const toBuy = items.filter((i) => !i.purchased);
  const bought = items.filter((i) => i.purchased);
  const overBudget = project.budget != null && estimated > project.budget;
  const taskTitle = (taskId: string | null) => project.tasks.find((t) => t.id === taskId)?.title ?? null;
  const days = project.target_date ? daysUntil(project.target_date) : null;

  const itemsByStore = storeOptions
    .map((s) => ({ store: s.value as Store, label: s.label, items: toBuy.filter((i) => i.store === s.value) }))
    .filter((g) => g.items.length > 0);

  const sheetTitle =
    sheet?.kind === 'edit-project'
      ? 'Edit project'
      : sheet?.kind === 'edit-item'
        ? 'Edit item'
        : sheet?.kind === 'catalog'
          ? sheet.replace
            ? `Find “${sheet.replace.name}”`
            : sheet.task
              ? `Materials for “${sheet.task.title}”`
              : 'Add to shopping list'
          : '';

  return (
    <div>
      <Link href="/" className="mb-3 inline-flex items-center gap-1 py-1 text-sm font-medium text-foreground/50 hover:text-foreground">
        ← Projects
      </Link>

      <ErrorBanner message={error} onDismiss={() => setError(null)} />

      {/* Header */}
      <section className="mb-5 rounded-3xl bg-cloud-white p-5 shadow-cloud">
        <div className="flex items-start gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-light-gold/50 text-2xl" aria-hidden="true">
            {room.icon}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold leading-tight">{project.title}</h1>
            <p className="text-sm text-foreground/50">
              {room.label} · {categoryOf(project.category).label}
            </p>
          </div>
          <button
            onClick={() => setSheet({ kind: 'edit-project' })}
            className="shrink-0 rounded-xl px-3 py-2 text-sm font-semibold text-primary-hover hover:bg-light-gold/50"
          >
            Edit
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <StatusBadge status={project.status} />
          <PriorityBadge priority={project.priority} />
          {project.target_date && (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                days! < 0 && project.status !== 'completed' ? 'bg-red-100 text-red-600' : 'bg-foreground/5 text-foreground/60'
              }`}
            >
              Target {formatDate(project.target_date)}
            </span>
          )}
        </div>

        {project.description && <p className="mt-3 whitespace-pre-line text-sm text-foreground/70">{project.description}</p>}

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Metric label="Budget" value={formatCurrency(project.budget)} />
          <Metric label="Estimated" value={formatCurrency(estimated)} warn={overBudget} />
          <Metric label="Spent" value={formatCurrency(spent)} />
        </div>
        {overBudget && (
          <p className="mt-2 text-xs font-medium text-red-600">
            Shopping list is {formatCurrency(estimated - project.budget!)} over budget.
          </p>
        )}

        {project.tasks.length > 0 && (
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-xs text-foreground/60">
              <span>Progress</span>
              <span>
                {doneCount}/{project.tasks.length} tasks
              </span>
            </div>
            <ProgressBar value={doneCount / project.tasks.length} label="Task progress" />
          </div>
        )}
      </section>

      {/* Tabs on phones/tablets; side by side on large screens */}
      <div className="sticky top-14 sm:top-16 z-20 -mx-4 mb-4 bg-background/90 px-4 py-2 backdrop-blur lg:hidden">
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-cloud-white p-1 shadow-cloud" role="tablist">
          <TabButton active={tab === 'tasks'} onClick={() => setTab('tasks')}>
            Tasks {openTasks > 0 && <Count n={openTasks} />}
          </TabButton>
          <TabButton active={tab === 'shopping'} onClick={() => setTab('shopping')}>
            Shopping {toBuy.length > 0 && <Count n={toBuy.length} />}
          </TabButton>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className={`${tab === 'tasks' ? '' : 'hidden'} lg:block rounded-3xl bg-cloud-white p-4 sm:p-5 shadow-cloud self-start`}>
          <h2 className="mb-3 hidden lg:block text-lg font-semibold">Tasks</h2>
          <TaskList
            tasks={project.tasks}
            items={items}
            onAdd={addTask}
            onToggle={toggleTask}
            onDelete={removeTask}
            onShopFor={(task) => setSheet({ kind: 'catalog', task })}
          />
        </section>

        <section className={`${tab === 'shopping' ? '' : 'hidden'} lg:block rounded-3xl bg-cloud-white p-4 sm:p-5 shadow-cloud self-start`}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Shopping list</h2>
            <button onClick={() => setSheet({ kind: 'catalog' })} className={`${primaryButtonClass} py-2.5`}>
              + Add items
            </button>
          </div>

          {items.length === 0 && (
            <p className="py-6 text-center text-sm text-foreground/50">
              Search Home Depot and Lowe&apos;s, or paste a product link, to build your list.
            </p>
          )}

          {itemsByStore.map((group) => (
            <div key={group.store} className="mb-2">
              <h3 className="mt-2 flex justify-between text-xs font-semibold uppercase tracking-wide text-foreground/40">
                <span>{group.label}</span>
                <span>{formatCurrency(sumItems(group.items))}</span>
              </h3>
              <ul className="divide-y divide-foreground/5">
                {group.items.map((item) => (
                  <ShoppingItemRow
                    key={item.id}
                    item={item}
                    context={taskTitle(item.task_id)}
                    onTogglePurchased={() => togglePurchased(item)}
                    onEdit={() => setSheet({ kind: 'edit-item', item })}
                    onFind={() => setSheet({ kind: 'catalog', replace: item })}
                  />
                ))}
              </ul>
            </div>
          ))}

          {bought.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer py-2 text-sm font-medium text-foreground/50">
                Bought ({bought.length}) · {formatCurrency(spent)}
              </summary>
              <ul className="divide-y divide-foreground/5">
                {bought.map((item) => (
                  <ShoppingItemRow
                    key={item.id}
                    item={item}
                    showStore
                    context={taskTitle(item.task_id)}
                    onTogglePurchased={() => togglePurchased(item)}
                    onEdit={() => setSheet({ kind: 'edit-item', item })}
                  />
                ))}
              </ul>
            </details>
          )}
        </section>
      </div>

      <div className="mt-8 text-center">
        <button onClick={handleDeleteProject} className="rounded-xl px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50">
          Delete project
        </button>
      </div>

      <Sheet open={sheet !== null} title={sheetTitle} onClose={() => setSheet(null)} wide={sheet?.kind === 'catalog'}>
        {sheet?.kind === 'edit-project' && (
          <ProjectForm project={project} onSubmit={handleEditProject} onCancel={() => setSheet(null)} />
        )}

        {sheet?.kind === 'catalog' && (
          <CatalogSearch
            key={sheet.replace?.id ?? sheet.task?.id ?? 'project'}
            initialQuery={sheet.replace?.name ?? ''}
            tasks={project.tasks}
            defaultTaskId={sheet.replace?.task_id ?? sheet.task?.id ?? null}
            single={!!sheet.replace}
            onAdd={async (data) => {
              if (sheet.replace) {
                // Swap the placeholder (e.g. a template material) for the real product, keeping its quantity.
                await saveItem(sheet.replace.id, { ...data, quantity: sheet.replace.quantity });
                setSheet(null);
              } else {
                await addItem(data);
              }
            }}
          />
        )}

        {sheet?.kind === 'edit-item' && (
          <>
            <ShoppingItemForm
              item={sheet.item}
              tasks={project.tasks}
              onSubmit={async (data) => {
                await saveItem(sheet.item.id, data);
                setSheet(null);
              }}
              onCancel={() => setSheet(null)}
            />
            <button
              onClick={() => removeItem(sheet.item)}
              className="mt-4 w-full rounded-xl py-3 text-sm font-medium text-red-500 hover:bg-red-50"
            >
              Remove from list
            </button>
          </>
        )}
      </Sheet>
    </div>
  );
}

function Metric({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="rounded-2xl bg-background px-2 py-2.5">
      <div className={`text-sm sm:text-base font-bold ${warn ? 'text-red-600' : ''}`}>{value}</div>
      <div className="text-[11px] uppercase tracking-wide text-foreground/45">{label}</div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
        active ? 'bg-primary text-white' : 'text-foreground/60'
      }`}
    >
      {children}
    </button>
  );
}

function Count({ n }: { n: number }) {
  return <span className="rounded-full bg-black/10 px-2 text-xs">{n}</span>;
}
