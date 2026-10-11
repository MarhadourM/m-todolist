import { endOfDay } from 'date-fns'
import { supabase } from '../../lib/supabase'
import type { Task } from '../../types'

export async function fetchTasksByList(userId: string, listId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('list_id', listId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as Task[]
}

export async function fetchTodayTasks(userId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('completed', false)
    .not('due_at', 'is', null)
    .lte('due_at', endOfDay(new Date()).toISOString())
    .order('due_at', { ascending: true })

  if (error) throw error
  return data as Task[]
}

export async function fetchScheduledTasks(userId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .not('due_at', 'is', null)
    .order('due_at', { ascending: true })

  if (error) throw error
  return data as Task[]
}

export async function createTask(
  userId: string,
  listId: string | null,
  title: string,
  position: number,
  dueAt: string | null,
  priority: number,
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({ user_id: userId, list_id: listId, title, position, due_at: dueAt, priority })
    .select()
    .single()

  if (error) throw error
  return data as Task
}

export async function updateTask(
  id: string,
  patch: Partial<
    Pick<Task, 'title' | 'notes' | 'due_at' | 'priority' | 'completed' | 'list_id'>
  >,
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Task
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}

export async function updateTaskPositions(
  updates: { id: string; position: number }[],
): Promise<void> {
  await Promise.all(
    updates.map((update) =>
      supabase.from('tasks').update({ position: update.position }).eq('id', update.id),
    ),
  )
}
