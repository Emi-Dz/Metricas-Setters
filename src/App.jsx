import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ProtectedRoute } from './router/ProtectedRoute'
import { LoginPage } from './pages/LoginPage'
import { ClientDashboardPage } from './pages/ClientDashboardPage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminClientesPage } from './pages/AdminClientesPage'
import { ReportePage } from './pages/ReportePage'
import { Spinner } from './components/ui/Spinner'

/**
 * Redirects the root path "/" based on the authenticated user's role.
 */
function RootRedirect() {
  const { user, role, loading } = useAuth()

  if (loading) {
    return (
      <div className="spinner-page">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (role === 'admin') return <Navigate to="/admin" replace />
  if (role === 'cliente') return <Navigate to="/dashboard" replace />

  // User exists but profile not loaded yet (e.g., profile missing in DB)
  return <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Client routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredRole="cliente">
            <ClientDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Admin sub-routes */}
      <Route
        path="/admin/clientes"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminClientesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reporte"
        element={
          <ProtectedRoute requiredRole="admin">
            <ReportePage />
          </ProtectedRoute>
        }
      />

      {/* Client: reporte quincenal */}
      <Route
        path="/reporte"
        element={
          <ProtectedRoute requiredRole="cliente">
            <ReportePage />
          </ProtectedRoute>
        }
      />

      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
