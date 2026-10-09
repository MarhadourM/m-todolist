import { Navigate, Route, Routes } from 'react-router-dom'

function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 bg-slate-900 text-slate-100">
      <h1 className="text-3xl font-bold">m-todolist</h1>
      <p className="text-slate-400">Setup OK — étape 1 terminée.</p>
    </main>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
