import { supabase } from '../../lib/supabase'
import type { TodoList } from '../../types'

export async function fetchLists(userId: string): Promise<TodoList[]> {
  const { data, error } = await supabase
    .from('lists')
    .select('*')
    .eq('user_id', userId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as TodoList[]
}

export async function createList(
  userId: string,
  name: string,
  color: string,
): Promise<TodoList> {
  const { data, error } = await supabase
    .from('lists')
    .insert({ user_id: userId, name, color })
    .select()
    .single()

  if (error) throw error
  return data as TodoList
}

export async function updateList(
  id: string,
  patch: Partial<Pick<TodoList, 'name' | 'color'>>,
): Promise<TodoList> {
  const { data, error } = await supabase
    .from('lists')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as TodoList
}

export async function deleteList(id: string): Promise<void> {
  const { error } = await supabase.from('lists').delete().eq('id', id)
  if (error) throw error
}
