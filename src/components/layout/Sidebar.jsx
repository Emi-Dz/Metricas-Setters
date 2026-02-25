import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useClientes } from '../../hooks/useClientes'

function IconGrid() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function IconUsers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function IconChart() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

function IconLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}

export function Sidebar({ isOpen, onClose }) {
  const { profile, role, signOut } = useAuth()
  const { clientes } = useClientes()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const avatarLetter = profile?.email?.[0]?.toUpperCase() ?? '?'
  const roleLabel = role === 'admin' ? 'Administrador' : 'Cliente'

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
      {/* Brand */}
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <div className="sidebar__logo-icon">
            <IconLogo />
          </div>
          <div className="sidebar__logo-text">
            <span className="sidebar__logo-name">Métricas</span>
            <span className="sidebar__logo-sub">Setters</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {role === 'cliente' && (
          <div className="sidebar__nav-section">
            <span className="sidebar__nav-label">Principal</span>
            <NavLink
              to="/dashboard"
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`
              }
            >
              <IconGrid />
              Mi Dashboard
            </NavLink>
          </div>
        )}

        {role === 'admin' && (
          <>
            <div className="sidebar__nav-section">
              <span className="sidebar__nav-label">Admin</span>
              <NavLink
                to="/admin"
                end
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`
                }
              >
                <IconGrid />
                Panel General
              </NavLink>
            </div>

            {clientes.length > 0 && (
              <div className="sidebar__nav-clients">
                <span className="sidebar__nav-label">Clientes</span>
                {clientes.map((c) => (
                  <NavLink
                    key={c.id}
                    to={`/admin?cliente=${c.id}`}
                    onClick={onClose}
                    className="sidebar__nav-item"
                  >
                    <IconChart />
                    <span
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {c.nombre}
                    </span>
                  </NavLink>
                ))}
              </div>
            )}

            <div className="sidebar__nav-section" style={{ marginTop: '8px' }}>
              <span className="sidebar__nav-label">Usuarios</span>
              <NavLink
                to="/admin/clientes"
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`
                }
              >
                <IconUsers />
                Gestión de Clientes
              </NavLink>
            </div>
          </>
        )}
      </nav>

      {/* Footer / User */}
      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="sidebar__user-avatar">{avatarLetter}</div>
          <div className="sidebar__user-info">
            <div className="sidebar__user-email">{profile?.email}</div>
            <div className="sidebar__user-role">{roleLabel}</div>
          </div>
        </div>
        <button className="sidebar__logout-btn" onClick={handleSignOut}>
          <IconLogout />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
