import { Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import SignIn from './pages/SignIn'
import Onboarding from './pages/Onboarding'
import { RequireAuth } from './components/RequireAuth'

export default function App() {
  return (
    <Routes>
      <Route path="/signin" element={<SignIn />} />
      <Route
        path="/onboarding"
        element={
          <RequireAuth requireFamily={false}>
            <Onboarding />
          </RequireAuth>
        }
      />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
    </Routes>
  )
}
