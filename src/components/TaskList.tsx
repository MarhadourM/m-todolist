import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useCreateTask, useReorderTasks } from '../features/tasks/hooks'
import { PRIORITIES } from '../features/tasks/priority'
import { DateTimePicker } from './DateTimePicker'
import { TaskItem } from './TaskItem'
import type { Task, TodoList } from '../types'

interface TaskListProps {
  tasks: Task[]
  listId: string | null
  allowAdd?: boolean
  showList?: boolean
  listsById?: Record<string, TodoList>
  emptyLabel?: string
}

export function TaskList({
  tasks,
  listId,
  allowAdd = true,
  showList = false,
  listsById,
  emptyLabel,
}: TaskListProps) {
  const createTask = useCreateTask()
  const reorder = useReorderTasks()
  const [title, setTitle] = useState('')
  const [due, setDue] = useState<string | null>(null)
  const [priority, setPriority] = useState(0)
  const [dragId, setDragId] = useState<string | null>(null)

  const ordered = useMemo(
    () =>
      [...tasks].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1
        return a.position - b.position
      }),
    [tasks],
  )

  const active = ordered.filter((task) => !task.completed)
  const completed = ordered.filter((task) => task.completed)

  const handleAdd = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    createTask.mutate({ listId, title: trimmed, due_at: due, priority })
    setTitle('')
    setDue(null)
    setPriority(0)
  }

  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return
    const ids = ordered.map((task) => task.id)
    const from = ids.indexOf(dragId)
    const to = ids.indexOf(targetId)
    if (from === -1 || to === -1) return
    const next = [...ids]
    next.splice(from, 1)
    next.splice(to, 0, dragId)
    reorder.mutate(next)
    setDragId(null)
  }

  const renderTask = (task: Task) => (
    <TaskItem
      key={task.id}
      task={task}
      list={showList ? listsById?.[task.list_id ?? ''] : undefined}
      onDragStart={setDragId}
      onDrop={handleDrop}
    />
  )

  return (
    <div className="flex flex-col gap-2">
      {allowAdd && (
        <form
          onSubmit={handleAdd}
          className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900/40 p-2 sm:flex-row sm:items-center"
        >
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ajouter une tâche…"
            className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
          />
          <div className="flex flex-wrap items-center gap-2">
            <DateTimePicker value={due} onChange={setDue} />
            <select
              value={priority}
              onChange={(event) => setPriority(Number(event.target.value))}
              aria-label="Priorité"
              className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500"
            >
              {PRIORITIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.value === 0 ? 'Priorité' : item.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={createTask.isPending}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
            >
              Ajouter
            </button>
          </div>
        </form>
      )}

      {ordered.length === 0 ? (
        <p className="px-1 py-2 text-sm text-slate-500">{emptyLabel ?? 'Aucune tâche.'}</p>
      ) : (
        <>
          {active.map(renderTask)}
          {completed.length > 0 && (
            <div className="mt-3 flex items-center gap-3">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Terminées
              </span>
              <span className="text-xs text-slate-500">{completed.length}</span>
              <div className="h-px flex-1 bg-slate-800" />
            </div>
          )}
          {completed.map(renderTask)}
        </>
      )}
    </div>
  )
}
