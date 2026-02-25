import { useAuth } from '../../context/AuthContext'

function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

export function TopBar({ title, subtitle, onMenuToggle }) {
  const { role } = useAuth()

  const roleLabel = role === 'admin' ? 'Administrador' : 'Cliente'
  const badgeClass =
    role === 'admin' ? 'topbar__role-badge--admin' : 'topbar__role-badge--cliente'

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button
          className="topbar__menu-btn"
          onClick={onMenuToggle}
          aria-label="Abrir menú"
        >
          <IconMenu />
        </button>
        <div className="topbar__titles">
          {title && <h1 className="topbar__title">{title}</h1>}
          {subtitle && <p className="topbar__subtitle">{subtitle}</p>}
        </div>
      </div>

      <div className="topbar__right">
        <span className={`topbar__role-badge ${badgeClass}`}>{roleLabel}</span>
      </div>
    </header>
  )
}
