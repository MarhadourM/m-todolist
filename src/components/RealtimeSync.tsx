import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { taskKeys } from '../features/tasks/hooks'
import { listKeys } from '../features/lists/hooks'
import type { Task, TodoList } from '../types'
import { useAuth } from '../auth/useAuth'

export function RealtimeSync() {
  const queryClient = useQueryClient()
  const { session } = useAuth()
  const userId = session?.user.id

  useEffect(() => {
    if (!userId) return

    const tasksChannel = supabase
      .channel(`realtime:tasks:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const all = taskKeys(userId).all
          const tasks = taskKeys(userId).all
          if (payload.eventType === 'INSERT') {
            const newTask = payload.new as Task
            queryClient.setQueriesData<Task[]>({ queryKey: tasks }, (old) => {
              if (!old) return [newTask]
              return [...old, newTask]
            })
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as Task
            queryClient.setQueriesData<Task[]>({ queryKey: tasks }, (old) =>
              old ? old.map((task) => (task.id === updated.id ? updated : task)) : old,
            )
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as Task
            queryClient.setQueriesData<Task[]>({ queryKey: tasks }, (old) =>
              old ? old.filter((task) => task.id !== deleted.id) : old,
            )
          }
          void queryClient.invalidateQueries({ queryKey: all })
        },
      )
      .subscribe()

    const listsChannel = supabase
      .channel(`realtime:lists:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lists',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const listsKey = listKeys(userId)
          if (payload.eventType === 'INSERT') {
            const newList = payload.new as TodoList
            queryClient.setQueriesData<TodoList[]>({ queryKey: listsKey }, (old) =>
              old ? [...old, newList] : [newList],
            )
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as TodoList
            queryClient.setQueriesData<TodoList[]>({ queryKey: listsKey }, (old) =>
              old ? old.map((list) => (list.id === updated.id ? updated : list)) : old,
            )
          } else if (payload.eventType === 'DELETE') {
            const deleted = payload.old as TodoList
            queryClient.setQueriesData<TodoList[]>({ queryKey: listsKey }, (old) =>
              old ? old.filter((list) => list.id !== deleted.id) : old,
            )
          }
          void queryClient.invalidateQueries({ queryKey: listsKey })
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(tasksChannel)
      void supabase.removeChannel(listsChannel)
    }
  }, [userId, queryClient])

  return null
}
