import { useAuth } from '../auth/useAuth'

export function Home() {
  const { session, signOut } = useAuth()
  const email = session?.user.email

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-900 p-4 text-slate-100">
      <h1 className="text-3xl font-bold">m-todolist</h1>
      <p className="text-slate-400">
        Connecté en tant que <span className="text-slate-200">{email}</span>
      </p>
      <button
        type="button"
        onClick={() => void signOut()}
        className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
      >
        Se déconnecter
      </button>
    </main>
  )
}
