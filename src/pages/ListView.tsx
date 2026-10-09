import { useParams } from 'react-router-dom'
import { useLists } from '../features/lists/hooks'

export function ListView() {
  const { listId } = useParams()
  const { data: lists } = useLists()
  const list = lists?.find((item) => item.id === listId)

  return (
    <div className="p-6">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        {list && (
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: list.color }} />
        )}
        {list?.name ?? 'Dossier'}
      </h1>
      <p className="mt-2 text-slate-400">Les tâches arrivent à l’étape 5.</p>
    </div>
  )
}
