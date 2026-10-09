import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../auth/useAuth'
import { createList, deleteList, fetchLists, updateList } from './api'
import type { TodoList } from '../../types'

function useUserId(): string {
  const { session } = useAuth()
  return session?.user.id ?? ''
}

export function listKeys(userId: string) {
  return ['lists', userId] as const
}

export function useLists() {
  const userId = useUserId()
  return useQuery({
    queryKey: listKeys(userId),
    queryFn: () => fetchLists(userId),
    enabled: userId !== '',
  })
}

export function useCreateList() {
  const userId = useUserId()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vars: { name: string; color: string }) =>
      createList(userId, vars.name, vars.color),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listKeys(userId) }),
  })
}

export function useUpdateList() {
  const userId = useUserId()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vars: { id: string; patch: Partial<Pick<TodoList, 'name' | 'color'>> }) =>
      updateList(vars.id, vars.patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listKeys(userId) }),
  })
}

export function useDeleteList() {
  const userId = useUserId()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteList(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listKeys(userId) }),
  })
}
