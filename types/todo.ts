export type TodoStatus = 'pending' | 'in_progress' | 'completed';
export type TodoPriority = 'low' | 'medium' | 'high';
export type TodoCategory =
  | 'general'
  | 'plumbing'
  | 'electrical'
  | 'painting'
  | 'carpentry'
  | 'landscaping'
  | 'cleaning'
  | 'other';

export interface Todo {
  id: string;
  user_id: string | null;
  title: string;
  description: string | null;
  estimated_cost: number | null;
  status: TodoStatus;
  priority: TodoPriority;
  category: TodoCategory;
  created_at: string;
  updated_at: string;
}

export interface TodoInsert {
  title: string;
  description?: string | null;
  estimated_cost?: number | null;
  status?: TodoStatus;
  priority?: TodoPriority;
  category?: TodoCategory;
}

export interface TodoUpdate {
  title?: string;
  description?: string | null;
  estimated_cost?: number | null;
  status?: TodoStatus;
  priority?: TodoPriority;
  category?: TodoCategory;
}