import { format, isBefore, isToday, isTomorrow, isYesterday } from 'date-fns'
import { fr } from 'date-fns/locale'

export function formatDue(iso: string): string {
  const date = new Date(iso)
  if (isToday(date)) return `Aujourd’hui ${format(date, 'HH:mm')}`
  if (isTomorrow(date)) return `Demain ${format(date, 'HH:mm')}`
  if (isYesterday(date)) return 'Hier'
  return format(date, 'd MMM yyyy HH:mm', { locale: fr })
}

export function isOverdue(iso: string): boolean {
  return isBefore(new Date(iso), new Date())
}

export function toDatetimeLocal(iso: string | null): string {
  if (!iso) return ''
  return format(new Date(iso), "yyyy-MM-dd'T'HH:mm")
}

export function fromDatetimeLocal(value: string): string | null {
  if (!value) return null
  return new Date(value).toISOString()
}
