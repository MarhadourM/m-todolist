export const LIST_COLORS = [
  '#6366f1',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#ef4444',
  '#8b5cf6',
  '#14b8a6',
] as const

export function randomListColor(): string {
  return LIST_COLORS[Math.floor(Math.random() * LIST_COLORS.length)]
}
