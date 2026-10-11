export const PRIORITIES = [
  { value: 0, label: 'Aucune', color: '#64748b' },
  { value: 1, label: 'Basse', color: '#3b82f6' },
  { value: 2, label: 'Moyenne', color: '#f59e0b' },
  { value: 3, label: 'Haute', color: '#ef4444' },
] as const

export function priorityMeta(value: number) {
  return PRIORITIES.find((item) => item.value === value) ?? PRIORITIES[0]
}
