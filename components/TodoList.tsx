'use client';

import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import type { Todo, TodoInsert, TodoUpdate, TodoCategory, TodoStatus } from '@/types/todo';
import CategoryFilter from './CategoryFilter';
import TodoForm from './TodoForm';
import TodoCard from './TodoCard';
import EmptyState from './EmptyState';

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<TodoCategory | 'all'>('all');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    const { data, error } = await getSupabase()
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('fetchTodos result:', { data, error: error ? JSON.stringify(error) : null });
    if (error) {
      console.error('Error fetching todos:', JSON.stringify(error, null, 2));
    } else {
      setTodos(data as Todo[]);
    }
    setLoading(false);
  }

  async function addTodo(data: TodoInsert | TodoUpdate) {
    const insert = data as TodoInsert;
    const { data: newTodo, error } = await getSupabase()
      .from('todos')
      .insert(insert)
      .select()
      .single();

    if (error) {
      console.error('Error adding todo:', JSON.stringify(error, null, 2));
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
    } else {
      setTodos((prev) => [newTodo as Todo, ...prev]);
      setIsAdding(false);
    }
  }

  async function updateTodo(id: string, data: TodoUpdate) {
    const { data: updated, error } = await getSupabase()
      .from('todos')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating todo:', error);
    } else {
      setTodos((prev) => prev.map((t) => (t.id === id ? (updated as Todo) : t)));
      setEditingTodo(null);
    }
  }

  async function deleteTodo(id: string) {
    const { error } = await getSupabase().from('todos').delete().eq('id', id);
    if (error) {
      console.error('Error deleting todo:', error);
    } else {
      setTodos((prev) => prev.filter((t) => t.id !== id));
    }
  }

  function handleStatusCycle(id: string, newStatus: TodoStatus) {
    updateTodo(id, { status: newStatus });
  }

  function handleEditSubmit(data: TodoInsert | TodoUpdate) {
    if (editingTodo) {
      updateTodo(editingTodo.id, data as TodoUpdate);
    }
  }

  const filteredTodos = filter === 'all' ? todos : todos.filter((t) => t.category === filter);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="animate-pulse text-foreground/40">Loading projects...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <CategoryFilter selected={filter} onChange={setFilter} />
        {!isAdding && !editingTodo && (
          <button
            onClick={() => setIsAdding(true)}
            className="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover shadow-md"
          >
            + New Project
          </button>
        )}
      </div>

      {isAdding && (
        <TodoForm onSubmit={addTodo} onCancel={() => setIsAdding(false)} />
      )}

      {editingTodo && (
        <TodoForm
          todo={editingTodo}
          onSubmit={handleEditSubmit}
          onCancel={() => setEditingTodo(null)}
        />
      )}

      {filteredTodos.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {filteredTodos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onStatusCycle={handleStatusCycle}
              onEdit={setEditingTodo}
              onDelete={deleteTodo}
            />
          ))}
        </div>
      )}
    </div>
  );
}
