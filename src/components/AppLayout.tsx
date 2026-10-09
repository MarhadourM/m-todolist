import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../auth/useAuth'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  const { signOut } = useAuth()
  const queryClient = useQueryClient()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    queryClient.clear()
    await signOut()
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      <div className="hidden md:flex">
        <Sidebar onSignOut={handleSignOut} />
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-20 flex md:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            className="absolute inset-0 bg-black/50"
            onClick={() => setMenuOpen(false)}
          />
          <div className="relative z-10 h-full">
            <Sidebar onSignOut={handleSignOut} onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-slate-800 px-3 py-2.5 md:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Ouvrir le menu"
            className="text-slate-300"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M3 12h18M3 18h18" />
            </svg>
          </button>
          <span className="font-semibold">m-todolist</span>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
