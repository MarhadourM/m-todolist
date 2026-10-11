import { useMemo } from 'react'
import { TaskList } from '../components/TaskList'
import { useLists } from '../features/lists/hooks'
import { useTodayTasks } from '../features/tasks/hooks'
import type { TodoList } from '../types'

export function TodayView() {
  const { data: tasks, isLoading } = useTodayTasks()
  const { data: lists } = useLists()

  const listsById = useMemo(() => {
    const map: Record<string, TodoList> = {}
    lists?.forEach((list) => {
      map[list.id] = list
    })
    return map
  }, [lists])

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <h1 className="mb-4 text-2xl font-bold">Aujourd’hui</h1>
      {isLoading ? (
        <p className="text-slate-400">Chargement…</p>
      ) : (
        <TaskList
          tasks={tasks ?? []}
          listId={null}
          allowAdd={false}
          showList
          listsById={listsById}
          emptyLabel="Rien à faire aujourd’hui."
        />
      )}
    </div>
  )
}
