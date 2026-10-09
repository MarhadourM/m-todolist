import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export function ProtectedRoute() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-900 text-slate-400">
        Chargement…
      </main>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
