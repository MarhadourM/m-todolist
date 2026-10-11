import { useMemo, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import frLocale from '@fullcalendar/core/locales/fr'
import type {
  EventClickArg,
  EventContentArg,
  EventDropArg,
  EventInput,
} from '@fullcalendar/core'
import type { EventResizeDoneArg } from '@fullcalendar/interaction'
import { TaskEditModal } from '../components/TaskEditModal'
import { useLists } from '../features/lists/hooks'
import { useScheduledTasks, useUpdateTask } from '../features/tasks/hooks'
import { priorityMeta } from '../features/tasks/priority'
import type { Task, TodoList } from '../types'

const DEFAULT_COLOR = '#64748b'

function withAlpha(hex: string, alpha: number): string {
  const value = hex.replace('#', '')
  const r = Number.parseInt(value.slice(0, 2), 16)
  const g = Number.parseInt(value.slice(2, 4), 16)
  const b = Number.parseInt(value.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function CalendarView() {
  const { data: tasks } = useScheduledTasks()
  const { data: lists } = useLists()
  const updateTask = useUpdateTask()
  const [selected, setSelected] = useState<Task | null>(null)

  const listsById = useMemo(() => {
    const map: Record<string, TodoList> = {}
    lists?.forEach((list) => {
      map[list.id] = list
    })
    return map
  }, [lists])

  const events: EventInput[] = useMemo(
    () =>
      (tasks ?? []).map((task) => {
        const color = (task.list_id ? listsById[task.list_id]?.color : undefined) ?? DEFAULT_COLOR
        return {
          id: task.id,
          title: task.title,
          start: task.due_at ?? undefined,
          allDay: false,
          backgroundColor: withAlpha(color, 0.16),
          borderColor: withAlpha(color, 0.85),
          textColor: '#e2e8f0',
          classNames: task.completed ? ['task-completed'] : [],
          extendedProps: { task, color },
        }
      }),
    [tasks, listsById],
  )

  const renderEventContent = (arg: EventContentArg) => {
    const task = arg.event.extendedProps.task as Task
    const color = arg.event.extendedProps.color as string
    const meta = priorityMeta(task.priority)
    return (
      <div className="flex w-full min-w-0 items-center gap-1.5 px-0.5">
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: meta.color, boxShadow: `0 0 0 2px ${withAlpha(meta.color, 0.25)}` }}
        />
        <span className="truncate font-medium" style={{ color }}>
          {arg.event.title}
        </span>
        {arg.timeText && (
          <span className="ml-auto shrink-0 text-[10px] opacity-60">{arg.timeText}</span>
        )}
      </div>
    )
  }

  const handleEventChange = (info: EventDropArg | EventResizeDoneArg) => {
    const start = info.event.start
    updateTask.mutate({
      id: info.event.id,
      patch: { due_at: start ? start.toISOString() : null },
    })
  }

  const handleEventClick = (info: EventClickArg) => {
    setSelected(info.event.extendedProps.task as Task)
  }

  return (
    <div className="h-full p-3 sm:p-5">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        buttonText={{ today: "Aujourd'hui", month: 'Mois', week: 'Semaine', day: 'Jour' }}
        locales={[frLocale]}
        locale="fr"
        firstDay={1}
        height="100%"
        editable
        events={events}
        eventContent={renderEventContent}
        eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
        slotMinTime="09:00:00"
        slotMaxTime="23:00:00"
        allDaySlot={false}
        eventDrop={handleEventChange}
        eventResize={handleEventChange}
        eventClick={handleEventClick}
        dayMaxEvents
        nowIndicator
      />

      {selected && <TaskEditModal task={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
