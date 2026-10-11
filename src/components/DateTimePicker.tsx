import { useEffect, useRef, useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { fr } from 'date-fns/locale'

interface DateTimePickerProps {
  value: string | null
  onChange: (value: string | null) => void
  placeholder?: string
}

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const BASE_MINUTES = [0, 15, 30, 45]

function nowDate(): Date {
  return new Date()
}

export function DateTimePicker({ value, onChange, placeholder = 'Échéance' }: DateTimePickerProps) {
  const [open, setOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState<Date>(() =>
    value ? new Date(value) : nowDate(),
  )
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const selected = value ? new Date(value) : null
  const hour = selected ? selected.getHours() : 9
  const minute = selected ? selected.getMinutes() : 0
  const minuteOptions = BASE_MINUTES.includes(minute)
    ? BASE_MINUTES
    : [...BASE_MINUTES, minute].sort((a, b) => a - b)

  const applyDate = (day: Date) => {
    const next = new Date(day)
    next.setHours(hour, minute, 0, 0)
    onChange(next.toISOString())
  }

  const applyTime = (nextHour: number, nextMinute: number) => {
    const next = new Date(selected ?? nowDate())
    next.setHours(nextHour, nextMinute, 0, 0)
    onChange(next.toISOString())
  }

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 1 }),
  })

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 transition hover:border-slate-500"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 2v4M16 2v4M3 10h18" />
          <rect x="3" y="4" width="18" height="18" rx="2" />
        </svg>
        <span className={selected ? '' : 'text-slate-500'}>
          {selected ? format(selected, 'd MMM yyyy HH:mm', { locale: fr }) : placeholder}
        </span>
      </button>

      {open && (
        <div className="absolute z-30 mt-1 w-64 rounded-xl border border-slate-700 bg-slate-900 p-3 shadow-2xl">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewMonth((month) => subMonths(month, 1))}
              aria-label="Mois précédent"
              className="rounded-md p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <span className="text-sm font-medium capitalize text-slate-100">
              {format(viewMonth, 'LLLL yyyy', { locale: fr })}
            </span>
            <button
              type="button"
              onClick={() => setViewMonth((month) => addMonths(month, 1))}
              aria-label="Mois suivant"
              className="rounded-md p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1 text-center text-[11px] text-slate-500">
            {WEEKDAYS.map((day, index) => (
              <span key={`${day}-${index}`}>{day}</span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const isSelected = selected ? isSameDay(day, selected) : false
              const inMonth = isSameMonth(day, viewMonth)
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => applyDate(day)}
                  className={`flex h-7 w-7 items-center justify-center rounded-md text-xs transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : isToday(day)
                        ? 'text-indigo-400 hover:bg-slate-700'
                        : inMonth
                          ? 'text-slate-200 hover:bg-slate-700'
                          : 'text-slate-600 hover:bg-slate-800'
                  }`}
                >
                  {format(day, 'd')}
                </button>
              )
            })}
          </div>

          <div className="mt-3 flex items-center gap-2 border-t border-slate-800 pt-3">
            <span className="text-xs text-slate-400">Heure</span>
            <select
              value={hour}
              onChange={(event) => applyTime(Number(event.target.value), minute)}
              className="rounded-md border border-slate-600 bg-slate-950 px-2 py-1 text-xs text-slate-100 outline-none focus:border-indigo-500"
            >
              {Array.from({ length: 24 }, (_, h) => h).map((h) => (
                <option key={h} value={h}>
                  {String(h).padStart(2, '0')}
                </option>
              ))}
            </select>
            <span className="text-slate-500">:</span>
            <select
              value={minute}
              onChange={(event) => applyTime(hour, Number(event.target.value))}
              className="rounded-md border border-slate-600 bg-slate-950 px-2 py-1 text-xs text-slate-100 outline-none focus:border-indigo-500"
            >
              {minuteOptions.map((m) => (
                <option key={m} value={m}>
                  {String(m).padStart(2, '0')}
                </option>
              ))}
            </select>
            {selected && (
              <button
                type="button"
                onClick={() => {
                  onChange(null)
                  setOpen(false)
                }}
                className="ml-auto text-xs text-slate-400 transition hover:text-red-400"
              >
                Effacer
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
