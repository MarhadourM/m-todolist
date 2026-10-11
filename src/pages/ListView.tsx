import { useParams } from 'react-router-dom'
import { TaskList } from '../components/TaskList'
import { useLists } from '../features/lists/hooks'
import { useTasksByList } from '../features/tasks/hooks'

export function ListView() {
  const { listId } = useParams()
  const { data: lists } = useLists()
  const { data: tasks, isLoading } = useTasksByList(listId)
  const list = lists?.find((item) => item.id === listId)

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <h1 className="mb-4 flex items-center gap-2 text-2xl font-bold">
        {list && (
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: list.color }} />
        )}
        {list?.name ?? 'Dossier'}
      </h1>
      {isLoading ? (
        <p className="text-slate-400">Chargement…</p>
      ) : (
        <TaskList
          tasks={tasks ?? []}
          listId={listId ?? null}
          emptyLabel="Aucune tâche dans ce dossier."
        />
      )}
    </div>
  )
}
