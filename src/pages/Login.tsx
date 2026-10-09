import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

export function Login() {
  const { session, signInWithEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState('')

  if (session) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setStatus('sending')
    setError('')
    try {
      await signInWithEmail(email)
      setStatus('sent')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-slate-800 p-8 shadow-xl">
        <h1 className="mb-1 text-2xl font-bold text-slate-100">m-todolist</h1>
        <p className="mb-6 text-sm text-slate-400">
          Connexion par lien magique — aucun mot de passe.
        </p>

        {status === 'sent' ? (
          <div className="rounded-lg bg-emerald-900/40 p-4 text-sm text-emerald-300">
            Un lien de connexion a été envoyé à <strong>{email}</strong>. Ouvre-le sur cet
            appareil pour te connecter.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm text-slate-300">
              Adresse email
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="toi@exemple.com"
                className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-indigo-500"
              />
            </label>

            {error && <p className="text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
            >
              {status === 'sending' ? 'Envoi…' : 'Envoyer le lien magique'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
