import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { isAuth } = useAuth()
  // Fall back to localStorage in case React state hasn't committed yet
  const hasToken = isAuth || !!localStorage.getItem('token')
  return hasToken ? children : <Navigate to="/login" replace />
}
