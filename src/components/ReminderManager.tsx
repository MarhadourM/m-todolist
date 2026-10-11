import { useEffect, useRef, useState } from 'react'
import { useDueReminders } from '../features/tasks/hooks'

const STORAGE_KEY = 'notified-reminders'

function reminderKey(id: string, remindAt: string): string {
  return `${id}:${remindAt}`
}

function loadNotified(): Set<string> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? new Set(JSON.parse(stored) as string[]) : new Set()
  } catch {
    return new Set()
  }
}

export function ReminderManager() {
  const { data: tasks } = useDueReminders()
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() =>
    typeof Notification === 'undefined' ? 'unsupported' : Notification.permission,
  )
  const notifiedRef = useRef<Set<string>>(loadNotified())

  useEffect(() => {
    if (permission !== 'granted' || !tasks) return
    const now = Date.now()
    const since = now - 24 * 60 * 60 * 1000
    let changed = false

    for (const task of tasks) {
      if (!task.remind_at) continue
      const remindTime = new Date(task.remind_at).getTime()
      if (remindTime > now) continue
      const key = reminderKey(task.id, task.remind_at)
      if (notifiedRef.current.has(key)) continue
      new Notification(task.title, {
        body: task.notes ?? 'Rappel de tâche',
        tag: task.id,
      })
      notifiedRef.current.add(key)
      changed = true
    }

    if (changed) {
      const pruned = [...notifiedRef.current].filter((key) => {
        const remindAt = key.slice(key.indexOf(':') + 1)
        return new Date(remindAt).getTime() >= since
      })
      notifiedRef.current = new Set(pruned)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned))
    }
  }, [tasks, permission])

  const requestPermission = async () => {
    const result = await Notification.requestPermission()
    setPermission(result)
  }

  if (permission !== 'default') return null

  return (
    <div className="fixed bottom-4 right-4 z-30">
      <button
        type="button"
        onClick={() => void requestPermission()}
        className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-100 shadow-lg transition hover:bg-slate-700"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        Activer les rappels
      </button>
    </div>
  )
}
