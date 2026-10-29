import { getSupabase } from '@/lib/supabase';
import type {
  Project,
  ProjectInsert,
  ProjectSummary,
  ProjectUpdate,
  ProjectWithChildren,
  ShoppingItem,
  ShoppingItemInsert,
  ShoppingItemUpdate,
  ShoppingItemWithProject,
  Task,
  TaskInsert,
  TaskUpdate,
} from '@/types/project';

// Thin typed wrappers around Supabase. Every function throws on error so callers
// can surface one message instead of logging and carrying on with stale state.

function unwrap<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
  if (error) throw new Error(error.message);
  return data as T;
}

// --- projects -------------------------------------------------------------

export async function listProjects(): Promise<ProjectSummary[]> {
  return unwrap(
    await getSupabase()
      .from('projects')
      .select('*, tasks(id, done), shopping_items(id, unit_price, quantity, purchased)')
      .order('updated_at', { ascending: false }),
  );
}

export async function getProject(id: string): Promise<ProjectWithChildren | null> {
  const project = unwrap<ProjectWithChildren | null>(
    await getSupabase()
      .from('projects')
      .select('*, tasks(*), shopping_items(*)')
      .eq('id', id)
      .maybeSingle(),
  );
  if (project) {
    project.tasks.sort((a, b) => a.position - b.position || a.created_at.localeCompare(b.created_at));
    project.shopping_items.sort((a, b) => a.created_at.localeCompare(b.created_at));
  }
  return project;
}

export async function createProject(data: ProjectInsert): Promise<Project> {
  return unwrap(await getSupabase().from('projects').insert(data).select().single());
}

export async function updateProject(id: string, data: ProjectUpdate): Promise<Project> {
  return unwrap(await getSupabase().from('projects').update(data).eq('id', id).select().single());
}

export async function deleteProject(id: string): Promise<void> {
  unwrap(await getSupabase().from('projects').delete().eq('id', id));
}

// --- tasks ----------------------------------------------------------------

export async function createTasks(rows: TaskInsert[]): Promise<Task[]> {
  if (rows.length === 0) return [];
  return unwrap(await getSupabase().from('tasks').insert(rows).select());
}

export async function updateTask(id: string, data: TaskUpdate): Promise<Task> {
  return unwrap(await getSupabase().from('tasks').update(data).eq('id', id).select().single());
}

export async function deleteTask(id: string): Promise<void> {
  unwrap(await getSupabase().from('tasks').delete().eq('id', id));
}

// --- shopping items -------------------------------------------------------

export async function listShoppingItems(): Promise<ShoppingItemWithProject[]> {
  return unwrap(
    await getSupabase()
      .from('shopping_items')
      .select('*, project:projects(id, title, room)')
      .order('created_at', { ascending: true }),
  );
}

export async function createShoppingItems(rows: ShoppingItemInsert[]): Promise<ShoppingItem[]> {
  if (rows.length === 0) return [];
  return unwrap(await getSupabase().from('shopping_items').insert(rows).select());
}

export async function updateShoppingItem(id: string, data: ShoppingItemUpdate): Promise<ShoppingItem> {
  return unwrap(await getSupabase().from('shopping_items').update(data).eq('id', id).select().single());
}

export async function deleteShoppingItem(id: string): Promise<void> {
  unwrap(await getSupabase().from('shopping_items').delete().eq('id', id));
}
