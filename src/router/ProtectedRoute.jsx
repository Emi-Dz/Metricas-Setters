import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/ui/Spinner'

/**
 * Wraps a route and enforces authentication + role-based access.
 * - While loading: shows a full-page spinner
 * - No session: redirects to /login
 * - Wrong role: redirects to the user's correct dashboard
 */
export function ProtectedRoute({ children, requiredRole }) {
  const { user, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="spinner-page">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && role !== requiredRole) {
    const redirect = role === 'admin' ? '/admin' : '/dashboard'
    return <Navigate to={redirect} replace />
  }

  return children
}
