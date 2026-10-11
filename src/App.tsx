import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Home } from './pages/Home'
import { ListView } from './pages/ListView'
import { Login } from './pages/Login'
import { TodayView } from './pages/TodayView'

const CalendarView = lazy(() =>
  import('./pages/CalendarView').then((module) => ({ default: module.CalendarView })),
)

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="today" element={<TodayView />} />
          <Route path="lists/:listId" element={<ListView />} />
          <Route
            path="calendar"
            element={
              <Suspense
                fallback={<div className="p-6 text-slate-400">Chargement du calendrier…</div>}
              >
                <CalendarView />
              </Suspense>
            }
          />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
