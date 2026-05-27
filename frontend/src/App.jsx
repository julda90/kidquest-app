import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import RewardsProgress from './pages/RewardsProgress'
import Tasks from './pages/Tasks'
import Children from './pages/Children'
import Settings from './pages/Settings'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/progress"  element={<ProtectedRoute><RewardsProgress /></ProtectedRoute>} />
          <Route path="/tasks"     element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
          <Route path="/children"  element={<ProtectedRoute><Children /></ProtectedRoute>} />
          <Route path="/settings"  element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
