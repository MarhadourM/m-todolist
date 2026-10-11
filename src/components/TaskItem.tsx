import { useState } from 'react'
import type { FormEvent } from 'react'
import { useDeleteTask, useUpdateTask } from '../features/tasks/hooks'
import { PRIORITIES, priorityMeta } from '../features/tasks/priority'
import { formatDue, isOverdue } from '../lib/dates'
import { DateTimePicker } from './DateTimePicker'
import type { Task } from '../types'

interface TaskItemProps {
  task: Task
  listName?: string
  onDragStart?: (id: string) => void
  onDrop?: (id: string) => void
}

export function TaskItem({ task, listName, onDragStart, onDrop }: TaskItemProps) {
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const [editing, setEditing] = useState(false)

  const [title, setTitle] = useState(task.title)
  const [notes, setNotes] = useState(task.notes ?? '')
  const [due, setDue] = useState<string | null>(task.due_at)
  const [priority, setPriority] = useState(task.priority)

  const meta = priorityMeta(task.priority)

  const openEdit = () => {
    setTitle(task.title)
    setNotes(task.notes ?? '')
    setDue(task.due_at)
    setPriority(task.priority)
    setEditing(true)
  }

  const handleSave = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    updateTask.mutate({
      id: task.id,
      patch: {
        title: trimmed,
        notes: notes.trim() ? notes.trim() : null,
        due_at: due,
        priority,
      },
    })
    setEditing(false)
  }

  const handleDelete = () => {
    if (!window.confirm(`Supprimer la tâche « ${task.title} » ?`)) return
    deleteTask.mutate(task.id)
  }

  if (editing) {
    return (
      <form
        onSubmit={handleSave}
        className="flex flex-col gap-3 rounded-lg border border-slate-700 bg-slate-900 p-3"
      >
        <input
          autoFocus
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
        />
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Notes (optionnel)"
          rows={2}
          className="resize-none rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
        />
        <div className="flex flex-wrap items-center gap-3">
          <DateTimePicker value={due} onChange={setDue} />
          <label className="flex items-center gap-2 text-xs text-slate-400">
            Priorité
            <select
              value={priority}
              onChange={(event) => setPriority(Number(event.target.value))}
              className="rounded-md border border-slate-600 bg-slate-950 px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-indigo-500"
            >
              {PRIORITIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            Enregistrer
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-md border border-slate-600 px-4 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
          >
            Annuler
          </button>
        </div>
      </form>
    )
  }

  return (
    <div
      draggable
      onDragStart={() => onDragStart?.(task.id)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => onDrop?.(task.id)}
      className="group flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2.5"
      style={{ borderLeft: `3px solid ${meta.color}` }}
    >
      <button
        type="button"
        onClick={() => updateTask.mutate({ id: task.id, patch: { completed: !task.completed } })}
        aria-label={task.completed ? 'Marquer non terminée' : 'Marquer terminée'}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
          task.completed
            ? 'border-emerald-500 bg-emerald-500 text-slate-900'
            : 'border-slate-600 hover:border-slate-400'
        }`}
      >
        {task.completed && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={`break-words text-sm ${
            task.completed ? 'text-slate-500 line-through' : 'text-slate-100'
          }`}
        >
          {task.title}
        </p>

        {(task.due_at || task.priority > 0 || listName || task.notes) && (
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            {listName && (
              <span className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-400">{listName}</span>
            )}
            {task.due_at && (
              <span
                className={
                  !task.completed && isOverdue(task.due_at) ? 'text-red-400' : 'text-slate-400'
                }
              >
                {formatDue(task.due_at)}
              </span>
            )}
            {task.priority > 0 && <span style={{ color: meta.color }}>{meta.label}</span>}
            {task.notes && (
              <span className="flex items-center gap-1 text-slate-500">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 6h16M4 12h16M4 18h10" />
                </svg>
                note
              </span>
            )}
          </div>
        )}

        {task.notes && (
          <p className="mt-2 hidden whitespace-pre-wrap border-l-2 border-slate-600 pl-2 text-xs text-slate-400 group-hover:block">
            {task.notes}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1 transition md:opacity-0 md:group-hover:opacity-100">
        <button
          type="button"
          onClick={openEdit}
          aria-label="Modifier"
          className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={handleDelete}
          aria-label="Supprimer"
          className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-red-400"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18" />
            <path d="M8 6V4h8v2" />
            <path d="M19 6l-1 14H6L5 6" />
          </svg>
        </button>
      </div>
    </div>
  )
}
