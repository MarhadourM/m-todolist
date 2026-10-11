import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../auth/useAuth'
import {
  createTask,
  deleteTask,
  fetchDueReminders,
  fetchScheduledTasks,
  fetchTasksByList,
  fetchTodayTasks,
  updateTask,
  updateTaskPositions,
} from './api'
import type { Task } from '../../types'

function useUserId(): string {
  const { session } = useAuth()
  return session?.user.id ?? ''
}

export function taskKeys(userId: string) {
  const all = ['tasks', userId] as const
  return {
    all,
    byList: (listId: string) => [...all, 'list', listId] as const,
    today: () => [...all, 'today'] as const,
    scheduled: () => [...all, 'scheduled'] as const,
    reminders: () => [...all, 'reminders'] as const,
  }
}

export function useTasksByList(listId: string | undefined) {
  const userId = useUserId()
  return useQuery({
    queryKey: taskKeys(userId).byList(listId ?? ''),
    queryFn: () => fetchTasksByList(userId, listId as string),
    enabled: userId !== '' && !!listId,
  })
}

export function useTodayTasks() {
  const userId = useUserId()
  return useQuery({
    queryKey: taskKeys(userId).today(),
    queryFn: () => fetchTodayTasks(userId),
    enabled: userId !== '',
  })
}

export function useScheduledTasks() {
  const userId = useUserId()
  return useQuery({
    queryKey: taskKeys(userId).scheduled(),
    queryFn: () => fetchScheduledTasks(userId),
    enabled: userId !== '',
  })
}

export function useDueReminders() {
  const userId = useUserId()
  return useQuery({
    queryKey: taskKeys(userId).reminders(),
    queryFn: () => fetchDueReminders(userId),
    enabled: userId !== '',
    refetchInterval: 30_000,
  })
}

export function useCreateTask() {
  const userId = useUserId()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vars: {
      listId: string | null
      title: string
      due_at: string | null
      priority: number
    }) => createTask(userId, vars.listId, vars.title, Date.now(), vars.due_at, vars.priority),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys(userId).all }),
  })
}

type TaskPatch = Parameters<typeof updateTask>[1]

export function useUpdateTask() {
  const userId = useUserId()
  const queryClient = useQueryClient()
  const all = taskKeys(userId).all
  return useMutation({
    mutationFn: (vars: { id: string; patch: TaskPatch }) => updateTask(vars.id, vars.patch),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey: all })
      const previous = queryClient.getQueriesData<Task[]>({ queryKey: all })
      queryClient.setQueriesData<Task[]>({ queryKey: all }, (old) =>
        old?.map((task) => (task.id === vars.id ? { ...task, ...vars.patch } : task)),
      )
      return { previous }
    },
    onError: (_error, _vars, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data))
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: all }),
  })
}

export function useDeleteTask() {
  const userId = useUserId()
  const queryClient = useQueryClient()
  const all = taskKeys(userId).all
  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: all })
      const previous = queryClient.getQueriesData<Task[]>({ queryKey: all })
      queryClient.setQueriesData<Task[]>({ queryKey: all }, (old) =>
        old?.filter((task) => task.id !== id),
      )
      return { previous }
    },
    onError: (_error, _id, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data))
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: all }),
  })
}

export function useReorderTasks() {
  const userId = useUserId()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orderedIds: string[]) =>
      updateTaskPositions(orderedIds.map((id, index) => ({ id, position: index }))),
    onSettled: () => queryClient.invalidateQueries({ queryKey: taskKeys(userId).all }),
  })
}
