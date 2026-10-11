export interface TodoList {
  id: string
  user_id: string
  name: string
  color: string
  position: number
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  list_id: string | null
  title: string
  notes: string | null
  due_at: string | null
  remind_at: string | null
  priority: number
  completed: boolean
  position: number
  created_at: string
  updated_at: string
}
