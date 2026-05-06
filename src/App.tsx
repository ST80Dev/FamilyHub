import { Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import SignIn from './pages/SignIn'
import Family from './pages/Family'
import Deadlines from './pages/Deadlines'
import Subscriptions from './pages/Subscriptions'
import Settings from './pages/Settings'
import Placeholder from './pages/Placeholder'
import { RequireAuth } from './components/RequireAuth'

export default function App() {
  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route
        path="/scadenze"
        element={
          <RequireAuth>
            <Deadlines />
          </RequireAuth>
        }
      />
      <Route
        path="/abbonamenti"
        element={
          <RequireAuth>
            <Subscriptions />
          </RequireAuth>
        }
      />
      <Route
        path="/buoni"
        element={
          <RequireAuth>
            <Placeholder
              title="Buoni"
              icon="🎁"
              description="Buoni regalo, rimborsi, cashback e coupon: salvali qui prima che scadano."
            />
          </RequireAuth>
        }
      />
      <Route
        path="/famiglia"
        element={
          <RequireAuth>
            <Family />
          </RequireAuth>
        }
      />
      <Route
        path="/impostazioni"
        element={
          <RequireAuth>
            <Settings />
          </RequireAuth>
        }
      />
      <Route path="/onboarding" element={<Navigate to="/famiglia" replace />} />
    </Routes>
  )
}
