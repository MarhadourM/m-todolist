import { useState } from 'react'
import type { FormEvent } from 'react'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { LIST_COLORS, randomListColor } from '../features/lists/colors'
import {
  useCreateList,
  useDeleteList,
  useLists,
  useUpdateList,
} from '../features/lists/hooks'
import type { TodoList } from '../types'

interface SidebarProps {
  onSignOut: () => void
  onNavigate?: () => void
}

export function Sidebar({ onSignOut, onNavigate }: SidebarProps) {
  const { session } = useAuth()
  const { data: lists, isLoading } = useLists()
  const createList = useCreateList()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState<string>(randomListColor())
  const navigate = useNavigate()

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    const created = await createList.mutateAsync({ name: trimmed, color })
    setName('')
    setColor(randomListColor())
    setAdding(false)
    onNavigate?.()
    navigate(`/lists/${created.id}`)
  }

  return (
    <aside className="flex h-full w-72 flex-col border-r border-slate-800 bg-slate-900">
      <div className="px-4 py-4">
        <span className="text-lg font-bold text-slate-100">m-todolist</span>
      </div>

      <div className="px-3">
        {adding ? (
          <form
            onSubmit={handleCreate}
            className="flex flex-col gap-2 rounded-lg bg-slate-800/60 p-3"
          >
            <input
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nom du dossier"
              className="rounded-md border border-slate-600 bg-slate-900 px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-indigo-500"
            />
            <div className="flex flex-wrap gap-1.5">
              {LIST_COLORS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setColor(preset)}
                  aria-label={`Couleur ${preset}`}
                  className={`h-5 w-5 rounded-full transition ${
                    color === preset ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-800' : ''
                  }`}
                  style={{ backgroundColor: preset }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createList.isPending}
                className="flex-1 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
              >
                Créer
              </button>
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="rounded-md border border-slate-600 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
              >
                Annuler
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="w-full rounded-lg border border-dashed border-slate-600 px-3 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
          >
            + Nouveau dossier
          </button>
        )}
      </div>

      <nav className="mt-3 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3 pb-3">
        {isLoading && <p className="px-2 text-sm text-slate-500">Chargement…</p>}
        {!isLoading && lists?.length === 0 && (
          <p className="px-2 text-sm text-slate-500">Aucun dossier pour l’instant.</p>
        )}
        {lists?.map((list) => (
          <SidebarItem key={list.id} list={list} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="border-t border-slate-800 p-3">
        <p className="truncate px-1 text-xs text-slate-500">{session?.user.email}</p>
        <button
          type="button"
          onClick={onSignOut}
          className="mt-2 w-full rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-slate-800"
        >
          Se déconnecter
        </button>
      </div>
    </aside>
  )
}

function SidebarItem({ list, onNavigate }: { list: TodoList; onNavigate?: () => void }) {
  const { listId } = useParams()
  const navigate = useNavigate()
  const updateList = useUpdateList()
  const deleteList = useDeleteList()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(list.name)

  const active = listId === list.id

  const handleRename = async (event: FormEvent) => {
    event.preventDefault()
    const trimmed = name.trim()
    if (trimmed && trimmed !== list.name) {
      await updateList.mutateAsync({ id: list.id, patch: { name: trimmed } })
    } else {
      setName(list.name)
    }
    setEditing(false)
  }

  const handleDelete = async () => {
    if (
      !window.confirm(`Supprimer le dossier « ${list.name} » ? Les tâches seront détachées.`)
    ) {
      return
    }
    await deleteList.mutateAsync(list.id)
    if (active) navigate('/')
  }

  if (editing) {
    return (
      <form onSubmit={handleRename} className="px-1">
        <input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setName(list.name)
              setEditing(false)
            }
          }}
          className="w-full rounded-md border border-slate-600 bg-slate-800 px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-indigo-500"
        />
      </form>
    )
  }

  return (
    <div
      className={`group flex items-center gap-2 rounded-lg px-2 py-1.5 ${
        active ? 'bg-slate-800' : 'hover:bg-slate-800/60'
      }`}
    >
      <span
        className="h-3 w-3 shrink-0 rounded-full"
        style={{ backgroundColor: list.color }}
      />
      <NavLink
        to={`/lists/${list.id}`}
        onClick={onNavigate}
        className="flex-1 truncate text-sm text-slate-200"
      >
        {list.name}
      </NavLink>
      <button
        type="button"
        onClick={() => setEditing(true)}
        aria-label="Renommer"
        className="text-slate-500 opacity-0 transition hover:text-slate-200 group-hover:opacity-100"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={handleDelete}
        aria-label="Supprimer"
        className="text-slate-500 opacity-0 transition hover:text-red-400 group-hover:opacity-100"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M19 6l-1 14H6L5 6" />
        </svg>
      </button>
    </div>
  )
}
