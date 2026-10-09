import { Navigate } from 'react-router-dom'
import { useLists } from '../features/lists/hooks'

export function Home() {
  const { data: lists, isLoading } = useLists()

  if (isLoading) {
    return <div className="p-6 text-slate-400">Chargement…</div>
  }

  if (lists && lists.length > 0) {
    return <Navigate to={`/lists/${lists[0].id}`} replace />
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
      <h1 className="text-2xl font-bold">Bienvenue</h1>
      <p className="text-slate-400">
        Crée ton premier dossier dans le menu pour commencer à organiser tes tâches.
      </p>
    </div>
  )
}
