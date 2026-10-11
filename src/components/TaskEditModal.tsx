import { useState } from 'react'
import type { FormEvent } from 'react'
import { useDeleteTask, useUpdateTask } from '../features/tasks/hooks'
import { PRIORITIES } from '../features/tasks/priority'
import { DateTimePicker } from './DateTimePicker'
import type { Task } from '../types'

interface TaskEditModalProps {
  task: Task
  onClose: () => void
}

export function TaskEditModal({ task, onClose }: TaskEditModalProps) {
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const [title, setTitle] = useState(task.title)
  const [notes, setNotes] = useState(task.notes ?? '')
  const [due, setDue] = useState<string | null>(task.due_at)
  const [priority, setPriority] = useState(task.priority)

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
    onClose()
  }

  const handleDelete = () => {
    if (!window.confirm(`Supprimer la tâche « ${task.title} » ?`)) return
    deleteTask.mutate(task.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fermer"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />
      <form
        onSubmit={handleSave}
        className="relative z-10 flex w-full max-w-md flex-col gap-3 rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl"
      >
        <h2 className="text-lg font-semibold text-slate-100">Modifier la tâche</h2>

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
          rows={3}
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

        <div className="mt-1 flex items-center justify-between">
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-md border border-red-900 px-3 py-1.5 text-sm text-red-400 transition hover:bg-red-950/40"
          >
            Supprimer
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-600 px-4 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-500"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
